// frontend/src/components/WorkoutHistory.js

import React, { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext'; // <-- IMPORT

import './WorkoutHistory.css';

const WorkoutHistory = ({ filterDate, onEdit }) => {
    // Get data and action functions directly from the context
    const { workouts, loading, deleteWorkout } = useContext(WorkoutContext);
    const { saveAsTemplate } = useContext(TemplateContext); // <-- GET FROM HERE
    // This logic determines what to show:
    // 1. If a date is filtered, show all workouts for that date.
    // 2. If no date is filtered, show only the latest workout (the first one in the array).
    const displayedWorkouts = filterDate
        ? workouts.filter(w => new Date(w.date).toISOString().slice(0, 10) === filterDate)
        : workouts.slice(0, 1);

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    if (loading) {
        return <p>Loading workout history...</p>;
    }

    return (
        <div className="workout-history">
            {displayedWorkouts.length === 0 ? (
                <p>No workouts logged for this date. Your quest begins now!</p>
            ) : (
                <ul className="workout-list">
                    {displayedWorkouts.map(workout => (
                        <li key={workout._id} className="workout-item">
                            <h3>{formatDate(workout.date)} - {workout.type || 'Workout'}</h3>
                            {workout.notes && <p><strong>Notes:</strong> {workout.notes}</p>}
                            
                            {workout.exercises && workout.exercises.length > 0 && (
                                <div className="exercise-details">
                                    <h4>Exercises Logged:</h4>
                                    <ul>
                                        {workout.exercises.map((ex, index) => (
                                            <li key={index}>{`${ex.name}: ${ex.sets}x${ex.reps} @ ${ex.weight} kg`}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="workout-actions">
                                <button className="action-button edit-button" onClick={() => onEdit(workout)}>
                                    Edit
                                </button>
                                <button className="action-button delete-button" onClick={() => deleteWorkout(workout._id)}>
                                    Delete
                                </button>
                                <button className="action-button template-button" onClick={() => saveAsTemplate(workout)}>
                                    Save as Template
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default WorkoutHistory;