import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    // Ensure your .env has no trailing slash:
    // VITE_BACKEND_URL=https://sales-management-9xbz.onrender.com
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            console.log('Attempting registration with:', { name, email });
            
            const response = await axios.post(
                `${BACKEND_URL}/register`, 
                { name, email, password },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    withCredentials: true
                }
            );
            
            console.log('Registration response:', response.data);
            
            if (response.data.message === "Already registered") {
                setError("E-mail already registered! Please login to proceed.");
            } else {
                alert("Registered successfully! Please login to proceed.");
                navigate('/login');
            }
        } catch (err) {
            console.error("Full registration error:", {
                message: err.message,
                code: err.code,
                config: err.config,
                response: err.response
            });
            
            if (err.response) {
                // Server responded with error status
                setError(err.response.data?.error || 
                    `Registration failed (Status: ${err.response.status})`);
            } else if (err.request) {
                // Request was made but no response received
                setError("No response from server. Please check your connection.");
            } else {
                // Something else happened
                setError("Registration failed. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-light min-vh-100 d-flex align-items-center py-4">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 col-lg-6 col-xl-5">
                        <div className="card shadow-sm border-0">
                            <div className="card-body p-4 p-md-5">
                                <h2 className="mb-4 text-center fw-bold text-dark">
                                    Register
                                </h2>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label fw-semibold">
                                            Name
                                        </label>
                                        <input 
                                            type="text"
                                            placeholder="Enter your name"
                                            className="form-control form-control-lg"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label fw-semibold">
                                            Email Address
                                        </label>
                                        <input 
                                            type="email"
                                            placeholder="Enter your email"
                                            className="form-control form-control-lg"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="password" className="form-label fw-semibold">
                                            Password
                                        </label>
                                        <input 
                                            type="password"
                                            placeholder="Enter your password"
                                            className="form-control form-control-lg"
                                            id="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isSubmitting}
                                            minLength="6"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100 py-2 fw-bold fs-5"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" 
                                                    role="status" 
                                                    aria-hidden="true">
                                                </span>
                                                Registering...
                                            </>
                                        ) : 'Register'}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="text-muted mb-2">
                                        Already have an account?
                                    </p>
                                    <Link 
                                        to='/login' 
                                        className="btn btn-outline-primary w-100 py-2"
                                    >
                                        Login
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;