// frontend/src/components/nutrition/MonarchsRoad/PathStone.js
import React from 'react';
import './PathStone.css';

const PathStone = ({ day, status, style }) => {
    const statusClass = `status-${status}`;
    return (
        <div className={`path-stone ${statusClass}`} style={style}>
            <div className="stone-day-number">{day}</div>
        </div>
    );
};

export default PathStone;