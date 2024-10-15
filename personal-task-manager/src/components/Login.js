import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; 
import './Auth.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:5000/login', {
            username,
            password,
        });
        localStorage.setItem('username', username); 
        localStorage.setItem('token', response.data.token); 
        navigate('/homepage');
    } catch (err) {
        console.error('Login error:', err);
        setError(err.response ? err.response.data.error : 'Login failed');
    }
};


    return (
        <div className="auth-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <button type="submit">Login</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
            <div className="signup-link">
                <p>Don't have an account? <Link to="/signuppage">Sign up here</Link></p>
            </div>
        </div>
    );
}

export default Login;
