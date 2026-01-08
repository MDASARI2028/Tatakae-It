// frontend/src/pages/ProgressPage.js

import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrophy, FaFireAlt, FaChartLine, FaBullseye, FaCalendarAlt, FaArrowUp, FaArrowDown, FaDumbbell } from 'react-icons/fa';
import BackButton from '../components/common/BackButton';
import './ProgressPage.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const ProgressPage = () => {
    const { token } = useContext(AuthContext);
    const { workouts } = useContext(WorkoutContext);
    const { templates, refreshTemplates } = useContext(TemplateContext);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [bodyMetrics, setBodyMetrics] = useState([]);
    const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'

    useEffect(() => {
        if (templates.length === 0 && token) refreshTemplates();
    }, [templates.length, token, refreshTemplates]);

    useEffect(() => {
        const fetchMetrics = async () => {
            if (!token) return;
            try {
                const res = await fetch('/api/metrics', { headers: { 'x-auth-token': token } });
                if (res.ok) setBodyMetrics(await res.json());
            } catch (error) { console.error('Failed to fetch metrics:', error); }
        };
        fetchMetrics();
    }, [token]);

    const handleTemplateChange = (e) => {
        const template = templates.find(t => t._id === e.target.value);
        setSelectedTemplate(template);
    };

    // Filter Workouts by Time Range
    const filteredWorkouts = useMemo(() => {
        if (!selectedTemplate || workouts.length === 0) return [];
        const now = new Date();
        const cutoff = new Date();
        if (timeRange === 'week') cutoff.setDate(now.getDate() - 7);
        if (timeRange === 'month') cutoff.setMonth(now.getMonth() - 1);
        if (timeRange === 'year') cutoff.setFullYear(now.getFullYear() - 1);
        if (timeRange === 'all') cutoff.setFullYear(1900);

        return workouts.filter(w => {
            const wDate = new Date(w.date);
            // Must match template exercises (fuzzy check: contains at least one)
            const matchesTemplate = w.exercises.some(we =>
                selectedTemplate.exercises.some(te => te.name.toLowerCase() === we.name.toLowerCase())
            );
            return wDate >= cutoff && matchesTemplate;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [workouts, selectedTemplate, timeRange]);

    // Calculate detailed analytics per exercise
    const exerciseAnalytics = useMemo(() => {
        if (!selectedTemplate || filteredWorkouts.length === 0) return [];

        return selectedTemplate.exercises.map(templateEx => {
            const exName = templateEx.name.toLowerCase();
            const history = [];

            // Extract history for this exercise from filtered workouts
            filteredWorkouts.forEach(w => {
                const matchedEx = w.exercises.find(we => we.name.toLowerCase() === exName);
                if (matchedEx) {
                    history.push({
                        date: w.date,
                        weight: Number(matchedEx.weight) || 0,
                        sets: Number(matchedEx.sets) || 0,
                        reps: Number(matchedEx.reps) || 0,
                        volume: (Number(matchedEx.sets) * Number(matchedEx.reps) * Number(matchedEx.weight)) || 0
                    });
                }
            });

            if (history.length === 0) return null;

            // Comparison: Current (Latest) vs Previous (Second Latest in TOTAL history, not just filtered)
            // To get accurate "Previous", we might need to look beyond the filter. 
            // For simplicity/performance, let's use the last 2 from the current filtered set if available, 
            // OR we'd need a separate lookup. Let's stick to filtered set for visual consistency, 
            // or better: Find the absolute latest stats from ALL workouts for the comparison box.

            // Let's use the `filteredWorkouts` for the Chart, but find the "Latest vs Previous" from global workouts for the Stats Card.
            // ... Actually, users usually compare "Recent Performance".

            const latest = history[history.length - 1];
            const previous = history.length > 1 ? history[history.length - 2] : null;

            const comparison = previous ? {
                weightDiff: latest.weight - previous.weight,
                setsDiff: latest.sets - previous.sets,
                repsDiff: latest.reps - previous.reps,
                volumeDiff: latest.volume - previous.volume,
                volumeChange: previous.volume ? ((latest.volume - previous.volume) / previous.volume * 100).toFixed(1) : 0
            } : null;

            // Chart Data
            const chartData = {
                labels: history.map(h => new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Weight',
                    data: history.map(h => h.weight),
                    borderColor: '#8b5cf6', // Violet
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            };

            return {
                name: templateEx.name,
                latest,
                previous,
                comparison,
                chartData
            };
        }).filter(Boolean);
    }, [filteredWorkouts, selectedTemplate]);

    // Helper function to create body metric chart data
    const bodyMetricCharts = useMemo(() => {
        if (bodyMetrics.length === 0) return [];

        const sortedMetrics = [...bodyMetrics].sort((a, b) => new Date(a.date) - new Date(b.date));

        const charts = [];

        // Weight Chart
        const weightData = {
            labels: sortedMetrics.map(m => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [{
                label: 'Weight (kg)',
                data: sortedMetrics.map(m => m.weight),
                borderColor: '#a78bfa',
                backgroundColor: 'rgba(167, 139, 250, 0.15)',
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 6,
                pointBackgroundColor: '#1e293b',
                pointBorderColor: '#a78bfa',
                pointBorderWidth: 3,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#a78bfa',
                pointHoverBorderColor: '#fff'
            }]
        };
        charts.push({ name: 'Weight', data: weightData, unit: 'kg' });

        // Body Fat % Chart
        const bodyFatMetrics = sortedMetrics.filter(m => m.bodyFatPercentage);
        if (bodyFatMetrics.length > 0) {
            const bodyFatData = {
                labels: bodyFatMetrics.map(m => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Body Fat %',
                    data: bodyFatMetrics.map(m => m.bodyFatPercentage),
                    borderColor: '#f472b6',
                    backgroundColor: 'rgba(244, 114, 182, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#1e293b',
                    pointBorderColor: '#f472b6',
                    pointBorderWidth: 3,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#f472b6',
                    pointHoverBorderColor: '#fff'
                }]
            };
            charts.push({ name: 'Body Fat', data: bodyFatData, unit: '%' });
        }

        // Waist Chart
        const waistMetrics = sortedMetrics.filter(m => m.waist);
        if (waistMetrics.length > 0) {
            const waistData = {
                labels: waistMetrics.map(m => new Date(m.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                datasets: [{
                    label: 'Waist (cm)',
                    data: waistMetrics.map(m => m.waist),
                    borderColor: '#c084fc',
                    backgroundColor: 'rgba(192, 132, 252, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3,
                    pointRadius: 6,
                    pointBackgroundColor: '#1e293b',
                    pointBorderColor: '#c084fc',
                    pointBorderWidth: 3,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#c084fc',
                    pointHoverBorderColor: '#fff'
                }]
            };
            charts.push({ name: 'Waist', data: waistData, unit: 'cm' });
        }

        return charts;
    }, [bodyMetrics]);


    // Animation Variants
    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

    return (
        <motion.div className="progress-page-enhanced system-ui" variants={containerVariants} initial="hidden" animate="visible">
            <header className="progress-header">
                <div className="header-left">
                    <BackButton />
                    <div>
                        <h2>Performance Analytics</h2>
                        <p className="sub">Deep dive into your training progress</p>
                    </div>
                </div>
            </header>

            {/* Template Selector Card */}
            <motion.section className="analysis-controls-card" variants={itemVariants}>
                <div className="control-group">
                    <label><FaBullseye /> Select Template</label>
                    <div className="select-wrapper">
                        <select
                            className="modern-select"
                            value={selectedTemplate?._id || ""}
                            onChange={handleTemplateChange}
                        >
                            <option value="" disabled>Choose a template...</option>
                            {templates.map(t => <option key={t._id} value={t._id}>{t.templateName}</option>)}
                        </select>
                    </div>
                </div>

                {selectedTemplate && (
                    <div className="control-group">
                        <label><FaCalendarAlt /> Time Range</label>
                        <div className="time-filters">
                            {['week', 'month', 'year', 'all'].map(range => (
                                <button
                                    key={range}
                                    className={`filter-btn ${timeRange === range ? 'active' : ''}`}
                                    onClick={() => setTimeRange(range)}
                                >
                                    {range === 'all' ? 'All Time' : `Last ${range.charAt(0).toUpperCase() + range.slice(1)}`}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.section>

            {/* Analytics Grid */}
            <div className="analytics-content">
                {selectedTemplate ? (
                    <motion.div className="exercise-analytics-grid" variants={containerVariants}>
                        {exerciseAnalytics.length > 0 ? (
                            exerciseAnalytics.map((item, idx) => {
                                const isEven = idx % 2 !== 0; // 0=Left(Odd visually), 1=Right(Even visually)
                                return (
                                    <motion.div
                                        key={idx}
                                        className={`exercise-row ${isEven ? 'right' : 'left'}`}
                                        initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    >
                                        {/* Main Analysis Card */}
                                        <div className="exercise-analysis-card">
                                            <div className="card-header">
                                                <h3>{item.name}</h3>
                                                <span className="badge">Total Volume: {item.latest.volume}</span>
                                            </div>

                                            {/* Comparison now in side insight, keeping just current stats or chart here? 
                                                Actually, user said "beside ... giving some insight". 
                                                Let's keep the main chart and current stats here, move DIFFs to insight.
                                            */}
                                            <div className="current-stats-row">
                                                <div className="stat-pill">
                                                    <span className="label">Weight</span>
                                                    <span className="value">{item.latest.weight}kg</span>
                                                </div>
                                                <div className="stat-pill">
                                                    <span className="label">Sets x Reps</span>
                                                    <span className="value">{item.latest.sets} x {item.latest.reps}</span>
                                                </div>
                                            </div>

                                            {/* Chart */}
                                            <div className="mini-chart-container">
                                                <Line
                                                    data={item.chartData}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        plugins: {
                                                            legend: { display: false },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(139, 92, 246, 0.9)',
                                                                titleColor: '#fff',
                                                                bodyColor: '#fff',
                                                                padding: 12,
                                                                cornerRadius: 8,
                                                                displayColors: false,
                                                                callbacks: {
                                                                    label: (context) => ` ${context.parsed.y} kg`
                                                                }
                                                            }
                                                        },
                                                        scales: {
                                                            x: { display: false },
                                                            y: {
                                                                display: true,
                                                                grid: { color: 'rgba(138, 43, 226, 0.1)' },
                                                                ticks: { color: 'rgba(148, 163, 184, 0.8)' }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Side Insight Card (Fills the gap) */}
                                        <div className="side-insight-card">
                                            <h4>Quick Insights</h4>
                                            {item.comparison ? (
                                                <div className="insight-content">
                                                    <div className="insight-item">
                                                        <span>vs Last Session</span>
                                                        <div className={`diff-tag ${item.comparison.weightDiff >= 0 ? 'pos' : 'neg'}`}>
                                                            {item.comparison.weightDiff > 0 ? '+' : ''}{item.comparison.weightDiff}kg
                                                        </div>
                                                    </div>
                                                    <div className="insight-item">
                                                        <span>Volume Change</span>
                                                        <div className={`diff-tag ${item.comparison.volumeChange >= 0 ? 'pos' : 'neg'}`}>
                                                            {item.comparison.volumeChange > 0 ? '+' : ''}{item.comparison.volumeChange}%
                                                        </div>
                                                    </div>
                                                    <p className="insight-tip">
                                                        {item.comparison.volumeChange > 0
                                                            ? "Great progress! You're overloading effectively."
                                                            : "Keep pushing! Consistency is key."}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="insight-tip">Not enough data for insights yet. Keep logging!</p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="no-data-msg">No workouts found for this time range.</div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div className="select-prompt" variants={itemVariants}>
                        <FaChartLine size={48} />
                        <h3>Select a template to view advanced analytics</h3>
                    </motion.div>
                )}
            </div>

            {/* --- BODY METRICS PROGRESS SECTION --- */}
            {bodyMetricCharts.length > 0 && (
                <>
                    <motion.div
                        className="page-title"
                        variants={itemVariants}
                        style={{ marginTop: '3rem' }}
                    >
                        <h2>Body Metrics Progress</h2>
                        <p>Track your physical transformation over time</p>
                    </motion.div>

                    <motion.div
                        className="charts-grid-enhanced"
                        variants={containerVariants}
                    >
                        {bodyMetricCharts.map((chart, idx) => (
                            <motion.div
                                key={chart.name}
                                className="chart-card-enhanced"
                                variants={itemVariants}
                                whileHover={{ y: -8 }}
                            >
                                <div className="chart-header">
                                    <h3>{chart.name}</h3>
                                    <div className="chart-badge">{chart.unit}</div>
                                </div>
                                {chart.data.labels.length > 0 ? (
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
                                                            label: (context) => ` ${context.parsed.y.toFixed(1)} ${chart.unit}`
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
                                        <p>📊 Log more metrics to see your progression</p>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </motion.div>
    );
};

export default ProgressPage;