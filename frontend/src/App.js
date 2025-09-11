// frontend/src/App.js

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { WorkoutProvider } from './context/WorkoutContext';
import { TemplateProvider } from './context/TemplateContext'; // <-- IMPORT

// --- Component & Page Imports ---
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import FitnessPage from './pages/FitnessPage';
import NutritionPage from './pages/NutritionPage';
import WorkoutLoggerPage from './pages/WorkoutLoggerPage';
import BodyMetricLoggerPage from './pages/BodyMetricLoggerPage';
import HistoryPage from './pages/HistoryPage';
import ProgressPage from './pages/ProgressPage';
import ManageTemplatesPage from './pages/ManageTemplatesPage'; // <-- IMPORT
import AuthPage from './pages/AuthPage'; // Import the new page

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
      {/* The Layout component is the main wrapper for all private pages */}
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        
        {/* The index route is the default page shown at "/" */}
        <Route index element={<Dashboard />} />
        
        {/* Other pages render inside the Layout's <Outlet /> */}
        <Route path="fitness" element={<FitnessPage />}>
          <Route path="workout-logger" element={<WorkoutLoggerPage />} />
          <Route path="metric-logger" element={<BodyMetricLoggerPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="templates" element={<ManageTemplatesPage />} />
        </Route>
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
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </TemplateProvider>
      </WorkoutProvider>
    </AuthProvider>
  );
}

export default App;