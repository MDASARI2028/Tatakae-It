// frontend/src/components/BodyMetricLogger.js

import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaCheck, FaWeight, FaChartBar, FaRuler } from 'react-icons/fa';
import api from '../api/axios'; // Import the configured axios instance
import './BodyMetricLogger.css';

const BodyMetricLogger = ({ onMetricLogged }) => {
    // We don't need token from context anymore since axios interceptor handles it
    // But we might need it for checking if user is logged in if we wanted to conditional render
    const { isAuthenticated } = useContext(AuthContext);

    // Helper to get local date string (YYYY-MM-DD) without UTC conversion
    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const initialState = {
        date: getLocalDateString(),
        weight: '',
        bodyFatPercentage: '',
        waist: '',
    };

    const [metrics, setMetrics] = useState(initialState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [latestMetrics, setLatestMetrics] = useState(null);

    useEffect(() => {
        const fetchLatestMetrics = async () => {
            if (!isAuthenticated) return;
            try {
                // Use api.get instead of fetch
                const response = await api.get('/api/metrics?limit=1');
                if (response.data && response.data.length > 0) {
                    setLatestMetrics(response.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch latest metrics", err);
            }
        };
        fetchLatestMetrics();
    }, [isAuthenticated]);



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
            // Use api.post instead of fetch
            await api.post('/api/metrics', metrics);

            setSuccess('Metrics logged successfully!');
            setMetrics(initialState);
            onMetricLogged?.();
            setTimeout(() => setSuccess(''), 3000);

            // Refresh latest metrics immediately for better UX
            setLatestMetrics(prev => ({ ...prev, ...metrics }));

        } catch (err) {
            // Axios error handling
            const msg = err.response?.data?.msg || err.message || 'Failed to log metrics.';
            setError(msg);
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
                        <div className="summary-item">
                            <span>Weight:</span> <strong>{metrics.weight || latestMetrics?.weight || '--'} kg</strong>
                        </div>
                        <div className="summary-item">
                            <span>Body Fat:</span> <strong>{metrics.bodyFatPercentage || latestMetrics?.bodyFatPercentage || '--'}%</strong>
                        </div>
                        <div className="summary-item">
                            <span>Waist:</span> <strong>{metrics.waist || latestMetrics?.waist || '--'} cm</strong>
                        </div>
                    </div>
                </motion.div>

                <motion.button
                    type="submit"
                    className="btn-save-metrics"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(21, 53, 212, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                >
                    <FaCheck /> Save Metrics
                </motion.button>
            </form>
        </motion.div>
    );
};

export default BodyMetricLogger;