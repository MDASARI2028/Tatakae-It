import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This component also accepts children props
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authenticated, redirect away to the dashboard. Otherwise, render the children.
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default PublicRoute;