const mongoose = require("mongoose");
const Task = require("./task.model");
const User = require("./user.model");
const Project = require("./project.model");

const QuotationSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  taskAdditionalCost: [
    {
      taskId: {type: String},
      adittionalCosts: [
        {
          name: { type: String, required: true }, 
          cost: { type: Number, required: true } 
        }
      ]
    }
  ],
  taskCosts: [
    {
      taskId: {type: String},
      cost: {type: Number, default: 0}
    }
  ],
  additionalCosts: [
    { 
      name: { type: String, required: true }, 
      cost: { type: Number, required: true } 
    }
  ],
  discounts: [
    {
      name: { type: String, required: true }, 
      amount: { type: Number, required: true } 
    }
  ],
  totalCost: { type: Number, default: 0 }
});

QuotationSchema.methods.calculateTaskCost = async function(quotationTask, additionalCosts) {
  const task = await Task.findById(quotationTask).populate("assignees");

  if (!task) {
    return 0;
  }

  let taskCost = 0;
  
  const estimatedHours = task.estimatedHours;
  
  for (let assignee of task.assignees) {
    const user = await User.findById(assignee);

    if (user) {
      taskCost += user.hourlyRate * estimatedHours;
    }
  }

  for (let additional of additionalCosts["adittionalCosts"] ?? []) {
    taskCost += additional.cost;
  }


  this.taskCosts.push({
    taskId: task._id,
    cost: taskCost
  })

  return taskCost;
};

QuotationSchema.methods.calculateTotalCost = async function() {
  let totalCost = 0;
  let project = await Project.findById(this.project._id);

  
  for (let task of project.tasks) {
    const taskCost = await this.calculateTaskCost(task, this.taskAdditionalCost.find((t) => t.taskId == task._id) ?? {});
    task.cost = taskCost;
    totalCost += taskCost;
  }

  for (let additional of this.additionalCosts) {
    totalCost += additional.cost;
  }

  for (let discount of this.discounts) {
    totalCost -= discount.amount;
  }

  this.totalCost = totalCost;
};

module.exports = mongoose.model("quotations", QuotationSchema);
