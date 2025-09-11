// frontend/src/pages/ProgressPage.js

import React, { useContext, useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { AuthContext } from '../context/AuthContext';
import { WorkoutContext } from '../context/WorkoutContext';
import './ProgressPage.css'; // Import new styles

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ProgressPage = () => {
    const { token } = useContext(AuthContext);
    const { workouts } = useContext(WorkoutContext);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [exerciseCharts, setExerciseCharts] = useState([]);

    // Fetch user's saved templates
    useEffect(() => {
        const fetchTemplates = async () => {
            if (!token) return;
            const response = await fetch('/api/templates', { headers: { 'x-auth-token': token } });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        };
        fetchTemplates();
    }, [token]);

    // Generate charts when a template is selected or workout data changes
    useEffect(() => {
        if (!selectedTemplate || workouts.length === 0) {
            setExerciseCharts([]);
            return;
        }

        const templateExerciseNames = selectedTemplate.exercises.map(ex => ex.name.toLowerCase());
        const reversedWorkouts = [...workouts].reverse(); // Oldest to newest

        const charts = templateExerciseNames.map(exerciseName => {
            const chartData = { labels: [], datasets: [{ label: 'Weight (kg)', data: [], borderColor: 'rgb(75, 192, 192)', tension: 0.1 }] };

            reversedWorkouts.forEach(workout => {
                workout.exercises.forEach(ex => {
                    if (ex.name.toLowerCase() === exerciseName) {
                        chartData.labels.push(new Date(workout.date).toLocaleDateString());
                        chartData.datasets[0].data.push(ex.weight);
                    }
                });
            });

            return { name: exerciseName, data: chartData };
        });

        setExerciseCharts(charts);

    }, [selectedTemplate, workouts]);
    
    const handleTemplateChange = (e) => {
        const template = templates.find(t => t._id === e.target.value);
        setSelectedTemplate(template);
    };

    return (
        <div>
            <h2>Analyze Your Progress</h2>
            <div className="template-filter-container">
                <label htmlFor="progress-template-select">Select a Workout Template to Analyze:</label>
                <select id="progress-template-select" className="form-select" onChange={handleTemplateChange} defaultValue="">
                    <option value="" disabled>Choose a template...</option>
                    {templates.map(t => (
                        <option key={t._id} value={t._id}>{t.templateName}</option>
                    ))}
                </select>
            </div>

            {selectedTemplate ? (
                <div className="mini-charts-grid">
                    {exerciseCharts.map(chart => (
                        <div key={chart.name} className="chart-card">
                            <h3>{chart.name}</h3>
                            {chart.data.labels.length > 1 ? 
                                <Line data={chart.data} /> : 
                                <p>Not enough data to display a chart. Log this exercise more to see progress.</p>
                            }
                        </div>
                    ))}
                </div>
            ) : (
                <p>Please select a template to see your exercise progression.</p>
            )}
        </div>
    );
};

export default ProgressPage;