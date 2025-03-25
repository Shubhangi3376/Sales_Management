const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Retailer",
      required: true,
      index: true, // Faster queries
    },
    salesData: [
      {
        brand: { type: String, required: true, trim: true },
        numberOfPacketsSold: { type: Number, required: true, min: 0 },
      }
    ],
    totalAmount: { type: Number, required: true, min: 0 }, // Total sale amount
    paidAmount: { type: Number, required: true, min: 0 }, // Amount paid
    dueAmount: { type: Number, required: true, min: 0 }, // Auto-calculated
    date: { type: Date, default: Date.now, immutable: true } // Sale date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sales", salesSchema);
