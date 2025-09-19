// frontend/src/pages/AuthPage.js

import React, { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import './AuthPage.css';
import backgroundImage from '../assets/images/jinwoo.jpg';

const AuthPage = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [isJapanese, setIsJapanese] = useState(false);

    const toggleTitle = () => {
        setIsJapanese(!isJapanese);
    };

    const pageStyle = {
      backgroundImage: `linear-gradient(rgba(25, 14, 45, 0.5), rgba(13, 14, 20, 0.5)), url(${backgroundImage})`
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
                    <span>Tatakae</span>
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