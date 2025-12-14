// frontend/src/context/LevelUpContext.js

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import api from '../api/axios';

const LevelUpContext = createContext();

export const useLevelUp = () => {
    const context = useContext(LevelUpContext);
    if (!context) {
        throw new Error('useLevelUp must be used within LevelUpProvider');
    }
    return context;
};

export const LevelUpProvider = ({ children }) => {
    const { token, user, loadUser } = useContext(AuthContext);
    const [levelUpData, setLevelUpData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentXpGain, setRecentXpGain] = useState(null);

    // Fetch Level Up stats
    const fetchLevelUpStats = useCallback(async () => {
        if (!token || !user?.levelUpMode?.enabled) return;

        try {
            setLoading(true);
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.get('/api/levelup/stats', config);
            setLevelUpData(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch Level Up stats:', err);
            setLoading(false);
        }
    }, [token, user]);

    // Toggle Level Up Mode
    const toggleLevelUpMode = async () => {
        console.log('[LevelUpContext] toggleLevelUpMode called');
        console.log('[LevelUpContext] token:', token ? 'exists' : 'missing');

        if (!token) {
            console.log('[LevelUpContext] No token, returning');
            return;
        }

        try {
            setLoading(true);
            const config = { headers: { 'x-auth-token': token } };
            console.log('[LevelUpContext] Making API call to /api/levelup/toggle');
            const res = await api.post('/api/levelup/toggle', {}, config);
            console.log('[LevelUpContext] API response:', res.data);

            if (res.data.success) {
                console.log('[LevelUpContext] Toggle successful, refreshing user data');
                // Refresh user data from backend to get updated levelUpMode status
                await loadUser();

                // If enabled, fetch stats
                if (res.data.levelUpMode.enabled) {
                    console.log('[LevelUpContext] Mode enabled, fetching stats');
                    await fetchLevelUpStats();
                } else {
                    console.log('[LevelUpContext] Mode disabled');
                }
            }

            setLoading(false);
            return res.data;
        } catch (err) {
            console.error('[LevelUpContext] Failed to toggle Level Up Mode:', err);
            console.error('[LevelUpContext] Error details:', err.response?.data);
            setLoading(false);
            throw err;
        }
    };

    // Calculate and award daily XP
    const calculateDailyXP = async () => {
        if (!token || !user?.levelUpMode?.enabled) return;

        try {
            setLoading(true);
            const config = { headers: { 'x-auth-token': token } };
            const res = await api.post('/api/levelup/calculate-daily', {}, config);

            if (res.data.success) {
                // Show XP gain notification
                setRecentXpGain(res.data);

                // Refresh stats
                await fetchLevelUpStats();

                // Clear notification after 5 seconds
                setTimeout(() => setRecentXpGain(null), 5000);
            }

            setLoading(false);
            return res.data;
        } catch (err) {
            console.error('Failed to calculate daily XP:', err);
            setLoading(false);
            throw err;
        }
    };

    // Get rank info
    const getRankInfo = (rank) => {
        const rankData = {
            'E': { name: 'E Rank', title: 'The Awakening', color: '#6B7280', emoji: '⚪' },
            'D': { name: 'D Rank', title: 'The Challenger', color: '#CD7F32', emoji: '🟤' },
            'C': { name: 'C Rank', title: 'The Warrior', color: '#C0C0C0', emoji: '⚪' },
            'B': { name: 'B Rank', title: 'The Beast', color: '#FFD700', emoji: '🟡' },
            'A': { name: 'A Rank', title: 'The Titan', color: '#50C878', emoji: '🟢' },
            'S': { name: 'S Rank', title: 'The Legend', color: '#0F52BA', emoji: '🔵' },
            'National': { name: 'National Level', title: 'The Champion', color: '#E0115F', emoji: '🔴' },
            'Monarch': { name: 'Monarch', title: 'The Apex', color: '#8A2BE2', emoji: '👑' }
        };

        return rankData[rank] || rankData['E'];
    };

    // Fetch stats when component mounts or user changes
    useEffect(() => {
        if (user?.levelUpMode?.enabled) {
            fetchLevelUpStats();
        }
    }, [user, fetchLevelUpStats]);

    const value = {
        levelUpData,
        loading,
        recentXpGain,
        toggleLevelUpMode,
        calculateDailyXP,
        fetchLevelUpStats,
        getRankInfo,
        isEnabled: user?.levelUpMode?.enabled || false
    };

    return (
        <LevelUpContext.Provider value={value}>
            {children}
        </LevelUpContext.Provider>
    );
};
