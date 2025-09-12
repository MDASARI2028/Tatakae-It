// frontend/src/components/dashboard/StatCard.js
import React from 'react';
import './StatCard.css';

const StatCard = ({ title, value, description, icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span className="stat-title">{title}</span>
                <span className="stat-icon">{icon}</span>
            </div>
            <div className="stat-card-body">
                <span className="stat-value">{value}</span>
                <p className="stat-description">{description}</p>
            </div>
            <div className="stat-progress-bar">
                <div style={{ width: '0%' }}></div> {/* Progress can be updated later */}
            </div>
        </div>
    );
};

export default StatCard;