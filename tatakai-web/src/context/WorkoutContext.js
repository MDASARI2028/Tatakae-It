// frontend/src/context/WorkoutContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);


    const fetchWorkouts = useCallback(async () => {
        setLoading(true);
        try {
            // Interceptor handles the token
            const response = await api.get('/api/workouts?limit=300');
            setWorkouts(response.data);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setWorkouts([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchWorkouts();
        } else {
            setLoading(false);
            setWorkouts([]);
        }
    }, [token, fetchWorkouts]);

    // This function will be used by the WorkoutLogger
    const addWorkout = async (workoutData) => {
        // --- OPTIMISTIC UPDATE ---
        const tempId = Date.now().toString();
        const optimisticWorkout = { ...workoutData, _id: tempId, user: 'temp' };

        // Save previous state for rollback
        const previousWorkouts = workouts;
        setWorkouts(prev => [optimisticWorkout, ...prev]);

        try {
            const response = await api.post('/api/workouts', workoutData);
            const savedWorkout = response.data;

            // Replace optimistic workout with real one
            setWorkouts(prev => prev.map(w => w._id === tempId ? savedWorkout : w));

            return { success: true };
        } catch (error) {
            console.error("Error adding workout:", error);
            // ROLLBACK
            setWorkouts(previousWorkouts);
            return { success: false, error: error.response?.data?.msg || error.message };
        }
    };
    const deleteWorkout = async (id) => {
        // --- OPTIMISTIC UPDATE ---
        const previousWorkouts = workouts;
        setWorkouts(prev => prev.filter(w => w._id !== id));

        try {
            await api.delete(`/api/workouts/${id}`);
            return { success: true };
        } catch (error) {
            console.error("Error deleting workout:", error);
            // ROLLBACK
            setWorkouts(previousWorkouts);
            return { success: false, error: error.response?.data?.msg || error.message };
        }
    };
    const updateWorkout = async (workoutId, workoutData) => {
        try {
            await api.put(`/api/workouts/${workoutId}`, workoutData);
            await fetchWorkouts(); // Refresh the list
            return { success: true };
        } catch (error) {
            console.error("Error updating workout:", error);
            return { success: false, error: error.response?.data?.msg || error.message };
        }
    };

    const contextValue = {
        workouts,
        loading,
        addWorkout,
        deleteWorkout, // <-- Add to context
        updateWorkout, // <-- Add to context
        fetchWorkouts, // <-- Add to context
    };

    return (
        <WorkoutContext.Provider value={contextValue}>
            {children}
        </WorkoutContext.Provider>
    );
};