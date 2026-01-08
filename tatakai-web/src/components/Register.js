// frontend/src/components/Register.js
import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './AuthForms.css'; // Import the new CSS

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '' // For confirmation
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { username, email, password, password2 } = formData;
    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== password2) {
            setError('Passwords do not match.');
            return;
        }

        const result = await register(username, email, password, password2);

        if (result.success) {
            setSuccess('You have Awakened! Switch to the Level Up tab to level up.');
            setFormData({ username: '', email: '', password: '', password2: '' });
        } else {
            setError(result.error);
        }
    };
    const handleMouseMove = (e) => {
        const btn = e.currentTarget;
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--x', `${x}px`);
        btn.style.setProperty('--y', `${y}px`);
    };
    return (
        <form onSubmit={onSubmit} className="auth-form">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <div>
                <label htmlFor="username">Code Name</label>
                <input id="username" type="text" name="username" className="form-input" value={username} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="email">Email ID</label>
                <input id="email" type="email" name="email" className="form-input" value={email} onChange={onChange} required />
            </div>
            <div>
                <label htmlFor="password">Create Password</label>
                <input id="password" type="password" name="password" className="form-input" value={password} onChange={onChange} minLength="6" required />
            </div>
            <div>
                <label htmlFor="password2">Confirm Password</label>
                <input id="password2" type="password" name="password2" className="form-input" value={password2} onChange={onChange} minLength="6" required />
            </div>
            <button type="submit" className="system-button btn-primary" onMouseMove={handleMouseMove} // <-- ADD THIS
            >Awaken</button>
        </form>
    );
};

export default Register;