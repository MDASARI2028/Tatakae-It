// backend/models/workout.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const exerciseSchema = new Schema({
    name: { type: String, required: true, trim: true },
    sets: { type: Number, required: true, min: 1 },
    reps: { type: Number, required: true, min: 1 },
    weight: { type: Number, required: true, min: 0 }
}, { _id: false });

const workoutSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Strength Training', 'Cardio', 'Other'],
        trim: true
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    exercises: [exerciseSchema],
    distance: { type: Number, min: 0 },
    cardioDuration: { type: Number, min: 0 },
    caloriesBurned: { type: Number, min: 0 }
}, {
    timestamps: true
});

const Workout = mongoose.model('Workout', workoutSchema);

// --- CORRECTED EXPORT ---
module.exports = { Workout, exerciseSchema };