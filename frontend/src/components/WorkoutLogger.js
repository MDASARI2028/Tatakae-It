// frontend/src/components/WorkoutLogger.js

import React, { useState, useEffect, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import './WorkoutLogger.css'; // Import the new styles

const WorkoutLogger = ({template}) => {
    const { addWorkout } = useContext(WorkoutContext);

    const initialWorkoutState = {
        type: 'Strength Training',
        duration: 60,
        notes: '',
        date: new Date().toISOString().split('T')[0]
    };
    const initialExercisesState = [{ name: '', sets: 3, reps: 10, weight: 10 }];

    const [workoutData, setWorkoutData] = useState(initialWorkoutState);
    const [exercises, setExercises] = useState(initialExercisesState);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleWorkoutChange = (e) => setWorkoutData({ ...workoutData, [e.target.name]: e.target.value });
    const handleExerciseChange = (index, e) => {
        const updatedExercises = exercises.map((ex, i) => i === index ? { ...ex, [e.target.name]: e.target.value } : ex);
        setExercises(updatedExercises);
    };
    const addExercise = () => setExercises([...exercises, { name: '', sets:3, reps: 10, weight: 10 }]);
    const removeExercise = (index) => {
        if (exercises.length > 1) setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const finalWorkoutData = {
            ...workoutData,
            exercises: workoutData.type === 'Strength Training' ? exercises.filter(ex => ex.name.trim() !== '') : []
        };
        
        const result = await addWorkout(finalWorkoutData);

        if (result.success) {
            setSuccess('Workout logged successfully!');
            setWorkoutData(initialWorkoutState);
            setExercises(initialExercisesState);
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to log workout.');
        }
    };
    useEffect(() => {
        if (template) {
            setWorkoutData({
                type: template.workoutType,
                duration: 60, // Default duration
                notes: template.notes || '',
                date: new Date().toISOString().split('T')[0]
            });
            // Deep copy exercises to avoid mutation issues
            setExercises(JSON.parse(JSON.stringify(template.exercises)));
        }
    }, [template]); 
    return (
        <div className="workout-logger">
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            
            <form onSubmit={handleSubmit} className="workout-logger-form">
                <div className="form-grid">
                    <input type="date" name="date" className="form-input" value={workoutData.date} onChange={handleWorkoutChange} required />
                    <select name="type" className="form-select" value={workoutData.type} onChange={handleWorkoutChange}>
                        <option value="Strength Training">Strength Training</option>
                        <option value="Cardio">Cardio</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <input type="number" name="duration" className="form-input" placeholder="Duration (mins)" value={workoutData.duration} onChange={handleWorkoutChange} min="1" required />
                <textarea name="notes" className="form-textarea" placeholder="Add notes about your session..." value={workoutData.notes} onChange={handleWorkoutChange}></textarea>
                {workoutData.type === 'Cardio' && (
                    <div className="form-grid">
                        <input type="number" name="distance" className="form-input" placeholder="Distance (km)" onChange={handleWorkoutChange} />
                        <input type="number" name="cardioDuration" className="form-input" placeholder="Duration (mins)" onChange={handleWorkoutChange} />
                        <input type="number" name="caloriesBurned" className="form-input" placeholder="Calories Burned" onChange={handleWorkoutChange} />
                    </div>
                )}
                {workoutData.type === 'Strength Training' && (
                    <div className="exercise-section">
                        <h4>Exercises</h4>
                        {exercises.map((exercise, index) => (
                            <div key={index} className="exercise-grid">
                                <input type="text" name="name" className="form-input" placeholder="Exercise Name" value={exercise.name} onChange={(e) => handleExerciseChange(index, e)} required />
                                <input type="number" name="sets" className="form-input" placeholder="Sets" value={exercise.sets} onChange={(e) => handleExerciseChange(index, e)} min="1" />
                                <input type="number" name="reps" className="form-input" placeholder="Reps" value={exercise.reps} onChange={(e) => handleExerciseChange(index, e)} min="1" />
                                <input type="number" name="weight" className="form-input" placeholder="Weight (kg)" value={exercise.weight} onChange={(e) => handleExerciseChange(index, e)} min="0" />
                                <button type="button" className="remove-exercise-btn" onClick={() => removeExercise(index)}>X</button>
                            </div>
                        ))}
                        <button type="button" className="system-button btn-secondary" onClick={addExercise}>Add Exercise</button>
                    </div>
                )}
                
                <button type="submit" className="system-button btn-primary">Log Workout</button>
            </form>
        </div>
    );
};

export default WorkoutLogger;