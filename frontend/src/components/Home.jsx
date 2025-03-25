import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const Home = ({ handleLogout }) => {
    const navigate = useNavigate();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!localStorage.getItem('isLoggedIn')) {
            navigate('/login');
        }
    }, [navigate]);

    return <Dashboard handleLogout={handleLogout} />;
};

export default Home;