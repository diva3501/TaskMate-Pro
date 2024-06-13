import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

function SignUp() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/register', {
                username,
                password,
            });
            console.log('User registered:', response.data);
            // Redirect to login page after successful registration
            window.location.href = '/loginpage';
        } catch (err) {
            console.error('Registration error:', err);
            setError(err.response ? err.response.data.error : 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Sign Up</h2>
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
                    <button type="submit">Sign Up</button>
                </div>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default SignUp;
