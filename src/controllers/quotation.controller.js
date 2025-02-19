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

    res.status(200).json({
      success: true,
      data: quotations
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const getQuotationById = async (req, res) => {
  try {
    const { quotationId } = req.params;

    const quotation = await Quotation.findById(quotationId)
      .populate("project")
      .populate({
        path: "taskAdditionalCost.taskId",
        select: "title description"
      });

    if (!quotation) {
      return res.status(404).json({ success: false, message: "Quotation not found" });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error });
  }
};

const previewQuotation = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    newQuotation = await new Quotation({
      project,
      taskAdditionalCost: [],
      additionalCosts: [],
      discounts: [],
      totalCost: 0,
    }).populate("project");

    let quotationTasks = (await project.populate("tasks"));
    
    await newQuotation.calculateTotalCost()

    res.status(200).json({
      message: "Get quotation successfully",
      quotation: newQuotation,
      quotationTasks: quotationTasks["tasks"]
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
    }).populate("project");

    let quotationTasks = (await project.populate("tasks"));
    
    await newQuotation.calculateTotalCost()

    await newQuotation.save();
    res.status(200).json({
      message: "Create quotation successfully",
      quotation: newQuotation,
      quotationTasks: quotationTasks["tasks"]
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
