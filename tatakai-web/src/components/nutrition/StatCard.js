import React from 'react';
import './StatCard.css';

const StatCard = ({ label, value, unit = '' }) => {
    return (
        <div className="stat-card">
            <span className="stat-value">{value}<span className="stat-unit">{unit}</span></span>
            <span className="stat-label">{label}</span>
        </div>
    );
};

export default StatCard;