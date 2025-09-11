// frontend/src/pages/FitnessPage.js
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './FitnessPage.css'; // Import the new styles

const FitnessPage = () => {
  return (
    <div className="fitness-grid-container">
      <nav className="sub-nav-panel">
        <NavLink to="/fitness/workout-logger">Log Workout</NavLink>
        <NavLink to="/fitness/metric-logger">Log Metrics</NavLink>
        <NavLink to="/fitness/history">View History</NavLink>
        <NavLink to="/fitness/progress">Analyze Progress</NavLink>
      </nav>
      
      <main className="fitness-content-area">
        <Outlet />
      </main>
    </div>
  );
};

export default FitnessPage;