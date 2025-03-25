const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Supply = require("../models/Supply");
const Retailer = require("../models/Retailer");

// ✅ GET: Fetch all supply records or for a specific retailer dynamically
router.get("/", async (req, res) => {
  try {
    const { retailerId } = req.query;

    // Build query dynamically
    const query = {};
    if (retailerId) {
      // Automatically handle invalid retailerId
      if (!mongoose.Types.ObjectId.isValid(retailerId)) {
        return res.status(400).json({ error: "Invalid Retailer ID" });
      }
      query.retailerId = retailerId; // Mongoose will cast to ObjectId
    }

    // Fetch supply records
    const supplies = await Supply.find(query).populate("retailerId", "name location");

    if (!supplies.length) {
      return res.status(404).json({ error: "No supply records found" });
    }

    res.status(200).json({ message: "Supply records fetched successfully", data: supplies });
  } catch (error) {
    console.error("Error fetching supply records:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ POST: Add new supply record (handles dynamic inputs)
router.post("/add", async (req, res) => {
  try {
    const { retailerId, salesData = [], totalAmount = 0, paidAmount = 0 } = req.body;

    // Validate retailerId
    if (!retailerId || !mongoose.Types.ObjectId.isValid(retailerId)) {
      return res.status(400).json({ error: "Invalid or missing Retailer ID" });
    }

    // Check if retailer exists
    const retailerExists = await Retailer.findById(retailerId);
    if (!retailerExists) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    // Validate and filter salesData
    const validSalesData = salesData
      .filter((item) => item.brand?.trim() && item.numberOfPackets > 0 && item.sellingPrice > 0)
      .map((item) => ({
        brand: item.brand.trim(),
        numberOfPackets: item.numberOfPackets,
        sellingPrice: item.sellingPrice,
      }));

    if (validSalesData.length === 0) {
      return res.status(400).json({ error: "At least one valid brand must be provided!" });
    }

    // Create new supply record
    const supply = new Supply({
      retailerId,
      salesData: validSalesData,
      totalAmount,
      paidAmount,
    });

    await supply.save();
    res.status(201).json({ message: "Supply record added successfully!", data: supply });
  } catch (error) {
    console.error("Error adding supply record:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ DELETE: Delete a supply record (handles invalid IDs gracefully)
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Supply ID" });
    }

    const deletedSupply = await Supply.findByIdAndDelete(id);

    if (!deletedSupply) {
      return res.status(404).json({ error: "Supply record not found" });
    }

    res.status(200).json({ message: "Supply record deleted successfully!", data: deletedSupply });
  } catch (error) {
    console.error("Error deleting supply record:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

module.exports = router;