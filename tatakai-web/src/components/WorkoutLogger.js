// frontend/src/components/WorkoutLogger.js

import React, { useState, useEffect, useContext } from 'react';
import { WorkoutContext } from '../context/WorkoutContext';
import { TemplateContext } from '../context/TemplateContext';
import { useLevelUp } from '../context/LevelUpContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaDumbbell, FaRunning, FaClock, FaFeatherAlt, FaCheck, FaDownload, FaEdit, FaTrash, FaTimes, FaSave } from 'react-icons/fa';
import './WorkoutLogger.css';

const WorkoutLogger = ({ template }) => {
    const { addWorkout } = useContext(WorkoutContext);
    const { templates, loading, error: templateError, refreshTemplates, deleteTemplate, updateTemplate, saveAsTemplate } = useContext(TemplateContext);
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

    // Initial state with setsData
    const initialExercisesState = [{
        name: '',
        sets: 1,
        reps: '',
        weight: '',
        setsData: [
            { reps: '', weight: '' }
        ]
    }];

    const initialCardioExercises = [{ name: '', duration: '', caloriesBurned: '' }];

    const [workoutData, setWorkoutData] = useState(initialWorkoutState);
    const [exercises, setExercises] = useState(initialExercisesState);
    const [cardioExercises, setCardioExercises] = useState(initialCardioExercises);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeStep, setActiveStep] = useState(1);

    // Template Management State
    const [showTemplateManager, setShowTemplateManager] = useState(false);
    const [editingTemplateId, setEditingTemplateId] = useState(null);
    const [editTemplateName, setEditTemplateName] = useState('');

    const handleStartEditTemplate = (t) => {
        setEditingTemplateId(t._id);
        setEditTemplateName(t.templateName);
    };

    const handleSaveTemplateEdit = async () => {
        if (!editTemplateName.trim()) return;
        const res = await updateTemplate(editingTemplateId, { templateName: editTemplateName });
        if (res.success) {
            setSuccess('Template updated successfully');
            setEditingTemplateId(null);
            setEditTemplateName('');
            // Clear success msg after 3s
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(res.error || 'Failed to update template');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDeleteTemplate = async (id) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const res = await deleteTemplate(id);
            if (res.success) {
                setSuccess('Template deleted');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(res.error || 'Failed to delete template');
                setTimeout(() => setError(''), 3000);
            }
        }
    };

    const handleSaveAsNewTemplate = async () => {
        const workoutToSave = {
            type: workoutData.type,
            notes: workoutData.notes,
            exercises: workoutData.type === 'Cardio' ? cardioExercises : exercises.filter(e => e.name.trim() !== '')
        };

        const res = await saveAsTemplate(workoutToSave);
        if (res.success) {
            setSuccess('Saved as template!');
            setTimeout(() => setSuccess(''), 3000);
        } else {
            setError(res.error || 'Failed to save template');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleWorkoutChange = (e) => setWorkoutData({ ...workoutData, [e.target.name]: e.target.value });

    const handleExerciseChange = (index, e) => {
        const { name, value } = e.target;
        const updatedExercises = [...exercises];
        updatedExercises[index] = { ...updatedExercises[index], [name]: value };

        // If sets count changes, resize setsData
        if (name === 'sets') {
            const newSetsCount = parseInt(value) || 0;
            const currentSetsData = updatedExercises[index].setsData || [];

            if (newSetsCount > currentSetsData.length) {
                // Add more sets, copying the last set's values for convenience if available
                const lastSet = currentSetsData.length > 0 ? currentSetsData[currentSetsData.length - 1] : { reps: '', weight: '' };
                const setsToAdd = new Array(newSetsCount - currentSetsData.length).fill(null).map(() => ({ ...lastSet }));
                updatedExercises[index].setsData = [...currentSetsData, ...setsToAdd];
            } else if (newSetsCount < currentSetsData.length) {
                // Remove sets
                updatedExercises[index].setsData = currentSetsData.slice(0, newSetsCount);
            }
        }

        setExercises(updatedExercises);
    };

    const handleSetChange = (exerciseIndex, setIndex, field, value) => {
        const updatedExercises = [...exercises];
        if (!updatedExercises[exerciseIndex].setsData) {
            updatedExercises[exerciseIndex].setsData = [];
        }
        updatedExercises[exerciseIndex].setsData[setIndex] = {
            ...updatedExercises[exerciseIndex].setsData[setIndex],
            [field]: value
        };
        setExercises(updatedExercises);
    };

    const addExercise = () => setExercises([...exercises, {
        name: '',
        sets: 1,
        reps: '',
        weight: '',
        setsData: [
            { reps: '', weight: '' }
        ]
    }]);

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
            formattedExercises = exercises
                .filter(ex => ex.name.trim() !== '')
                .map(ex => {
                    // Calculate summaries from setsData
                    let summaryReps = ex.reps;
                    let summaryWeight = ex.weight;

                    if (ex.setsData && ex.setsData.length > 0) {
                        const totalReps = ex.setsData.reduce((acc, s) => acc + (Number(s.reps) || 0), 0);
                        const maxWeight = ex.setsData.reduce((max, s) => Math.max(max, (Number(s.weight) || 0)), 0);

                        summaryReps = Math.round(totalReps / ex.setsData.length);
                        summaryWeight = maxWeight;
                    }

                    return {
                        ...ex,
                        reps: summaryReps,
                        weight: summaryWeight
                    };
                });
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
            // Deep clone the exercises array
            const clonedExercises = template.exercises.map(ex => {
                const setsCount = ex.sets || 3;
                // Generate setsData from template summary if setsData doesn't exist in template
                // (Templates might need migration later or we just infer)
                const inferredSetsData = ex.setsData || new Array(setsCount).fill({
                    reps: ex.reps || 10,
                    weight: ex.weight || 10
                });

                return {
                    name: ex.name || '',
                    sets: setsCount,
                    reps: ex.reps || 10,
                    weight: ex.weight || 10,
                    setsData: inferredSetsData
                };
            });
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
                                        <div className="template-label-group">
                                            <FaDownload className="template-label-icon" />
                                            <label className="template-selector-label">Load from Template</label>
                                        </div>
                                        <div className="template-actions">
                                            <button
                                                type="button"
                                                className={`manage-templates-btn ${showTemplateManager ? 'active' : ''}`}
                                                onClick={() => setShowTemplateManager(!showTemplateManager)}
                                                title="Manage Templates"
                                            >
                                                <FaEdit /> Manage
                                            </button>
                                            <button
                                                type="button"
                                                className="refresh-templates-btn"
                                                onClick={refreshTemplates}
                                                title="Refresh Templates"
                                            >
                                                ↻
                                            </button>
                                        </div>
                                    </div>

                                    {/* Template Manager Panel */}
                                    <AnimatePresence>
                                        {showTemplateManager && (
                                            <motion.div
                                                className="template-manager-panel"
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                            >
                                                <h4 className="manager-title">Manage Templates</h4>
                                                {templates.length === 0 ? (
                                                    <p className="no-templates-manager">No templates found.</p>
                                                ) : (
                                                    <ul className="template-manage-list">
                                                        {templates.map(t => (
                                                            <li key={t._id} className="template-manage-item">
                                                                {editingTemplateId === t._id ? (
                                                                    <div className="template-edit-row">
                                                                        <input
                                                                            type="text"
                                                                            value={editTemplateName}
                                                                            onChange={(e) => setEditTemplateName(e.target.value)}
                                                                            className="template-edit-input"
                                                                            autoFocus
                                                                        />
                                                                        <div className="edit-actions">
                                                                            <button onClick={handleSaveTemplateEdit} className="btn-icon-save" title="Save"><FaSave /></button>
                                                                            <button onClick={() => setEditingTemplateId(null)} className="btn-icon-cancel" title="Cancel"><FaTimes /></button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="template-view-row">
                                                                        <span className="template-name-display">{t.templateName}</span>
                                                                        <div className="template-item-actions">
                                                                            <button onClick={() => handleStartEditTemplate(t)} className="btn-icon-edit" title="Rename"><FaEdit /></button>
                                                                            <button onClick={() => handleDeleteTemplate(t._id)} className="btn-icon-delete" title="Delete"><FaTrash /></button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {loading ? (
                                        <div className="template-loading">
                                            <span className="api-loader-spinner"></span> Loading templates...
                                        </div>
                                    ) : templateError ? (
                                        <div className="template-error">
                                            <p>{templateError}</p>
                                            <button type="button" onClick={refreshTemplates} className="btn-retry">Retry</button>
                                        </div>
                                    ) : (
                                        templates && templates.length > 0 && (
                                            <select
                                                className="template-selector-dropdown"
                                                onChange={(e) => {
                                                    const selectedTemplate = templates.find(t => t._id === e.target.value);
                                                    if (selectedTemplate) {
                                                        const clonedExercises = selectedTemplate.exercises.map(ex => {
                                                            const setsCount = ex.sets || 3;
                                                            // For templates, we generate setsData based on the summary reps/weight
                                                            const inferredSetsData = new Array(setsCount).fill({
                                                                reps: ex.reps || 10,
                                                                weight: ex.weight || 10
                                                            });
                                                            return {
                                                                name: ex.name || '',
                                                                sets: setsCount,
                                                                reps: ex.reps || 10,
                                                                weight: ex.weight || 10,
                                                                setsData: inferredSetsData
                                                            };
                                                        });
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
                                        )
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
                                                            placeholder="Exercise Name (e.g., Running)"
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

                                                <div className="exercise-sets-config">
                                                    <div className="form-group-enhanced compact">
                                                        <label>Number of Sets:</label>
                                                        <input
                                                            type="number"
                                                            name="sets"
                                                            className="form-input-enhanced sets-count-input"
                                                            value={exercise.sets}
                                                            onChange={(e) => handleExerciseChange(index, e)}
                                                            min="1"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="sets-list">
                                                    <div className="sets-header-row">
                                                        <span className="set-label">Set</span>
                                                        <span className="set-label">Reps</span>
                                                        <span className="set-label">Weight (kg)</span>
                                                    </div>
                                                    {exercise.setsData && exercise.setsData.map((set, setIndex) => (
                                                        <motion.div
                                                            key={setIndex}
                                                            className="set-row"
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                        >
                                                            <div className="set-number-badge">{setIndex + 1}</div>
                                                            <input
                                                                type="number"
                                                                className="form-input-enhanced set-input"
                                                                placeholder="Reps"
                                                                value={set.reps}
                                                                onChange={(e) => handleSetChange(index, setIndex, 'reps', e.target.value)}
                                                            />
                                                            <input
                                                                type="number"
                                                                className="form-input-enhanced set-input"
                                                                placeholder="Kg"
                                                                value={set.weight}
                                                                onChange={(e) => handleSetChange(index, setIndex, 'weight', e.target.value)}
                                                            />
                                                        </motion.div>
                                                    ))}
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
                                    type="button"
                                    className="btn-save-template-step"
                                    onClick={handleSaveAsNewTemplate}
                                    whileHover={{ scale: 1.05 }}
                                    title="Save current setup as a new template"
                                >
                                    <FaSave /> Save Template
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