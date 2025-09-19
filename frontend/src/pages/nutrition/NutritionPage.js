import React, { useState, useEffect } from 'react';
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
            {activeTab !== 'summary' && (
                <header className="page-header">
                    <button className="back-to-summary" onClick={() => setActiveTab('summary')}>
                        &larr; Back to Summary
                    </button>
                </header>
            )}
            <main className="tab-content">
                {renderTabContent()}
            </main>
        </div>
    );
};

export default NutritionPage;