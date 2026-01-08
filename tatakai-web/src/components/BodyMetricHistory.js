// frontend/src/components/BodyMetricHistory.js

import React from 'react';

const BodyMetricHistory = ({ metrics }) => {
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    return (
        <div className="metric-history">
            <h3>Metrics History</h3>
            {metrics.length === 0 ? (
                <p>No metrics logged yet.</p>
            ) : (
                <ul className="metric-list">
                    {metrics.map((metric) => (
                        <li key={metric._id} className="metric-item">
                            <strong>{formatDate(metric.date)}</strong>
                            <div>Weight: {metric.weight} kg</div>
                            {metric.bodyFatPercentage && <div>Body Fat: {metric.bodyFatPercentage}%</div>}
                            {metric.waist && <div>Waist: {metric.waist} cm</div>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default BodyMetricHistory;