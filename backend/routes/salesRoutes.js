const express = require("express");
const mongoose = require("mongoose");
const Sales = require("../models/Sales");
const Retailer = require("../models/Retailer");
const Supply = require("../models/Supply"); // For stock updates
const router = express.Router();

// ✅ GET: Fetch all sales records
router.get("/", async (req, res) => {
  try {
    const sales = await Sales.find().populate("retailerId", "name location");
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ POST: Add a new sales record
router.post("/add", async (req, res) => {
  try {
    const { retailerId, salesData, totalAmount, paidAmount } = req.body;

    console.log("Received retailerId:", retailerId); // Debugging line

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(retailerId)) {
      return res.status(400).json({ error: "Invalid Retailer ID" });
    }

    // Validate required fields
    if (!totalAmount || !paidAmount) {
      return res.status(400).json({ error: "Total amount and paid amount are required" });
    }

    // ✅ Filter out invalid salesData entries
    const validSalesData = salesData.filter(
      (item) => item.brand?.trim() && item.numberOfPacketsSold > 0
    );

    if (validSalesData.length === 0) {
      return res.status(400).json({ error: "At least one valid brand sale must be provided!" });
    }

    // Check if retailer exists
    const retailerExists = await Retailer.findById(retailerId);
    if (!retailerExists) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    // Calculate due amount
    const dueAmount = totalAmount - paidAmount;

    // Create new sales record
    const sales = new Sales({
      retailerId,
      salesData: validSalesData,
      totalAmount,
      paidAmount,
      dueAmount,
    });

    await sales.save();
    res.status(201).json({ message: "✅ Sales record added successfully!", sales });
  } catch (error) {
    console.error("Error adding sales record:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ GET: Fetch sales records for a specific retailer
router.get("/:retailerId", async (req, res) => {
  try {
    const { retailerId } = req.params;

    console.log("Received retailerId:", retailerId); // Debugging line

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(retailerId)) {
      return res.status(400).json({ error: "Invalid Retailer ID" });
    }

    // Fetch supply records for the retailer
    const supplyRecords = await Supply.find({ retailerId });

    if (!supplyRecords || supplyRecords.length === 0) {
      return res.status(404).json({ error: "No supply records found for this retailer" });
    }

    res.status(200).json(supplyRecords);
  } catch (error) {
    console.error("Error fetching supply records:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ PUT: Update a sales record
router.put("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { salesData, totalAmount, paidAmount } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Sales ID" });
    }

    // Validate required fields
    if (!totalAmount || !paidAmount) {
      return res.status(400).json({ error: "Total amount and paid amount are required" });
    }

    // Filter out invalid salesData entries
    const validSalesData = salesData.filter(
      (item) => item.brand?.trim() && item.numberOfPacketsSold > 0
    );

    if (validSalesData.length === 0) {
      return res.status(400).json({ error: "At least one valid brand sale must be provided!" });
    }

    // Calculate due amount
    const dueAmount = totalAmount - paidAmount;

    // Update sales record
    const updatedSales = await Sales.findByIdAndUpdate(
      id,
      { salesData: validSalesData, totalAmount, paidAmount, dueAmount },
      { new: true, runValidators: true }
    );

    if (!updatedSales) {
      return res.status(404).json({ error: "Sales record not found" });
    }

    res.status(200).json({ message: "✅ Sales record updated successfully!", updatedSales });
  } catch (error) {
    console.error("Error updating sales record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ DELETE: Delete a sales record
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid Sales ID" });
    }

    const deletedSales = await Sales.findByIdAndDelete(id);

    if (!deletedSales) {
      return res.status(404).json({ error: "Sales record not found" });
    }

    res.status(200).json({ message: "✅ Sales record deleted successfully!", deletedSales });
  } catch (error) {
    console.error("Error deleting sales record:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ PUT: Update stock after sales
router.put("/update-stock/:supplyId", async (req, res) => {
  try {
    const { supplyId } = req.params;
    const { soldPackets } = req.body;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(supplyId)) {
      return res.status(400).json({ error: "Invalid Supply ID" });
    }

    // Validate soldPackets
    if (soldPackets === undefined || soldPackets < 0) {
      return res.status(400).json({ error: "Invalid sold packets value" });
    }

    // Find the supply record
    const supply = await Supply.findById(supplyId);
    if (!supply) {
      return res.status(404).json({ error: "Supply record not found" });
    }

    // Update stock remaining
    supply.stockRemaining -= soldPackets;
    await supply.save();

    res.status(200).json({ message: "✅ Stock updated successfully!", supply });
  } catch (error) {
    console.error("Error updating stock:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;