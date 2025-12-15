// backend/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    nutritionGoals: {
        calorieGoal: { type: Number, default: 2200 },
        proteinGoal: { type: Number, default: 150 },
        carbGoal: { type: Number, default: 250 },
        fatGoal: { type: Number, default: 70 },
    },
    streakStartDate: {
        type: Date,
        default: Date.now // Defaults to when the user signs up
    },
    levelUpMode: {
        enabled: { type: Boolean, default: false },
        xp: { type: Number, default: 0 },
        rank: {
            type: String,
            enum: ['E', 'D', 'C', 'B', 'A', 'S', 'National', 'Monarch'],
            default: 'E'
        },
        seasonStartDate: { type: Date }, // When user activated Level Up Mode
        lastXpUpdate: { type: Date },
        dailyXPEarned: { type: Number, default: 0 }, // Tracks XP earned specifically today (reset daily)
        lastDailyCalculationDate: { type: Date },    // Tracks the last date daily XP was calculated
        restDays: [{ type: String }], // Array of date strings (YYYY-MM-DD) marked as rest days
        streaks: {
            fitness: {
                current: { type: Number, default: 0 },
                longest: { type: Number, default: 0 },
                lastLog: { type: Date }
            },
            nutrition: {
                current: { type: Number, default: 0 },
                longest: { type: Number, default: 0 },
                lastLog: { type: Date }
            }
        },
        legacyAchievements: [{
            season: { type: Number }, // Season number
            year: { type: Number },
            finalRank: { type: String },
            finalXP: { type: Number },
            completedAt: { type: Date }
        }]
    }
}, { timestamps: true });

// Mongoose Middleware: This function runs BEFORE a user document is saved
userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    // Hash the password with a salt round of 10
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;