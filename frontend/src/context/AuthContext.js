import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
        const storedToken = localStorage.getItem('token');
        console.log('[AUTH CONTEXT] Stored token on load:', storedToken ? `${storedToken.substring(0, 20)}...` : 'NO TOKEN');
        if (storedToken) {
            // First, decode the token to check if it's expired
            const decoded = jwtDecode(storedToken);
            const isExpired = decoded.exp * 1000 < Date.now();
            console.log('[AUTH CONTEXT] Token expired:', isExpired);

            if (isExpired) {
                // If expired, clear everything without an API call
                localStorage.removeItem('token');
                setUser(null);
                setIsAuthenticated(false);
                setToken(null);
            } else {
                // If not expired, fetch the latest user data
                try {
                    const config = { headers: { 'x-auth-token': storedToken } };
                    const res = await api.get('/api/users/me', config);
                    setUser(res.data);
                    setIsAuthenticated(true);
                    setToken(storedToken);
                    console.log('[AUTH CONTEXT] User loaded successfully');
                } catch (error) {
                    console.error('[AUTH CONTEXT] Failed to load user:', error.response?.status, error.message);
                    localStorage.removeItem('token'); // Clean up on error
                }
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const login = useCallback(async (email, password) => {
        try {
            const res = await api.post('/api/users/login', { email, password });
            console.log('[AUTH CONTEXT] Login successful, token received:', res.data.token ? `${res.data.token.substring(0, 20)}...` : 'NO TOKEN');
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
            setToken(res.data.token);
            return { success: true };
        } catch (error) {
            console.error('[AUTH CONTEXT] Login failed:', error.response?.status, error.message);
            return { success: false, error: error.response?.data?.msg || error.message };
        }
    }, []);

    const register = useCallback(async (username, email, password) => {
        try {
            const res = await api.post('/api/users/register', { username, email, password });
            return { success: true, msg: res.data.msg };
        } catch (error) {
            return { success: false, error: error.response?.data?.msg || 'Registration failed.' };
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
        setToken(null);
    }, []);

    const updateGoals = useCallback(async (goals) => {
        if (!token) return { success: false, error: 'Not authenticated' };
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.put('/api/users/goals', goals, config);
            setUser(prevUser => ({ ...prevUser, nutritionGoals: res.data.nutritionGoals }));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.msg || 'Failed to update goals.' };
        }
    }, [token]);

    const resetStreak = useCallback(async () => {
        if (!token) return { success: false, error: 'Not authenticated' };
        try {
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.put('/api/users/reset-streak', {}, config);
            setUser(res.data);
            return { success: true };
        } catch (error) {
            return { success: false, error: 'Failed to reset streak.' };
        }
    }, [token]);

    const contextValue = useMemo(() => ({
        token, user, isAuthenticated, loading, login, register, logout, updateGoals, resetStreak
    }), [token, user, isAuthenticated, loading, login, register, logout, updateGoals, resetStreak]);

    return (<AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>);
};