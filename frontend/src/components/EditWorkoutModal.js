// frontend/src/components/EditWorkoutModal.js

import React, { useState, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { motion } from 'framer-motion';
import { FaCalendar, FaDumbbell, FaClock, FaStickyNote, FaPlus, FaTimes } from 'react-icons/fa';
import './EditWorkoutModal.css';

const EditWorkoutModal = ({ workout, onClose, showToast }) => {
    const { updateWorkout } = useContext(WorkoutContext);

    const [workoutData, setWorkoutData] = useState({
        date: new Date(workout.date).toISOString().slice(0, 10),
        type: workout.type,
        duration: workout.duration,
        notes: workout.notes || '',
    });
    const [exercises, setExercises] = useState(JSON.parse(JSON.stringify(workout.exercises)));
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setIsSubmitting(true);

        const finalData = { ...workoutData, exercises };
        const result = await updateWorkout(workout._id, finalData);

        if (result.success) {
            showToast('Workout updated successfully!', 'success');
            onClose();
        } else {
            showToast('Failed to update workout. Please try again.', 'error');
        }
        setIsSubmitting(false);
    };

    return (
        <motion.div
            className="modal-backdrop"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
            >
                <h2>✏️ Edit Workout</h2>
                <form onSubmit={handleSubmit} className="workout-logger-form">
                    <div className="form-grid">
                        <div className="form-field">
                            <label><FaCalendar /> Date</label>
                            <input
                                type="date"
                                name="date"
                                className="form-input"
                                value={workoutData.date}
                                onChange={handleWorkoutChange}
                                required
                            />
                        </div>
                        <div className="form-field">
                            <label><FaDumbbell /> Type</label>
                            <select
                                name="type"
                                className="form-select"
                                value={workoutData.type}
                                onChange={handleWorkoutChange}
                            >
                                <option value="Strength Training">Strength Training</option>
                                <option value="Cardio">Cardio</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-field">
                        <label><FaClock /> Duration (minutes)</label>
                        <input
                            type="number"
                            name="duration"
                            className="form-input"
                            placeholder="Duration (mins)"
                            value={workoutData.duration}
                            onChange={handleWorkoutChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="form-field">
                        <label><FaStickyNote /> Notes</label>
                        <textarea
                            name="notes"
                            className="form-textarea"
                            placeholder="Add any notes about your workout..."
                            value={workoutData.notes}
                            onChange={handleWorkoutChange}
                        ></textarea>
                    </div>

                    <div className="exercises-list-container">
                        <h4>🏋️ Exercises</h4>
                        {exercises.map((exercise, index) => (
                            <motion.div
                                key={index}
                                className="exercise-grid"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <input
                                    type="text"
                                    name="name"
                                    className="form-input"
                                    placeholder="Exercise Name"
                                    value={exercise.name}
                                    onChange={(e) => handleExerciseChange(index, e)}
                                    required
                                />
                                <input
                                    type="number"
                                    name="sets"
                                    className="form-input"
                                    placeholder="Sets"
                                    value={exercise.sets}
                                    onChange={(e) => handleExerciseChange(index, e)}
                                    min="1"
                                />
                                <input
                                    type="number"
                                    name="reps"
                                    className="form-input"
                                    placeholder="Reps"
                                    value={exercise.reps}
                                    onChange={(e) => handleExerciseChange(index, e)}
                                    min="1"
                                />
                                <input
                                    type="number"
                                    name="weight"
                                    className="form-input"
                                    placeholder="Weight (kg)"
                                    value={exercise.weight}
                                    onChange={(e) => handleExerciseChange(index, e)}
                                    min="0"
                                />
                                <button
                                    type="button"
                                    className="remove-exercise-btn"
                                    onClick={() => removeExercise(index)}
                                    title="Remove exercise"
                                >
                                    <FaTimes />
                                </button>
                            </motion.div>
                        ))}
                        <motion.button
                            type="button"
                            className="system-button btn-secondary"
                            onClick={addExercise}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <FaPlus /> Add Exercise
                        </motion.button>
                    </div>

                    <div className="modal-actions">
                        <motion.button
                            type="button"
                            className="system-button btn-secondary"
                            onClick={onClose}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="system-button btn-primary"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default EditWorkoutModal;