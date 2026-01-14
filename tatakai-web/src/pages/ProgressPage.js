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
    const { workouts, fetchWorkouts } = useContext(WorkoutContext);
    const { templates, refreshTemplates } = useContext(TemplateContext);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [bodyMetrics, setBodyMetrics] = useState([]);
    const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year', 'all'

    useEffect(() => {
        // Force refresh workouts when entering the page to ensure latest data
        if (token) fetchWorkouts();
    }, [token, fetchWorkouts]);

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
                // Find ALL matching exercises in this workout (in case of multiple sets logged separately)
                const matchedExercises = w.exercises.filter(we => we.name.toLowerCase() === exName);

                if (matchedExercises.length > 0) {
                    // Aggregate stats for the day
                    const maxWeight = Math.max(...matchedExercises.map(e => Number(e.weight) || 0));

                    // Volume = Sum of (Weight * Sets * Reps) for each entry
                    const dayVolume = matchedExercises.reduce((acc, e) => {
                        const weight = Number(e.weight) || 0;
                        const sets = Number(e.sets) || 1; // Default to 1 if missing
                        const reps = Number(e.reps) || 0;
                        return acc + (weight * sets * reps);
                    }, 0);

                    const totalSets = matchedExercises.reduce((acc, e) => acc + (Number(e.sets) || 0), 0);
                    const totalReps = matchedExercises.reduce((acc, e) => acc + ((Number(e.sets) || 1) * (Number(e.reps) || 0)), 0);

                    history.push({
                        date: w.date,
                        weight: maxWeight, // Taking the max weight of the day for the chart
                        sets: totalSets,
                        reps: totalReps,
                        volume: dayVolume
                    });
                }
            });

            if (history.length === 0) return null;

            // Comparison: Current (Latest) vs Previous (Second Latest in TOTAL history, not just filtered)
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
                chartData,
                history // <--- Added this
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
                                        <div className="exercise-analysis-card glass-panel">
                                            <div className="card-header-row">
                                                <div>
                                                    <h3>{item.name}</h3>
                                                    <span className="subtitle-date">Last: {new Date(item.latest.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="header-badges">
                                                    <div className="metric-badge volume">
                                                        <span className="label">Vol</span>
                                                        <span className="val">{item.latest.volume}</span>
                                                    </div>
                                                    <div className="metric-badge weight">
                                                        <span className="label">Max</span>
                                                        <span className="val">{item.latest.weight}kg</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="current-stats-grid">
                                                <div className="stat-box">
                                                    <span className="kpi-label">Sets</span>
                                                    <span className="kpi-value">{item.latest.sets}</span>
                                                </div>
                                                <div className="stat-box">
                                                    <span className="kpi-label">Avg Reps</span>
                                                    <span className="kpi-value">{Math.round(item.latest.reps / (item.latest.sets || 1))}</span>
                                                </div>
                                                <div className="stat-box highlight">
                                                    <span className="kpi-label">Volume</span>
                                                    <span className="kpi-value">{item.latest.volume}</span>
                                                </div>
                                            </div>

                                            {/* Advanced Dual-Axis Chart */}
                                            <div className="advanced-chart-container">
                                                <Line
                                                    data={{
                                                        labels: item.chartData.labels,
                                                        datasets: [
                                                            {
                                                                label: 'Total Volume',
                                                                data: item.history.map(h => h.volume),
                                                                borderColor: '#a855f7', // Purple-500
                                                                backgroundColor: (context) => {
                                                                    const ctx = context.chart.ctx;
                                                                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                                                                    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.5)');
                                                                    gradient.addColorStop(1, 'rgba(168, 85, 247, 0.0)');
                                                                    return gradient;
                                                                },
                                                                fill: true,
                                                                yAxisID: 'y1',
                                                                tension: 0.4,
                                                                pointRadius: 4,
                                                                pointHoverRadius: 8
                                                            },
                                                            {
                                                                label: 'Max Weight',
                                                                data: item.history.map(h => h.weight),
                                                                borderColor: '#22d3ee', // Cyan-400
                                                                backgroundColor: 'rgba(34, 211, 238, 0.1)',
                                                                borderDash: [5, 5],
                                                                yAxisID: 'y2', // Right Axis
                                                                tension: 0.2,
                                                                pointRadius: 3,
                                                                pointHoverRadius: 6
                                                            }
                                                        ]
                                                    }}
                                                    options={{
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        interaction: {
                                                            mode: 'index',
                                                            intersect: false,
                                                        },
                                                        plugins: {
                                                            legend: {
                                                                display: true,
                                                                labels: { color: '#e2e8f0', usePointStyle: true }
                                                            },
                                                            tooltip: {
                                                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                                                titleColor: '#fff',
                                                                bodyColor: '#cbd5e1',
                                                                borderColor: '#334155',
                                                                borderWidth: 1,
                                                                padding: 10,
                                                                callbacks: {
                                                                    label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y}`
                                                                }
                                                            }
                                                        },
                                                        scales: {
                                                            x: {
                                                                display: false,
                                                                grid: { display: false }
                                                            },
                                                            y1: {
                                                                type: 'linear',
                                                                display: true,
                                                                position: 'left',
                                                                grid: { color: 'rgba(148, 163, 184, 0.1)' },
                                                                ticks: { color: '#a855f7' }, // Purple Text for Volume
                                                                title: { display: true, text: 'Volume', color: '#a855f7', font: { size: 10 } }
                                                            },
                                                            y2: {
                                                                type: 'linear',
                                                                display: true,
                                                                position: 'right',
                                                                grid: { display: false },
                                                                ticks: { color: '#22d3ee' }, // Cyan Text for Weight
                                                                title: { display: true, text: 'Weight (kg)', color: '#22d3ee', font: { size: 10 } }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        {/* Enhanced Side Insight Card */}
                                        <div className="side-insight-card glow-border">
                                            <div className="insight-header">
                                                <FaFireAlt className="insight-icon" />
                                                <h4>Performance Analysis</h4>
                                            </div>

                                            {item.comparison ? (
                                                <div className="insight-body">
                                                    <div className="insight-row primary">
                                                        <span>VS Last Session (Volume)</span>
                                                        <div className={`diff-tag large ${item.comparison.volumeChange >= 0 ? 'pos' : 'neg'}`}>
                                                            {item.comparison.volumeChange > 0 ? '▲' : '▼'} {Math.abs(item.comparison.volumeChange)}%
                                                        </div>
                                                    </div>

                                                    <div className="insight-details">
                                                        <div className="detail-item">
                                                            <span>Volume Diff</span>
                                                            <strong className={item.comparison.volumeDiff >= 0 ? 'text-success' : 'text-danger'}>
                                                                {item.comparison.volumeDiff > 0 ? '+' : ''}{item.comparison.volumeDiff}
                                                            </strong>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span>Weight Diff</span>
                                                            <strong className={item.comparison.weightDiff >= 0 ? 'text-cyan' : 'text-danger'}>
                                                                {item.comparison.weightDiff > 0 ? '+' : ''}{item.comparison.weightDiff}kg
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    <div className="insight-verdict">
                                                        {item.comparison.volumeChange > 5 ? (
                                                            <p>🚀 <strong>Significant Overload!</strong> Your total workload increased nicely. Keep this intensity!</p>
                                                        ) : item.comparison.volumeChange < -5 ? (
                                                            <p>📉 <strong>Volume Drop.</strong> De-load or just a lighter day? Rest up!</p>
                                                        ) : (
                                                            <p>⚖️ <strong>Sustained Effort.</strong> Consistency builds muscle. Good hold.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="insight-body empty">
                                                    <p>Keep logging to unlock progressive analysis!</p>
                                                </div>
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