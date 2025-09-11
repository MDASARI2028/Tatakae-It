// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkToken = useCallback(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                const decoded = jwtDecode(storedToken);
                const isExpired = decoded.exp * 1000 < Date.now();
                if (!isExpired) {
                    setToken(storedToken);
                    setUser({ id: decoded.id, username: decoded.username });
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('token');
                }
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        checkToken();
    }, [checkToken]);

    const login = async (email, password) => {
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Login failed.');
            }
            localStorage.setItem('token', data.token);
            checkToken(); // Re-check token to update state
            return { success: true };
        } catch (error) {
            console.error("Login Error:", error.message);
            // --- THIS IS THE FIX ---
            // Ensure we always return an object, even on error
            return { success: false, error: error.message };
        }
    };

    const register = async (username, email, password, password2) => {
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Add password2 to the request body
                body: JSON.stringify({ username, email, password, password2 }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.msg || 'Registration failed.');
            }
            return { success: true };
        } catch (error) {
            console.error("Registration Error:", error.message);
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    const contextValue = { token, user, isAuthenticated, loading, login, register, logout };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};