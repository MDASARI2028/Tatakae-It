import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNutrition } from '../../context/NutritionContext';
import NutritionSummary from '../../components/nutrition/NutritionSummary';
import NutritionLogger from '../../components/nutrition/NutritionLogger';
import NutritionHistory from '../../components/nutrition/NutritionHistory';
import HydrationTracker from '../../components/nutrition/HydrationTracker';
import NutritionProgress from '../../components/nutrition/NutritionProgress';
import './NutritionPage.css';

const NutritionPage = () => {
    const [activeTab, setActiveTab] = useState('summary');
    const { selectedDate, setDate, getMealsForDate, getHydrationForDate } = useNutrition();

    useEffect(() => {
        getMealsForDate(selectedDate);
        getHydrationForDate(selectedDate);
    }, [selectedDate, getMealsForDate, getHydrationForDate]);

    const handleDateChange = (daysToAdd) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + daysToAdd);
        setDate(newDate);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const tabs = [
        { id: 'summary', label: 'Summary' },
        { id: 'logger', label: 'Log Meal' },
        { id: 'history', label: 'History' },
        { id: 'hydration', label: 'Hydration' },
        { id: 'progress', label: 'Progress' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'summary':
                return <NutritionSummary setActiveTab={setActiveTab} />;
            case 'logger':
                return <NutritionLogger selectedDate={selectedDate} />;
            case 'history':
                return <NutritionHistory selectedDate={selectedDate} handleDateChange={handleDateChange} isToday={isToday} />;
            case 'hydration':
                return <HydrationTracker />;
            case 'progress':
                return <NutritionProgress />;
            default:
                return <NutritionSummary setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="nutrition-page system-ui">
            <motion.header className="nutrition-top" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="nutrition-header-left">
                    <h2>Nutrition Center</h2>
                    <p className="sub">Track meals, hydration and goals</p>
                </div>
                <div className="nutrition-header-right">
                    <div className="date-navigator">
                        <button onClick={() => handleDateChange(-1)} className="nav-btn">←</button>
                        <h3>{new Date(selectedDate).toDateString()}</h3>
                        <button onClick={() => handleDateChange(1)} className="nav-btn">→</button>
                    </div>
                </div>
            </motion.header>

            <nav className="nutrition-tabs" aria-label="Nutrition tabs">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        className={tab.id === activeTab ? 'active' : ''}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {tab.label}
                    </motion.button>
                ))}
            </nav>

            <main className="tab-content">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default NutritionPage;