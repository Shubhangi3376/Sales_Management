const mongoose = require("mongoose");

const stockSummarySchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Retailer", // Reference to the Retailer model
    required: true,
  },
  brand: { type: String, required: true, trim: true }, // Product brand
  totalSupplied: { type: Number, required: true, min: 0 }, // Total packets supplied
  totalSold: { type: Number, required: true, min: 0 }, // Total packets sold
  stockRemaining: { type: Number, required: true, min: 0 }, // Remaining stock
  totalEarnings: { type: Number, required: true, min: 0 }, // Total earnings from sales
  paidAmount: { type: Number, required: true, min: 0 }, // Total amount paid
  dueAmount: { type: Number, required: true, min: 0 }, // Total amount due
  updatedAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("StockSummary", stockSummarySchema);