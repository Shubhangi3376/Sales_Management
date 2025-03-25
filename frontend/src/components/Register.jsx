import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        
        axios.post('http://localhost:3001/register', { name, email, password })
        .then(result => {
            console.log(result);
            if (result.data === "Already registered") {
                alert("E-mail already registered! Please login to proceed.");
                navigate('/login');
            } else {
                alert("Registered successfully! Please login to proceed.");
                navigate('/login');
            }
        })
        .catch(err => console.log(err));
    };

    return (
        <div style={{
            backgroundColor: "#f8f9fa",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <div className="p-4 rounded shadow-sm"
                style={{
                    width: "35%",
                    backgroundColor: "#ffffff",
                    borderRadius: "10px",
                    border: "1px solid #dee2e6"
                }}>
                
                <h2 className="mb-3 text-center" style={{ fontWeight: "bold", color: "#343a40" }}>
                    Register
                </h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="form-label">
                            <strong>Name</strong>
                        </label>
                        <input 
                            type="text"
                            placeholder="Enter your name"
                            className="form-control"
                            id="name"
                            onChange={(event) => setName(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            <strong>Email Address</strong>
                        </label>
                        <input 
                            type="email"
                            placeholder="Enter your email"
                            className="form-control"
                            id="email"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                            <strong>Password</strong>
                        </label>
                        <input 
                            type="password"
                            placeholder="Enter your password"
                            className="form-control"
                            id="password"
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2"
                        style={{ fontWeight: "bold", fontSize: "1rem", backgroundColor: "#007bff", border: "none" }}>
                        Register
                    </button>
                </form>

                <p className="text-center mt-3" style={{ color: "#6c757d" }}>
                    Already have an account?
                </p>

                <Link to='/login' className="btn btn-outline-primary w-100 py-2">
                    Login
                </Link>
            </div>
        </div>
    );
};

export default Register;
