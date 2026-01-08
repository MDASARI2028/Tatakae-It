// frontend/src/context/NutritionContext.js

import React, { createContext, useReducer, useContext, useCallback } from 'react';
import api from '../api/axios';
import { AuthContext } from './AuthContext';

// 1. Initial State (No changes here)
const initialState = {
    nutritionLogs: [],
    selectedDate: new Date(),
    loading: false,
    error: null,
    hydrationLogs: [],
    hydrationGoal: 3000,
    progressData: null,
    nutritionGoals: {
        calories: 2200,
        protein: 150,
        fat: 70,
        carbs: 250
    }
};

// Helper to get local date string (YYYY-MM-DD) without UTC conversion
const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 2. The Reducer Function (No changes here)
const nutritionReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: true, error: null };
        case 'SET_DATE':
            return { ...state, selectedDate: action.payload };
        case 'GET_MEALS_SUCCESS':
            return { ...state, loading: false, nutritionLogs: action.payload };
        case 'ADD_MEAL_SUCCESS':
            return {
                ...state,
                loading: false,
                nutritionLogs: [...state.nutritionLogs, action.payload]
            };
        case 'DELETE_MEAL_SUCCESS':
            return {
                ...state,
                loading: false,
                nutritionLogs: state.nutritionLogs.filter(log => log._id !== action.payload)
            };
        case 'NUTRITION_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'GET_HYDRATION_SUCCESS':
            return { ...state, hydrationLogs: action.payload, loading: false };
        case 'ADD_HYDRATION_SUCCESS':
            return {
                ...state,
                hydrationLogs: [...state.hydrationLogs, action.payload],
                loading: false,
            };
        case 'SET_HYDRATION_GOAL':
            return { ...state, hydrationGoal: action.payload };
        case 'DELETE_HYDRATION_SUCCESS':
            return {
                ...state,
                hydrationLogs: state.hydrationLogs.filter(log => log._id !== action.payload),
                loading: false,
            };
        case 'UPDATE_MEAL_SUCCESS':
            return {
                ...state,
                loading: false,
                nutritionLogs: state.nutritionLogs.map(log =>
                    log._id === action.payload._id ? action.payload : log
                ),
            };
        case 'GET_PROGRESS_SUCCESS':
            return { ...state, progressData: action.payload, loading: false };
        case 'SET_NUTRITION_GOALS':
            return { ...state, nutritionGoals: action.payload };
        default:
            return state;
    }
};

// 3. Create the Context (No changes here)
export const NutritionContext = createContext();

