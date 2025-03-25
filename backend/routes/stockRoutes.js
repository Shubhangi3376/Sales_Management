const express = require("express");
const router = express.Router();
const Supply = require("../models/Supply");
const Sales = require("../models/Sales");
const Retailer = require("../models/Retailer");

// Get Stock Summary (Retailer-wise)
router.get("/", async (req, res) => {
  try {
    // Fetch all retailers
    const retailers = await Retailer.find();

    if (!retailers.length) {
      return res.status(404).json({ error: "No retailers found" });
    }

    // Fetch all supplies & sales
    const supplies = await Supply.find();
    const sales = await Sales.find();

    if (!supplies.length) {
      return res.status(404).json({ error: "No supply data found" });
    }

    if (!sales.length) {
      return res.status(404).json({ error: "No sales data found" });
    }

    let stockSummary = [];

    // Process each retailer
    retailers.forEach((retailer) => {
      let retailerSupplies = supplies.filter(
        (s) => s.retailerId._id.toString() === retailer._id.toString()
      );
      let retailerSales = sales.filter(
        (s) => s.retailerId._id.toString() === retailer._id.toString()
      );

      let totalSupplied = {};
      let totalSold = {};
      let totalPayments = 0;
      let totalDues = 0;

      // Calculate total supplied stock
      retailerSupplies.forEach((supply) => {
        if (supply.salesData && Array.isArray(supply.salesData)) {
          supply.salesData.forEach((item) => {
            totalSupplied[item.brand] =
              (totalSupplied[item.brand] || 0) + item.numberOfPackets;
          });
        }
      });

      // Calculate total sold stock & payments
      retailerSales.forEach((sale) => {
        if (sale.salesData && Array.isArray(sale.salesData)) {
          sale.salesData.forEach((item) => {
            totalSold[item.brand] =
              (totalSold[item.brand] || 0) + item.numberOfPacketsSold;
          });
        }
        totalPayments += sale.paidAmount || 0;
        totalDues += sale.dueAmount || 0;
      });

      // Calculate remaining stock
      let remainingStock = {};
      let mostSoldProduct = { brandName: null, quantity: 0 };
      let lowStockBrands = [];

      Object.keys(totalSupplied).forEach((brand) => {
        remainingStock[brand] = totalSupplied[brand] - (totalSold[brand] || 0);

        // Determine most sold product
        if ((totalSold[brand] || 0) > mostSoldProduct.quantity) {
          mostSoldProduct = { brandName: brand, quantity: totalSold[brand] };
        }

        // Identify low stock brands (Threshold: <10 packets)
        if (remainingStock[brand] < 10) {
          lowStockBrands.push(brand);
        }
      });

      stockSummary.push({
        retailerId: retailer._id,
        retailerName: retailer.name,
        totalSupplied,
        totalSold,
        remainingStock,
        earnings: totalPayments,
        totalDues,
        mostSoldProduct: mostSoldProduct.brandName || "N/A",
        lowStockAlerts: lowStockBrands,
      });
    });

    res.json(stockSummary);
  } catch (error) {
    console.error("Error fetching stock summary:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;