// frontend/src/components/EditWorkoutModal.js

import React, { useState, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import './EditWorkoutModal.css';
import './WorkoutLogger.css';

const EditWorkoutModal = ({ workout, onClose }) => {
    const { updateWorkout } = useContext(WorkoutContext);
    
    const [workoutData, setWorkoutData] = useState({
        date: new Date(workout.date).toISOString().slice(0, 10),
        type: workout.type,
        duration: workout.duration,
        notes: workout.notes || '',
    });
    const [exercises, setExercises] = useState(JSON.parse(JSON.stringify(workout.exercises)));

    const handleWorkoutChange = (e) => setWorkoutData({ ...workoutData, [e.target.name]: e.target.value });
    const handleExerciseChange = (index, e) => {
        const updated = exercises.map((ex, i) => i === index ? { ...ex, [e.target.name]: e.target.value } : ex);
        setExercises(updated);
    };
    const addExercise = () => setExercises([...exercises, { name: '', sets: 3, reps: 10, weight: 10 }]);
    const removeExercise = (index) => {
        if (exercises.length > 1) setExercises(exercises.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const finalData = { ...workoutData, exercises };
        const result = await updateWorkout(workout._id, finalData);
        if (result.success) {
            onClose();
        } else {
            alert('Failed to update workout.');
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Edit System Log</h2>
                <form onSubmit={handleSubmit} className="workout-logger-form">
                    {/* --- THIS SECTION IS NOW COMPLETE --- */}
                    <div className="form-grid">
                        <input type="date" name="date" className="form-input" value={workoutData.date} onChange={handleWorkoutChange} />
                        <select name="type" className="form-select" value={workoutData.type} onChange={handleWorkoutChange}>
                            <option value="Strength Training">Strength Training</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <input type="number" name="duration" className="form-input" placeholder="Duration (mins)" value={workoutData.duration} onChange={handleWorkoutChange} min="1" required />
                    <textarea name="notes" className="form-textarea" placeholder="Notes..." value={workoutData.notes} onChange={handleWorkoutChange}></textarea>
                    <div className="exercises-list-container">
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
                    </div>
                    <button type="button" className="system-button btn-secondary" onClick={addExercise}>Add Exercise</button>
                    
                    <div className="modal-actions">
                        <button type="button" className="system-button btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="system-button btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditWorkoutModal;