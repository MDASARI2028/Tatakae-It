// frontend/src/components/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
    return (
        <div className="dashboard-container">
            <div className="dashboard-quote">
                <p className="quote-line line-1">The System Uses</p>
                <p className="quote-line line-2">You</p>
                <p className="quote-line line-3">Use The System</p>
            </div>

            <div className="gateway-container">
                <Link to="/fitness" className="gateway-card">
                    <h3 data-text="Fitness System">Fitness System</h3>
                    <p>Track workouts, view history, and monitor progress.</p>
                </Link>
                <Link to="/nutrition" className="gateway-card">
                    <h3 data-text="Nutrition System">Nutrition System</h3>
                    <p>Log meals and track your daily energy consumption.</p>
                </Link>
            </div>
        </div>
    );
};

export default Dashboard;