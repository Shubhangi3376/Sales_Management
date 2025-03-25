import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Dashboard = ({ handleLogout }) => {
    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Navbar - optimized for mobile */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
                <div className="container-fluid px-3">
                    {/* Brand and toggle button */}
                    <div className="d-flex w-100 align-items-center">
                        <NavLink className="navbar-brand me-auto" to="/home">
                            <span className="d-none d-sm-inline">Stock Tracker</span>
                            <span className="d-inline d-sm-none">ST</span>
                        </NavLink>
                        
                        <div className="d-flex align-items-center">
                            <button 
                                className="btn btn-outline-light btn-sm me-2 d-lg-none" 
                                onClick={handleLogout}
                                aria-label="Logout"
                            >
                                <i className="bi bi-box-arrow-right"></i>
                            </button>
                            <button 
                                className="navbar-toggler" 
                                type="button" 
                                data-bs-toggle="collapse" 
                                data-bs-target="#mainNavbar"
                                aria-controls="mainNavbar"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        </div>
                    </div>

                    {/* Collapsible content */}
                    <div className="collapse navbar-collapse" id="mainNavbar">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <NavItem to="/home/retailers" icon="shop" text="Retailers" />
                            <NavItem to="/home/supply" icon="truck" text="Supply Entry" />
                            <NavItem to="/home/sales" icon="cash-coin" text="Sales Entry" />
                            <NavItem to="/home/stock-summary" icon="clipboard-data" text="Stock Summary" />
                        </ul>
                        
                        {/* Logout button - desktop version */}
                        <div className="d-flex my-2 my-lg-0">
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
            <main className="flex-grow-1 container-fluid px-3 px-md-4 py-3">
                <Outlet />
            </main>
        </div>
    );
};

// Reusable NavItem component
const NavItem = ({ to, icon, text }) => (
    <li className="nav-item">
        <NavLink 
            className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
            } 
            to={to}
        >
            <i className={`bi bi-${icon} me-1 d-lg-none`}></i>
            {text}
        </NavLink>
    </li>
);

export default Dashboard;