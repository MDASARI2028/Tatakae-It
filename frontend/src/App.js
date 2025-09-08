import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PrivateRoute from './routing/PrivateRoute';
import PublicRoute from './routing/PublicRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <h1>Tatakae It</h1>
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* We wrap each public component in our PublicRoute gatekeeper */}
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* --- PROTECTED ROUTE --- */}
            {/* We wrap our private component in our PrivateRoute gatekeeper */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />

            {/* --- FALLBACK ROUTE --- */}
            {/* Redirect any other path to the register page by default */}
            <Route path="*" element={<Navigate to="/register" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;