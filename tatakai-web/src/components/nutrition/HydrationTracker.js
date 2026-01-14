import React, { useEffect, useMemo, useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { FaTint, FaPlus, FaTrash, FaClock } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './HydrationTracker.css';

const HydrationTracker = () => {
    const {
        hydrationLogs,
        hydrationGoal,
        selectedDate,
        addHydration,
        getHydrationForDate,
        deleteHydration,
        setHydrationGoal,
        loading
    } = useNutrition();

    const [customAmount, setCustomAmount] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        getHydrationForDate(selectedDate);
    }, [selectedDate, getHydrationForDate]);

    const totalIntake = useMemo(() => {
        return hydrationLogs.reduce((total, log) => total + log.amount, 0);
    }, [hydrationLogs]);

    const progressPercent = Math.min(Math.round((totalIntake / hydrationGoal) * 100), 100);

    const handleAddWater = (amount) => {
        const numAmount = parseInt(amount, 10);
        if (!numAmount || numAmount <= 0) return;

        // Trigger pour animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 1200);

        const logData = { date: selectedDate, amount: numAmount };
        addHydration(logData);
        setCustomAmount('');
    };

    const handleSetGoal = () => {
        const newGoal = prompt("Set your new daily hydration goal (in ml):", hydrationGoal);
        const numGoal = parseInt(newGoal, 10);
        if (numGoal && numGoal > 0) {
            setHydrationGoal(numGoal);
        }
    };

    return (
        <motion.div className="hy-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Left Column */}
            <div className="hy-main">
                {/* Header */}
                <div className="hy-header">
                    <div className="hy-header-left">
                        <div className="hy-icon-box"><FaTint /></div>
                        <div className="hy-title-text">
                            <h2>Hydration Tracker</h2>
                            <p>Keep yourself refreshed and healthy</p>
                        </div>
                    </div>
                    <button className="hy-edit-goal-btn" onClick={handleSetGoal}>EDIT GOAL</button>
                </div>

                {/* Circular Progress */}
                <div className="hy-circle-container">
                    <div className={`hy-circle ${isAnimating ? 'pouring' : ''}`}>
                        {/* Glass shine overlay */}
                        <div className="hy-glass-shine"></div>

                        <svg className="hy-circle-svg" viewBox="0 0 200 200">
                            {/* Background circle */}
                            <circle cx="100" cy="100" r="88" className="hy-circle-bg" />
                            {/* Progress circle */}
                            <circle
                                cx="100"
                                cy="100"
                                r="88"
                                className="hy-circle-progress"
                                style={{
                                    strokeDasharray: `${2 * Math.PI * 88}`,
                                    strokeDashoffset: `${2 * Math.PI * 88 * (1 - progressPercent / 100)}`
                                }}
                            />
                        </svg>
                        {/* Water fill effect with bubbles */}
                        <div
                            className="hy-water-fill"
                            style={{ '--water-level': `${progressPercent}%` }}
                        >
                            <div className="hy-bubbles">
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                                <span className="hy-bubble"></span>
                            </div>
                        </div>
                        {/* Center text */}
                        <div className="hy-circle-text">
                            <span className="hy-big-value">{totalIntake}</span>
                            <span className="hy-sub-text">ML / {hydrationGoal} ML GOAL</span>
                        </div>
                    </div>
                </div>

                {/* Quick Add Buttons */}
                <div className="hy-quick-btns">
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddWater(250)}
                        disabled={loading}
                        className="hy-preset-btn"
                    >
                        <span className="hy-preset-val">+250</span>
                        <span className="hy-preset-unit">ML</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddWater(500)}
                        disabled={loading}
                        className="hy-preset-btn"
                    >
                        <span className="hy-preset-val">+500</span>
                        <span className="hy-preset-unit">ML</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleAddWater(750)}
                        disabled={loading}
                        className="hy-preset-btn"
                    >
                        <span className="hy-preset-val">+750</span>
                        <span className="hy-preset-unit">ML</span>
                    </motion.button>
                </div>

                {/* Custom Input */}
                <div className="hy-custom-row">
                    <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter custom amount (ml)"
                        className="hy-custom-input"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddWater(customAmount)}
                        disabled={loading || !customAmount}
                        className="hy-custom-btn"
                    >
                        <FaPlus />
                    </motion.button>
                </div>

                {/* Today's Log */}
                <div className="hy-log-section">
                    <h3 className="hy-section-title">TODAY'S LOG SEQUENCE</h3>
                    <div className="hy-log-list">
                        {hydrationLogs.length > 0 ? (
                            <AnimatePresence>
                                {hydrationLogs.slice().reverse().map(log => (
                                    <motion.div
                                        key={log._id}
                                        className="hy-log-item"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <div className="hy-log-left">
                                            <FaClock className="hy-log-clock" />
                                            <span className="hy-log-time">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span className="hy-log-amount">+{log.amount} ml</span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            onClick={() => deleteHydration(log._id)}
                                            className="hy-log-delete"
                                        >
                                            <FaTrash />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="hy-empty">No water logged yet. Start hydrating!</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar */}
            <aside className="hy-sidebar">
                {/* Goal Card */}
                <div className="hy-sidebar-card">
                    <h4 className="hy-card-title">DAILY HYDRATION GOAL</h4>
                    <p className="hy-goal-display">
                        <span className="hy-goal-num">{hydrationGoal}</span>
                        <span className="hy-goal-unit">ml</span>
                    </p>
                    <p className="hy-card-desc">
                        Recommended daily water intake varies, but 8-10 glasses (2-2.5L) is a common guideline for active users in combat phase.
                    </p>
                </div>

                {/* Tactical Tips */}
                <div className="hy-sidebar-card">
                    <h4 className="hy-tips-title">
                        <FaTint className="hy-tips-icon" /> TACTICAL TIPS
                    </h4>
                    <ul className="hy-tips-list">
                        <li><span className="hy-tip-dot"></span>Drink water with every meal protocol</li>
                        <li><span className="hy-tip-dot"></span>Keep a hydration unit within proximity</li>
                        <li><span className="hy-tip-dot"></span>Consume liquids at first thirst signal</li>
                    </ul>
                </div>

                {/* Current Phase */}
                <div className="hy-sidebar-card hy-phase-card">
                    <div className="hy-phase-text">
                        <span className="hy-phase-label">CURRENT PHASE</span>
                        <span className="hy-phase-value">CONSTRUCTION</span>
                    </div>
                    <div className="hy-phase-dot"></div>
                </div>

                {/* Footer */}
                <p className="hy-sidebar-footer">SELECT ITEMS TO BEGIN INFUSION SEQUENCE</p>
            </aside>
        </motion.div>
    );
};

export default HydrationTracker;