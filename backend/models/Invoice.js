const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  taxPercentage: { type: Number, default: 0 },
  total: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invoiceNumber: { type: String, required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    billFrom: {
      businessName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    billTo: {
      clientName: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      phone: { type: String, required: true },
    },
    items: [itemSchema],
    notes: { type: String },
    paymentTerms: { type: String, default: "Net 15" },
    status: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    subtotal: { type: Number },
    taxTotal: { type: Number },
    total: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
