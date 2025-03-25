import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // For displaying error messages
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        axios.post('http://localhost:3001/login', { email, password })
            .then(result => {
                console.log("Backend Response:", result.data); // Debugging

                if (result.data === "Success") {
                    console.log("Login Success");
                    localStorage.setItem('isLoggedIn', 'true'); // Store login status
                    onLogin(); // Update login state in App.js
                    navigate('/home'); // ✅ Redirect to home only on success
                } else {
                    console.log("Login Failed:", result.data);
                    setError(result.data); // Set error message for display
                }
            })
            .catch(err => {
                console.error("Login Error:", err);
                setError('Server error! Please try again later.'); // Set error message for display
            });
    };

    return (
        <div className="d-flex justify-content-center align-items-center text-center vh-100" style={{ backgroundColor: "#f8f9fa" }}>
            <div className="bg-white p-4 rounded shadow" style={{ width: '40%', maxWidth: '500px' }}>
                <h2 className="mb-3 text-dark">Login</h2>
                {/* Display error message if any */}
                {error && (
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3 text-start">
                        <label htmlFor="email" className="form-label">
                            <strong>Email Id</strong>
                        </label>
                        <input
                            type="email"
                            placeholder="Enter Email"
                            className="form-control"
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="password" className="form-label">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            className="form-control"
                            id="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
                <p className="my-2 text-dark">Don&apos;t have an account?</p>
                <Link to="/register" className="btn btn-secondary w-100">Register</Link>
            </div>
        </div>
    );
};

export default Login;