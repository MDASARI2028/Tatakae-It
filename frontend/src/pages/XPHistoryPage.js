import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaHistory, FaDumbbell, FaAppleAlt, FaFire, FaExclamationTriangle } from 'react-icons/fa';
import BackButton from '../components/common/BackButton';
import axios from 'axios';

const XPHistoryPage = () => {
    const { token } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            const config = { headers: { 'x-auth-token': token } };
            try {
                const res = await axios.get('/api/levelup/history', config);
                setHistory(res.data);
            } catch (err) {
                console.error("Error fetching XP history", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchHistory();
    }, [token]);

    const getIcon = (category) => {
        switch (category) {
            case 'FITNESS': return <FaDumbbell className="text-blue-400" />;
            case 'NUTRITION': return <FaAppleAlt className="text-green-400" />;
            case 'STREAK': return <FaFire className="text-orange-400" />;
            case 'PENALTY': return <FaExclamationTriangle className="text-red-500" />;
            default: return <FaHistory className="text-purple-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pt-24 font-inter relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="mb-8">
                    <BackButton />
                </div>

                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                        <FaHistory className="text-3xl text-purple-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">XP History</h1>
                        <p className="text-slate-400">Track your gains and losses</p>
                    </div>
                </div>

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
