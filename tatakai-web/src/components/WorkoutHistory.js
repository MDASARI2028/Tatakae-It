// frontend/src/components/WorkoutHistory.js

import React, { useContext, useMemo } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTrash, FaEdit, FaDownload, FaDumbbell, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import './WorkoutHistory.css';

const WorkoutHistory = ({ filterDate, setFilterDate, onEdit, showToast }) => {
    const { workouts, loading, deleteWorkout } = useContext(WorkoutContext);
    const { saveAsTemplate } = useContext(TemplateContext);

    // Get today's date in YYYY-MM-DD format (local timezone)
    const getLocalToday = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const today = getLocalToday();

    // Helper function to normalize date to YYYY-MM-DD format
    // Handles both ISO date strings and simple date strings
    const normalizeDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // If invalid date, return original string (fallback)
        if (isNaN(date.getTime())) return dateString;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Calculate progressive overload for each exercise
    // Returns: { change: number (%), improved: boolean }
    const calculateProgressiveOverload = useMemo(() => {
        // Build a map of exercise name -> sorted list of performances
        const exerciseHistory = {};

        // Sort workouts by date (oldest first)
        const sortedWorkouts = [...workouts].sort((a, b) =>
            new Date(a.date) - new Date(b.date)
        );

        sortedWorkouts.forEach(workout => {
            if (!workout.exercises) return;
            workout.exercises.forEach(ex => {
                const name = ex.name?.toLowerCase().trim();
                if (!name) return;

                if (!exerciseHistory[name]) {
                    exerciseHistory[name] = [];
                }

                // Calculate volume (sets × reps × weight)
                const volume = (Number(ex.sets) || 0) * (Number(ex.reps) || 0) * (Number(ex.weight) || 1);
                exerciseHistory[name].push({
                    workoutId: workout._id,
                    date: workout.date,
                    sets: Number(ex.sets) || 0,
                    reps: Number(ex.reps) || 0,
                    weight: Number(ex.weight) || 0,
                    volume
                });
            });
        });

        // Function to get progressive overload for a specific exercise in a workout
        return (workoutId, exerciseName) => {
            const name = exerciseName?.toLowerCase().trim();
            if (!name || !exerciseHistory[name]) return null;

            const history = exerciseHistory[name];
            const currentIdx = history.findIndex(h => h.workoutId === workoutId);

            if (currentIdx <= 0) return null; // No previous data

            const current = history[currentIdx];
            const previous = history[currentIdx - 1];

            if (previous.volume === 0) return null;

            const changePercent = ((current.volume - previous.volume) / previous.volume) * 100;

            return {
                change: Math.round(changePercent),
                improved: changePercent > 0,
                currentVolume: current.volume,
                previousVolume: previous.volume
            };
        };
    }, [workouts]);

    // Calculate overall workout progressive overload (average of all exercises)
    const getWorkoutOverallOverload = (workout) => {
        if (!workout.exercises || workout.exercises.length === 0 || workout.type === 'Cardio') {
            return null;
        }

        let totalChange = 0;
        let validExercises = 0;

        workout.exercises.forEach(ex => {
            const overload = calculateProgressiveOverload(workout._id, ex.name);
            if (overload && overload.change !== null) {
                totalChange += overload.change;
                validExercises++;
            }
        });

        if (validExercises === 0) return null;

        const avgChange = totalChange / validExercises;
        return {
            average: Math.round(avgChange),
            improved: avgChange > 0,
            exercisesCompared: validExercises,
            totalExercises: workout.exercises.length
        };
    };

    const displayedWorkouts = useMemo(() => {
        const targetDate = filterDate || today;
        return workouts.filter(w => normalizeDate(w.date) === targetDate);
    }, [workouts, filterDate, today]);

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
            <div className="history-controls">
                <label className="date-picker-label">
                    <span className="icon">📅</span>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="modern-date-input"
                    />
                </label>
                {filterDate && (
                    <button className="clear-filter-btn" onClick={() => setFilterDate('')}>
                        Show All
                    </button>
                )}
            </div>

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
                        {displayedWorkouts.map(workout => {
                            const workoutOverload = getWorkoutOverallOverload(workout);

                            return (
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
                                            {workoutOverload && (
                                                <span
                                                    className={`workout-overload-badge ${workoutOverload.improved ? 'improved' : 'declined'}`}
                                                    title={`${workoutOverload.exercisesCompared}/${workoutOverload.totalExercises} exercises compared`}
                                                >
                                                    {workoutOverload.improved ? <FaArrowUp /> : <FaArrowDown />}
                                                    {Math.abs(workoutOverload.average)}% avg
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {workout.notes && (
                                        <div className="workout-notes-display">
                                            <span className="note-icon">💬</span>
                                            <p>{workout.notes}</p>
                                        </div>
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
                                                {workout.exercises.map((ex, index) => {
                                                    const overload = workout.type !== 'Cardio'
                                                        ? calculateProgressiveOverload(workout._id, ex.name)
                                                        : null;

                                                    return (
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
                                                            {overload && (
                                                                <span
                                                                    className={`progressive-overload ${overload.improved ? 'improved' : 'declined'}`}
                                                                    title={`Volume: ${overload.currentVolume} vs ${overload.previousVolume} (previous)`}
                                                                >
                                                                    {overload.improved ? <FaArrowUp /> : <FaArrowDown />}
                                                                    {Math.abs(overload.change)}%
                                                                </span>
                                                            )}
                                                        </motion.li>
                                                    );
                                                })}
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
                            );
                        })}
                    </AnimatePresence>
                </motion.ul>
            )}
        </motion.div>
    );
};

export default WorkoutHistory;