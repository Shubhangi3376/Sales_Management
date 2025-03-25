import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Table, Container, Accordion, Button, ButtonGroup, 
  ProgressBar, Badge, Form, Alert, Spinner
} from "react-bootstrap";
import { 
  ArrowUp, ArrowDown, Download, ExclamationTriangleFill, 
  CartPlus, InfoCircle 
} from "react-bootstrap-icons";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const processRetailerData = (retailer) => {
  if (!retailer) return null;
  
  try {
    const retailerId = retailer.retailerId || "N/A";
    const retailerName = retailer.retailerName || "Unknown Retailer";
    const earnings = Number(retailer.earnings) || 0;
    const totalDues = Number(retailer.totalDues) || 0;
    const inventoryHealthScore = Math.min(Math.max(Number(retailer.inventoryHealthScore) || 0, 0, 100));
    const performanceVsAverage = Number(retailer.performanceVsAverage) || 0;
    
    const totalSupplied = retailer.totalSupplied || {};
    const totalSold = retailer.totalSold || {};
    const remainingStock = retailer.remainingStock || {};
    const stockTrends = retailer.stockTrends || {};
    const turnoverRates = retailer.turnoverRates || {};
    
    const brands = Object.keys(totalSupplied || {});
    const brandData = brands.map(brand => ({
      brand,
      supplied: Number(totalSupplied?.[brand]) || 0,
      sold: Number(totalSold?.[brand]) || 0,
      remaining: Number(remainingStock?.[brand]) || 0,
      trend: stockTrends?.[brand] || 'stable',
      turnover: Math.min(Math.max(Number(turnoverRates?.[brand]) || 0, 0), 100)
    }));
    
    const lowStockAlerts = Array.isArray(retailer.lowStockAlerts) 
      ? retailer.lowStockAlerts.filter(alert => typeof alert === 'string') 
      : [];
    const reorderSuggestions = Array.isArray(retailer.reorderSuggestions) 
      ? retailer.reorderSuggestions.filter(suggestion => typeof suggestion === 'string')
      : [];
    
    return {
      retailerId,
      retailerName,
      earnings,
      totalDues,
      inventoryHealthScore,
      performanceVsAverage,
      brandData,
      lowStockAlerts,
      reorderSuggestions
    };
  } catch (error) {
    console.error("Error processing retailer data:", error);
    return null;
  }
};

