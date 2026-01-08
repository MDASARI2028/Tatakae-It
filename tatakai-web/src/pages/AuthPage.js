// frontend/src/pages/AuthPage.js

import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import './AuthPage.css';
import backgroundImage from '../assets/images/jinwoo.jpg';

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [isJapanese, setIsJapanese] = useState(false);
    const [bgLoaded, setBgLoaded] = useState(false);

    // Preload background image
    React.useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
        img.onload = () => setBgLoaded(true);
    }, []);

    const toggleTitle = () => {
        setIsJapanese(!isJapanese);
    };

    const pageStyle = {
        backgroundImage: bgLoaded ? `linear-gradient(rgba(75, 60, 145, 0.5), rgba(45, 30, 95, 0.5)), url(${backgroundImage})` : 'none',
        backgroundColor: '#1a1a2e', // Fallback/Placeholder color
        opacity: bgLoaded ? 1 : 0, // Fade in the whole container or just the background
        transition: 'opacity 0.5s ease-in-out'
    };

    return (
        <div className="auth-page-container" style={pageStyle}>
            <h1
                className={`auth-page-title ${isJapanese ? 'japanese-font' : ''}`}
                onClick={toggleTitle}
                title="Click to toggle language"
            >
                {isJapanese ? (
                    <span className="japanese-part">戦い</span>
                ) : (
                    <span>Tatakai</span>
                )}
                <span> It</span>
            </h1>

            <div className="auth-card">
                <h2>Welcome</h2>
                <p>ENTER THE REALM OF POWERING UP</p>

                <div className="auth-toggle">
                    <button onClick={() => setIsLoginView(true)} className={isLoginView ? 'active' : ''}>
                        Level Up
                    </button>
                    <button onClick={() => setIsLoginView(false)} className={!isLoginView ? 'active' : ''}>
                        Awaken
                    </button>
                </div>

                {isLoginView ? <Login /> : <Register />}

                <div className="auth-footer-link">
                    {isLoginView ? (
                        <span>New Player? <button onClick={() => setIsLoginView(false)}>Awaken</button></span>
                    ) : (
                        <span>Already a Player? <button onClick={() => setIsLoginView(true)}>Level Up</button></span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;