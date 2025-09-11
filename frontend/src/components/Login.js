// frontend/src/components/Login.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './AuthForms.css';

const Login = () => {
  // CORRECT: All hooks are called inside the component function.
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const { email, password } = formData;
  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (!result.success) {
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
      <div>
        <label htmlFor="email">Hunter ID (Email)</label>
        <input
          id="email"
          type="email"
          name="email"
          className="form-input"
          value={email}
          onChange={onChange}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Shadow Key (Password)</label>
        <div className="password-wrapper">
          <input
            id="password"
            type={isPasswordVisible ? "text" : "password"}
            name="password"
            className="form-input"
            value={password}
            onChange={onChange}
            required
          />
          <button type="button" className="eye-icon" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>
      <button type="submit" className="system-button btn-primary" onMouseMove={handleMouseMove} // <-- ADD THIS
        >Use The System</button>
    </form>
  );
};

export default Login;