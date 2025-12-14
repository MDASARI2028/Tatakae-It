import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNutrition } from '../../context/NutritionContext';
import './DailyProgressRings.css';

// Configuration for all five rings
const RING_CONFIG = {
    calories: { goal: 2200, color: '#ff007a' },
    protein: { goal: 150, color: '#adff2f' },
    fat: { goal: 70, color: '#ff9f40' },
    carbs: { goal: 250, color: '#00bfff' },
    water: { goal: 3000, color: '#8884d8' },
};

const OVER_LIMIT_COLOR = '#ff3b30';

// Helper function for dynamic font sizing
const getDynamicFontSize = (calories) => {
    const numDigits = String(calories).length;
    if (numDigits <= 3) return '2.8rem';
    if (numDigits === 4) return '2.4rem';
    if (numDigits === 5) return '2.0rem';
    return '1.6rem';
};

// Helper function to calculate angles
const getAngle = (value, goal) => (goal > 0 ? (Math.min(value, goal) / goal) * 360 : 0);

const DailyProgressRings = () => {
    const { nutritionLogs, hydrationLogs, nutritionGoals, hydrationGoal } = useNutrition();

    const dailyTotals = useMemo(() => {
        const totals = { calories: 0, protein: 0, fat: 0, carbs: 0, water: 0 };
        if (Array.isArray(nutritionLogs)) {
            nutritionLogs.forEach(log => {
                if (log && Array.isArray(log.items)) {
                    log.items.forEach(item => {
                        if (item) {
                            totals.calories += Number(item.calories) || 0;
                            totals.protein += Number(item.protein) || 0;
                            totals.fat += Number(item.fat) || 0;
                            totals.carbs += Number(item.carbohydrates) || 0;
                        }
                    });
                }
            });
        }
        if (Array.isArray(hydrationLogs)) {
            totals.water = hydrationLogs.reduce((total, log) => total + (log?.amount || 0), 0);
        }
        return totals;
    }, [nutritionLogs, hydrationLogs]);

    const isOverLimit = dailyTotals.calories > nutritionGoals.calories;
    const calorieColor = isOverLimit ? OVER_LIMIT_COLOR : RING_CONFIG.calories.color;
    const calorieStatusClass = isOverLimit ? 'over-limit' : '';

    const roundedCalories = Math.round(dailyTotals.calories);
    const calorieFontSize = getDynamicFontSize(roundedCalories);

    return (
        <div className="rings-container-final">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="45%" outerRadius="100%" fill="rgba(58, 63, 90, 0.5)" startAngle={90} endAngle={-270} isAnimationActive={false} stroke="none" />
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="90%" outerRadius="100%" startAngle={90} endAngle={90 - getAngle(dailyTotals.calories, nutritionGoals.calories)} stroke="none" cornerRadius="50%"><Cell fill={calorieColor} /></Pie>
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="80%" outerRadius="90%" startAngle={90} endAngle={90 - getAngle(dailyTotals.protein, nutritionGoals.protein)} stroke="none" cornerRadius="50%"><Cell fill={RING_CONFIG.protein.color} /></Pie>
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="70%" outerRadius="80%" startAngle={90} endAngle={90 - getAngle(dailyTotals.fat, nutritionGoals.fat)} stroke="none" cornerRadius="50%"><Cell fill={RING_CONFIG.fat.color} /></Pie>
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="60%" outerRadius="70%" startAngle={90} endAngle={90 - getAngle(dailyTotals.carbs, nutritionGoals.carbs)} stroke="none" cornerRadius="50%"><Cell fill={RING_CONFIG.carbs.color} /></Pie>
                    <Pie data={[{ value: 1 }]} dataKey="value" cx="50%" cy="50%" innerRadius="50%" outerRadius="60%" startAngle={90} endAngle={90 - getAngle(dailyTotals.water, hydrationGoal)} stroke="none" cornerRadius="50%"><Cell fill={RING_CONFIG.water.color} /></Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className={`rings-center-text-final ${calorieStatusClass}`}>
                <h3 style={{ fontSize: calorieFontSize }}>
                    {roundedCalories}
                </h3>
                <span>cal</span>
            </div>
        </div>
    );
};

export default DailyProgressRings;