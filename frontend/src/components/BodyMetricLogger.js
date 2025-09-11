// frontend/src/components/BodyMetricLogger.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './BodyMetricLogger.css'; // Import the new CSS

const BodyMetricLogger = ({ onMetricLogged }) => {
    const { token } = useContext(AuthContext);
    const initialState = {
        date: new Date().toISOString().split('T')[0],
        weight: '',
        bodyFatPercentage: '',
        waist: '',
    };
    
    const [metrics, setMetrics] = useState(initialState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setMetrics({ ...metrics, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!metrics.weight) {
            setError('Weight is a required field.');
            return;
        }

        try {
            const response = await fetch('/api/metrics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify(metrics),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.msg || 'Failed to log metrics.');
            }

            setSuccess('Metrics logged successfully!');
            setMetrics(initialState); // Reset form
            onMetricLogged(); // Refresh the history list
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="metric-logger">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit} className="metric-logger-form">
                <input type="date" name="date" className="form-input" value={metrics.date} onChange={handleChange} required />
                <input type="number" name="weight" className="form-input" placeholder="Weight (kg)" value={metrics.weight} onChange={handleChange} required />
                <input type="number" name="bodyFatPercentage" className="form-input" placeholder="Body Fat %" value={metrics.bodyFatPercentage} onChange={handleChange} />
                <input type="number" name="waist" className="form-input" placeholder="Waist (cm)" value={metrics.waist} onChange={handleChange} />
                <button type="submit" className="system-button btn-primary">Save Metrics</button>
            </form>
        </div>
    );
};

export default BodyMetricLogger;