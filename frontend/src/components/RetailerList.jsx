import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RetailerList = () => {
  const [retailers, setRetailers] = useState([]);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRetailers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/retailers');
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
      const response = await axios.post('http://localhost:3001/api/retailers/add', { name, contact, location });
      alert(response.data.message);
      fetchRetailers();
      setName('');
      setContact('');
      setLocation('');
    } catch (error) {
      console.error("Error adding retailer:", error);
      alert("Error adding retailer");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this retailer?")) {
      try {
        await axios.delete(`http://localhost:3001/api/retailers/delete/${id}`);
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
    <div className="container mt-5">
      <h2 className="text-center mb-4">🏪 Retailers List</h2>

      <div className="card p-3 mb-4 shadow-sm">
        <h4 className="text-center">➕ Add New Retailer</h4>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contact</label>
            <input type="tel" className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} pattern="[0-9]{10}" title="Enter a 10-digit phone number" required />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" className="form-control" value={location} onChange={(e) => setLocation(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-success w-100 mt-2">✅ Add Retailer</button>
        </form>
      </div>

      <div className="form-group">
        <input type="text" className="form-control" placeholder="🔍 Search by Name, Contact, or Location" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

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
            {filteredRetailers.length > 0 ? (
              filteredRetailers.map((retailer) => (
                <tr key={retailer._id}>
                  <td>{retailer.name}</td>
                  <td>{retailer.contact}</td>
                  <td>{retailer.location}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(retailer._id)}>❌ Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center">🚫 No retailers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetailerList;
