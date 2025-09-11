// frontend/src/components/Layout.js
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import './Layout.css';

const Layout = () => {
    return (
        <div className="app-container">
            <header className="app-header">
                <Link to="/" className="app-title-link">
                    <h1>Tatakae It</h1>
                </Link>
                {/* User info and logout are removed from here */}
            </header>
            <main className="app-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;