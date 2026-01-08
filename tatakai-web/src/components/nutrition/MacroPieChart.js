import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = {
    protein: '#adff2f',
    carbs: '#00bfff',
    fat: '#ff9f40',
};

const MacroPieChart = ({ data }) => {
    const chartData = [
        { name: 'Protein', value: Math.round(data.avgProtein) },
        { name: 'Carbs', value: Math.round(data.avgCarbs) },
        { name: 'Fat', value: Math.round(data.avgFat) },
    ];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    {`${payload[0].name}: ${payload[0].value}g (avg)`}
                </div>
            );
        }
        return null;
    };

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default MacroPieChart;