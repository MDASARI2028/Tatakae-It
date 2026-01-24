import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaHistory, FaDumbbell, FaAppleAlt, FaFire, FaExclamationTriangle } from 'react-icons/fa';
import BackButton from '../components/common/BackButton';
import api from '../api/axios';

const XPHistoryPage = () => {
    const { token } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const fetchHistory = async () => {
            const config = { headers: { 'x-auth-token': token } };
            try {
                // Add a timeout to prevent infinite loading
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timed out')), 10000)
                );

                const fetchPromise = api.get('/api/levelup/history', config);
                const res = await Promise.race([fetchPromise, timeoutPromise]);

                if (isMounted) {
                    if (Array.isArray(res.data)) {
                        setHistory(res.data);
                        setError(null);
                    } else {
                        console.error("XP History Error: Received non-array data", res.data);
                        setError('Invalid data received from server. Please check your connection.');
                        setHistory([]);
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching XP history", err);
                    setError(err.message === 'Request timed out' ? 'Loading took too long. Please try again.' : 'Failed to load history.');
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        if (token) {
            fetchHistory();
        } else {
            // If token is missing (but somehow we are here), wait or stop
            // Usually handled by auth context, but let's be safe
        }

        return () => { isMounted = false; };
    }, [token]);

    const getIcon = (category) => {
        switch (category) {
            case 'FITNESS': return <FaDumbbell className="text-secondary" />;
            case 'NUTRITION': return <FaAppleAlt className="text-green-400" />;
            case 'STREAK': return <FaFire className="text-orange-400" />;
            case 'PENALTY': return <FaExclamationTriangle className="text-red-500" />;
            default: return <FaHistory className="text-secondary" />;
        }
    };

    // error state already added in previous step's variable block? 
    // Wait, previous step REPLACED lines 10-11 where history/loading were defined.
    // So current file currently DOES NOT HAVE history/loading defined!
    // I must restore them.

    // ... (rest of the file logic uses them) ...
    // See lines 63 in view_file.

    // UI Update for error:
    // Insert error message before the content list.

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pt-24 font-inter relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8">
                    <BackButton />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <FaHistory className="text-3xl text-secondary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">XP History</h1>
                        <p className="text-slate-400">Track your gains and losses</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 flex items-center gap-3">
                        <FaExclamationTriangle />
                        <span>{error}</span>
                    </div>
                )}

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="p-12 text-center text-slate-400">
                            <p>No XP history found yet.</p>
                            <p className="text-sm mt-2">Start your journey to see logs here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-800">
                            {history.map((log) => (
                                <motion.div
                                    key={log._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 hover:bg-slate-800/50 transition-colors flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-lg bg-slate-800 border border-slate-700 group-hover:border-slate-600 transition-colors`}>
                                            {getIcon(log.category)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-200">{log.reason}</p>
                                            <p className="text-xs text-slate-500">{new Date(log.date).toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className={`text-lg font-bold font-mono ${log.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {log.amount > 0 ? '+' : ''}{log.amount} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default XPHistoryPage;
