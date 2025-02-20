const Task = require("../models/task.model");
const Project = require("../models/project.model");
const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");


exports.getUserTasks = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let tasks;
    if (user.role === "admin") {
      tasks = await Task.find().populate("project", "projectName").populate("assignees", "name email");
    } else {
      tasks = await Task.find({ assignee: userId }) 
        .populate("project", "projectName")
        .populate("assignee", "name email"); 
        
      // const userProjects = await Project.find({ "team.userId": userId }).select("_id");
      // const projectIds = userProjects.map(p => p._id);

      // tasks = await Task.find({ project: { $in: projectIds } })
      //   .populate("project", "projectName")
      //   .populate("assignees", "name email");
    }

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Failed to get user tasks", error });
  }
};


exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("project", "projectName").populate("assignees", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate("project", "projectName description");

    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.createTask = async (req, res) => {
  try {
    const { projectId, title, description, assignee, priority, startDate, endDate } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newTask = new Task({
      title,
      description,
      assignee,
      priority,
      startDate,
      endDate,
      project: projectId
    });

    await newTask.save();

    project.tasks.push(newTask._id);
    await project.save();

    res.status(201).json({ message: "Task created successfully", task: newTask });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, status, assignees, priority, startDate, endDate, progress } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({ message: "Progress must from 0 to 100" });
    }

    if (status && !["Pending", "In Progress", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignees = assignees || task.assignees;
    task.priority = priority || task.priority;
    task.startDate = startDate || task.startDate;
    task.endDate = endDate || task.endDate;
    if (progress !== undefined) task.progress = progress;

    await task.save();
    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await Project.updateOne({ tasks: task._id }, { $pull: { tasks: task._id } });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverdueTasks = async (req, res) => {
  try {
    const now = new Date();

    const overdueTasks = await Task.find({
      endDate: { $lte: now }, 
      status: { $ne: "Completed" }
    }).populate("assignees project");

    res.status(200).json({ success: true, overdueTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Getting data error", error });
  }
};

exports.getOverdueTasksSorted = async (req, res) => {
  try {
    const now = new Date();

    const overdueTasks = await Task.aggregate([
      {
        $match: {
          status: { $ne: "Completed" },
          endDate: { $lt: now }
        }
      },
      {
        $addFields: {
          overdueTime: { $subtract: [now, "$endDate"] } 
        }
      },
      {
        $sort: { overdueTime: -1 } 
      }
    ]);

    res.status(200).json({ success: true, overdueTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy công việc trễ hạn", error });
  }
};

exports.uploadTaskDocument = async (req, res) => {
  try {
    const { taskId } = req.params;

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    if (req.file.size > 25 * 1024 * 1024) {
      return res.status(400).json({ message: "File size exceeds 25MB limit" });
    }

    const fileUrl = req.file.path;
    const fileName = req.file.originalname;

    task.documents.push({
      url: fileUrl,
      name: fileName, 
      uploadedBy: userId,
      sharedWith: []
    });

    await task.save();
    res.status(200).json({ message: "File uploaded", document: { url: fileUrl, name: fileName } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Upload failed", error });
  }
};


exports.shareTaskDocument = async (req, res) => {
  try {
    const { taskId, documentId } = req.params;
    const { userId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const document = task.documents.id(documentId);
    if (!document) return res.status(404).json({ message: "Document not found" });

    if (!document.sharedWith.includes(userId)) {
      document.sharedWith.push(userId);
      await task.save();
    }

    res.status(200).json({ message: "Document shared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Share failed", error });
  }
};

exports.deleteTaskDocument = async (req, res) => {
  try {
    const { taskId, documentId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const docIndex = task.documents.findIndex(doc => doc._id.toString() === documentId);
    if (docIndex === -1) return res.status(404).json({ message: "Document not found" });

    const fileUrl = task.documents[docIndex].url;
    const fileExtension = fileUrl.split(".").pop().toLowerCase();

    let resourceType = "raw"; 
    if (["jpg", "jpeg", "png", "gif"].includes(fileExtension)) {
      resourceType = "image";
    } else if (["mp4", "avi", "mov"].includes(fileExtension)) {
      resourceType = "video";
    }

    const publicId = fileUrl.split("/").pop().split(".")[0]; 

    await cloudinary.uploader.destroy(`project_documents/${publicId}`, { resource_type: resourceType });

    task.documents.splice(docIndex, 1);
    await task.save();

    res.status(200).json({ message: "Task document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed", error });
  }
};