const StockSummary = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStockSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${BACKEND_URL}/api/stock`, {
        params: { time: timeFilter },
        timeout: 10000
      });
      
      if (!response?.data) {
        throw new Error("No data received from server");
      }
      
      const responseData = Array.isArray(response.data) ? response.data : [response.data];
      const processedData = responseData
        .map(processRetailerData)
        .filter(retailer => retailer && retailer.retailerId && retailer.brandData);
      
      if (processedData.length === 0) {
        throw new Error("No valid retailer data found");
      }
      
      setStockData(processedData);
    } catch (err) {
      console.error("API Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to load stock data");
      setStockData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockSummary();
  }, [timeFilter]);

  const filteredData = stockData.filter(retailer => {
    if (!retailer || !retailer.retailerName || !retailer.brandData) return false;
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    return (
      retailer.retailerName.toLowerCase().includes(term) ||
      retailer.brandData.some(brand => 
        brand?.brand?.toLowerCase().includes(term)
    ));
  });

  const exportToExcel = (retailer) => {
    try {
      if (!retailer || !retailer.brandData) {
        throw new Error("Invalid retailer data for export");
      }

      const inventorySheet = retailer.brandData.map(brand => ({
        Brand: brand.brand || "N/A",
        Supplied: brand.supplied || 0,
        Sold: brand.sold || 0,
        Remaining: brand.remaining || 0,
        "Turnover Rate (%)": brand.turnover || 0,
        Trend: brand.trend || "stable"
      }));
      
      const financialSheet = [
        { Metric: "Total Earnings", Value: retailer.earnings || 0 },
        { Metric: "Total Dues", Value: retailer.totalDues || 0 },
        { Metric: "Inventory Health Score", Value: retailer.inventoryHealthScore || 0 },
        { Metric: "Performance Vs Avg (%)", Value: retailer.performanceVsAverage || 0 },
      ];
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, 
        XLSX.utils.json_to_sheet(inventorySheet), 
        "Inventory"
      );
      XLSX.utils.book_append_sheet(workbook, 
        XLSX.utils.json_to_sheet(financialSheet), 
        "Financials"
      );
      
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(
        new Blob([excelBuffer], { type: "application/octet-stream" }),
        `${retailer.retailerName || "Retailer"}_Stock_Report.xlsx`
      );
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to generate Excel file: " + err.message);
    }
  };

  const renderBrandRow = (brand) => (
    <tr key={brand.brand || Math.random()}>
      <td>
        <div className="d-flex align-items-center">
          <span className="text-truncate" style={{ maxWidth: "100px" }}>
            {brand.brand || "N/A"}
          </span>
          {brand.trend === "up" && <ArrowUp color="green" className="ms-2 flex-shrink-0" />}
          {brand.trend === "down" && <ArrowDown color="red" className="ms-2 flex-shrink-0" />}
        </div>
      </td>
      <td>{(brand.supplied || 0).toLocaleString()}</td>
      <td>{(brand.sold || 0).toLocaleString()}</td>
      <td>{(brand.remaining || 0).toLocaleString()}</td>
      <td>
        <ProgressBar
          now={brand.turnover || 0}
          label={`${brand.turnover || 0}%`}
          variant={getProgressVariant(brand.turnover)}
        />
      </td>
    </tr>
  );

  const getProgressVariant = (value) => {
    const numericValue = Number(value) || 0;
    if (numericValue > 75) return "success";
    if (numericValue > 50) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading stock data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Error loading data</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={fetchStockSummary}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  if (filteredData.length === 0) {
    return (
      <Container className="mt-4">
        <Alert variant="info">
          <InfoCircle className="me-2" />
          {searchTerm ? "No matching retailers found" : "No stock data available"}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-3 mb-5 px-3 px-md-4">
      <h2 className="text-center mb-4">Stock Analytics Dashboard</h2>
      
      {/* Filters - Stack on mobile */}
      <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
        <Form.Control
          type="search"
          placeholder="Search retailers or brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow-1"
        />
        
        <ButtonGroup className="flex-wrap">
          {["week", "month", "quarter", "year"].map((period) => (
            <Button
              key={period}
              variant={timeFilter === period ? "primary" : "outline-primary"}
              onClick={() => setTimeFilter(period)}
              className="text-nowrap"
              size="sm"
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Retailers List */}
      <Accordion alwaysOpen>
        {filteredData.map((retailer, index) => (
          <Accordion.Item eventKey={index.toString()} key={retailer.retailerId || index}>
            <Accordion.Header className="py-2">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center w-100 pe-2 gap-2">
                <div className="d-flex align-items-center">
                  <strong className="text-truncate" style={{ maxWidth: "200px" }}>
                    {retailer.retailerName || "Unknown Retailer"}
                  </strong>
                  {(retailer.lowStockAlerts?.length || 0) > 0 && (
                    <Badge bg="danger" className="ms-2">
                      {retailer.lowStockAlerts.length} Alerts
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToExcel(retailer);
                  }}
                  className="ms-md-2 mt-2 mt-md-0"
                >
                  <Download size={16} className="me-1" />
                  <span className="d-none d-md-inline">Export</span>
                </Button>
              </div>
            </Accordion.Header>

            <Accordion.Body className="p-2 p-md-3">
              <div className="mb-4">
                <h5>Inventory Overview</h5>
                <div className="table-responsive">
                  <Table bordered hover className="mb-4" size="sm">
                    <thead className="table-light">
                      <tr>
                        <th>Brand</th>
                        <th>Supplied</th>
                        <th>Sold</th>
                        <th>Remaining</th>
                        <th>Turnover</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(retailer.brandData || []).map(renderBrandRow)}
                    </tbody>
                  </Table>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <h5 className="mb-3">Sales Visualization</h5>
                  <div style={{ height: "250px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={retailer.brandData || []}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <XAxis dataKey="brand" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => (value || 0).toLocaleString()}
                        />
                        <Bar 
                          dataKey="supplied" 
                          name="Supplied" 
                          fill="#8884d8" 
                          radius={[4, 4, 0, 0]} 
                        />
                        <Bar 
                          dataKey="sold" 
                          name="Sold" 
                          fill="#82ca9d" 
                          radius={[4, 4, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <h5 className="mb-3">Retailer Summary</h5>
                  <Table bordered className="mb-3" size="sm">
                    <tbody>
                      <tr>
                        <td><strong>Earnings</strong></td>
                        <td>₹{(retailer.earnings || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Dues</strong></td>
                        <td>₹{(retailer.totalDues || 0).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Inventory Health</strong></td>
                        <td>
                          <ProgressBar
                            now={retailer.inventoryHealthScore || 0}
                            label={`${retailer.inventoryHealthScore || 0}%`}
                            variant={getProgressVariant(retailer.inventoryHealthScore)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td><strong>Performance</strong></td>
                        <td>
                          {(retailer.performanceVsAverage || 0) > 0 ? (
                            <span className="text-success">
                              +{retailer.performanceVsAverage}% <ArrowUp />
                            </span>
                          ) : (
                            <span className="text-danger">
                              {retailer.performanceVsAverage}% <ArrowDown />
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  {/* Alerts Section */}
                  <div className="mb-3">
                    {(retailer.lowStockAlerts?.length || 0) > 0 && (
                      <Alert variant="warning" className="mb-3">
                        <Alert.Heading className="d-flex align-items-center">
                          <ExclamationTriangleFill className="me-2 flex-shrink-0" />
                          <span>Low Stock Alerts ({retailer.lowStockAlerts.length})</span>
                        </Alert.Heading>
                        <ul className="mb-0 ps-3">
                          {retailer.lowStockAlerts.map((alert, idx) => (
                            <li key={idx} className="small">{alert || "Unknown alert"}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}

                    {(retailer.reorderSuggestions?.length || 0) > 0 && (
                      <Alert variant="info">
                        <Alert.Heading className="d-flex align-items-center">
                          <CartPlus className="me-2 flex-shrink-0" />
                          <span>Reorder Suggestions ({retailer.reorderSuggestions.length})</span>
                        </Alert.Heading>
                        <ul className="mb-0 ps-3">
                          {retailer.reorderSuggestions.map((suggestion, idx) => (
                            <li key={idx} className="small">{suggestion || "Unknown suggestion"}</li>
                          ))}
                        </ul>
                      </Alert>
                    )}
                  </div>
                </div>
              </div>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </Container>
  );
};

export default StockSummary;