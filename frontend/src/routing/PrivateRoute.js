import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// This component now accepts children props
const PrivateRoute = ({ children }) => { 
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If authenticated, render the children. Otherwise, redirect.
  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default PrivateRoute;