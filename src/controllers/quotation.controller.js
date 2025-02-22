const Quotation = require("../models/quotation.model");
const Project = require("../models/project.model");
const Task = require("../models/task.model");

const getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find()
      .populate("project") 
      .populate({
        path: "taskAdditionalCosts.taskId",
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
        path: "taskAdditionalCosts.taskId",
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
      taskAdditionalCosts: [],
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
    const {additionalCosts, taskAdditionalCosts, discounts } = formatQuotationData(req.body);


    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    newQuotation = await new Quotation({
      project,
      taskAdditionalCosts: taskAdditionalCosts || [],
      additionalCosts: additionalCosts || [], 
      discounts: discounts || [], 
      totalCost: 0,
    });

    await newQuotation.calculateTotalCost();

    await newQuotation.save();
    res.status(200).json({
      status: "success",
      message: "Create quotation successfully",
      quotation: newQuotation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({status: "failed", message: "Internal server error" });
  }
};

const formatQuotationData = (reqData) => {
  const taskAdditionalCosts = Object.entries(reqData["taskAdditionalCosts"])
    .filter(([_, costs]) => costs.length > 0)
    .map(([taskId, costs]) => ({
        taskId,
        adittionalCosts: costs.map(cost => ({
            name: cost.name || "",
            cost: Number(cost.cost) || 0
        }))
    }));
    
  const additionalCosts = reqData["additionalCosts"].map(cost => ({
      name: cost.name || "",
      cost: Number(cost.cost) || 0
  }));

  const discounts = reqData["discounts"].map(cost => ({
      name: cost.name || "",
      amount: Number(cost.cost) || 0
  }));

  return {
      taskAdditionalCosts,
      additionalCosts,
      discounts,
  };
};

module.exports = {
  getAllQuotations,
  getQuotationById,
  previewQuotation,
  createQuotation
};
