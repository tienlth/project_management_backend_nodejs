const mongoose = require("mongoose");
const Contract = require("../models/contract.model");
const Project = require("../models/project.model");
const Quotation = require("../models/quotation.model");

const getAllContracts = async (req, res) => {
  try {
    const contracts = await Contract.find().populate("project quotation");
    res.status(200).json(contracts);
  } catch (error) {
    console.error("Error fetching contracts:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getContractById = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId)
    .populate("quotation") 
    .populate({
      path: "project", 
      populate: {
        path: "tasks", 
      },
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: "Contract not found" });
    }

    res.status(200).json(contract);
  } catch (error) {
    console.error("Error fetching contract:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

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

    const previewContract = new Contract(
      {
        project: await Project.findById(projectId).populate("tasks"),
        quotation: await Quotation.findById(quotation._id),
        isDraft: true,
        partyA: {
          company: "",
          address: "",
          taxCode: "",
          representative: "",
          position: "",
          phone: "",
          email: ""
        },
        partyB: {
          company: "",
          address: "",
          taxCode: "",
          representative: "",
          position: "",
          phone: "",
          email: ""
        },
        paymentTerms: {
          method: "",
          installments: [],
          bankDetails: {
            accountName: "",
            accountNumber: "",
            bankName: "",
            branch: ""
          }
        },
        rightsAndObligations: {
          partyA: {
            responsibilities: ""
          },
          partyB: {
            responsibilities: ""
          }
        }
      }
    );

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

    let quotation = await Quotation.findOne({ project: projectId });
    if (!quotation) {
      return res.status(404).json({ message: "Quotation not found" });
    }

    let contract = await Contract.findOne({ project: projectId });

    if (contract) {
      contract.partyA = partyA;
      contract.partyB = partyB;
      contract.paymentTerms = paymentTerms;
      contract.rightsAndObligations = rightsAndObligations;
      contract.warrantyAndSupport = warrantyAndSupport;
      contract.terminationClause = terminationClause;
      contract.contractEffectiveness = contractEffectiveness;
      contract.isDraft = isDraft ?? contract.isDraft;
    } else {
      contract = new Contract({
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
    }

    await contract.save();

    res.status(200).json({
      status: "success",
      message: contract.isNew ? "Contract created successfully" : "Contract updated successfully",
      contract
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({status: "failed", message: "Internal server error" });
  }
};

module.exports = {
  getContractById,
  getAllContracts,
  previewContract,
  saveContract
};
