// API configuration for axios
import axios from 'axios';

// Use environment variable for API URL in production, fallback to proxy in development
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 Token Expiry
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('[AXIOS] 401 Unauthorized - Token likely expired. Logging out.');
            localStorage.removeItem('token');
            // Optional: Redirect to login or dispatch distinct event
            // window.location.href = '/login'; // Force redirect if needed
        }
        return Promise.reject(error);
    }
);

export default api;
