import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ handleLogout }) => {
    return (
        <>
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid">
                    <NavLink className="navbar-brand" to="/home">Stock Tracker</NavLink>
                    <button 
                        className="navbar-toggler" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#navbarNavDropdown"
                        aria-controls="navbarNavDropdown"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } 
                                    to="/home/retailers"
                                >
                                    Retailers
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } 
                                    to="/home/supply"
                                >
                                    Supply Entry
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } 
                                    to="/home/sales"
                                >
                                    Sales Entry
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } 
                                    to="/home/stock-summary"
                                >
                                    Stock Summary
                                </NavLink>
                            </li>
                        </ul>
                        <div className="d-flex">
                            <button 
                                className="btn btn-outline-light" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="container mt-4">
                <Outlet /> {/* Render nested routes here */}
            </div>
        </>
    );
};

export default Dashboard;