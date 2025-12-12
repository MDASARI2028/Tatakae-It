// frontend/src/components/BodyMetricLogger.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaCheck, FaWeight, FaChartBar, FaRuler } from 'react-icons/fa';
import './BodyMetricLogger.css';

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
            setMetrics(initialState);
            onMetricLogged();
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError(err.message);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    const metricFields = [
        { name: 'weight', label: 'Weight (kg)', icon: FaWeight, required: true },
        { name: 'bodyFatPercentage', label: 'Body Fat %', icon: FaChartBar, required: false },
        { name: 'waist', label: 'Waist (cm)', icon: FaRuler, required: false },
    ];

    return (
        <motion.div 
            className="metric-logger-enhanced"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {error && (
                <motion.div 
                    className="alert alert-error"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {error}
                </motion.div>
            )}
            {success && (
                <motion.div 
                    className="alert alert-success"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <FaCheck /> {success}
                </motion.div>
            )}

            <motion.div className="metric-header" variants={itemVariants}>
                <h3>Log Your Body Metrics</h3>
                <p>Track your progress with detailed measurements</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="metric-logger-form-enhanced">
                <motion.div className="date-selector" variants={itemVariants}>
                    <label>Date</label>
                    <input 
                        type="date" 
                        name="date" 
                        className="form-input-metric" 
                        value={metrics.date} 
                        onChange={handleChange} 
                        required 
                    />
                </motion.div>

                <motion.div 
                    className="metrics-grid"
                    variants={containerVariants}
                >
                    {metricFields.map((field, idx) => {
                        const Icon = field.icon;
                        return (
                            <motion.div 
                                key={field.name}
                                className="metric-input-wrapper"
                                variants={itemVariants}
                                whileHover={{ y: -4 }}
                            >
                                <label htmlFor={field.name}>
                                    <Icon className="metric-icon" />
                                    {field.label}
                                    {field.required && <span className="required">*</span>}
                                </label>
                                <input 
                                    id={field.name}
                                    type="number" 
                                    name={field.name} 
                                    className="form-input-metric" 
                                    placeholder={field.label}
                                    value={metrics[field.name]} 
                                    onChange={handleChange}
                                    required={field.required}
                                    step="0.1"
                                />
                                <motion.div 
                                    className="input-underline"
                                    initial={{ scaleX: 0 }}
                                    whileFocus={{ scaleX: 1 }}
                                />
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div 
                    className="metric-summary"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h4>Current Values</h4>
                    <div className="summary-values">
                        {metrics.weight && (
                            <div className="summary-item">
                                <span>Weight:</span> <strong>{metrics.weight} kg</strong>
                            </div>
                        )}
                        {metrics.bodyFatPercentage && (
                            <div className="summary-item">
                                <span>Body Fat:</span> <strong>{metrics.bodyFatPercentage}%</strong>
                            </div>
                        )}
                        {metrics.waist && (
                            <div className="summary-item">
                                <span>Waist:</span> <strong>{metrics.waist} cm</strong>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.button 
                    type="submit" 
                    className="btn-save-metrics"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(138, 43, 226, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaCheck /> Save Metrics
                </motion.button>
            </form>
        </motion.div>
    );
};

export default BodyMetricLogger;