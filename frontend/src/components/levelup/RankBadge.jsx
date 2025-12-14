// frontend/src/components/levelup/RankBadge.jsx

import React from 'react';
import { motion } from 'framer-motion';
import './RankBadge.css';

const RankBadge = ({ rank, size = 'medium', showTitle = false, showName = true }) => {
    const rankData = {
        'E': { name: 'E Rank', title: 'The Awakening', color: '#9CA3AF', image: '/ranks/E-rank.png', glow: 'rgba(156, 163, 175, 0.5)' },
        'D': { name: 'D Rank', title: 'The Challenger', color: '#CD7F32', image: '/ranks/D-rank.png', glow: 'rgba(205, 127, 50, 0.4)' },
        'C': { name: 'C Rank', title: 'The Warrior', color: '#C0C0C0', image: '/ranks/C-rank.png', glow: 'rgba(192, 192, 192, 0.4)' },
        'B': { name: 'B Rank', title: 'The Beast', color: '#FFD700', image: '/ranks/B-rank.png', glow: 'rgba(255, 215, 0, 0.4)' },
        'A': { name: 'A Rank', title: 'The Titan', color: '#50C878', image: '/ranks/A-rank.png', glow: 'rgba(80, 200, 120, 0.4)' },
        'S': { name: 'S Rank', title: 'The Legend', color: '#0F52BA', image: '/ranks/S-rank.png', glow: 'rgba(15, 82, 186, 0.5)' },
        'National': { name: 'National Level', title: 'The Champion', color: '#E0115F', image: '/ranks/National-rank.png', glow: 'rgba(224, 17, 95, 0.5)' },
        'Monarch': { name: 'Monarch', title: 'The Apex', color: '#8A2BE2', image: '/ranks/Monarch-rank.jpg', glow: 'rgba(138, 43, 226, 0.6)' }
    };

    const info = rankData[rank] || rankData['E'];

    const sizeClasses = {
        small: 'rank-badge-small',
        medium: 'rank-badge-medium',
        large: 'rank-badge-large'
    };

    return (
        <motion.div
            className={`rank-badge ${sizeClasses[size]}`}
            style={{
                '--rank-color': info.color,
                '--rank-glow': info.glow
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
        >
            <div className="rank-badge-inner">
                {info.image ? (
                    <img src={info.image} alt={info.name} className="rank-image" />
                ) : (
                    <div className="rank-emoji">{info.emoji}</div>
                )}
                {showName && <div className="rank-name">{info.name}</div>}
                {showTitle && <div className="rank-title">{info.title}</div>}
            </div>
            {rank === 'Monarch' && (
                <div className="monarch-particles">
                    {[...Array(8)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="particle"
                            animate={{
                                y: [0, -20, 0],
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.2, 0.8]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.2
                            }}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default RankBadge;
