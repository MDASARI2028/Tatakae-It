// frontend/src/components/HunterProfile.js
import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaChevronDown, FaHome } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const HunterProfile = () => {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleDashboardClick = () => {
        navigate('/dashboard');
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary hover:from-primary hover:to-secondary transition-all duration-300 shadow-lg hover:shadow-primary/50 group"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                    <FaUserCircle className="relative text-2xl text-white" />
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-semibold text-white">
                        {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1) || 'Hunter'}
                    </span>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <FaChevronDown className="text-white text-sm" />
                </motion.div>
            </motion.button>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 mt-2 w-56 max-w-[90vw] rounded-xl bg-slate-900/95 backdrop-blur border border-primary/30 shadow-2xl shadow-primary/50 overflow-hidden z-50"
                    >
                        {/* Profile Info */}
                        <div className="p-4 border-b border-primary/20 bg-gradient-to-r from-primary/30 to-secondary/30">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full blur opacity-50"></div>
                                    <FaUserCircle className="relative text-3xl text-secondary" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">
                                        {user?.username?.charAt(0).toUpperCase() + user?.username?.slice(1) || 'Hunter'}
                                    </p>
                                    <p className="text-xs text-secondary">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="p-4 border-b border-primary/20">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-primary/10 rounded-lg p-2 text-center">
                                    <p className="text-xs text-secondary">Status</p>
                                    <p className="text-sm font-bold text-secondary">Active</p>
                                </div>
                                <div className="bg-indigo-500/10 rounded-lg p-2 text-center">
                                    <p className="text-xs text-indigo-300">Streak</p>
                                    <p className="text-sm font-bold text-indigo-400">{user?.streak || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Link */}
                        <motion.button
                            whileHover={{ backgroundColor: 'rgba(147, 51, 234, 0.3)' }}
                            onClick={handleDashboardClick}
                            className="w-full px-4 py-3 bg-primary/50 hover:bg-primary/70 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 border-b border-primary/20"
                        >
                            <FaHome className="text-lg" /> Dashboard
                        </motion.button>

                        {/* Logout Button */}
                        <motion.button
                            whileHover={{ backgroundColor: '#dc2626' }}
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-3 bg-red-600/80 hover:bg-red-600 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300"
                        >
                            <FaSignOutAlt /> Logout
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default HunterProfile;