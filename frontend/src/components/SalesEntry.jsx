import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.min.css"; // For icons

const Sales = () => {
  const [retailers, setRetailers] = useState([]);
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [supplyData, setSupplyData] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [dueAmount, setDueAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState("");

  // Set current date
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  // Fetch retailers
  useEffect(() => {
    const fetchRetailers = async () => {
      setLoading(true);
      try {
        const response = await axios.get("http://localhost:3001/api/retailers");
        setRetailers(response.data);
      } catch (error) {
        alert("❌ Failed to fetch retailers. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchRetailers();
  }, []);

  // Fetch supply data when a retailer is selected
  const handleRetailerSelect = async (retailerId) => {
    if (!retailerId) return;

    setSelectedRetailer(retailerId);
    setSalesData({});
    setTotalAmount(0);
    setPaidAmount(0);
    setDueAmount(0);
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:3001/api/supply?retailerId=${retailerId}`);
      setSupplyData(response.data.data);
    } catch (error) {
      alert("❌ Failed to fetch supply data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle changes in sold quantity
  const handleSoldChange = (brand, value) => {
    const soldPackets = parseInt(value, 10) || 0;
    if (soldPackets < 0) return; // Prevent negative values

    // Get total available stock for this brand
    const totalStock = supplyData
      .filter((supply) => supply.salesData.some((item) => item.brand === brand))
      .reduce((sum, supply) => {
        const stock = supply.salesData.find((item) => item.brand === brand)?.numberOfPackets || 0;
        return sum + stock;
      }, 0);

    if (soldPackets > totalStock) {
      alert(`⚠️ You cannot sell more than ${totalStock} packets.`);
      return;
    }

    const updatedSalesData = { ...salesData, [brand]: soldPackets };
    setSalesData(updatedSalesData);

    // Recalculate total amount
    let calculatedTotal = 0;
    Object.entries(updatedSalesData).forEach(([brand, qty]) => {
      const sellingPrice = supplyData.find((supply) =>
        supply.salesData.some((item) => item.brand === brand)
      )?.salesData.find((item) => item.brand === brand)?.sellingPrice;

      if (sellingPrice) {
        calculatedTotal += qty * sellingPrice;
      }
    });

    setTotalAmount(calculatedTotal);
    setDueAmount(calculatedTotal - paidAmount);
  };

  // Handle changes in paid amount
  const handlePaidChange = (value) => {
    const paid = parseInt(value, 10) || 0;
    if (paid > totalAmount) {
      alert("⚠️ Paid amount cannot exceed the total amount.");
      return;
    }
    setPaidAmount(paid);
    setDueAmount(totalAmount - paid);
  };

  // Group data by brand
  const groupedSalesData = {};
  supplyData.forEach((supply) => {
    supply.salesData.forEach((item) => {
      if (!groupedSalesData[item.brand]) {
        groupedSalesData[item.brand] = {
          brand: item.brand,
          totalStock: 0,
          sellingPrice: item.sellingPrice,
        };
      }
      groupedSalesData[item.brand].totalStock += item.numberOfPackets;
    });
  });

  // Submit sales data
  const handleSubmit = async () => {
    if (!selectedRetailer || totalAmount === 0) {
      alert("⚠️ Please select a retailer and enter valid sales data.");
      return;
    }

    if (!window.confirm("Are you sure you want to submit this sale?")) {
      return;
    }

    const salesPayload = {
      retailerId: selectedRetailer,
      salesData: Object.entries(salesData).map(([brand, quantity]) => ({
        brand,
        numberOfPacketsSold: quantity,
      })),
      totalAmount,
      paidAmount,
      date,
    };

    setSubmitting(true);
    try {
      await axios.post("http://localhost:3001/api/sales/add", salesPayload);
      alert("✅ Sales recorded successfully!");
      setSalesData({});
      setTotalAmount(0);
      setPaidAmount(0);
      setDueAmount(0);
      setSupplyData([]);
      setSelectedRetailer(null);
    } catch (error) {
      alert("❌ Failed to record sales. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">📊 Record Sales</h2>
      <div className="mb-3 text-center">
        <strong>📅 Date: {date}</strong>
      </div>

      {/* Retailer Selection */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title">🏪 Select Retailer</h5>
        </div>
        <div className="card-body">
          <select
            className="form-control"
            onChange={(e) => handleRetailerSelect(e.target.value)}
            value={selectedRetailer || ""}
            disabled={loading}
          >
            <option value="">-- Select --</option>
            {retailers.map((retailer) => (
              <option key={retailer._id} value={retailer._id}>
                {retailer.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading data...</p>
        </div>
      ) : (
        supplyData.length > 0 && (
          <div className="card mb-3">
            <div className="card-header">
              <h5 className="card-title">📦 Available Stock</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>🚬 Brand</th>
                      <th>📦 Stock</th>
                      <th>🛒 Sold</th>
                      <th>💰 Price (₹)</th>
                      <th>💵 Subtotal (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(groupedSalesData).map(({ brand, totalStock, sellingPrice }) => (
                      <tr key={brand}>
                        <td>{brand}</td>
                        <td>{totalStock}</td>
                        <td>
                          <input
                            type="number"
                            className="form-control"
                            value={salesData[brand] || 0}
                            onChange={(e) => handleSoldChange(brand, e.target.value)}
                          />
                        </td>
                        <td>₹{sellingPrice}</td>
                        <td>₹{(salesData[brand] || 0) * sellingPrice}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {/* Payment Section */}
      <div className="card mb-3">
        <div className="card-header">
          <h5 className="card-title">💵 Payment</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label>Total Amount (₹):</label>
              <input type="text" className="form-control" value={totalAmount.toLocaleString()} readOnly />
            </div>
            <div className="col-md-4">
              <label>Paid Amount (₹):</label>
              <input
                type="number"
                className="form-control"
                min="0"
                value={paidAmount}
                onChange={(e) => handlePaidChange(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label>Due Amount (₹):</label>
              <input type="text" className="form-control text-danger" value={dueAmount.toLocaleString()} readOnly />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="text-center">
        <button
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={submitting || !selectedRetailer}
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-check"></i> Submit Sales
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sales;