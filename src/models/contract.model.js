const mongoose = require("mongoose");

const ContractSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "projects", required: true },
  quotation: { type: mongoose.Schema.Types.ObjectId, ref: "quotations", required: true },
  isDraft: { type: Boolean, default: true },
  partyA: {
    company: { type: String, required: true },
    address: { type: String, required: true },
    taxCode: { type: String, required: true },
    representative: { type: String, required: true },
    position: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  partyB: {
    company: { type: String, required: true },
    address: { type: String, required: true },
    taxCode: { type: String, required: true },
    representative: { type: String, required: true },
    position: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true }
  },
  paymentTerms: {
    method: { type: String, default: "Bank Transfer" },
    installments: [
      { stage: String, percentage: Number, amount: Number }
    ],
    bankDetails: {
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      branch: { type: String, required: true }
    }
  },
  rightsAndObligations: {
    partyA: {
      responsibilities: [{ type: String, required: true }]
    },
    partyB: {
      responsibilities: [{ type: String, required: true }]
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