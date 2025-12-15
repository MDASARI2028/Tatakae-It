// frontend/src/pages/GuidePage.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FaDumbbell, FaAppleAlt, FaBolt, FaChartLine, FaHistory,
    FaFire, FaTrophy, FaBed, FaArrowUp, FaArrowDown, FaHome,
    FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import './GuidePage.css';

const GuidePage = () => {
    const [expandedSection, setExpandedSection] = useState(null);

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const sections = [
        {
            id: 'fitness',
            icon: FaDumbbell,
            title: 'Dominate Your Workouts',
            tagline: 'Track. Improve. Repeat.',
            color: 'purple',
            content: [
                { title: 'Log Workout', desc: 'Record every set, rep, and weight. Build your legacy one lift at a time.' },
                { title: 'Templates', desc: 'Save your go-to routines. One tap to load your favorite workout.' },
                { title: 'History', desc: 'Review past sessions. See how far you\'ve come.' },
                { title: 'Body Metrics', desc: 'Track weight, measurements, and body composition changes.' }
            ]
        },
        {
            id: 'nutrition',
            icon: FaAppleAlt,
            title: 'Fuel Your Performance',
            tagline: 'Every calorie counts.',
            color: 'emerald',
            content: [
                { title: 'Log Meals', desc: 'Track breakfast, lunch, dinner, and snacks with full macro breakdown.' },
                { title: 'Food Search', desc: 'Integrated database with thousands of foods. No more guessing.' },
                { title: 'Recipes', desc: 'Save your daily staples. Log complex meals in one tap.' },
                { title: 'Hydration', desc: 'Track your water intake. Stay on top of the gallon game.' }
            ]
        },
        {
            id: 'levelup',
            icon: FaBolt,
            title: 'Level Up Mode',
            tagline: 'Turn fitness into a game.',
            color: 'amber',
            content: [
                { title: 'Earn XP', desc: 'Every workout earns experience points. Push harder, earn more.' },
                { title: 'Climb Ranks', desc: 'From E-Rank to Monarch. Prove you\'re built different.' },
                { title: 'Progressive Overload', desc: 'System tracks your volume. Green arrows = gains. Red arrows = time to step up.' },
                { title: 'Rest Days', desc: 'Log rest days to avoid penalties. Recovery is part of the grind.' }
            ]
        },
        {
            id: 'progress',
            icon: FaChartLine,
            title: 'Visualize Your Gains',
            tagline: 'Data-driven dominance.',
            color: 'cyan',
            content: [
                { title: 'Charts', desc: 'Interactive graphs showing your progress over time.' },
                { title: 'Trends', desc: 'Spot patterns. Identify what\'s working and what needs work.' },
                { title: 'PRs', desc: 'Personal records tracked automatically. Watch the numbers climb.' },
                { title: 'XP History', desc: 'Detailed log of every XP gain and loss. Full transparency.' }
            ]
        }
    ];

    const levelUpRanks = [
        { rank: 'E', name: 'The Awakening', xp: '0', color: '#6B7280' },
        { rank: 'D', name: 'The Challenger', xp: '8K', color: '#CD7F32' },
        { rank: 'C', name: 'The Warrior', xp: '20K', color: '#C0C0C0' },
        { rank: 'B', name: 'The Beast', xp: '40K', color: '#FFD700' },
        { rank: 'A', name: 'The Titan', xp: '60K', color: '#50C878' },
        { rank: 'S', name: 'The Legend', xp: '85K', color: '#0F52BA' },
        { rank: 'N', name: 'National Level', xp: '115K', color: '#E0115F' },
        { rank: 'M', name: 'Monarch', xp: '150K', color: '#8A2BE2' }
    ];

    return (
        <motion.div
            className="guide-page"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Header */}
            <div className="guide-header">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <h1 className="guide-title">
                        <span className="gradient-text">THE SYSTEM</span>
                    </h1>
                    <p className="guide-subtitle">Your guide to domination</p>
                </motion.div>

                <Link to="/" className="back-button">
                    <FaHome /> Back to Dashboard
                </Link>
            </div>

            {/* Hero Quote */}
            <motion.div
                className="hero-quote"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <span className="">"</span>
                <p>THE SYSTEM USES YOU — YOU USE THE SYSTEM</p>
                <span className="">"</span>
            </motion.div>

            {/* Quick Tips */}
            <motion.div
                className="quick-tips"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
            >
                <h2>⚡ Quick Navigation Tips</h2>
                <div className="tips-grid">
                    <div className="tip-item">
                        <div className="tip-icon">🏠</div>
                        <div className="tip-content">
                            <h4>Go to Dashboard</h4>
                            <p>Click the <strong>TATAKAI-IT</strong> logo at the top of any page</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-icon">👤</div>
                        <div className="tip-content">
                            <h4>Hunter Profile</h4>
                            <p>Click your profile in top-right → Access Status, Streak, Dashboard and Logout</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-icon">⬅️</div>
                        <div className="tip-content">
                            <h4>Go Back</h4>
                            <p>Use browser back button or look for back arrows within pages</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-icon">⚡</div>
                        <div className="tip-content">
                            <h4>Level Up Mode</h4>
                            <p>Toggle from Dashboard top-right dropdown → Track XP & Ranks</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-icon">🏋️</div>
                        <div className="tip-content">
                            <h4>Log Workouts</h4>
                            <p>Dashboard → Fitness section → Log Workout button</p>
                        </div>
                    </div>
                    <div className="tip-item">
                        <div className="tip-icon">🍎</div>
                        <div className="tip-content">
                            <h4>Log Nutrition</h4>
                            <p>Dashboard → Nutrition section → Enter to access all meal features</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Feature Sections */}
            <div className="guide-sections">
                {sections.map((section, index) => (
                    <motion.div
                        key={section.id}
                        className={`guide-section ${section.color}`}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * (index + 1) }}
                    >
                        <div
                            className="section-header"
                            onClick={() => toggleSection(section.id)}
                        >
                            <div className="section-icon">
                                <section.icon />
                            </div>
                            <div className="section-title">
                                <h2>{section.title}</h2>
                                <p>{section.tagline}</p>
                            </div>
                            <div className="section-toggle">
                                {expandedSection === section.id ? <FaChevronUp /> : <FaChevronDown />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedSection === section.id && (
                                <motion.div
                                    className="section-content"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="content-grid">
                                        {section.content.map((item, i) => (
                                            <motion.div
                                                key={i}
                                                className="content-item"
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: 0.05 * i }}
                                            >
                                                <h4>{item.title}</h4>
                                                <p>{item.desc}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                ))}
            </div>

            {/* Rank System */}
            <motion.div
                className="rank-system"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <h2>
                    <FaTrophy className="inline-icon" /> Rank Progression
                </h2>
                <p className="rank-subtitle">Your journey from hunter to monarch</p>

                <div className="rank-ladder">
                    {levelUpRanks.map((rank, index) => (
                        <motion.div
                            key={rank.rank}
                            className="rank-item"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.05 * index }}
                            style={{ '--rank-color': rank.color }}
                        >
                            <div className="rank-badge">{rank.rank}</div>
                            <div className="rank-info">
                                <span className="rank-name">{rank.name}</span>
                                <span className="rank-xp">{rank.xp} XP</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* XP Quick Reference */}
            <motion.div
                className="xp-reference"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <h2>
                    <FaBolt className="inline-icon" /> XP Mechanics
                </h2>

                <div className="xp-grid">
                    <div className="xp-card earn">
                        <FaArrowUp className="xp-icon" />
                        <h4>Earning XP</h4>
                        <ul>
                            <li>+25 XP — Log any workout</li>
                            <li>+15 XP — New exercise PR</li>
                            <li>+10 XP — Per 10% volume increase</li>
                            <li>+100 XP — 7-day streak</li>
                            <li>+300 XP — 14-day streak</li>
                            <li>+750 XP — 30-day streak</li>
                        </ul>
                    </div>

                    <div className="xp-card lose">
                        <FaArrowDown className="xp-icon" />
                        <h4>Losing XP</h4>
                        <ul>
                            <li>-50 XP — Missed day (no log)</li>
                            <li>-5 XP — Per 20% volume decrease</li>
                        </ul>
                    </div>

                    <div className="xp-card protect">
                        <FaBed className="xp-icon" />
                        <h4>Protect Your XP</h4>
                        <ul>
                            <li>Log rest days to avoid penalties</li>
                            <li>Keeps your streak intact</li>
                            <li>Recovery is part of the system</li>
                        </ul>
                    </div>
                </div>
            </motion.div>

            {/* Footer CTA */}
            <motion.div
                className="guide-footer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                <p>The only question left is:</p>
                <h3>Are you ready to level up?</h3>
                <Link to="/" className="start-button">
                    <FaFire /> Enter The System
                </Link>
            </motion.div>
        </motion.div>
    );
};

export default GuidePage;
