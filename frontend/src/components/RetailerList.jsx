import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const RetailerList = () => {
  const [retailers, setRetailers] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormCollapsed, setIsFormCollapsed] = useState(true);

  const fetchRetailers = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/retailers`);
      setRetailers(response.data);
    } catch (error) {
      console.error("Error fetching retailers:", error);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/api/retailers/add`, { name, contact, location });
      alert(response.data.message);
      fetchRetailers();
      setName('');
      setContact('');
      setLocation('');
      setIsFormCollapsed(true); // Collapse form after submission
    } catch (error) {
      console.error("Error adding retailer:", error);
      alert("Error adding retailer");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this retailer?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/retailers/delete/${id}`);
        setRetailers(retailers.filter(retailer => retailer._id !== id));
        alert("Retailer deleted successfully!");
      } catch (error) {
        console.error("Error deleting retailer:", error);
        alert("Failed to delete retailer");
      }
    }
  };

  const filteredRetailers = retailers.filter(retailer =>
    retailer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    retailer.contact.includes(searchQuery) ||
    retailer.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-3">
      <h2 className="text-center mb-3">🏪 Retailers</h2>

      {/* Search Bar */}
      <div className="form-group mb-3">
        <div className="input-group">
          <input 
            type="text" 
            className="form-control" 
            placeholder="🔍 Search retailers..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
          <button 
            className={`btn ${isFormCollapsed ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setIsFormCollapsed(!isFormCollapsed)}
          >
            {isFormCollapsed ? '➕ Add Retailer' : '✖ Close'}
          </button>
        </div>
      </div>

      {/* Add Retailer Form - Collapsible */}
      {!isFormCollapsed && (
        <div className="card p-3 mb-4 shadow-sm">
          <h4 className="text-center mb-3">Add New Retailer</h4>
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-4 mb-2">
                <label>Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="col-md-4 mb-2">
                <label>Contact</label>
                <input 
                  type="tel" 
                  className="form-control" 
                  value={contact} 
                  onChange={(e) => setContact(e.target.value)} 
                  pattern="[0-9]{10}" 
                  title="Enter a 10-digit phone number" 
                  required 
                />
              </div>
              <div className="col-md-4 mb-2">
                <label>Location</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-success w-100 mt-2">
              ✅ Add Retailer
            </button>
          </form>
        </div>
      )}

      {/* Retailers List */}
      {filteredRetailers.length > 0 ? (
        <div className="list-group">
          {filteredRetailers.map((retailer) => (
            <div key={retailer._id} className="list-group-item list-group-item-action">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{retailer.name}</h5>
                <button 
                  className="btn btn-danger btn-sm" 
                  onClick={() => handleDelete(retailer._id)}
                >
                  ❌
                </button>
              </div>
              <p className="mb-1">
                <strong>Contact:</strong> {retailer.contact}
              </p>
              <small>
                <strong>Location:</strong> {retailer.location}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <div className="alert alert-warning text-center">
          🚫 No retailers found
        </div>
      )}

      {/* Alternative: Table view for larger screens */}
      <div className="d-none d-md-block mt-4">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="thead-dark">
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRetailers.map((retailer) => (
                <tr key={retailer._id}>
                  <td>{retailer.name}</td>
                  <td>{retailer.contact}</td>
                  <td>{retailer.location}</td>
                  <td>
                    <button 
                      className="btn btn-danger btn-sm" 
                      onClick={() => handleDelete(retailer._id)}
                    >
                      ❌ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RetailerList;