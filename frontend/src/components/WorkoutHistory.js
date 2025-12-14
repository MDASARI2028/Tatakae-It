// frontend/src/components/WorkoutHistory.js

import React, { useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEdit, FaDownload, FaDumbbell } from 'react-icons/fa';
import './WorkoutHistory.css';

const WorkoutHistory = ({ filterDate, onEdit, showToast }) => {
    const { workouts, loading, deleteWorkout } = useContext(WorkoutContext);
    const { saveAsTemplate } = useContext(TemplateContext);

    // Get today's date in YYYY-MM-DD format (local timezone)
    const today = new Date().toISOString().split('T')[0];

    // Helper function to normalize date to YYYY-MM-DD format
    const normalizeDate = (dateString) => {
        const date = new Date(dateString);
        // Get the date in local timezone format YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const displayedWorkouts = filterDate
        ? workouts.filter(w => normalizeDate(w.date) === filterDate)
        : workouts.filter(w => normalizeDate(w.date) === today); // Show today's workouts by default

    const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const handleDelete = async (workoutId) => {
        const result = await deleteWorkout(workoutId);
        if (result && result.success) {
            showToast('Workout deleted successfully!', 'success');
        } else if (result && !result.success) {
            showToast('Failed to delete workout.', 'error');
        }
    };

    const handleSaveAsTemplate = async (workout) => {
        const result = await saveAsTemplate(workout);
        if (result && result.success) {
            showToast('Template saved successfully!', 'success');
        } else if (result && !result.success) {
            showToast(result.error || 'Failed to save template.', 'error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: 100, transition: { duration: 0.2 } }
    };

    if (loading) {
        return (
            <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading workout history...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="workout-history-enhanced"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {displayedWorkouts.length === 0 ? (
                <motion.div
                    className="empty-message"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <FaDumbbell className="empty-icon" />
                    <p>No workouts logged for this date yet!</p>
                    <span>Start logging to track your progress</span>
                </motion.div>
            ) : (
                <motion.ul
                    className="workout-list-enhanced"
                    variants={containerVariants}
                >
                    <AnimatePresence>
                        {displayedWorkouts.map(workout => (
                            <motion.li
                                key={workout._id}
                                className="workout-item-enhanced"
                                variants={itemVariants}
                                exit="exit"
                            >
                                <div className="workout-header">
                                    <div className="workout-title-section">
                                        <h3>{formatDate(workout.date)}</h3>
                                        <span className="workout-type-badge">{workout.type || 'Workout'}</span>
                                    </div>
                                </div>

                                {workout.notes && (
                                    <motion.p
                                        className="workout-notes"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        💬 {workout.notes}
                                    </motion.p>
                                )}

                                {workout.exercises && workout.exercises.length > 0 && (
                                    <motion.div
                                        className="exercise-details-enhanced"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <h4>{workout.type === 'Cardio' ? '🏃 Cardio Exercises' : '🏋️ Exercises'}</h4>
                                        <ul className="exercises-list">
                                            {workout.exercises.map((ex, index) => (
                                                <motion.li
                                                    key={index}
                                                    className="exercise-item"
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + index * 0.05 }}
                                                >
                                                    <span className="exercise-name">{ex.name}</span>
                                                    <span className="exercise-stats">
                                                        {workout.type === 'Cardio'
                                                            ? `${ex.duration || 0} min • ${ex.caloriesBurned || 0} cal`
                                                            : `${ex.sets}×${ex.reps} @ ${ex.weight}kg`
                                                        }
                                                    </span>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}

                                <motion.div
                                    className="workout-actions-enhanced"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <motion.button
                                        className="action-button edit-button-enhanced"
                                        onClick={() => onEdit(workout)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Edit Workout"
                                    >
                                        <FaEdit /> Edit
                                    </motion.button>
                                    <motion.button
                                        className="action-button template-button-enhanced"
                                        onClick={() => handleSaveAsTemplate(workout)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Save as Template"
                                    >
                                        <FaDownload /> Template
                                    </motion.button>
                                    <motion.button
                                        className="action-button delete-button-enhanced"
                                        onClick={() => handleDelete(workout._id)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        title="Delete Workout"
                                    >
                                        <FaTrash /> Delete
                                    </motion.button>
                                </motion.div>
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </motion.ul>
            )}
        </motion.div>
    );
};

export default WorkoutHistory;