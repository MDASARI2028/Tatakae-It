// frontend/src/pages/FitnessPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaDumbbell, FaHistory, FaRulerCombined, FaChartLine } from 'react-icons/fa';
import './FitnessPage.css';

const FitnessPage = () => {
  return (
    <div className="fitness-grid-container">
      <Link to="/fitness/workout-logger" className="fitness-card">
        <FaDumbbell className="fitness-icon" />
        <h3 data-text="Log Workout">Log Workout</h3>
        <p>Record your daily training sessions.</p>
      </Link>
      <Link to="/fitness/history" className="fitness-card">
        <FaHistory className="fitness-icon" />
        <h3 data-text="View History">View History</h3>
        <p>Review past workouts and metrics.</p>
      </Link>
      <Link to="/fitness/metric-logger" className="fitness-card">
        <FaRulerCombined className="fitness-icon" />
        <h3 data-text="Log Metrics">Log Metrics</h3>
        <p>Track your body measurements.</p>
      </Link>
      <Link to="/fitness/progress" className="fitness-card">
        <FaChartLine className="fitness-icon" />
        <h3 data-text="Analyze Progress">Analyze Progress</h3>
        <p>Visualize your performance over time.</p>
      </Link>
    </div>
  );
};

export default FitnessPage;