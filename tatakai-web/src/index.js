import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css?v=2'; // Add `?v=2` to the end
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);