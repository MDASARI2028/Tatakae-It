// frontend/src/context/WorkoutContext.js

import React, { createContext, useState, useEffect, useContext,useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const WorkoutContext = createContext();

export const WorkoutProvider = ({ children }) => {
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);


    const fetchWorkouts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/workouts', { headers: { 'x-auth-token': token } });
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
            // After successfully adding, refresh the list
            await fetchWorkouts();
            return { success: true };
        } catch (error) {
            console.error("Error adding workout:", error);
            return { success: false, error: error.message };
        }
    };
    const deleteWorkout = async (workoutId) => {
        if (!window.confirm("Are you sure you want to delete this workout?")) return;

        try {
            const response = await fetch(`/api/workouts/${workoutId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token },
            });
            if (!response.ok) throw new Error('Failed to delete workout.');
            await fetchWorkouts(); // Refresh the list
            return { success: true };
        } catch (error) {
            console.error("Error deleting workout:", error);
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