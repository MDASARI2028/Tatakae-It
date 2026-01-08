import React from 'react';
import DailyProgressRings from './DailyProgressRings';
import { FaClipboardList, FaHistory, FaTint, FaChartPie } from 'react-icons/fa';
import './NutritionSummary.css';

const NutritionSummary = ({ setActiveTab }) => {
    return (
        <div className="nutrition-summary-container">
            <div className="summary-cards-grid">
                {/* Each card now has a unique alignment class */}
                <div className="nutrition-summary-card align-top-left" onClick={() => setActiveTab('logger')}>
                    <FaClipboardList className="nutrition-summary-icon" />
                    <h3 data-text="Log Meal">Log Meal</h3>
                    <p>Record your daily nutritional intake.</p>
                </div>
                <div className="nutrition-summary-card align-top-right" onClick={() => setActiveTab('history')}>
                    <FaHistory className="nutrition-summary-icon" />
                    <h3 data-text="View History">View History</h3>
                    <p>Review and edit your past entries.</p>
                </div>
                <div className="nutrition-summary-card align-bottom-left" onClick={() => setActiveTab('hydration')}>
                    <FaTint className="nutrition-summary-icon" />
                    <h3 data-text="Track Hydration">Track Hydration</h3>
                    <p>Log your daily water intake.</p>
                </div>
                <div className="nutrition-summary-card align-bottom-right" onClick={() => setActiveTab('progress')}>
                    <FaChartPie className="nutrition-summary-icon" />
                    <h3 data-text="Analyze Progress">Analyze Progress</h3>
                    <p>Visualize your performance over time.</p>
                </div>
                <div className="center-ring-container">
                    <DailyProgressRings />
                </div>
            </div>

            {/* Legend for the rings */}
            <div className="nutrition-rings-legend">
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ff007a' }}></span>
                    <span>Calories</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#adff2f' }}></span>
                    <span>Protein</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#ff9f40' }}></span>
                    <span>Carbs</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#8884d8' }}></span>
                    <span>Fat</span>
                </div>
                <div className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: '#00bfff' }}></span>
                    <span>Water</span>
                </div>
            </div>
        </div>
    );
};

export default NutritionSummary;