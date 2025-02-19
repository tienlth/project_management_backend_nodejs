const mongoose = require("mongoose");
const Contract = require("../models/contract.model");
const Project = require("../models/project.model");
const Quotation = require("../models/quotation.model");

const previewContract = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const quotation = await Quotation.findOne({ project: projectId });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const previewContract = new Contract({
      project: await Project.findById(projectId),
      quotation: await Quotation.findById(quotation._id),
      isDraft: true,
      partyA: {},
      partyB: {},
      paymentTerms: {},
      rightsAndObligations: {},
      warrantyAndSupport: "",
      terminationClause: "",
      contractEffectiveness: ""
    });

    res.status(200).json({
      message: "Preview contract successfully",
      contract: previewContract
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const saveContract = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { partyA, partyB, paymentTerms, rightsAndObligations, warrantyAndSupport, terminationClause, contractEffectiveness, isDraft } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const quotation = await Quotation.findOne({ project: projectId });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    const newContract = new Contract({
      project: projectId,
      quotation: quotation._id,
      isDraft: isDraft ?? true,
      partyA,
      partyB,
      paymentTerms,
      rightsAndObligations,
      warrantyAndSupport,
      terminationClause,
      contractEffectiveness
    });

    await newContract.save();

    res.status(201).json({
      message: "Contract created successfully",
      contract: newContract
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  previewContract,
  saveContract
};
