require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const mongoose = require('mongoose');

const app = express();
app.use(compression());
const port = process.env.PORT || 5000;

app.use(cors({
  // TEMPORARY DEBUG: Allow all origins to reflect back
  origin: true,
  credentials: true
}));
app.use(express.json());

const uri = process.env.MONGO_URI;
mongoose.connect(uri)
  .then(() => console.log("[SYSTEM] MongoDB database connection established successfully."))
  .catch(err => console.error("[SYSTEM] MongoDB Connection Error:", err));

const connection = mongoose.connection;

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/workouts', require('./routes/workout.routes'));
app.use('/api/metrics', require('./routes/bodyMetric.routes'));
app.use('/api/templates', require('./routes/template.routes'));
app.use('/api/nutrition', require('./routes/nutrition.routes.js'));
app.use('/api/hydration', require('./routes/hydration.routes.js'));
app.use('/api/recipes', require('./routes/recipe.routes.js'));
app.use('/api/food-search', require('./routes/foodSearch.routes.js'));
app.use('/api/levelup', require('./routes/levelup.routes.js'));
app.use('/api/demo', require('./routes/demo.routes.js'));

// Default route for root to prevent "Cannot GET /" confusion
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(port, () => {
  console.log(`[SYSTEM] Backend server is running on port: ${port}`);
});

module.exports = app;