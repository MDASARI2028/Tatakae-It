// frontend/src/components/Dashboard.js

import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const quote = `"Success isn't always about greatness. It's about consistency. Consistent hard work gains success. Greatness will come."`;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header-info">
        {user && <span>Welcome, Hunter {user.username}</span>}
        <button onClick={logout} className="minimal-logout-button">(Logout)</button>
      </div>

      <div className="dashboard-quote">
        <p>{quote}</p>
      </div>

      <nav className="main-tabs">
        <NavLink to="/fitness" className={({ isActive }) => (isActive ? 'active-tab' : '')}>
          Fitness
        </NavLink>
        <NavLink to="/nutrition" className={({ isActive }) => (isActive ? 'active-tab' : '')}>
          Nutrition
        </NavLink>
      </nav>
    </div>
  );
};

export default Dashboard;