// frontend/src/components/WorkoutLogger.js

import React, { useState, useEffect, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext';
import { useLevelUp } from '../context/LevelUpContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaRunning, FaClock, FaFeatherAlt, FaCheck, FaDownload } from 'react-icons/fa';
import './WorkoutLogger.css';

const WorkoutLogger = ({ template }) => {
    const { addWorkout } = useContext(WorkoutContext);
    const { templates, loading, error: templateError, refreshTemplates } = useContext(TemplateContext);
    const { calculateDailyXP } = useLevelUp();

    // Helper to get local date string (YYYY-MM-DD) without UTC conversion
    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const initialWorkoutState = {
        type: 'Strength Training',
        duration: 60,
        notes: '',
        date: getLocalDateString()
    };
    const initialExercisesState = [{ name: '', sets: '', reps: '', weight: '' }];
    const initialCardioExercises = [{ name: '', duration: '', caloriesBurned: '' }];

    const [workoutData, setWorkoutData] = useState(initialWorkoutState);
    const [exercises, setExercises] = useState(initialExercisesState);
    const [cardioExercises, setCardioExercises] = useState(initialCardioExercises);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(1);

    const handleWorkoutChange = (e) => setWorkoutData({ ...workoutData, [e.target.name]: e.target.value });
    const handleExerciseChange = (index, e) => {
        const updatedExercises = exercises.map((ex, i) => i === index ? { ...ex, [e.target.name]: e.target.value } : ex);
        setExercises(updatedExercises);
    };
    const addExercise = () => setExercises([...exercises, { name: '', sets: '', reps: '', weight: '' }]);
    const addCardioExercise = () => setCardioExercises([...cardioExercises, { name: '', duration: '', caloriesBurned: '' }]);
    const removeExercise = (index) => {
        if (exercises.length > 1) setExercises(exercises.filter((_, i) => i !== index));
    };
    const removeCardioExercise = (index) => {
        if (cardioExercises.length > 1) setCardioExercises(cardioExercises.filter((_, i) => i !== index));
    };
    const handleCardioExerciseChange = (index, e) => {
        const updated = cardioExercises.map((ex, i) => i === index ? { ...ex, [e.target.name]: e.target.value } : ex);
        setCardioExercises(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Format exercises based on workout type
        let formattedExercises = [];
        if (workoutData.type === 'Strength Training') {
            formattedExercises = exercises.filter(ex => ex.name.trim() !== '');
        } else if (workoutData.type === 'Cardio') {
            // Only send cardio-specific fields
            formattedExercises = cardioExercises
                .filter(ex => ex.name.trim() !== '')
                .map(ex => ({
                    name: ex.name,
                    duration: Number(ex.duration) || 0,
                    caloriesBurned: Number(ex.caloriesBurned) || 0
                }));
        }

        const finalWorkoutData = {
            ...workoutData,
            exercises: formattedExercises
        };

        const result = await addWorkout(finalWorkoutData);

        if (result.success) {
            setSuccess('Workout logged successfully!');
            setWorkoutData(initialWorkoutState);
            setExercises(initialExercisesState);
            setCardioExercises(initialCardioExercises);
            setActiveStep(1);

            // Trigger XP Calculation
            if (calculateDailyXP) {
                console.log('Triggering XP calculation after workout...');
                calculateDailyXP(true).catch(err => console.error('XP Trigger Error:', err));
            }

            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(result.error || 'Failed to log workout.');
        }
    };

    useEffect(() => {
        if (template && template.exercises) {
            setWorkoutData({
                type: template.workoutType || 'Strength Training',
                duration: 60,
                notes: template.notes || '',
                date: getLocalDateString()
            });
            // Deep clone the exercises array to avoid reference issues
            const clonedExercises = template.exercises.map(ex => ({
                name: ex.name || '',
                sets: ex.sets || 3,
                reps: ex.reps || 10,
                weight: ex.weight || 10
            }));
            setExercises(clonedExercises.length > 0 ? clonedExercises : initialExercisesState);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [template]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.5 } }
    };

    const stepVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
    };

    return (
        <motion.div
            className="workout-logger-enhanced"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {error && (
                <motion.div
                    className="alert alert-error"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    {error}
                </motion.div>
            )}
            {success && (
                <motion.div
                    className="alert alert-success"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                >
                    <FaCheck /> {success}
                </motion.div>
            )}

            {/* --- PROGRESS INDICATOR --- */}
            <div className="step-indicator">
                {[1, 2, 3].map(step => (
                    <motion.div
                        key={step}
                        className={`step ${activeStep >= step ? 'active' : ''}`}
                        onClick={() => setActiveStep(step)}
                        whileHover={{ scale: 1.1 }}
                    >
                        {step}
                    </motion.div>
                ))}
                <div className="step-line" style={{ width: `${((activeStep - 1) / 2) * 100}%` }}></div>
            </div>

            <form onSubmit={handleSubmit} className="workout-logger-form-enhanced">
                <AnimatePresence mode="wait">
                    {/* --- STEP 1: WORKOUT BASICS --- */}
                    {activeStep === 1 && (
                        <motion.div
                            key="step1"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="form-step"
                        >
                            <div className="step-header">
                                <FaDumbbell className="step-icon" />
                                <h3>Workout Basics</h3>
                            </div>

                            <div className="form-group-enhanced">
                                <label>Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input-enhanced"
                                    value={workoutData.date}
                                    onChange={handleWorkoutChange}
                                    required
                                />
                            </div>

                            <div className="form-group-enhanced">
                                <label>Workout Type</label>
                                <div className="type-selector">
                                    {['Strength Training', 'Cardio', 'Steps', 'Other'].map(type => (
                                        <motion.label
                                            key={type}
                                            className={`type-option ${workoutData.type === type ? 'selected' : ''}`}
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <input
                                                type="radio"
                                                name="type"
                                                value={type}
                                                checked={workoutData.type === type}
                                                onChange={handleWorkoutChange}
                                            />
                                            <span>{type}</span>
                                        </motion.label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-group-enhanced">
                                <label><FaClock /> Duration (minutes)</label>
                                <input
                                    type="number"
                                    name="duration"
                                    className="form-input-enhanced"
                                    value={workoutData.duration}
                                    onChange={handleWorkoutChange}
                                    min="1"
                                    required
                                />
                            </div>

                            <motion.button
                                type="button"
                                className="btn-next"
                                onClick={() => setActiveStep(2)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Next →
                            </motion.button>
                        </motion.div>
                    )}

                    {/* --- STEP 2: EXERCISES OR DETAILS --- */}
                    {activeStep === 2 && (
                        <motion.div
                            key="step2"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="form-step"
                        >
                            <div className="step-header">
                                {workoutData.type === 'Cardio' ? <FaRunning className="step-icon" /> : <FaDumbbell className="step-icon" />}
                                <h3>{workoutData.type === 'Cardio' ? 'Cardio Details' : 'Add Exercises'}</h3>
                            </div>

                            {/* Template Quick Load Indicator */}
                            {workoutData.type === 'Strength Training' && template && (
                                <motion.div
                                    className="template-quick-load"
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div className="quick-load-header">
                                        <FaDownload className="quick-load-icon" />
                                        <span>Template Loaded: {template.templateName}</span>
                                    </div>
                                    <p className="quick-load-info">
                                        {template.exercises?.length || 0} exercises loaded from template
                                    </p>
                                </motion.div>
                            )}

                            {/* Template Selector */}
                            {workoutData.type === 'Strength Training' && !template && (
                                <div className="template-selector-section">
                                    <div className="template-label-row">
                                        <label className="template-selector-label">
                                            <FaDownload className="template-label-icon" />
                                            Load from Template
                                        </label>
                                        <button
                                            type="button"
                                            className="refresh-templates-btn"
                                            onClick={refreshTemplates}
                                            title="Refresh Templates"
                                        >
                                            ↻
                                        </button>
                                    </div>
                                    <p className="template-selector-hint">Start with a saved workout template</p>

                                    {loading ? (
                                        <div className="template-loading">
                                            <span className="api-loader-spinner"></span> Loading templates...
                                        </div>
                                    ) : templateError ? (
                                        <div className="template-error">
                                            <p>{templateError}</p>
                                            <button type="button" onClick={refreshTemplates} className="btn-retry">Retry</button>
                                        </div>
                                    ) : templates && templates.length > 0 ? (
                                        <select
                                            className="template-selector-dropdown"
                                            onChange={(e) => {
                                                const selectedTemplate = templates.find(t => t._id === e.target.value);
                                                if (selectedTemplate) {
                                                    // Load template exercises
                                                    const clonedExercises = selectedTemplate.exercises.map(ex => ({
                                                        name: ex.name || '',
                                                        sets: ex.sets || '',
                                                        reps: ex.reps || '',
                                                        weight: ex.weight || ''
                                                    }));
                                                    setExercises(clonedExercises.length > 0 ? clonedExercises : initialExercisesState);
                                                    setWorkoutData({
                                                        ...workoutData,
                                                        type: selectedTemplate.workoutType || 'Strength Training',
                                                        notes: selectedTemplate.notes || ''
                                                    });
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Choose a template...</option>
                                            {templates.map(t => (
                                                <option key={t._id} value={t._id}>{t.templateName}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="no-templates-message">
                                            <p>No templates found. Save a workout as a template to see it here!</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {workoutData.type === 'Cardio' && (
                                <div className="exercise-section-enhanced">
                                    <AnimatePresence>
                                        {cardioExercises.map((exercise, index) => (
                                            <motion.div
                                                key={index}
                                                layout
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="exercise-card"
                                            >
                                                <div className="exercise-header">
                                                    <div className="exercise-name-row">
                                                        <span className="exercise-number">#{index + 1}</span>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            className="form-input-enhanced exercise-name-input"
                                                            placeholder="Exercise Name (e.g., Running, Cycling)"
                                                            value={exercise.name}
                                                            onChange={(e) => handleCardioExerciseChange(index, e)}
                                                            required
                                                        />
                                                    </div>
                                                    <motion.button
                                                        type="button"
                                                        className="remove-exercise-btn-enhanced"
                                                        onClick={() => removeCardioExercise(index)}
                                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                                    >
                                                        ✕
                                                    </motion.button>
                                                </div>
                                                <div className="exercise-stats">
                                                    <input
                                                        type="number"
                                                        name="duration"
                                                        className="form-input-enhanced stat-input"
                                                        placeholder="Duration (min)"
                                                        value={exercise.duration}
                                                        onChange={(e) => handleCardioExerciseChange(index, e)}
                                                        required
                                                    />
                                                    <input
                                                        type="number"
                                                        name="caloriesBurned"
                                                        className="form-input-enhanced stat-input"
                                                        placeholder="Calories"
                                                        value={exercise.caloriesBurned}
                                                        onChange={(e) => handleCardioExerciseChange(index, e)}
                                                        required
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <motion.button
                                        type="button"
                                        className="add-exercise-btn-enhanced"
                                        onClick={addCardioExercise}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        + Add Cardio Exercise
                                    </motion.button>
                                </div>
                            )}

                            {workoutData.type === 'Steps' && (
                                <div className="cardio-grid">
                                    <div className="form-group-enhanced">
                                        <label>Steps Walked</label>
                                        <input
                                            type="number"
                                            name="steps"
                                            className="form-input-enhanced"
                                            placeholder="Number of steps"
                                            onChange={handleWorkoutChange}
                                        />
                                    </div>
                                    <div className="form-group-enhanced">
                                        <label>Distance (km)</label>
                                        <input
                                            type="number"
                                            name="distance"
                                            className="form-input-enhanced"
                                            placeholder="Distance"
                                            onChange={handleWorkoutChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {workoutData.type === 'Strength Training' && (
                                <div className="exercise-section-enhanced">
                                    <AnimatePresence>
                                        {exercises.map((exercise, index) => (
                                            <motion.div
                                                key={index}
                                                layout
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="exercise-card"
                                            >
                                                <div className="exercise-header">
                                                    <div className="exercise-name-row">
                                                        <span className="exercise-number">#{index + 1}</span>
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            className="form-input-enhanced exercise-name-input"
                                                            placeholder="Exercise Name (e.g., Bench Press)"
                                                            value={exercise.name}
                                                            onChange={(e) => handleExerciseChange(index, e)}
                                                            required
                                                        />
                                                    </div>
                                                    <motion.button
                                                        type="button"
                                                        className="remove-exercise-btn-enhanced"
                                                        onClick={() => removeExercise(index)}
                                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                                    >
                                                        ✕
                                                    </motion.button>
                                                </div>
                                                <div className="exercise-stats">
                                                    <input
                                                        type="number"
                                                        name="sets"
                                                        className="form-input-enhanced stat-input"
                                                        placeholder="Sets"
                                                        value={exercise.sets}
                                                        onChange={(e) => handleExerciseChange(index, e)}
                                                        min="1"
                                                    />
                                                    <input
                                                        type="number"
                                                        name="reps"
                                                        className="form-input-enhanced stat-input"
                                                        placeholder="Reps"
                                                        value={exercise.reps}
                                                        onChange={(e) => handleExerciseChange(index, e)}
                                                        min="1"
                                                    />
                                                    <input
                                                        type="number"
                                                        name="weight"
                                                        className="form-input-enhanced stat-input"
                                                        placeholder="Weight (kg)"
                                                        value={exercise.weight}
                                                        onChange={(e) => handleExerciseChange(index, e)}
                                                        min="0"
                                                    />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <motion.button
                                        type="button"
                                        className="btn-add-exercise"
                                        onClick={addExercise}
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        + Add Exercise
                                    </motion.button>
                                </div>
                            )}

                            <div className="step-navigation">
                                <motion.button
                                    type="button"
                                    className="btn-prev"
                                    onClick={() => setActiveStep(1)}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    ← Back
                                </motion.button>
                                <motion.button
                                    type="button"
                                    className="btn-next"
                                    onClick={() => setActiveStep(3)}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Next →
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* --- STEP 3: NOTES & SUBMIT --- */}
                    {activeStep === 3 && (
                        <motion.div
                            key="step3"
                            variants={stepVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="form-step"
                        >
                            <div className="step-header">
                                <FaFeatherAlt className="step-icon" />
                                <h3>Final Notes</h3>
                            </div>

                            <div className="form-group-enhanced">
                                <label>Workout Notes</label>
                                <textarea
                                    name="notes"
                                    className="form-textarea-enhanced"
                                    placeholder="How did the workout go? Any notes..."
                                    value={workoutData.notes}
                                    onChange={handleWorkoutChange}
                                    rows="5"
                                ></textarea>
                            </div>

                            {/* --- REVIEW SUMMARY --- */}
                            <div className="review-summary">
                                <h4>Summary</h4>
                                <div className="summary-item"><span>Date:</span> <strong>{workoutData.date}</strong></div>
                                <div className="summary-item"><span>Type:</span> <strong>{workoutData.type}</strong></div>
                                <div className="summary-item"><span>Duration:</span> <strong>{workoutData.duration} min</strong></div>
                                {workoutData.type === 'Strength Training' && (
                                    <div className="summary-item"><span>Exercises:</span> <strong>{exercises.filter(e => e.name).length}</strong></div>
                                )}
                            </div>

                            <div className="step-navigation">
                                <motion.button
                                    type="button"
                                    className="btn-prev"
                                    onClick={() => setActiveStep(2)}
                                    whileHover={{ scale: 1.05 }}
                                >
                                    ← Back
                                </motion.button>
                                <motion.button
                                    type="submit"
                                    className="btn-submit"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    ✓ Log Workout
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>
        </motion.div>
    );
};

export default WorkoutLogger;