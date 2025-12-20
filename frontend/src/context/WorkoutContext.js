// frontend/src/context/WorkoutContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);


    const fetchWorkouts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/workouts?limit=50', { headers: { 'x-auth-token': token } });
            if (response.ok) {
                const data = await response.json();
                setWorkouts(data);
            } else {
                setWorkouts([]);
            }
        } catch (error) {
            console.error("Error fetching workouts:", error);
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
            const response = await fetch('/api/workouts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(workoutData)
            });

            if (!response.ok) {
                throw new Error('Failed to add workout.');
            }

            const savedWorkout = await response.json();

            // Replace optimistic workout with real one
            setWorkouts(prev => prev.map(w => w._id === tempId ? savedWorkout : w));

            return { success: true };
        } catch (error) {
            console.error("Error adding workout:", error);
            // ROLLBACK
            setWorkouts(previousWorkouts);
            return { success: false, error: error.message };
        }
    };
    const deleteWorkout = async (id) => {
        // --- OPTIMISTIC UPDATE ---
        const previousWorkouts = workouts;
        setWorkouts(prev => prev.filter(w => w._id !== id));

        try {
            const response = await fetch(`/api/workouts/${id}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });
            if (!response.ok) {
                throw new Error('Failed to delete workout.');
            }
            return { success: true };
        } catch (error) {
            console.error("Error deleting workout:", error);
            // ROLLBACK
            setWorkouts(previousWorkouts);
            return { success: false, error: error.message };
        }
    };
    const updateWorkout = async (workoutId, workoutData) => {
        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token,
                },
                body: JSON.stringify(workoutData),
            });
            if (!response.ok) throw new Error('Failed to update workout.');
            await fetchWorkouts(); // Refresh the list
            return { success: true };
        } catch (error) {
            console.error("Error updating workout:", error);
            return { success: false, error: error.message };
        }
    };

    const contextValue = {
        workouts,
        loading,
        addWorkout,
        deleteWorkout, // <-- Add to context
        updateWorkout, // <-- Add to context
    };

    return (
        <WorkoutContext.Provider value={contextValue}>
            {children}
        </WorkoutContext.Provider>
    );
};