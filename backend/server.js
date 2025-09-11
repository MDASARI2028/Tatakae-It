// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows us to parse JSON

// --- MongoDB Connection ---
const uri = process.env.MONGO_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("[SYSTEM] MongoDB database connection established successfully.");
});

// --- API ROUTES ---
// We are telling our app to use the user routes file for any URL that starts with /api/users
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/workouts', require('./routes/workout.routes'));
app.use('/api/metrics', require('./routes/bodyMetric.routes'));
app.use('/api/templates', require('./routes/template.routes'));

app.listen(port, () => {
    console.log(`[SYSTEM] Backend server is running on port: ${port}`);
});