import React, { useMemo } from 'react';
import PathStone from './PathStone';
import './MonarchsRoad.css';

const MonarchsRoad = ({ data, user, goal }) => {

    const pathData = useMemo(() => {
        // Fallback: if no streakStartDate, use the data span or default to 30 days
        let period;
        if (user && user.streakStartDate) {
            const startDate = new Date(user.streakStartDate);
            const today = new Date();
            const diffTime = Math.abs(today - startDate);
            const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            period = Math.min(daysDiff, 365); // Cap at 365 days
        } else if (data && data.length > 0) {
            // Use the data length as period if available
            period = Math.min(data.length, 365);
        } else {
            // Default fallback
            period = 30;
        }

        const loggedDataMap = new Map((data || []).map(day => [day.date, day]));
        const road = [];

        for (let i = 0; i < period; i++) {
            const date = new Date();
            date.setDate(date.getDate() - (period - 1 - i));
            const dateString = date.toISOString().split('T')[0];
            const dayNumber = i + 1;

            let status = 'future';
            if (loggedDataMap.has(dateString)) {
                const dayData = loggedDataMap.get(dateString);
                const calorieDiff = Math.abs(dayData.totalCalories - goal);
                status = (calorieDiff < goal * 0.1) ? 'flawless' : 'standard';
            } else if (new Date() > date) {
                status = 'broken';
            }

            // ✅ New algorithm for a horizontal, winding path
            const horizontalSpacing = 80; // Distance between stones on X-axis
            const verticalAmplitude = 50; // How high/low the path curves
            const frequency = 0.5; // How wavy the path is

            const x = i * horizontalSpacing;
            const y = verticalAmplitude * Math.sin(i * frequency);

            road.push({ day: dayNumber, status, x, y });
        }
        return road;
    }, [data, goal, user]);

    // Calculate the total width needed for the path based on actual stones
    const roadWidth = (pathData.length * 80) + 100;

    return (
        <div className="monarchs-road-container">
            <div className="monarchs-road-path" style={{ width: `${roadWidth}px` }}>
                {pathData.map(stone => (
                    <PathStone
                        key={stone.day}
                        day={stone.day}
                        status={stone.status}
                        style={{
                            // Center the path vertically, then apply the sine wave offset
                            transform: `translate(${stone.x}px, calc(50% + ${stone.y}px))`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default MonarchsRoad;