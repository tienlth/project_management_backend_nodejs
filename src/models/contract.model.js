const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "quotations", required: true },
  isDraft: { type: Boolean, default: true },
  partyA: {
    company: { type: String },
    address: { type: String },
    taxCode: { type: String },
    representative: { type: String },
    position: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  partyB: {
    company: { type: String },
    address: { type: String },
    taxCode: { type: String },
    representative: { type: String },
    position: { type: String },
    phone: { type: String },
    email: { type: String }
  },
  paymentTerms: {
    method: { type: String, default: "Bank Transfer" },
    installments: [
      { stage: String, amount: Number }
    ],
    bankDetails: {
      accountName: { type: String },
      accountNumber: { type: String },
      bankName: { type: String },
      branch: { type: String }
    }
  },
  rightsAndObligations: {
    partyA: {
      responsibilities: { type: String }
    },
    partyB: {
      responsibilities: { type: String }
    }
  },
  warrantyAndSupport: {
    type: String, default: ""
  },
  terminationClause: {
    type: String, default: ""
  },
  contractEffectiveness: {
    type: String, default: ""
  }
}, { timestamps: true });

module.exports = mongoose.model("contracts", ContractSchema);