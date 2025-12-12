// frontend/src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFire, FaAppleAlt } from 'react-icons/fa';
import ConstellationParticles from './dashboard/ConstellationParticles';

const Dashboard = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            <ConstellationParticles />
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

                    top: '-50%',
                    left: '0%',

                    objectFit: 'cover',

                    objectPosition: 'center'
                }}
            />

            <div className="relative z-10 w-full h-screen flex flex-col items-center justify-center px-4" style={{ marginTop: '-4rem' }}>

                <div className="w-full mb-8">
                    <div className="max-w-6xl mx-auto dashboard-quote" style={{ transform: 'translateY(-20px)' }}>
                        {/* Line 1: "THE SYSTEM USES" - Left aligned */}
                        <div className="text-left mb-1">
                            <h1 className="quote-line line-1 text-3xl md:text-4xl lg:text-5xl font-black"
                                style={{
                                    textShadow: '0 0 8px rgba(168, 85, 247, 0.5), 0 0 16px rgba(168, 85, 247, 0.3)',
                                    filter: 'drop-shadow(0 0 6px rgb(168, 85, 247))',
                                    letterSpacing: '0.05em'
                                }}>
                                "THE SYSTEM USES
                            </h1>
                        </div>

                        {/* Line 2: "YOU" - Center aligned, White glow */}
                        <motion.div
                            className="text-center mb-1"
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
                            <h3 className="quote-line line-3 text-3xl md:text-4xl lg:text-5xl font-black"
                                style={{
                                    textShadow: '0 0 8px rgba(168, 85, 247, 0.5), 0 0 16px rgba(168, 85, 247, 0.3)',
                                    filter: 'drop-shadow(0 0 6px rgb(168, 85, 247))',
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
                            className="group relative h-full cursor-pointer dashboard-card"
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
                            className="group relative h-full cursor-pointer dashboard-card"
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
        </div>
    );
};

export default Dashboard;