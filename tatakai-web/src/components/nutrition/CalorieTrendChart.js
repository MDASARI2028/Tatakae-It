import React from 'react';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line, ReferenceLine } from 'recharts';

const CalorieTrendChart = ({ data, goal }) => {
    // Custom Tooltip for styling
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{
                    background: '#1a1f2e',
                    border: '1px solid #764be0',
                    borderRadius: '8px',
                    padding: '10px'
                }}>
                    <p className="label" style={{ color: '#fff', marginBottom: '4px', fontSize: '0.85rem' }}>{label}</p>
                    <p className="intro" style={{ color: '#c7d2e7', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {`${payload[0].value} kcal`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="date"
                    stroke="#718096"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#718096' }}
                    minTickGap={30}
                />
                <YAxis
                    stroke="#718096"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: '#718096' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(118, 75, 224, 0.5)', strokeWidth: 1 }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />

                <ReferenceLine y={goal} stroke="#ff9f40" strokeDasharray="5 5" strokeWidth={1.5}>

                </ReferenceLine>

                <Line
                    type="monotone"
                    dataKey="totalCalories"
                    name="Daily Intake"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={1500}
                />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default CalorieTrendChart;