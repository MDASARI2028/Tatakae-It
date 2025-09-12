// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TemplateProvider } from './context/TemplateContext';

// --- Component & Page Imports ---
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import FitnessPage from './pages/FitnessPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutLoggerPage from './pages/WorkoutLoggerPage';
import BodyMetricLoggerPage from './pages/BodyMetricLoggerPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import ManageTemplatesPage from './pages/ManageTemplatesPage';
import AuthPage from './pages/AuthPage';

// --- Routing Imports ---
import PrivateRoute from './routing/PrivateRoute';
import PublicRoute from './routing/PublicRoute';

const AppRoutes = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <div>Loading System...</div>;
  }

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><AuthPage /></PublicRoute>} />

      {/* --- Main Private Routes --- */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        <Route index element={<Dashboard />} />
        
        {/* --- CORRECTED FITNESS ROUTES --- */}
        {/* The FitnessPage with the cards is the index for the /fitness route */}
        <Route path="fitness" element={<FitnessPage />} /> 
        {/* The sub-pages are now direct children of the Layout, not nested */}
        <Route path="fitness/workout-logger" element={<WorkoutLoggerPage />} />
        <Route path="fitness/metric-logger" element={<BodyMetricLoggerPage />} />
        <Route path="fitness/history" element={<HistoryPage />} />
        <Route path="fitness/progress" element={<ProgressPage />} />
        <Route path="fitness/templates" element={<ManageTemplatesPage />} />

        <Route path="nutrition" element={<NutritionPage />} />
      </Route>
      
      {/* --- Catch-all Route --- */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <WorkoutProvider>
        <TemplateProvider>
          <Router>
            <div className="site-wrapper">
              <AppRoutes />
            </div>
          </Router>
        </TemplateProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;