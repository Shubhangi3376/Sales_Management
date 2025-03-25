const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const jsPDF = require("jspdf");
const autoTable = require("jspdf-autotable");
const fs = require("fs");
require("dotenv").config();
const mongoose = require("mongoose");
const FormDataModel = require("./models/FormData");
const connectDB = require("./db"); // Your existing DB connection function

// Import Stock Tracking Routes
const retailerRoutes = require("./routes/retailerRoutes");
const supplyRoutes = require("./routes/supplyRoutes");
const salesRoutes = require("./routes/salesRoutes");
const stockRoutes = require("./routes/stockRoutes");

// Initialize Express
const app = express();
app.use(express.json());
// ✅ Corrected CORS Middleware
app.use(cors({
  origin: "https://sales-management-1.onrender.com",
  methods: ["POST", "GET"],
  credentials: true
}));



// Connect to Stock Tracking Database
connectDB();

// 📌 Default Route
app.get("/", (req, res) => {
  res.send("✅ Stock Tracking & Authentication API is running...");
});

// 📌 User Authentication Routes
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  FormDataModel.findOne({ email: email }).then((user) => {
    if (user) {
      res.json("Already registered");
    } else {
      FormDataModel.create(req.body)
        .then((log_reg_form) => res.json(log_reg_form))
        .catch((err) => res.json(err));
    }
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  FormDataModel.findOne({ email: email })
      .then(user => {
          if (user) {
              if (user.password === password) {
                  return res.json("Success"); // Send success response
              } else {
                  return res.json("Wrong password"); // Send wrong password response
              }
          } else {
              return res.json("No records found!"); // Send user not found response
          }
      })
      .catch(err => {
          console.error("Database Error:", err);
          res.status(500).json("Internal Server Error"); // Handle database errors
      });
});

// 📌 Stock Tracking Routes (Protected Routes)
app.use("/api/retailers", retailerRoutes);
app.use("/api/supply", supplyRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/stock", stockRoutes);

// 📩 Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/** 
 * 📜 Function to Fetch Stock Data and Generate PDF
 */
const generateStockPDF = async () => {
  try {
    console.log("📡 Fetching stock data...");
    const response = await axios.get(`${process.env.STOCK_API}/summary`);
    const stockSummary = response.data;

    if (!stockSummary || stockSummary.length === 0) {
      console.warn("⚠️ No stock data available.");
      return null;
    }

    // 📄 Create PDF
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("📊 Stock Summary Report (Last 7 Days)", 14, 15);

    const tableRows = stockSummary.map((retailer) => [
      retailer.retailerName,
      retailer.totalSupplied,
      retailer.totalSold,
      retailer.stockRemaining,
    ]);

    autoTable(doc, {
      startY: 25,
      theme: "striped",
      head: [["Retailer Name", "Supplied", "Sold", "Remaining"]],
      body: tableRows,
    });

    const pdfPath = `./Stock_Summary_${Date.now()}.pdf`;
    doc.save(pdfPath);

    console.log(`✅ PDF generated successfully: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error("❌ Error generating stock summary PDF:", error.message);
    return null;
  }
};

/** 
 * 📧 Function to Send Email with Stock Report
 */
const sendStockEmail = async () => {
  try {
    console.log("📨 Preparing stock summary email...");
    const pdfPath = await generateStockPDF();
    if (!pdfPath) return;

    const mailOptions = {
      from: process.env.EMAIL_SENDER,
      to: process.env.EMAIL_RECEIVER,
      subject: "📊 Weekly Stock Summary Report",
      text: "Dear Retailer,\n\nAttached is your stock summary report for the last 7 days.\n\nBest Regards,\nStock Tracker Team",
      attachments: [{ filename: "Stock_Summary.pdf", path: pdfPath }],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.response}`);

    // Remove PDF after sending email
    fs.unlinkSync(pdfPath);
    console.log("🗑️ Temporary PDF deleted.");
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

/** 
 * 🔄 Reset Stock Summary API (Called Every 8th Day)
 */
const resetStockSummary = async () => {
  try {
    console.log("🔄 Resetting stock summary...");
    await axios.post(`${process.env.STOCK_API}/reset`);
    console.log("✅ Stock summary reset successfully.");
  } catch (error) {
    console.error("❌ Error resetting stock summary:", error.message);
  }
};

// ⏳ Schedule Tasks
cron.schedule("0 0 * * 7", sendStockEmail); // Every Sunday at midnight
cron.schedule("0 0 * * 1", resetStockSummary); // Every Monday at midnight

const PORT = process.env.PORT || 3001;  // Use Render-provided PORT
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

