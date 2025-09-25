import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNutrition } from '../../context/NutritionContext';
import { AuthContext } from '../../context/AuthContext';
import StatCard from './StatCard';
import CalorieTrendChart from './CalorieTrendChart';
import MacroPieChart from './MacroPieChart';
import MonarchsRoad from './MonarchsRoad/MonarchsRoad'; // Import the new component
import './NutritionProgress.css';

// GoalSetter sub-component
const GoalSetter = () => {
    const { user, updateGoals } = useContext(AuthContext);
    const [goals, setGoals] = useState({ calorieGoal: 2200, proteinGoal: 150, carbGoal: 250, fatGoal: 70 });
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (user && user.nutritionGoals) {
            setGoals(user.nutritionGoals);
        }
    }, [user]);

    const onChange = e => setGoals({ ...goals, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        const result = await updateGoals(goals);
        setStatus(result.success ? 'Goals updated!' : result.error);
        setTimeout(() => setStatus(''), 3000);
    };
    
    return (
        <form onSubmit={onSubmit} className="goal-setter-form">
            <div className="goal-inputs">
                <input type="number" name="calorieGoal" value={goals.calorieGoal} onChange={onChange} aria-label="Calorie Goal"/>
                <input type="number" name="proteinGoal" value={goals.proteinGoal} onChange={onChange} aria-label="Protein Goal"/>
                <input type="number" name="carbGoal" value={goals.carbGoal} onChange={onChange} aria-label="Carb Goal"/>
                <input type="number" name="fatGoal" value={goals.fatGoal} onChange={onChange} aria-label="Fat Goal"/>
            </div>
            <button type="submit">Set Goals</button>
            {status && <span className="status-message">{status}</span>}
        </form>
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
        <div className="nutrition-progress-container">
            <section className="progress-section">
                <h3 className="section-title">System Directives: Set Your Targets</h3>
                <GoalSetter />
            </section>
            
            <section className="progress-section">
                <div className="section-header">
                    <h3 className="section-title">Performance Analysis</h3>
                    <div className="period-selector">
                        <button onClick={() => setPeriod(7)} className={period === 7 ? 'active' : ''}>7 Days</button>
                        <button onClick={() => setPeriod(30)} className={period === 30 ? 'active' : ''}>30 Days</button>
                    </div>
                </div>
                {loading && <p>Analyzing data...</p>}
                {!loading && progressData && user && (
                    <div className="charts-grid">
                        <div className="stat-cards-grid">
                            <StatCard label="Avg. Daily Calories" value={stats.avgCalories.toFixed(0)} unit="kcal" />
                            <StatCard label="Avg. Daily Protein" value={stats.avgProtein.toFixed(1)} unit="g" />
                            <StatCard label="Avg. Daily Carbs" value={stats.avgCarbs.toFixed(1)} unit="g" />
                            <StatCard label="Avg. Daily Fat" value={stats.avgFat.toFixed(1)} unit="g" />
                        </div>

                        <div className="chart-container">
                            <h4>Calorie Trend</h4>
                            <CalorieTrendChart data={progressData} goal={user.nutritionGoals.calorieGoal} />
                        </div>
                        
                        <div className="chart-container">
                            <h4>Avg. Macro Breakdown</h4>
                            <MacroPieChart data={stats} />
                        </div>
                        
                        <div className="chart-container full-width">
                            <div className="section-header">
                                <h4>Logging Consistency</h4>
                                <button onClick={resetStreak} className="reset-streak-btn">Reset Streak</button>
                            </div>
                            <MonarchsRoad 
                                data={progressData} 
                                user={user} 
                                goal={user.nutritionGoals.calorieGoal}
                            />
                        </div>
                    </div>
                )}
                 {!loading && (!progressData || progressData.length === 0) && <p>No data to analyze for this period. Start logging your meals!</p>}
            </section>
        </div>
    );
};

export default NutritionProgress;