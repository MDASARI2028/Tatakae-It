import React, { useMemo } from 'react';
import PathStone from './PathStone';
import './MonarchsRoad.css';

const MonarchsRoad = ({ data, period, user, goal }) => {

    const pathData = useMemo(() => {
        if (!user || !user.streakStartDate) return []; // Don't render if no user/start date
        const startDate = new Date(user.streakStartDate);
        const today = new Date();
        const diffTime = Math.abs(today - startDate);
        // Limit to max 365 days for performance, or use actual if smaller
        const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        const period = Math.min(daysDiff, 365); // Cap at 365 days
        const loggedDataMap = new Map(data.map(day => [day.date, day]));
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

    // Calculate the total width needed for the path
    const roadWidth = (period * 80) + 100;

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