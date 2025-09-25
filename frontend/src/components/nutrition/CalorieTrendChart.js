import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';

const CalorieTrendChart = ({ data, goal }) => {
    // Custom Tooltip for styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`Date: ${label}`}</p>
                    <p className="intro">{`Calories: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid stroke="#3a3f5a" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#8892b0" fontSize={12} />
                <YAxis stroke="#8892b0" fontSize={12} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(118, 75, 224, 0.1)' }}/>
                <Legend />
                <ReferenceLine y={goal} label={{ value: 'Goal', position: 'insideTopLeft', fill: '#ff9f40' }} stroke="#ff9f40" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="totalCalories" name="Calories" stroke="#764be0" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CalorieTrendChart;