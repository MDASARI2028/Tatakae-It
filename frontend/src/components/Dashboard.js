// frontend/src/components/Dashboard.js
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFire, FaAppleAlt, FaBolt, FaChevronDown, FaHistory, FaBed, FaRedo, FaQuestionCircle } from 'react-icons/fa';
import ConstellationParticles from './dashboard/ConstellationParticles';
import { useLevelUp } from '../context/LevelUpContext';
import RankBadge from './levelup/RankBadge';
import './Dashboard.css';

const Dashboard = () => {
    const { isEnabled, toggleLevelUpMode, levelUpData, loading, calculateDailyXP, resetXP, logRestDay } = useLevelUp();
    const [toggling, setToggling] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = async () => {
        setToggling(true);
        // Simulate a small delay for the animation
        setTimeout(async () => {
            await toggleLevelUpMode();
            setToggling(false);
        }, 800);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // XP is now calculated only once per session via LevelUpContext's hasCalculatedToday flag
    // The useEffect below runs once when the component mounts with Level Up enabled
    useEffect(() => {
        if (isEnabled && calculateDailyXP) {
            calculateDailyXP().catch(err => {
                console.error('[Dashboard] Failed to calculate daily XP:', err);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEnabled]); // Only depend on isEnabled, not calculateDailyXP to prevent re-running

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <ConstellationParticles />

            {/* Level Up Mode Dropdown - Top Right */}
            <div
                ref={dropdownRef}
                style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    zIndex: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                }}
            >
                {/* 1. Main Button - Toggles Dropdown */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 shadow-lg group ${isEnabled
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 hover:shadow-purple-500/50'
                        : 'bg-slate-800/80 hover:bg-slate-800 border border-slate-700'
                        }`}
                >
                    <div className="relative">
                        {isEnabled && (
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
                        )}
                        <FaBolt className={`relative text-lg ${isEnabled ? 'text-yellow-300' : 'text-slate-400'}`} />
                    </div>

                    <span className={`text-sm font-semibold ${isEnabled ? 'text-white' : 'text-slate-300'}`}>
                        Level Up Mode
                    </span>

                    <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                        <FaChevronDown className={`text-xs ${isEnabled ? 'text-white' : 'text-slate-400'}`} />
                    </motion.div>
                </motion.button>

                {/* 2. Dropdown Menu */}
                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute top-14 right-0 w-64 bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-xl shadow-2xl shadow-purple-900/50 overflow-hidden flex flex-col gap-1"
                        >
                            {/* Header / Toggle Row */}
                            <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/20 to-indigo-900/20 flex justify-between items-center">
                                <span className="text-sm font-bold text-white">System Status</span>

                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleToggle}
                                    disabled={toggling}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isEnabled ? 'bg-green-500' : 'bg-slate-600'}`}
                                >
                                    <span className="sr-only">Toggle Level Up Mode</span>
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                </motion.button>
                            </div>

                            {/* Stats Section (Only if Enabled) */}
                            {isEnabled && levelUpData ? (
                                <div className="p-4 px-3 flex flex-col gap-4">
                                    {/* Rank Display */}
                                    {/* Rank Display - Vertical Stack */}
                                    <div className="flex flex-col items-center gap-2 px-0">
                                        <span className="text-lg text-slate-400 uppercase tracking-widest font-bold">Current Level</span>

                                        <div className="transform scale-125 my-1">
                                            <RankBadge
                                                rank={levelUpData.rank}
                                                size="large"
                                                showName={false}
                                            />
                                        </div>

                                        <div className="text-center">
                                            <div className="text-lg font-black text-white uppercase tracking-wider glow-text" style={{
                                                color: levelUpData.rank === 'E' ? '#9CA3AF' : 'var(--rank-color)',
                                                textShadow: '0 0 10px rgba(138, 43, 226, 0.5)'
                                            }}>
                                                {levelUpData.rank} Rank
                                            </div>
                                            <div className="text-[10px] text-purple-300/70 italic">
                                                {levelUpData.rank === 'E' && 'The Awakening'}
                                                {/* Add other titles dynamically later if needed */}
                                            </div>
                                        </div>
                                    </div>

                                    {/* XP Display */}
                                    <div className="bg-slate-800/50 rounded-lg p-3 border border-purple-500/10">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-xs text-purple-300 font-bold">Experience</span>
                                            <span className="text-lg font-black text-white font-orbitron leading-none">
                                                {levelUpData.xp.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">XP</span>
                                            </span>
                                        </div>
                                        {/* Progress Bar Placeholder */}
                                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(levelUpData.xp % 1000) / 10}%` }} // Simplified fake progress for now
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons Container */}
                                    <motion.div
                                        className="flex flex-col gap-2 mt-3 pt-3 border-t border-white/10"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {/* XP History Link */}
                                        <motion.div
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)' }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            <Link
                                                to="/xp-history"
                                                className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-medium text-purple-300 bg-gradient-to-r from-purple-500/10 to-purple-600/10 hover:from-purple-500/20 hover:to-purple-600/20 rounded-lg transition-all duration-200 border border-purple-500/20 hover:border-purple-400/50"
                                            >
                                                <FaHistory className="text-sm" />
                                                <span>XP History</span>
                                            </Link>
                                        </motion.div>

                                        {/* Log Rest Day Button */}
                                        <motion.button
                                            onClick={async () => {
                                                const result = await logRestDay();
                                                if (result?.success) {
                                                    alert(result.message);
                                                }
                                            }}
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)' }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-medium text-cyan-400 bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 hover:from-cyan-500/20 hover:to-cyan-600/20 rounded-lg transition-all duration-200 border border-cyan-500/20 hover:border-cyan-400/50"
                                        >
                                            <FaBed className="text-sm" />
                                            <span>Log Rest Day</span>
                                        </motion.button>

                                        {/* Reset XP Button */}
                                        <motion.button
                                            onClick={async () => {
                                                if (window.confirm('Reset all XP and history? This cannot be undone.')) {
                                                    await resetXP();
                                                }
                                            }}
                                            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' }}
                                            whileTap={{ scale: 0.98 }}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.25 }}
                                            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 text-xs font-medium text-slate-400 bg-gradient-to-r from-slate-500/10 to-slate-600/10 hover:from-red-500/15 hover:to-red-600/15 hover:text-red-400 rounded-lg transition-all duration-200 border border-slate-500/20 hover:border-red-500/40"
                                        >
                                            <FaRedo className="text-sm" />
                                            <span>Reset Progress</span>
                                        </motion.button>
                                    </motion.div>
                                </div>
                            ) : (
                                <div className="p-6 text-center">
                                    <p className="text-xs text-slate-400">Enable Level Up Mode to track your hunter rank and progression.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <img
                src="/ghostly-watcher.jpg"
                alt=""
                className="absolute pointer-events-none"
                style={{
                    zIndex: 1,
                    opacity: 0.15,

                    mixBlendMode: 'screen',

                    width: '150%',
                    height: '180%',

                    top: '-45%',
                    left: '0%',

                    objectFit: 'cover',

                    objectPosition: 'center'
                }}
            />

            <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4" style={{ marginTop: '-1rem' }}>

                <div className="w-full mb-8">
                    <div className="max-w-4xl ml-auto mr-10 dashboard-quote" style={{ transform: 'translateY(0px)' }}>
                        {/* Line 1: "THE SYSTEM USES" - Left aligned */}
                        <div className="text-left mb-1">
                            <h1 className="quote-line line-1 text-3xl md:text-4xl lg:text-5xl font-black text-white"
                                style={{
                                    textShadow: '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.4)',
                                    filter: 'drop-shadow(0 0 8px rgb(168, 85, 247))',
                                    letterSpacing: '0.05em'
                                }}>
                                "THE SYSTEM USES
                            </h1>
                        </div>

                        {/* Line 2: "YOU" - Centered but nudged more right, White glow */}
                        <motion.div
                            className="text-center pl-48 mb-1"
                            animate={{
                                textShadow: ['0 0 12px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4)',
                                    '0 0 16px rgba(255, 255, 255, 0.7), 0 0 24px rgba(255, 255, 255, 0.5)',
                                    '0 0 12px rgba(255, 255, 255, 0.6), 0 0 20px rgba(255, 255, 255, 0.4)']
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white"
                                style={{
                                    filter: 'drop-shadow(0 0 8px rgb(255, 255, 255))',
                                    letterSpacing: '0.05em'
                                }}>
                                YOU
                            </h2>
                        </motion.div>

                        {/* Line 3: "USE THE SYSTEM" - Right aligned */}
                        <div className="text-right">
                            <h3 className="quote-line line-3 text-3xl md:text-4xl lg:text-5xl font-black text-white"
                                style={{
                                    textShadow: '0 0 10px rgba(168, 85, 247, 0.8), 0 0 20px rgba(168, 85, 247, 0.4)',
                                    filter: 'drop-shadow(0 0 8px rgb(168, 85, 247))',
                                    letterSpacing: '0.05em'
                                }}>
                                USE THE SYSTEM"
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Gateway Cards - Optimized for viewport */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl w-full">
                    {/* Fitness Card */}
                    <Link to="/fitness">
                        <motion.div
                            className="group relative h-full cursor-pointer dashboard-card overflow-hidden"
                            style={{ minHeight: '280px' }}
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg opacity-0 group-hover:opacity-12 blur-lg transition-opacity duration-500"></div>

                            <div className="relative h-full p-5 rounded-lg bg-slate-900/35 backdrop-blur border border-purple-500/25 group-hover:border-purple-500/60 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                <div className="relative z-10 h-full flex flex-col">
                                    <motion.div
                                        className="text-5xl text-purple-400 mb-3"
                                        whileHover={{ scale: 1.15, rotate: 15 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <FaFire />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                        Fitness System
                                    </h3>
                                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors flex-grow mb-2 text-sm">
                                        Track workouts, view history, and monitor progress.
                                    </p>
                                    <motion.div
                                        className="flex items-center gap-2 text-purple-400 font-semibold text-sm"
                                        whileHover={{ gap: "8px" }}
                                    >
                                        <span>Enter</span>
                                        <motion.span whileHover={{ x: 3 }}>→</motion.span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    <Link to="/nutrition">
                        <motion.div
                            className="group relative h-full cursor-pointer dashboard-card overflow-hidden"
                            style={{ minHeight: '240px' }}
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg opacity-0 group-hover:opacity-12 blur-lg transition-opacity duration-500"></div>

                            {/* Card */}
                            <div className="relative h-full p-5 rounded-lg bg-slate-900/35 backdrop-blur border border-cyan-500/25 group-hover:border-cyan-500/60 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                {/* Content */}
                                <div className="relative z-10 h-full flex flex-col">
                                    <motion.div
                                        className="text-5xl text-cyan-400 mb-3"
                                        whileHover={{ scale: 1.15, rotate: -15 }}
                                        transition={{ type: "spring" }}
                                    >
                                        <FaAppleAlt />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                                        Nutrition System
                                    </h3>
                                    <p className="text-slate-400 group-hover:text-slate-300 transition-colors flex-grow mb-2 text-sm">
                                        Log meals and track your daily energy consumption.
                                    </p>
                                    <motion.div
                                        className="flex items-center gap-2 text-cyan-400 font-semibold text-sm"
                                        whileHover={{ gap: "8px" }}
                                    >
                                        <span>Enter</span>
                                        <motion.span whileHover={{ x: 3 }}>→</motion.span>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Floating Guide Button - Bottom Right */}
            <Link to="/guide">
                <motion.div
                    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600/90 to-indigo-600/90 backdrop-blur-md rounded-full border border-white/20 shadow-lg cursor-pointer group"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(138, 43, 226, 0.5)' }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <FaQuestionCircle className="text-lg text-white" />
                    <span className="text-sm font-bold text-white tracking-wide">THE SYSTEM</span>
                </motion.div>
            </Link>
        </div>
    );
};

export default Dashboard;