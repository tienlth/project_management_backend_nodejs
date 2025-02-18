const Task = require("../models/task.model");
const Project = require("../models/project.model");

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("project", "projectName").populate("assignee", "name email");
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
    const { title, description, status, assignee, priority, startDate, endDate } = req.body;

    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.assignee = assignee || task.assignee;
    task.priority = priority || task.priority;
    task.startDate = startDate || task.startDate;
    task.endDate = endDate || task.endDate;

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
