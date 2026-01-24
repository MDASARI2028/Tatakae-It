// frontend/src/pages/FitnessPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDumbbell, FaHistory, FaRulerCombined, FaChartLine } from 'react-icons/fa';
import BackButton from '../components/common/BackButton';
import FitnessParticles from '../components/FitnessParticles';
import FitnessSummary from '../components/fitness/FitnessSummary';
import './FitnessPage.css';

const FitnessPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentDate] = useState(new Date());

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaDumbbell },
    { id: 'logger', label: 'Log Workout', icon: FaDumbbell },
    { id: 'history', label: 'History', icon: FaHistory },
    { id: 'metrics', label: 'Body Metrics', icon: FaRulerCombined },
    { id: 'progress', label: 'Progress', icon: FaChartLine }
  ];

  const cards = [
    {
      to: "/fitness/workout-logger",
      icon: FaDumbbell,
      title: "Log Workout",
      desc: "Record your daily training sessions and track performance.",
      color: "from-primary to-secondary"
    },
    {
      to: "/fitness/history",
      icon: FaHistory,
      title: "Workout History",
      desc: "Review past sessions and monitor your training journey.",
      color: "from-blue-600 to-cyan-600"
    },
    {
      to: "/fitness/metric-logger",
      icon: FaRulerCombined,
      title: "Body Metrics",
      desc: "Track measurements and physical progress over time.",
      color: "from-pink-600 to-rose-600"
    },
    {
      to: "/fitness/progress",
      icon: FaChartLine,
      title: "Progress Analytics",
      desc: "Visualize performance and celebrate your achievements.",
      color: "from-green-600 to-emerald-600"
    },
  ];

  const getTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab cards={cards} />;
      case 'logger':
        return <LoggerTab />;
      case 'history':
        return <HistoryTab />;
      case 'metrics':
        return <MetricsTab />;
      case 'progress':
        return <ProgressTab />;
      default:
        return <OverviewTab cards={cards} />;
    }
  };

  return (
    <div className="fitness-page system-ui relative">
      <FitnessParticles />
      {/* Header */}
      <motion.header
        className="fitness-header"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="fitness-header-left">
          <BackButton />
          <div>
            <h2>Fitness Center</h2>
            <p className="sub">Track workouts, metrics and progress</p>
          </div>
        </div>
        <div className="fitness-header-right">
          <div className="date-display">
            <span>{currentDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' })}</span>
          </div>
        </div>
      </motion.header>

      {/* Tabs Navigation */}
      <nav className="fitness-tabs" aria-label="Fitness tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              className={`fitness-tab-btn ${tab.id === activeTab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="tab-icon" />
              {tab.label}
            </motion.button>
          );
        })}
      </nav>

      {/* Tab Content */}
      <main className="fitness-tab-content">
        {getTabContent()}
      </main>
    </div>
  );
};

// Overview Tab - Grid of cards
const OverviewTab = ({ cards }) => {
  return (
    <motion.div
      className="fitness-cards-grid"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ gridColumn: '1 / -1', width: '100%' }}>
        <FitnessSummary />
      </div>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Link to={card.to} className="fitness-card-link">
              <div className="fitness-card">
                <div className={`fitness-card-icon bg-gradient-to-br ${card.color}`}>
                  <Icon />
                </div>
                <h3>{card.title}</h3>
                <p>{card.desc}</p>
                <div className="fitness-card-cta">
                  <span>Explore</span>
                  <span className="arrow">→</span>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

// Logger Tab
const LoggerTab = () => {
  return (
    <div className="fitness-tab-placeholder">
      <h3>Log Workout</h3>
      <p>Start a new workout session and track your exercises.</p>
      <Link to="/fitness/workout-logger" className="fitness-cta-button">
        Begin Logging
      </Link>
    </div>
  );
};

// History Tab
const HistoryTab = () => {
  return (
    <div className="fitness-tab-placeholder">
      <h3>Workout History</h3>
      <p>View and manage your past workout sessions.</p>
      <Link to="/fitness/history" className="fitness-cta-button">
        View History
      </Link>
    </div>
  );
};

// Metrics Tab
const MetricsTab = () => {
  return (
    <div className="fitness-tab-placeholder">
      <h3>Body Metrics</h3>
      <p>Track your measurements and physical progress.</p>
      <Link to="/fitness/metric-logger" className="fitness-cta-button">
        Log Metrics
      </Link>
    </div>
  );
};

// Progress Tab
const ProgressTab = () => {
  return (
    <div className="fitness-tab-placeholder">
      <h3>Progress Analytics</h3>
      <p>Visualize your fitness journey and celebrate wins.</p>
      <Link to="/fitness/progress" className="fitness-cta-button">
        Analyze Progress
      </Link>
    </div>
  );
};

export default FitnessPage;