// 4. Create the Provider Component (This is where the fix is)
export const NutritionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(nutritionReducer, initialState);
    const { token } = useContext(AuthContext);

    // --- ACTIONS ---

    const setDate = (date) => {
        dispatch({ type: 'SET_DATE', payload: date });
    };

    const getMealsForDate = useCallback(async (date) => {
        // ✅ FIX #1: Check for the token before doing anything.
        if (!token) {
            return;
        }

        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const formattedDate = getLocalDateString(date);
            const res = await api.get(`/api/nutrition/date/${formattedDate}`, config);
            dispatch({ type: 'GET_MEALS_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to fetch meals.' });
        }
    }, [token]);

    const getProgressData = useCallback(async (period = 30) => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.get(`/api/nutrition/progress?period=${period}`, config);
            dispatch({ type: 'GET_PROGRESS_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to fetch progress data.' });
        }
    }, [token]);

    const addMeal = async (mealData) => {
        if (!token) {
            dispatch({ type: 'NUTRITION_ERROR', payload: 'You must be logged in to add a meal.' });
            return;
        }

        // --- OPTIMISTIC UPDATE ---
        const tempId = Date.now().toString();
        const optimisticMeal = { ...mealData, _id: tempId, items: mealData.items || [] };
        const previousLogs = state.nutritionLogs;

        dispatch({ type: 'GET_MEALS_SUCCESS', payload: [...state.nutritionLogs, optimisticMeal] });

        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.post('/api/nutrition', mealData, config);

            // Replace optimistic meal with real one
            dispatch({
                type: 'GET_MEALS_SUCCESS',
                payload: previousLogs.concat(res.data)
            });
        } catch (err) {
            console.error("Error adding meal:", err);
            dispatch({ type: 'GET_MEALS_SUCCESS', payload: previousLogs });
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to add meal.' });
        }
    };

    const deleteMeal = async (mealId) => {
        if (!token) {
            dispatch({ type: 'NUTRITION_ERROR', payload: 'You must be logged in to delete a meal.' });
            return;
        }

        // --- OPTIMISTIC UPDATE ---
        const previousLogs = state.nutritionLogs;
        dispatch({
            type: 'GET_MEALS_SUCCESS',
            payload: state.nutritionLogs.filter(log => log._id !== mealId)
        });

        try {
            const config = { headers: { 'x-auth-token': token } };
            await api.delete(`/api/nutrition/${mealId}`, config);
            // No need to do anything else, already removed optimistically
        } catch (err) {
            console.error("Error deleting meal:", err);
            dispatch({ type: 'GET_MEALS_SUCCESS', payload: previousLogs });
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to delete meal.' });
        }
    };
    const getHydrationForDate = useCallback(async (date) => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const formattedDate = getLocalDateString(date);
            const res = await api.get(`/api/hydration/date/${formattedDate}`, config);
            dispatch({ type: 'GET_HYDRATION_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to fetch hydration data.' });
        }
    }, [token]);

    const addHydration = async (logData) => {
        if (!token) return;

        // --- OPTIMISTIC UPDATE ---
        const tempId = Date.now().toString();
        const optimisticHydration = { ...logData, _id: tempId };
        const previousHydration = state.hydrationLogs;

        dispatch({
            type: 'GET_HYDRATION_SUCCESS',
            payload: [...state.hydrationLogs, optimisticHydration]
        });

        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.post('/api/hydration', logData, config);
            // Replace with real data
            dispatch({
                type: 'GET_HYDRATION_SUCCESS',
                payload: previousHydration.concat(res.data)
            });
        } catch (err) {
            console.error("Error adding hydration:", err);
            dispatch({ type: 'GET_HYDRATION_SUCCESS', payload: previousHydration });
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to add hydration log.' });
        }
    };

    const setHydrationGoal = (goal) => {
        dispatch({ type: 'SET_HYDRATION_GOAL', payload: goal });
    };
    const deleteHydration = async (logId) => {
        if (!token) return;

        // --- OPTIMISTIC UPDATE ---
        const previousHydration = state.hydrationLogs;
        dispatch({
            type: 'GET_HYDRATION_SUCCESS',
            payload: state.hydrationLogs.filter(log => log._id !== logId)
        });

        try {
            const config = { headers: { 'x-auth-token': token } };
            await api.delete(`/api/hydration/${logId}`, config);
        } catch (err) {
            console.error("Error deleting hydration:", err);
            dispatch({ type: 'GET_HYDRATION_SUCCESS', payload: previousHydration });
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to delete log.' });
        }
    };
    const updateMeal = async (logId, mealData) => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.put(`/api/nutrition/${logId}`, mealData, config);
            dispatch({ type: 'UPDATE_MEAL_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'NUTRITION_ERROR', payload: err.response?.data?.msg || 'Failed to update meal.' });
        }
    };

    const setNutritionGoals = (goals) => {
        dispatch({ type: 'SET_NUTRITION_GOALS', payload: goals });
    };

    return (
        <NutritionContext.Provider
            value={{
                ...state,
                setDate,
                getMealsForDate,
                addMeal,
                deleteMeal,
                getProgressData,
                getHydrationForDate,
                addHydration,
                setHydrationGoal,
                deleteHydration,
                updateMeal,
                setNutritionGoals
            }}
        >
            {children}
        </NutritionContext.Provider>
    );
};

// 5. Custom Hook (No changes here)
export const useNutrition = () => {
    return useContext(NutritionContext);
};