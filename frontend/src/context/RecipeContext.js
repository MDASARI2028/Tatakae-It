// frontend/src/context/RecipeContext.js

import React, { createContext, useReducer, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// 1. Initial State
const initialState = {
    recipes: [],
    loading: false,
    error: null,
};

// 2. Reducer
const recipeReducer = (state, action) => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: true, error: null };
        case 'RECIPE_ERROR':
            return { ...state, loading: false, error: action.payload };
        case 'GET_RECIPES_SUCCESS':
            return { ...state, loading: false, recipes: action.payload };
        case 'ADD_RECIPE_SUCCESS':
            return {
                ...state,
                loading: false,
                recipes: [...state.recipes, action.payload].sort((a, b) => a.name.localeCompare(b.name)),
            };
        case 'DELETE_RECIPE_SUCCESS':
            return {
                ...state,
                loading: false,
                recipes: state.recipes.filter(recipe => recipe._id !== action.payload),
            };
        default:
            return state;
    }
};

// 3. Create Context
export const RecipeContext = createContext();

// 4. Provider Component
export const RecipeProvider = ({ children }) => {
    const [state, dispatch] = useReducer(recipeReducer, initialState);
    const { token } = useContext(AuthContext);

    const getRecipes = useCallback(async () => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.get('/api/recipes', config);
            dispatch({ type: 'GET_RECIPES_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'RECIPE_ERROR', payload: err.response?.data?.msg || 'Failed to fetch recipes.' });
        }
    }, [token]);

    const addRecipe = async (recipeData) => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            const res = await axios.post('/api/recipes', recipeData, config);
            dispatch({ type: 'ADD_RECIPE_SUCCESS', payload: res.data });
        } catch (err) {
            dispatch({ type: 'RECIPE_ERROR', payload: err.response?.data?.msg || 'Failed to save recipe.' });
        }
    };

    const deleteRecipe = async (recipeId) => {
        if (!token) return;
        try {
            dispatch({ type: 'SET_LOADING' });
            const config = { headers: { 'x-auth-token': token } };
            await axios.delete(`/api/recipes/${recipeId}`, config);
            dispatch({ type: 'DELETE_RECIPE_SUCCESS', payload: recipeId });
        } catch (err) {
            dispatch({ type: 'RECIPE_ERROR', payload: err.response?.data?.msg || 'Failed to delete recipe.' });
        }
    };

    return (
        <RecipeContext.Provider
            value={{
                ...state,
                getRecipes,
                addRecipe,
                deleteRecipe,
            }}
        >
            {children}
        </RecipeContext.Provider>
    );
};