// frontend/src/context/TemplateContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const TemplateContext = createContext();

export const TemplateProvider = ({ children }) => {
    const [templates, setTemplates] = useState([]);
    const { token } = useContext(AuthContext);



    const fetchTemplates = useCallback(async () => {
        try {
            const response = await fetch('/api/templates', { headers: { 'x-auth-token': token } });
            if (response.ok) {
                const data = await response.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        }
    }, [token]);

    useEffect(() => {
        if (token) {
            fetchTemplates();
        }
    }, [token, fetchTemplates]);
    const saveAsTemplate = async (workout) => {
        const templateName = window.prompt("Enter a name for this template:", `${workout.type} Template`);
        if (!templateName) return { success: false, error: 'Template name is required' };

        const templateData = {
            templateName,
            workoutType: workout.type,
            notes: workout.notes,
            exercises: workout.exercises,
        };

        try {
            const response = await fetch('/api/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
                body: JSON.stringify(templateData),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Failed to save template.');
            }

            await fetchTemplates(); // Refresh the global list
            return { success: true };
        } catch (error) {
            console.error("Error saving template:", error);
            return { success: false, error: error.message };
        }
    };

    return (
        <TemplateContext.Provider value={{ templates, saveAsTemplate }}>
            {children}
        </TemplateContext.Provider>
    );
};