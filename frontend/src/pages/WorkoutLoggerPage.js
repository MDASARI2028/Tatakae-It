// frontend/src/pages/WorkoutLoggerPage.js

import React, { useContext } from 'react';
import WorkoutLogger from '../components/WorkoutLogger';
import { WorkoutContext } from '../context/WorkoutContext';
import { motion } from 'framer-motion';
import { FaDumbbell, FaFire, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import './WorkoutLoggerPage.css';

const WorkoutLoggerPage = () => {
    const { workouts } = useContext(WorkoutContext);

    // Calculate quick stats
    const thisWeekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return workoutDate >= weekAgo && workoutDate <= today;
    }).length;

    const thisMonthWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        const today = new Date();
        return workoutDate.getMonth() === today.getMonth() &&
            workoutDate.getFullYear() === today.getFullYear();
    }).length;

    const totalWorkouts = workouts.length;

    return (
        <div className="workout-logger-page-wrapper">
            {/* Solid Black Background */}
            <div className="gradient-mesh-background"></div>

            {/* Content - Side by Side Layout */}
            <div className="workout-logger-page">
                <div className="logger-split-layout">
                    {/* Left Side - Title and Stats */}
                    <div className="logger-left-panel">
                        {/* Hero Header */}
                        <motion.div
                            className="logger-hero-header"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="hero-title-section">
                                <FaDumbbell className="hero-icon" />
                                <h1 className="hero-title">Log Workouts</h1>
                            </div>
                            <p className="hero-subtitle">Track your progress, build your strength</p>
                        </motion.div>

                        {/* Quick Stats Cards */}
                        <motion.div
                            className="quick-stats-stack"
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.05, x: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <FaFire className="stat-icon fire" />
                                <div className="stat-content">
                                    <span className="stat-value">{thisWeekWorkouts}</span>
                                    <span className="stat-label">This Week</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.05, x: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <FaCalendarAlt className="stat-icon calendar" />
                                <div className="stat-content">
                                    <span className="stat-value">{thisMonthWorkouts}</span>
                                    <span className="stat-label">This Month</span>
                                </div>
                            </motion.div>

                            <motion.div
                                className="stat-card"
                                whileHover={{ scale: 1.05, x: 10 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <FaTrophy className="stat-icon trophy" />
                                <div className="stat-content">
                                    <span className="stat-value">{totalWorkouts}</span>
                                    <span className="stat-label">Total Logged</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Side - Workout Form */}
                    <motion.div
                        className="logger-right-panel"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <WorkoutLogger />
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default WorkoutLoggerPage;