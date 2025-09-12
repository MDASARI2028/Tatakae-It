// frontend/src/components/Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import HunterProfile from './HunterProfile';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-container">
            <header className="app-header">
                {/* Item 1: Empty spacer for the left column */}
                <div></div>

                {/* Item 2: The centered title */}
                <div className="title-container">
                    <Link to="/" className="app-title-link">
                        <h1>Tatakae It</h1>
                    </Link>
                </div>

                {/* Item 3: The profile widget on the right */}
                <HunterProfile />
            </header>
            <main className="app-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;