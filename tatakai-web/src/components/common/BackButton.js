// frontend/src/components/common/BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';
import './BackButton.css';

const BackButton = ({ label = 'Back', className = '' }) => {
    const navigate = useNavigate();

    return (
        <motion.button
            className={`back-button-nav ${className}`}
            onClick={() => navigate(-1)}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.95 }}
        >
            <FaArrowLeft />
            <span>{label}</span>
        </motion.button>
    );
};

export default BackButton;
