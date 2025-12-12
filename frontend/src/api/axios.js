// API configuration for axios
import axios from 'axios';

// Use environment variable for API URL in production, fallback to proxy in development
const API_URL = process.env.REACT_APP_API_URL || '';

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL
});

export default api;
