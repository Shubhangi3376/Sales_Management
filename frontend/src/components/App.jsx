import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './Home';
import Login from './Login';
import Register from './Register';
import RetailerList from './RetailerList';
import SupplyEntry from './SupplyEntry';
import SalesEntry from './SalesEntry';
import StockSummary from './StockSummary';

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        const storedLoginStatus = localStorage.getItem('isLoggedIn');
        if (storedLoginStatus === 'true') {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogin = () => {
        localStorage.setItem('isLoggedIn', 'true');
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn'); // Clear login status
        setIsLoggedIn(false); // Update state
    };

    return (
        <Routes>
            {/* Protected Routes */}
            <Route
                path="/home"
                element={isLoggedIn ? <Home handleLogout={handleLogout} /> : <Navigate to="/login" />}
            >
                <Route index element={<RetailerList />} /> {/* Default route for /home */}
                <Route path="retailers" element={<RetailerList />} />
                <Route path="supply" element={<SupplyEntry />} />
                <Route path="sales" element={<SalesEntry />} />
                <Route path="stock-summary" element={<StockSummary />} />
            </Route>

            {/* Public Routes */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
            <Route path="*" element={<Navigate to={isLoggedIn ? "/home" : "/login"} />} />
        </Routes>
    );
};

export default App;