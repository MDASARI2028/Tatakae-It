import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { AuthContext } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FaBullseye, FaChartLine, FaFire } from 'react-icons/fa';
import StatCard from './StatCard';
import CalorieTrendChart from './CalorieTrendChart';
import MacroPieChart from './MacroPieChart';
import MonarchsRoad from './MonarchsRoad/MonarchsRoad';
import './NutritionProgress.css';

// GoalSetter sub-component
const GoalSetter = () => {
    const { user, updateGoals } = useContext(AuthContext);
    const { setNutritionGoals } = useNutrition(); // Get setNutritionGoals from NutritionContext
    const [goals, setGoals] = useState({ calorieGoal: 2200, proteinGoal: 150, carbGoal: 250, fatGoal: 70 });
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    useEffect(() => {
        if (user && user.nutritionGoals) {
            setGoals(user.nutritionGoals);
        }
    }, [user]);

    const onChange = e => setGoals({ ...goals, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Set loading to true
        const result = await updateGoals(goals);
        if (result.success) {
            // Update context with new goals
            setNutritionGoals({
                calories: parseInt(goals.calorieGoal),
                protein: parseInt(goals.proteinGoal),
                fat: parseInt(goals.fatGoal),
                carbs: parseInt(goals.carbGoal)
            });
            setStatus('Goals updated!');
        } else {
            setStatus(result.error);
        }
        setIsLoading(false); // Set loading to false
        setTimeout(() => setStatus(''), 3000);
    };

    return (
        <motion.form onSubmit={onSubmit} className="goal-setter-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="goal-inputs-grid">
                <div className="goal-field">
                    <label>Daily Calories</label>
                    <div className="input-with-icon">
                        <FaFire className="input-icon" style={{ color: '#ff007a' }} />
                        <input type="number" name="calorieGoal" value={goals.calorieGoal} onChange={onChange} />
                        <span className="unit">kcal</span>
                    </div>
                </div>
                <div className="goal-field">
                    <label>Protein</label>
                    <div className="input-with-icon">
                        <div className="dot" style={{ background: '#adff2f' }}></div>
                        <input type="number" name="proteinGoal" value={goals.proteinGoal} onChange={onChange} />
                        <span className="unit">g</span>
                    </div>
                </div>
                <div className="goal-field">
                    <label>Carbohydrates</label>
                    <div className="input-with-icon">
                        <div className="dot" style={{ background: '#ff9f40' }}></div>
                        <input type="number" name="carbGoal" value={goals.carbGoal} onChange={onChange} />
                        <span className="unit">g</span>
                    </div>
                </div>
                <div className="goal-field">
                    <label>Fats</label>
                    <div className="input-with-icon">
                        <div className="dot" style={{ background: '#8884d8' }}></div>
                        <input type="number" name="fatGoal" value={goals.fatGoal} onChange={onChange} />
                        <span className="unit">g</span>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(118, 75, 224, 0.4)' }}
                    whileTap={{ scale: 0.98 }}
                    className="set-goals-btn"
                    disabled={isLoading}
                >
                    {isLoading ? 'Updating...' : 'Update Targets'}
                </motion.button>
                {status && <motion.span className="status-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{status}</motion.span>}
            </div>
        </motion.form>
    );
};

// Main Progress Page Component
const NutritionProgress = () => {
    const { user } = useContext(AuthContext);
    const { progressData, getProgressData, loading } = useNutrition();
    const [period, setPeriod] = useState(30);
    const { resetStreak } = useContext(AuthContext); // Get the new function

    useEffect(() => {
        if (user) { // Only fetch data if the user is loaded
            getProgressData(period);
        }
    }, [period, getProgressData, user]);

    const stats = useMemo(() => {
        if (!progressData || progressData.length === 0) {
            return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 };
        }
        const total = progressData.reduce((acc, day) => {
            acc.calories += day.totalCalories;
            acc.protein += day.totalProtein;
            acc.carbs += day.totalCarbs;
            acc.fat += day.totalFat;
            return acc;
        }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

        const count = progressData.length;
        return {
            avgCalories: total.calories / count,
            avgProtein: total.protein / count,
            avgCarbs: total.carbs / count,
            avgFat: total.fat / count,
        };
    }, [progressData]);

    return (
        <motion.div className="nutrition-progress-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.section className="progress-section targets-section" initial={{ y: -12 }} animate={{ y: 0 }}>
                <div className="section-title-group">
                    <FaBullseye className="section-icon" />
                    <h3>Set Your Targets</h3>
                </div>
                <GoalSetter />
            </motion.section>

            <motion.section className="progress-section" initial={{ y: 12 }} animate={{ y: 0 }}>
                <div className="section-header">
                    <div className="section-title-group">
                        <FaChartLine className="section-icon" />
                        <h3>Performance Analysis</h3>
                    </div>
                    <div className="period-selector">
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setPeriod(7)} className={period === 7 ? 'active' : ''}>7 Days</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => setPeriod(30)} className={period === 30 ? 'active' : ''}>30 Days</motion.button>
                    </div>
                </div>
                {loading && <p className="loading-msg">Analyzing data...</p>}
                {!loading && progressData && user && (
                    <div className="charts-grid">
                        <div className="stat-cards-grid">
                            <StatCard label="Avg. Daily Calories" value={stats.avgCalories.toFixed(0)} unit="kcal" />
                            <StatCard label="Avg. Daily Protein" value={stats.avgProtein.toFixed(1)} unit="g" />
                            <StatCard label="Avg. Daily Carbs" value={stats.avgCarbs.toFixed(1)} unit="g" />
                            <StatCard label="Avg. Daily Fat" value={stats.avgFat.toFixed(1)} unit="g" />
                        </div>

                        <motion.div className="chart-container" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
                            <h4><FaFire /> Calorie Trend</h4>
                            <CalorieTrendChart data={progressData} goal={user.nutritionGoals.calorieGoal} />
                        </motion.div>

                        <motion.div className="chart-container" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
                            <h4>Macro Breakdown</h4>
                            <MacroPieChart data={stats} />
                        </motion.div>

                        <motion.div className="chart-container full-width" initial={{ scale: 0.98 }} animate={{ scale: 1 }}>
                            <div className="consistency-header">
                                <h4>Logging Consistency</h4>
                                <motion.button onClick={resetStreak} whileHover={{ scale: 1.05 }} className="reset-streak-btn">Reset Streak</motion.button>
                            </div>
                            <MonarchsRoad
                                data={progressData}
                                user={user}
                                goal={user.nutritionGoals.calorieGoal}
                            />
                        </motion.div>
                    </div>
                )}
                {!loading && (!progressData || progressData.length === 0) && <p className="no-data-msg">No data to analyze. Start logging meals to see your progress!</p>}
            </motion.section>
        </motion.div>
    );
};

export default NutritionProgress;