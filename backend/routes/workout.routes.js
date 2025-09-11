// backend/routes/workout.routes.js

const router = require('express').Router();
// --- THIS IS THE FIX ---
// We now destructure { Workout } from the imported file
const { Workout } = require('../models/workout.model');
const auth = require('../middleware/auth.middleware');

// @route   POST /api/workouts
// @desc    Create a new workout log
// @access  Private
router.post('/', auth, async (req, res) => {
    try {
        const { type, duration, notes, exercises, date, distance, cardioDuration, caloriesBurned } = req.body;

        if (!type || !duration) {
            return res.status(400).json({ msg: 'Workout type and duration are mandatory.' });
        }

        const newWorkout = new Workout({
            user: req.user.id,
            type,
            duration,
            notes,
            exercises,
            date,
            distance,
            cardioDuration,
            caloriesBurned
        });

        const savedWorkout = await newWorkout.save();
        res.status(201).json(savedWorkout);

    } catch (err) {
        console.error("Workout Creation Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   GET /api/workouts
// @desc    Get all workouts for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
        res.json(workouts);
    } catch (err) {
        console.error("Fetch Workouts Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   PUT /api/workouts/:id
// @desc    Update a specific workout
// @access  Private
router.put('/:id', auth, async (req, res) => {
    try {
        const { type, duration, notes, exercises, date } = req.body;
        const workout = await Workout.findOne({ _id: req.params.id, user: req.user.id });

        if (!workout) {
            return res.status(404).json({ msg: 'Workout not found or user not authorized.' });
        }

        // --- THIS IS THE FIX ---
        // We only update fields if they are provided in the request.
        // This prevents errors if an old record is missing a field.
        workout.type = type || workout.type;
        workout.duration = duration || workout.duration;
        workout.notes = notes || workout.notes;
        workout.exercises = exercises || workout.exercises;
        workout.date = date || workout.date;
        
        const updatedWorkout = await workout.save();
        res.json(updatedWorkout);

    } catch (err) {
        console.error("Workout Update Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   DELETE /api/workouts/:id
// @desc    Delete a specific workout
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const workout = await Workout.findOneAndDelete({ _id: req.params.id, user: req.user.id });

        if (!workout) {
            return res.status(404).json({ msg: 'Workout not found or user not authorized.' });
        }

        res.json({ msg: 'Workout deleted successfully.' });

    } catch (err) {
        console.error("Workout Deletion Error:", err.message);
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;