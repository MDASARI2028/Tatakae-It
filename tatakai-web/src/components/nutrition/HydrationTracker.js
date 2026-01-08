import React, { useEffect, useMemo, useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { FaTint, FaPlus, FaTrash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './HydrationTracker.css';

const HydrationTracker = () => {
    const { 
        hydrationLogs, 
        hydrationGoal, 
        selectedDate, 
        addHydration, 
        getHydrationForDate,
        deleteHydration, // Get the new delete function
        setHydrationGoal, // Get the set goal function
        loading 
    } = useNutrition();

    // State for the custom amount input
    const [customAmount, setCustomAmount] = useState('');

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

        const logData = { date: selectedDate, amount: numAmount };
        addHydration(logData);
        setCustomAmount(''); // Reset custom input after adding
    };
    
    const handleSetGoal = () => {
        const newGoal = prompt("Set your new daily hydration goal (in ml):", hydrationGoal);
        const numGoal = parseInt(newGoal, 10);
        if (numGoal && numGoal > 0) {
            setHydrationGoal(numGoal);
        }
    };

    return (
        <motion.div className="hydration-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className="hydration-left" initial={{ x: -12 }} animate={{ x: 0 }}>
                <div className="hydration-header">
                    <div className="h-title">
                        <FaTint className="water-icon" />
                        <div>
                            <h3>Hydration Tracker</h3>
                            <p className="hint">Keep yourself refreshed and healthy</p>
                        </div>
                    </div>
                </div>

                <div className="progress-card">
                    <div className="intake-display">
                        <div className="big-number">{totalIntake}</div>
                        <div className="sub-text">ml / {hydrationGoal} ml goal</div>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
                            {progressPercent > 5 && <span className="progress-percent">{progressPercent}%</span>}
                        </div>
                    </div>
                    <button onClick={handleSetGoal} className="edit-goal-link">Edit Goal</button>
                </div>

                <div className="add-water-section">
                    <div className="quick-buttons">
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAddWater(250)} disabled={loading} className="quick-btn">+250</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAddWater(500)} disabled={loading} className="quick-btn">+500</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAddWater(750)} disabled={loading} className="quick-btn">+750</motion.button>
                    </div>
                    <div className="custom-input-group">
                        <input 
                            type="number"
                            value={customAmount}
                            onChange={(e) => setCustomAmount(e.target.value)}
                            placeholder="Custom ml"
                            className="custom-input"
                        />
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleAddWater(customAmount)} disabled={loading || !customAmount} className="custom-btn"><FaPlus/></motion.button>
                    </div>
                </div>

                <div className="log-section">
                    <h4>Today's Log</h4>
                    <div className="log-list">
                        {hydrationLogs.length > 0 ? (
                            <AnimatePresence>
                                {hydrationLogs.slice().reverse().map(log => (
                                    <motion.div key={log._id} className="log-item" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                                        <div className="log-content">
                                            <span className="log-amount">{log.amount} ml</span>
                                            <span className="log-time">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <motion.button whileHover={{ scale: 1.1 }} onClick={() => deleteHydration(log._id)} className="delete-btn"><FaTrash/></motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="empty-state">No water logged yet. Start hydrating!</div>
                        )}
                    </div>
                </div>
            </motion.div>

            <motion.aside className="hydration-right" initial={{ x: 12 }} animate={{ x: 0 }}>
                <div className="hydration-info-card">
                    <h4>Daily Hydration Goal</h4>
                    <p className="goal-value">{hydrationGoal} ml</p>
                    <p className="info-text">Recommended daily water intake varies, but 8-10 glasses (2-2.5L) is a common guideline.</p>
                    <div className="tips">
                        <h5>💧 Tips</h5>
                        <ul>
                            <li>Drink water with meals</li>
                            <li>Keep a bottle nearby</li>
                            <li>Drink when thirsty</li>
                        </ul>
                    </div>
                </div>
            </motion.aside>
        </motion.div>
    );
};

export default HydrationTracker;