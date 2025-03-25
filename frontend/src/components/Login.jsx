import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await axios.post(`${BACKEND_URL}/login`, { 
                email, 
                password 
            });

            if (result.data === "Success") {
                localStorage.setItem('isLoggedIn', 'true');
                onLogin();
                navigate('/home');
            } else {
                setError(result.data || 'Invalid credentials');
            }
        } catch (err) {
            console.error("Login Error:", err);
            setError(err.response?.data?.message || 'Server error! Please try again later.');
        } finally {
            setIsLoading(false);
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
                                    Login
                                </h2>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
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
                                            disabled={isLoading}
                                            autoComplete="username"
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
                                            disabled={isLoading}
                                            autoComplete="current-password"
                                        />
                                    </div>

                                    <button 
                                        type="submit" 
                                        className="btn btn-primary w-100 py-2 fw-bold fs-5"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" 
                                                    role="status" 
                                                    aria-hidden="true">
                                                </span>
                                                Logging in...
                                            </>
                                        ) : 'Login'}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p className="text-muted mb-2">
                                        Don't have an account?
                                    </p>
                                    <Link 
                                        to="/register" 
                                        className="btn btn-outline-primary w-100 py-2"
                                    >
                                        Register
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

export default Login;