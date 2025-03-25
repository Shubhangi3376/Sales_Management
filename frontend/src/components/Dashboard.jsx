import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ handleLogout }) => {
    return (
        <>
            {/* Navbar - optimized for mobile */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container-fluid px-3">
                    <div className="d-flex w-100 align-items-center">
                        <NavLink className="navbar-brand me-auto" to="/home">
                            <span className="d-none d-sm-inline">Stock Tracker</span>
                            <span className="d-inline d-sm-none">ST</span>
                        </NavLink>
                        
                        <div className="d-flex align-items-center">
                            <button 
                                className="btn btn-outline-light btn-sm me-2 d-lg-none" 
                                onClick={handleLogout}
                            >
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
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
                        </div>
                    </div>

                    <div className="collapse navbar-collapse mt-2 mt-lg-0" id="navbarNavDropdown">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink 
                                    className={({ isActive }) => 
                                        `nav-link ${isActive ? 'active' : ''}`
                                    } 
                                    to="/home/retailers"
                                >
                                    <i className="bi bi-shop me-1 d-lg-none"></i>
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
                                    <i className="bi bi-truck me-1 d-lg-none"></i>
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
                                    <i className="bi bi-cash-coin me-1 d-lg-none"></i>
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
                                    <i className="bi bi-clipboard-data me-1 d-lg-none"></i>
                                    Stock Summary
                                </NavLink>
                            </li>
                        </ul>
                        <div className="d-flex pb-2 pb-lg-0">
                            <button 
                                className="btn btn-outline-light d-none d-lg-block" 
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Page Content - adjusted padding for mobile */}
            <div className="container-fluid px-3 px-md-4 py-3">
                <Outlet /> {/* Render nested routes here */}
            </div>
        </>
    );
};

export default Dashboard;