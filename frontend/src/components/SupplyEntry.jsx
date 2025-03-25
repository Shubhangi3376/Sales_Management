import React, { useState, useEffect } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import * as autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SupplyEntry = () => {
  const [formData, setFormData] = useState({
    retailerId: "",
    supplyData: [],
    paidAmount: "",
  });
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [grandTotal, setGrandTotal] = useState("₹0.00");
  const [productCount, setProductCount] = useState(0);
  const [productNames, setProductNames] = useState([]);
  const [retailerProducts, setRetailerProducts] = useState({});
  const [templates, setTemplates] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const savedProducts = localStorage.getItem("retailerProducts");
    if (savedProducts) setRetailerProducts(JSON.parse(savedProducts));

    const savedTemplates = localStorage.getItem("productTemplates");
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

    const fetchRetailers = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/retailers`);
        setRetailers(response.data);
      } catch (error) {
        console.error("Error fetching retailers:", error);
        alert("Failed to load retailers.");
      }
    };
    fetchRetailers();
  }, []);

  const handleRetailerSelect = (retailerId) => {
    setFormData((prev) => ({ ...prev, retailerId }));
    setSubmitSuccess(false);
    setSubmitError("");

    if (retailerProducts[retailerId]) {
      const products = retailerProducts[retailerId];
      setProductCount(products.length);
      setProductNames(products.map((p) => p.name));
      setFormData((prev) => ({
        ...prev,
        supplyData: products.map((p) => ({
          brand: p.name,
          numberOfPackets: "",
          sellingPrice: p.price || "",
          total: "₹0.00",
        })),
      }));
    }
  };

  const saveAsTemplate = () => {
    const templateName = prompt("Enter template name:");
    if (!templateName) return;

    const newTemplate = {
      name: templateName,
      products: productNames.map((name, i) => ({
        name,
        price: formData.supplyData[i]?.sellingPrice || "",
      })),
    };

    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    localStorage.setItem("productTemplates", JSON.stringify(updatedTemplates));
    alert("Template saved!");
  };

  const loadTemplate = (template) => {
    setProductCount(template.products.length);
    setProductNames(template.products.map((p) => p.name));
    setFormData((prev) => ({
      ...prev,
      supplyData: template.products.map((p) => ({
        brand: p.name,
        numberOfPackets: "",
        sellingPrice: p.price || "",
        total: "₹0.00",
      })),
    }));
    setShowTemplateModal(false);
  };

  const saveRetailerProducts = () => {
    if (!formData.retailerId) return;

    const products = productNames.map((name, i) => ({
      name,
      price: formData.supplyData[i]?.sellingPrice || "",
    }));

    const updatedRetailerProducts = {
      ...retailerProducts,
      [formData.retailerId]: products,
    };

    setRetailerProducts(updatedRetailerProducts);
    localStorage.setItem("retailerProducts", JSON.stringify(updatedRetailerProducts));
    alert("Products saved for this retailer!");
  };

  const handleProductCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    if (isNaN(count) || count < 0) return;
    setProductCount(count);
    const updatedNames = [...productNames];
    const updatedData = [...formData.supplyData];

    while (updatedNames.length < count) updatedNames.push("");
    while (updatedData.length < count)
      updatedData.push({ brand: "", numberOfPackets: "", sellingPrice: "", total: "₹0.00" });

    setProductNames(updatedNames.slice(0, count));
    setFormData((prev) => ({
      ...prev,
      supplyData: updatedData.slice(0, count),
    }));
  };

  const handleProductNameChange = (index, value) => {
    const updated = [...productNames];
    updated[index] = value;
    setProductNames(updated);

    const updatedSupply = [...formData.supplyData];
    updatedSupply[index] = { ...updatedSupply[index], brand: value };
    setFormData((prev) => ({ ...prev, supplyData: updatedSupply }));
  };

  const handlePacketChange = (index, value) => {
    const updated = [...formData.supplyData];
    const qty = parseInt(value, 10);
    const price = parseFloat(updated[index].sellingPrice) || 0;
    const total = isNaN(qty) ? 0 : qty * price;
    updated[index] = {
      ...updated[index],
      numberOfPackets: value,
      total: `₹${total.toFixed(2)}`,
    };
    setFormData((prev) => ({ ...prev, supplyData: updated }));

    const grand = updated.reduce((acc, item) => {
      const t = parseFloat(item.total.replace("₹", "")) || 0;
      return acc + t;
    }, 0);
    setGrandTotal(`₹${grand.toFixed(2)}`);
  };

  const handleSellingPriceChange = (index, value) => {
    const updated = [...formData.supplyData];
    const price = parseFloat(value);
    const qty = parseInt(updated[index].numberOfPackets, 10) || 0;
    const total = price * qty;
    updated[index] = {
      ...updated[index],
      sellingPrice: value,
      total: `₹${isNaN(total) ? 0 : total.toFixed(2)}`,
    };
    setFormData((prev) => ({ ...prev, supplyData: updated }));

    const grand = updated.reduce((acc, item) => {
      const t = parseFloat(item.total.replace("₹", "")) || 0;
      return acc + t;
    }, 0);
    setGrandTotal(`₹${grand.toFixed(2)}`);
  };

  const generatePDF = () => {
    try {
      if (!formData.retailerId) {
        alert("Please select a retailer first");
        return;
      }
  
      const retailer = retailers.find(r => r._id === formData.retailerId);
      if (!retailer) {
        alert("Retailer not found");
        return;
      }
  
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
  
      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(40, 53, 147);
      doc.text("CIGARETTE SUPPLY INVOICE", 105, 20, { align: 'center' });
      doc.setDrawColor(200, 200, 200);
      doc.line(15, 25, 195, 25);
  
      // Retailer Info
      doc.setFontSize(10);
      doc.setTextColor(80);
      doc.setFont("helvetica", "bold");
      doc.text("Retailer Details:", 15, 35);
      doc.setFont("helvetica", "normal");
      doc.text(`Name: ${retailer.name}`, 15, 40);
      doc.text(`Location: ${retailer.location}`, 15, 45);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, 50);
      doc.text(`Time: ${new Date().toLocaleTimeString()}`, 15, 55);
  
      // Products Table
      const tableData = formData.supplyData.map((item, index) => [
        index + 1,
        item.brand || "N/A",
        item.numberOfPackets || "0",
        `₹${Number(item.sellingPrice || 0).toFixed(2)}`,
        `₹${(Number(item.numberOfPackets) * Number(item.sellingPrice || 0)).toFixed(2)}`
      ]);
  
      doc.autoTable({
        startY: 65,
        head: [['#', 'Product', 'Qty', 'Unit Price', 'Total']],
        body: tableData,
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          overflow: 'linebreak',
          valign: 'middle',
          lineColor: [200, 200, 200],
          font: 'helvetica',
          fontStyle: 'normal'
        },
        headStyles: {
          fillColor: [44, 62, 80],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 60, halign: 'left' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 30, halign: 'right' },
          4: { cellWidth: 30, halign: 'right' }
        }
      });
  
      // Payment Summary
      const finalY = Math.min(doc.lastAutoTable.finalY + 15, 250);
      doc.setDrawColor(150, 150, 150);
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(120, finalY - 5, 75, 40, 3, 3, 'FD');
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("PAYMENT SUMMARY", 135, finalY, { align: 'center' });
      doc.setFont("helvetica", "normal");
      doc.text(`Subtotal:`, 125, finalY + 10);
      doc.text(`₹${Number(grandTotal.replace(/[^0-9.-]+/g,"")).toFixed(2)}`, 180, finalY + 10, { align: 'right' });
      doc.text(`Paid Amount:`, 125, finalY + 18);
      doc.text(`₹${Number(formData.paidAmount || 0).toFixed(2)}`, 180, finalY + 18, { align: 'right' });
      const balance = Number(grandTotal.replace(/[^0-9.-]+/g,"")) - Number(formData.paidAmount || 0);
      doc.setFont("helvetica", "bold");
      doc.text(`Balance Due:`, 125, finalY + 26);
      doc.text(`₹${balance.toFixed(2)}`, 180, finalY + 26, { align: 'right' });
  
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(100);
      doc.text("Thank you for your business!", 105, 285, { align: 'center' });
  
      const fileName = `Invoice_${retailer.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
  
    } catch (error) {
      console.error("PDF generation error:", error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.retailerId) {
      setSubmitError("Please select a retailer");
      return;
    }

    if (productCount === 0) {
      setSubmitError("Please add at least one product");
      return;
    }

    const validProducts = formData.supplyData.filter(
      (item) => item.brand && item.numberOfPackets && item.sellingPrice
    );

    if (validProducts.length === 0) {
      setSubmitError("Please fill in all product details");
      return;
    }

    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      const payload = {
        retailerId: formData.retailerId,
        salesData: validProducts.map((item) => ({
          brand: item.brand,
          numberOfPackets: item.numberOfPackets,
          sellingPrice: item.sellingPrice,
        })),
        totalAmount: parseFloat(grandTotal.replace("₹", "")),
        paidAmount: parseFloat(formData.paidAmount) || 0,
      };

      const response = await axios.post(
        `${BACKEND_URL}/api/supply/add`,
        payload
      );

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error.response?.data?.error ||
          "Failed to submit supply data. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      retailerId: "",
      supplyData: [],
      paidAmount: "",
    });
    setProductCount(0);
    setProductNames([]);
    setGrandTotal("₹0.00");
    setSubmitSuccess(false);
  };

  return (
    <div className="container mt-3 p-2">
      <h2 className="text-center mb-3">🚚 Supply Cigarettes</h2>

      {/* Retailer Selection */}
      <div className="card mb-3 shadow-sm">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center p-2">
          <h5 className="card-title mb-0">🏪 Select Retailer</h5>
          {formData.retailerId && (
            <button 
              className="btn btn-sm btn-light" 
              onClick={saveRetailerProducts}
            >
              <i className="fa fa-save me-1"></i> Save
            </button>
          )}
        </div>
        <div className="card-body p-2">
          <select
            className="form-select"
            value={formData.retailerId}
            onChange={(e) => handleRetailerSelect(e.target.value)}
          >
            <option value="">-- Select a Retailer --</option>
            {retailers.map((retailer) => (
              <option key={retailer._id} value={retailer._id}>
                {retailer.name} ({retailer.location})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Management */}
      <div className="card mb-3 shadow-sm">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center p-2">
          <h5 className="card-title mb-0">📦 Products</h5>
          <div>
            <button
              className="btn btn-sm btn-light me-1"
              onClick={() => setShowTemplateModal(true)}
            >
              <i className="fa fa-folder-open me-1"></i> Load
            </button>
            <button
              className="btn btn-sm btn-light"
              onClick={saveAsTemplate}
              disabled={productCount === 0}
            >
              <i className="fa fa-save me-1"></i> Save
            </button>
          </div>
        </div>
        <div className="card-body p-2">
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <label className="form-label">Number of Products</label>
              <input
                type="number"
                className="form-control"
                value={productCount}
                onChange={handleProductCountChange}
                min="0"
              />
            </div>
            <div className="col-12 col-md-6">
              <label className="form-label">Quick Actions</label>
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() =>
                  navigator.clipboard.writeText(
                    productNames.join("\n") +
                      "\n" +
                      formData.supplyData.map((p) => p.sellingPrice || "").join("\n")
                  )
                }
              >
                <i className="fa fa-copy me-1"></i> Copy Data
              </button>
            </div>
          </div>

          {/* Mobile Product List */}
          <div className="d-block d-md-none">
            {Array.from({ length: productCount }).map((_, index) => (
              <div className="card mb-2 p-2" key={index}>
                <div className="mb-2">
                  <label className="form-label">Product {index + 1}</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Name"
                    value={productNames[index] || ""}
                    onChange={(e) => handleProductNameChange(index, e.target.value)}
                  />
                  <div className="row g-2">
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Packets"
                        value={formData.supplyData[index]?.numberOfPackets || ""}
                        onChange={(e) => handlePacketChange(index, e.target.value)}
                        min="0"
                      />
                    </div>
                    <div className="col-6">
                      <input
                        type="number"
                        className="form-control"
                        placeholder="Price"
                        value={formData.supplyData[index]?.sellingPrice || ""}
                        onChange={(e) => handleSellingPriceChange(index, e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted">Total:</span>
                  <strong>{formData.supplyData[index]?.total || "₹0.00"}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Product Table */}
          <div className="d-none d-md-block">
            {productCount > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Packets</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: productCount }).map((_, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            value={productNames[index] || ""}
                            onChange={(e) => handleProductNameChange(index, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.supplyData[index]?.numberOfPackets || ""}
                            onChange={(e) => handlePacketChange(index, e.target.value)}
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={formData.supplyData[index]?.sellingPrice || ""}
                            onChange={(e) => handleSellingPriceChange(index, e.target.value)}
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="align-middle">
                          <strong>{formData.supplyData[index]?.total || "₹0.00"}</strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="row g-2 mt-3">
            <div className="col-12 col-md-4">
              <label className="form-label">💰 Paid Amount</label>
              <input
                type="number"
                className="form-control"
                value={formData.paidAmount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, paidAmount: e.target.value }))
                }
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center">
              <h5 className="mb-0">
                Grand Total: <span className="text-success">{grandTotal}</span>
              </h5>
            </div>
            <div className="col-12 col-md-4 d-flex align-items-center gap-2">
              <button 
                className="btn btn-primary flex-grow-1"
                onClick={generatePDF}
                disabled={!formData.retailerId || productCount === 0}
              >
                <i className="fa fa-download me-1"></i> PDF
              </button>
              <button
                className="btn btn-success flex-grow-1"
                onClick={handleSubmit}
                disabled={submitting || !formData.retailerId || productCount === 0}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Submit
                  </>
                ) : (
                  <>
                    <i className="fa fa-paper-plane me-1"></i> Submit
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Messages */}
          {submitSuccess && (
            <div className="alert alert-success mt-3 d-flex justify-content-between align-items-center">
              <span>
                <i className="fa fa-check-circle me-2"></i>
                Supply record submitted successfully!
              </span>
              <button className="btn btn-sm btn-outline-secondary" onClick={resetForm}>
                New Entry
              </button>
            </div>
          )}
          {submitError && (
            <div className="alert alert-danger mt-3">
              <i className="fa fa-exclamation-circle me-2"></i>
              {submitError}
            </div>
          )}
        </div>
      </div>

      {/* Load Template Modal */}
      {showTemplateModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">📁 Load Template</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowTemplateModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {templates.length === 0 ? (
                  <div className="text-center py-3">
                    <i className="fa fa-folder-open fa-3x text-muted mb-3"></i>
                    <p>No templates saved yet.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {templates.map((template, index) => (
                      <button
                        key={index}
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                        onClick={() => loadTemplate(template)}
                      >
                        <span>{template.name}</span>
                        <span className="badge bg-primary rounded-pill">
                          {template.products.length} products
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplyEntry;