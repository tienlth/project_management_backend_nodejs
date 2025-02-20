const Quotation = require("../models/quotation.model");
const Project = require("../models/project.model");
const Task = require("../models/task.model");

const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("project") 
      .populate({
        path: "taskAdditionalCost.taskId",
        select: "title description"
      });

    res.status(200).json(quotations);
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const { quotationId } = req.params;

    const quotation = await Quotation.findById(quotationId)
      .populate({
        path: "project",
        populate: {
          path: "tasks",
          model: "tasks"
        }
      })
      .populate({
        path: "taskAdditionalCost.taskId",
        select: "title description"
      });

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.status(200).json(quotation);
  } catch (error) {
    console.log(error)
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const previewQuotation = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId).populate("tasks");
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    newQuotation = await new Quotation({
      project: project,
      taskAdditionalCost: [],
      additionalCosts: [],
      discounts: [],
      totalCost: 0,
    });

    let quotationTasks = []
    await project.tasks.map(async (task)=>{
      quotationTasks.push(await Task.findById(task).populate("assignees"))
    })
    
    await newQuotation.calculateTotalCost()

    res.status(200).json({
      message: "Get quotation successfully",
      quotation: newQuotation,
      quotationTasks: quotationTasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createQuotation = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const {additionalCosts, taskAdditionalCost, discounts } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    console.log(taskAdditionalCost)
    newQuotation = await new Quotation({
      project,
      taskAdditionalCost: taskAdditionalCost || [],
      additionalCosts: additionalCosts || [], 
      discounts: discounts || [], 
      totalCost: 0,
    });

    await newQuotation.calculateTotalCost()

    await newQuotation.save();
    res.status(200).json({
      message: "Create quotation successfully",
      quotation: newQuotation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getAllQuotations,
  getQuotationById,
  previewQuotation,
  createQuotation
};
