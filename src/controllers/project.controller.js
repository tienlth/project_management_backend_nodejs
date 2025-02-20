const Project = require("../models/project.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");

const User = require("../models/user.model");

exports.getUserProjects = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let projects;
    if (user.role === "admin") {
      projects = await Project.find().populate("tasks");
    } else {
      projects = await Project.find({ "team.userId": userId }).populate("tasks");
    }

    res.status(200).json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to get user projects", error });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate({
      path: "tasks", 
      populate: {
        path: "assignees", 
      },
    });
    if (!project) return res.status(404).json({ message: "Project not found" });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate } = req.body;
    
    const newProject = new Project({ projectName, description, startDate, endDate });
    await newProject.save();

    res.status(201).json({ message: "Project created successfully", project: newProject });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { projectName, description, priority, startDate, endDate, status, progress } = req.body;

    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (status && !["Planning", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid Status" });
    }

    if (progress !== undefined) {
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ message: "Progress must from 0 to 100" });
      }
      project.progress = progress;
    }

    project.projectName = projectName || project.projectName;
    project.description = description || project.description;
    project.priority = priority || project.priority;
    project.startDate = startDate || project.startDate;
    project.endDate = endDate || project.endDate;
    project.status = status || project.status;

    await project.save();
    res.json({ message: "Project updated successfully", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.projectId);
    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverdueProjects = async (req, res) => {
  try {
    const now = new Date();

    const overdueProjects = await Project.find({
      endDate: { $lte: now }, 
      status: { $ne: "Completed" }
    }).populate("tasks");

    res.status(200).json({ success: true, overdueProjects });
  } catch (error) {
    res.status(500).json({ success: false, message: "Getting data error", error });
  }
};

exports.getProjectsSortedByOverdueTime = async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks");

    const projectsWithOverdueTime = projects.map((project) => {
      let totalOverdueTime = 0;
      const overdueTasks = project.tasks.filter(
        (task) => task.status !== "Completed" && task.endDate < new Date()
      );

      overdueTasks.forEach((task) => {
        const overdueTime = new Date() - new Date(task.endDate); 
        totalOverdueTime += overdueTime;
      });

      return {
        ...project.toObject(),
        totalOverdueTime, 
        overdueTasks,
      };
    });

    projectsWithOverdueTime.sort((a, b) => b.totalOverdueTime - a.totalOverdueTime);

    res.status(200).json({ success: true, projects: projectsWithOverdueTime });
  } catch (error) {
    res.status(500).json({ success: false, message: "Get data error", error });
  }
};

exports.uploadProjectDocument = async (req, res) => {
  try {
    const { projectId } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 25MB limit" });
    }

    const fileUrl = req.file.path;
    const fileName = req.file.originalname;

    project.documents.push({
      url: fileUrl,
      name: fileName, 
      uploadedBy: userId,
      sharedWith: []
    });

    await project.save();
    res.status(200).json({ message: "File uploaded", document: req.file.path });
  } catch (error) {
    console.log(error.toString())
    res.status(500).json({ message: "Upload failed", error });
  }
};

exports.shareProjectDocument = async (req, res) => {
  try {
    const { projectId, documentId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const document = project.documents.id(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (!document.sharedWith.includes(userId)) {
      document.sharedWith.push(userId);
      await project.save();
    }

    res.status(200).json({ message: "Document shared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Share failed", error });
  }
};

exports.deleteProjectDocument = async (req, res) => {
  try {
    const { projectId, documentId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const docIndex = project.documents.findIndex(doc => doc._id.toString() === documentId);
    if (docIndex === -1) return res.status(404).json({ message: "Document not found" });

    const fileUrl = project.documents[docIndex].url;
    const fileExtension = fileUrl.split(".").pop().toLowerCase();

    let resourceType = "raw";
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      resourceType = "image";
    } else if (["mp4", "avi", "mov"].includes(fileExtension)) {
      resourceType = "video";
    }

    const publicId = fileUrl.split("/").pop().split(".")[0];

    await cloudinary.uploader.destroy(`project_documents/${publicId}`, { resource_type: resourceType });

    project.documents.splice(docIndex, 1);
    await project.save();

    res.status(200).json({ message: "Project document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};