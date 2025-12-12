// frontend/src/pages/ProgressPage.js

import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import { WorkoutContext } from '../context/WorkoutContext';
import { motion } from 'framer-motion';
import { FaTrophy, FaFireAlt, FaChartLine, FaBullseye } from 'react-icons/fa';
import './ProgressPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProgressPage = () => {
    const { token } = useContext(AuthContext);
    const { workouts } = useContext(WorkoutContext);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [exerciseCharts, setExerciseCharts] = useState([]);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (!token) return;
            const response = await fetch('/api/templates', { headers: { 'x-auth-token': token } });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        };
        fetchTemplates();
    }, [token]);

    useEffect(() => {
        if (!selectedTemplate || workouts.length === 0) {
            setExerciseCharts([]);
            return;
        }

        const templateExerciseNames = selectedTemplate.exercises.map(ex => ex.name.toLowerCase());
        const reversedWorkouts = [...workouts].reverse();

        const charts = templateExerciseNames.map((exerciseName, idx) => {
            const colors = ['#8A2BE2', '#9932CC', '#BA55D3', '#DA70D6', '#EE82EE'];
            const color = colors[idx % colors.length];

            const chartData = {
                labels: [],
                datasets: [{
                    label: 'Weight (kg)',
                    data: [],
                    borderColor: color,
                    backgroundColor: `${color}20`,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 5,
                    pointBackgroundColor: color,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointHoverRadius: 7
                }]
            };

            reversedWorkouts.forEach(workout => {
                workout.exercises.forEach(ex => {
                    if (ex.name.toLowerCase() === exerciseName) {
                        chartData.labels.push(new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                        chartData.datasets[0].data.push(ex.weight);
                    }
                });
            });

            return { name: exerciseName, data: chartData };
        });

        setExerciseCharts(charts);
    }, [selectedTemplate, workouts]);

    const handleTemplateChange = (e) => {
        const template = templates.find(t => t._id === e.target.value);
        setSelectedTemplate(template);
    };

    const getProgressMetrics = () => {
        if (!selectedTemplate || workouts.length === 0) return { totalWorkouts: 0, avgWeight: 0, maxWeight: 0 };

        let totalWeight = 0, count = 0, maxWeight = 0;

        workouts.forEach(workout => {
            workout.exercises.forEach(ex => {
                const isTemplateExercise = selectedTemplate.exercises.some(te => te.name.toLowerCase() === ex.name.toLowerCase());
                if (isTemplateExercise) {
                    totalWeight += ex.weight;
                    count++;
                    maxWeight = Math.max(maxWeight, ex.weight);
                }
            });
        });

        return {
            totalWorkouts: workouts.length,
            avgWeight: count > 0 ? (totalWeight / count).toFixed(1) : 0,
            maxWeight: maxWeight
        };
    };

    const metrics = getProgressMetrics();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div 
            className="progress-page-enhanced"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div className="page-title" variants={itemVariants}>
                <h2>Performance Analytics</h2>
                <p>Track your strength progression and celebrate your gains</p>
            </motion.div>

            {/* --- TEMPLATE SELECTOR --- */}
            <motion.div className="template-filter-container-enhanced" variants={itemVariants}>
                <div className="filter-header">
                    <FaBullseye className="filter-icon" />
                    <label htmlFor="progress-template-select">Select Template</label>
                </div>
                <select 
                    id="progress-template-select" 
                    className="form-select-enhanced" 
                    onChange={handleTemplateChange} 
                    defaultValue=""
                >
                    <option value="" disabled>📋 Choose a template...</option>
                    {templates.map(t => (
                        <option key={t._id} value={t._id}>{t.templateName}</option>
                    ))}
                </select>
            </motion.div>

            {selectedTemplate && (
                <>
                    {/* --- METRICS CARDS --- */}
                    <motion.div 
                        className="metrics-cards-grid"
                        variants={containerVariants}
                    >
                        <motion.div className="metric-card" variants={itemVariants}>
                            <div className="metric-icon-wrapper">
                                <FaChartLine />
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Total Workouts</span>
                                <span className="metric-value">{metrics.totalWorkouts}</span>
                            </div>
                        </motion.div>

                        <motion.div className="metric-card" variants={itemVariants}>
                            <div className="metric-icon-wrapper average">
                                <FaFireAlt />
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Average Weight</span>
                                <span className="metric-value">{metrics.avgWeight} kg</span>
                            </div>
                        </motion.div>

                        <motion.div className="metric-card" variants={itemVariants}>
                            <div className="metric-icon-wrapper max">
                                <FaTrophy />
                            </div>
                            <div className="metric-content">
                                <span className="metric-label">Max Weight</span>
                                <span className="metric-value">{metrics.maxWeight} kg</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* --- CHARTS GRID --- */}
                    <motion.div 
                        className="charts-grid-enhanced"
                        variants={containerVariants}
                    >
                        {exerciseCharts.length > 0 ? (
                            exerciseCharts.map((chart, idx) => (
                                <motion.div 
                                    key={chart.name} 
                                    className="chart-card-enhanced"
                                    variants={itemVariants}
                                    whileHover={{ y: -8 }}
                                >
                                    <div className="chart-header">
                                        <h3>{chart.name.charAt(0).toUpperCase() + chart.name.slice(1)}</h3>
                                        <div className="chart-badge">#{idx + 1}</div>
                                    </div>
                                    {chart.data.labels.length > 1 ? (
                                        <div className="chart-container">
                                            <Line 
                                                data={chart.data}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: true,
                                                    plugins: {
                                                        legend: { display: false },
                                                        tooltip: {
                                                            backgroundColor: 'rgba(138, 43, 226, 0.8)',
                                                            padding: 12,
                                                            borderRadius: 8,
                                                            titleFont: { size: 12, weight: 'bold' },
                                                            bodyFont: { size: 11 },
                                                            callbacks: {
                                                                label: (context) => ` ${context.parsed.y.toFixed(1)} kg`
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: false,
                                                            grid: { color: 'rgba(138, 43, 226, 0.1)' },
                                                            ticks: { color: 'rgba(240, 242, 245, 0.7)' }
                                                        },
                                                        x: {
                                                            grid: { display: false },
                                                            ticks: { color: 'rgba(240, 242, 245, 0.7)' }
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="no-data">
                                            <p>📊 Log more workouts to see your progression</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        ) : (
                            <motion.div 
                                className="empty-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <FaChartLine className="empty-icon" />
                                <h3>No Data Yet</h3>
                                <p>Start logging your workouts to see your progress charts!</p>
                            </motion.div>
                        )}
                    </motion.div>
                </>
            )}

            {!selectedTemplate && (
                <motion.div 
                    className="empty-state-large"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <FaBullseye className="empty-icon-large" />
                    <h3>Select a Template</h3>
                    <p>Choose a workout template above to analyze your progress</p>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ProgressPage;