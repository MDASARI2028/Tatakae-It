import React, { useState, useContext } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import HunterProfile from './HunterProfile';
import './Layout.css';
import { AuthContext } from '../context/AuthContext';
import useIdleTimer from '../hooks/useIdleTimer';

const Layout = () => {
    const [isJapanese, setIsJapanese] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { logout, isAuthenticated } = useContext(AuthContext);

    // Auto-logout after 15 minutes (900000ms) of inactivity
    useIdleTimer(() => {
        if (isAuthenticated) {
            console.log("User inactive. Logging out...");
            logout();
        }
    }, 900000);

    const handleTitleClick = (e) => {
        // If already on dashboard, toggle font; otherwise navigate to dashboard
        if (location.pathname === '/dashboard') {
            e.preventDefault();
            setIsJapanese(!isJapanese);
        }
    };

    return (
        <div className="layout-container">
            {/* Header - Responsive for all devices with Glassmorphism */}
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-5 bg-black/30 backdrop-blur-md border-b border-white/10">

                {/* Mobile Menu Button - Left side on mobile */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden text-white text-2xl z-50 focus:outline-none hover:text-purple-400 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>

                {/* Title - Centered on all devices */}
                <Link
                    to="/dashboard"
                    onClick={handleTitleClick}
                    className="absolute left-1/2 transform -translate-x-1/2 cursor-pointer no-underline"
                >
                    <h1
                        className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold m-0 whitespace-nowrap logo app-title"
                        style={{
                            fontFamily: isJapanese ? 'serif' : 'Georgia, serif'
                        }}
                    >
                        {isJapanese ? '戦え-IT' : 'TATAKAI IT'}
                    </h1>
                </Link>

                {/* Hunter Profile - Right side, hidden on mobile when menu is open */}
                <div className={`${isMobileMenuOpen ? 'hidden md:block' : 'block'} mr-2 md:mr-6 lg:mr-10`}>
                    <HunterProfile />
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/90 z-30 pt-20 px-6"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    {/* Mobile menu content can be added here if needed */}
                    <div className="flex flex-col items-center justify-center h-full space-y-6">
                        <p className="text-white/60 text-sm">Navigation menu available in specific pages</p>
                    </div>
                </div>
            )}

            {/* Main content with responsive top padding */}
            <main className="pt-14 sm:pt-16 md:pt-20 px-4 sm:px-6 md:px-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;