const mongoose = require("mongoose");

const retailerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, // Retailer name
  location: { type: String, required: true, trim: true }, // Retailer location
  contact: { type: String, trim: true }, // Optional contact info
  createdAt: { type: Date, default: Date.now }, // Timestamp
});

module.exports = mongoose.model("Retailer", retailerSchema);