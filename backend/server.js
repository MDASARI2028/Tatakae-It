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
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once('open', () => {
  console.log("[SYSTEM] MongoDB database connection established successfully.");
});

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/workouts', require('./routes/workout.routes'));
app.use('/api/metrics', require('./routes/bodyMetric.routes'));
app.use('/api/templates', require('./routes/template.routes'));
app.use('/api/nutrition', require('./routes/nutrition.routes.js'));
app.use('/api/hydration', require('./routes/hydration.routes.js'));
app.use('/api/recipes', require('./routes/recipe.routes.js'));
app.use('/api/food-search', require('./routes/foodSearch.routes.js'));
app.use('/api/levelup', require('./routes/levelup.routes.js'));

app.listen(port, () => {
  console.log(`[SYSTEM] Backend server is running on port: ${port}`);
});