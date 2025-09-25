// frontend/src/components/HunterProfile.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';
import './HunterProfile.css';

const HunterProfile = () => {
    const { user, logout } = useContext(AuthContext);

    return (
        <div className="hunter-profile-widget">
            <FaUserCircle className="profile-icon" />
            <span className="profile-username">Hunter {user?.username}</span>
            <button onClick={logout} className="profile-logout-button">
                Logout
            </button>
        </div>
    );
};

export default HunterProfile;