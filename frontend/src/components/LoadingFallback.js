// frontend/src/components/LoadingFallback.js
import React from 'react';
import './LoadingFallback.css';

const LoadingFallback = () => {
    return (
        <div className="loading-fallback">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading...</p>
        </div>
    );
};

export default LoadingFallback;
