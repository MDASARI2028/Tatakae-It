import React, { useEffect, useMemo, useState } from 'react';
import { useNutrition } from '../../context/NutritionContext';
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
        <div className="hydration-tracker">
            <div className="progress-display">
                <h3>{totalIntake} ml</h3>
                <span>Goal: {hydrationGoal} ml</span>
                <button onClick={handleSetGoal} className="edit-goal-btn">Edit Goal</button>
            </div>

            <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}>
                    {progressPercent > 10 && <span className="progress-percent">{progressPercent}%</span>}
                </div>
            </div>
            
            <div className="add-controls">
                <div className="quick-add-buttons">
                    <button onClick={() => handleAddWater(250)} disabled={loading}>+250ml</button>
                    <button onClick={() => handleAddWater(500)} disabled={loading}>+500ml</button>
                    <button onClick={() => handleAddWater(750)} disabled={loading}>+750ml</button>
                </div>
                <div className="custom-add">
                    <input 
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Custom ml"
                        className="custom-input"
                    />
                    <button onClick={() => handleAddWater(customAmount)} disabled={loading || !customAmount}>Add</button>
                </div>
            </div>

            <div className="log-list">
                <h4>Today's Log</h4>
                {hydrationLogs.length > 0 ? (
                    hydrationLogs.map(log => (
                        <div key={log._id} className="log-item">
                            <div>
                                <span>{log.amount} ml</span>
                                <span className="log-time">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <button onClick={() => deleteHydration(log._id)} className="delete-log-btn">×</button>
                        </div>
                    )).reverse()
                ) : (
                    <p>No water logged for this day yet.</p>
                )}
            </div>
        </div>
    );
};

export default HydrationTracker;