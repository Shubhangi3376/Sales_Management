const mongoose = require("mongoose");

const supplySchema = new mongoose.Schema(
  {
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      required: true,
      index: true,
    },
    salesData: [
      {
        brand: { type: String, required: true, trim: true },
        numberOfPackets: { type: Number, required: true, min: 1 },
        sellingPrice: { type: Number, required: true, min: 0 },
      },
    ],
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now, immutable: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supply", supplySchema);
