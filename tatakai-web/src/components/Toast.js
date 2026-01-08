// frontend/src/components/Toast.js
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: <FaCheckCircle />,
        error: <FaExclamationCircle />,
        info: <FaInfoCircle />
    };

    return (
        <motion.div
            className={`toast toast-${type}`}
            initial={{ opacity: 0, y: -50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        >
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-message">{message}</div>
            <button className="toast-close" onClick={onClose}>
                <FaTimes />
            </button>
        </motion.div>
    );
};

export const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            <AnimatePresence>
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                        duration={toast.duration}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default Toast;
