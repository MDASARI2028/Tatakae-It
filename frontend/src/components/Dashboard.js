import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext'; // Import our context

const Dashboard = () => {
  // Access the global state and functions from AuthContext
  const { user, logout, isLoading } = useContext(AuthContext);

  // If the state is still loading, show a simple message
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="form-container">
      <h2>Hunter's Dashboard</h2>
      {user ? (
        <div>
          <h3>Welcome, {user.username}</h3>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user._id}</p>
          <button onClick={logout} style={{ marginTop: '1rem', backgroundColor: '#dc3545' }}>
            Logout
          </button>
        </div>
      ) : (
        <p>Could not load user data. Please try logging in again.</p>
      )}
    </div>
  );
};

export default Dashboard;