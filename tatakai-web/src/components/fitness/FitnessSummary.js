import React, { useContext, useMemo } from 'react';
import { WorkoutContext } from '../../context/WorkoutContext';
import { motion } from 'framer-motion';
import { FaFire, FaDumbbell, FaCalendarCheck } from 'react-icons/fa';
import './FitnessSummary.css';

const FitnessSummary = () => {
    const { workouts } = useContext(WorkoutContext);

    // --- Calculations ---
    const stats = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday as start
        startOfWeek.setHours(0, 0, 0, 0);

        const thisWeekWorkouts = workouts.filter(w => new Date(w.date) >= startOfWeek);

        let totalSets = 0;
        let maxWeight = 0;
        let maxLiftName = '-';

        thisWeekWorkouts.forEach(workout => {
            if (workout.exercises) {
                workout.exercises.forEach(ex => {
                    if (Array.isArray(ex.sets)) {
                        ex.sets.forEach(set => {
                            const weight = Number(set.weight) || 0;
                            totalSets += 1;

                            if (weight > maxWeight) {
                                maxWeight = weight;
                                maxLiftName = ex.name || 'Lift';
                            }
                        });
                    }
                });
            }
        });

        // Calculate Streak (Simplified: consecutive days with workouts ending today/yesterday)
        // For accurate streak we'd need a more complex algo on sorted unique dates
        // Here we just count unique days in last 7 days for " Consistency "
        const uniqueDays = new Set(thisWeekWorkouts.map(w => new Date(w.date).toDateString())).size;
        const estimatedCalories = totalSets * 12; // Crude estimate: 12 kcals per intense set
        const weeklyXP = thisWeekWorkouts.length * 150; // +150 XP per workout (gamified estimate)

        return {
            xp: weeklyXP,
            maxLift: maxWeight,
            maxLiftName: maxLiftName,
            calories: estimatedCalories,
            consistency: uniqueDays,
            workoutCount: thisWeekWorkouts.length
        };
    }, [workouts]);

    const weeklyXPGoal = 600; // e.g. 4 workouts * 150
    const progress = Math.min((stats.xp / weeklyXPGoal) * 100, 100);
    const radius = 40; // Reduced from 50
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="fitness-summary-container">
            <div className="fs-header">
                <h3>Weekly Status</h3>
                <span className="fs-badge">Week {getWeekNumber(new Date())}</span>
            </div>

            <div className="fs-content">
                {/* Main Ring - Weekly XP */}
                <div className="fs-ring-section">
                    <div className="fs-ring-wrapper">
                        <svg className="fs-progress-ring" width="100" height="100">
                            <defs>
                                <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6423C2" />
                                    <stop offset="100%" stopColor="#7B3FE4" />
                                </linearGradient>
                                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            {/* Background Ticks */}
                            <circle
                                cx="50" cy="50" r="44"
                                fill="transparent"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="2"
                                strokeDasharray="1 3"
                            />
                            {/* Base Track */}
                            <circle
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="6"
                                fill="transparent"
                                r={radius}
                                cx="50"
                                cy="50"
                            />
                            {/* Progress Ring */}
                            <motion.circle
                                stroke="url(#ringGradient)"
                                strokeWidth="6"
                                strokeLinecap="round"
                                fill="transparent"
                                r={radius}
                                cx="50"
                                cy="50"
                                filter="url(#glow)"
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                style={{ strokeDasharray: `${circumference} ${circumference}` }}
                            />
                        </svg>
                        <div className="fs-ring-text">
                            <span className="fs-count" style={{ fontSize: '1.5rem' }}>{stats.xp}</span>
                            <span className="fs-label" style={{ fontSize: '0.6rem' }}>WEEKLY XP</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="fs-stats-grid">
                    {/* Peak Lift Card */}
                    <div className="fs-stat-card">
                        <div className="fs-icon-box purple">
                            <FaFire />
                        </div>
                        <div className="fs-stat-info">
                            <span className="fs-stat-val">{stats.maxLift}<small style={{ fontSize: '0.7em', color: '#aaa' }}>kg</small></span>
                            <span className="fs-stat-label">PEAK: {stats.maxLiftName.length > 10 ? stats.maxLiftName.substring(0, 10) + '...' : stats.maxLiftName}</span>
                            {/* Micro-Bar Visualization */}
                            <div className="fs-micro-bar">
                                <motion.div className="fs-micro-fill purple" initial={{ width: 0 }} animate={{ width: '85%' }} />
                            </div>
                        </div>
                    </div>

                    {/* Calories Card */}
                    <div className="fs-stat-card">
                        <div className="fs-icon-box cyan">
                            <FaDumbbell />
                        </div>
                        <div className="fs-stat-info">
                            <span className="fs-stat-val">{stats.calories}</span>
                            <span className="fs-stat-label">EST. BURN (KCAL)</span>
                            {/* Micro-Bar Visualization */}
                            <div className="fs-micro-bar">
                                <motion.div className="fs-micro-fill cyan" initial={{ width: 0 }} animate={{ width: `${Math.min((stats.calories / 2000) * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Active Days Card */}
                    <div className="fs-stat-card">
                        <div className="fs-icon-box orange">
                            <FaCalendarCheck />
                        </div>
                        <div className="fs-stat-info">
                            <span className="fs-stat-val">{stats.consistency}</span>
                            <span className="fs-stat-label">ACTIVE DAYS</span>
                            {/* 7-Day Dots Visualization */}
                            <div className="fs-day-dots">
                                {[...Array(7)].map((_, i) => (
                                    <div key={i} className={`fs-dot ${i < stats.consistency ? 'active' : ''}`} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
}

export default FitnessSummary;
