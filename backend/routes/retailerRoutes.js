const express = require("express");
const router = express.Router();
const Retailer = require("../models/Retailer");

// ✅ GET: Fetch all retailers
router.get("/", async (req, res) => {
  try {
    const retailers = await Retailer.find();
    res.status(200).json(retailers);
  } catch (error) {
    console.error("Error fetching retailers:", error);
    res.status(500).json({ error: "Error fetching retailers" });
  }
});

// ✅ POST: Add a new retailer
router.post("/add", async (req, res) => {
  try {
    const { name, contact, location } = req.body;

    // Validate required fields
    if (!name || !contact || !location) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create new retailer
    const retailer = new Retailer({ name, contact, location });
    await retailer.save();

    res.status(201).json({ message: "✅ Retailer added successfully!", retailer });
  } catch (error) {
    console.error("Error adding retailer:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

// ✅ DELETE: Delete a retailer
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRetailer = await Retailer.findByIdAndDelete(id);

    if (!deletedRetailer) {
      return res.status(404).json({ error: "Retailer not found" });
    }

    res.status(200).json({ message: "✅ Retailer deleted successfully!", deletedRetailer });
  } catch (error) {
    console.error("Error deleting retailer:", error);
    res.status(500).json({ error: "Error deleting retailer" });
  }
});

module.exports = router;