
// frontend/src/context/TemplateContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useContext(AuthContext);


    const fetchTemplates = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/api/templates');
            if (Array.isArray(response.data)) {
                setTemplates(response.data);
            } else {
                console.error("Templates Error: Received non-array data", response.data);
                setTemplates([]);
                setError('Received invalid data from server');
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
            setError('Failed to load templates');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchTemplates();
        }
    }, [token, fetchTemplates]);

    // Expose a refresh function
    const refreshTemplates = fetchTemplates;

    const saveAsTemplate = async (workout) => {
        const defaultName = (workout.type || 'Workout') + ' Template';
        const templateName = window.prompt("Enter a name for this template:", defaultName);
        if (!templateName) return { success: false, error: 'Template name is required' };

        const templateData = {
            templateName,
            workoutType: workout.type,
            notes: workout.notes,
            exercises: workout.exercises,
        };

        try {
            await api.post('/api/templates', templateData);
            await fetchTemplates(); // Refresh the global list
            return { success: true };
        } catch (error) {
            console.error("Error saving template:", error);
            return { success: false, error: error.response?.data?.msg || error.message };
        }
    };

    return (
        <TemplateContext.Provider value={{ templates, loading, error, refreshTemplates, saveAsTemplate }}>
            {children}
        </TemplateContext.Provider>
    );
};