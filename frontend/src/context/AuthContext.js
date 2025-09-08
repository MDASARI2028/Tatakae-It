import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    isAuthenticated: null,
    isLoading: true,
    user: null,
  });

  // This effect will run ONCE when the app loads to check for a token
  useEffect(() => {
    const loadUser = async () => {
      // Read the token directly from localStorage, NOT from the state
      const token = localStorage.getItem('token'); 

      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        try {
          const res = await axios.get('http://localhost:5000/api/users/me');
          setAuthState({
            token: token,
            isAuthenticated: true,
            isLoading: false,
            user: res.data,
          });
        } catch (err) {
          localStorage.removeItem('token');
          setAuthState({
            token: null,
            isAuthenticated: false,
            isLoading: false,
            user: null,
          });
        }
      } else {
        // If there's no token, we're done loading
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    };

    loadUser();
  }, []); // The empty array ensures this effect ONLY runs once.

  const login = async (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['x-auth-token'] = token;
    try {
      // After login, fetch the user data immediately
      const res = await axios.get('http://localhost:5000/api/users/me');
      setAuthState({
        token,
        isAuthenticated: true,
        isLoading: false,
        user: res.data,
      });
    } catch (err) {
      // Handle case where token is bad for some reason
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['x-auth-token'];
    setAuthState({
      token: null,
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });
  };

  // We pass the functions in the value, but now also the state itself
  const contextValue = { ...authState, login, logout };

  return (
    <AuthContext.Provider value={contextValue}>
      {/* We prevent children from rendering until the initial token check is done */}
      {!authState.isLoading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };