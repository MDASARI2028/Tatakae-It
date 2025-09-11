// backend/models/template.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// --- CORRECTED IMPORT ---
const { exerciseSchema } = require('./workout.model');

const templateSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    templateName: {
        type: String,
        required: true,
        trim: true
    },
    workoutType: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    },
    // --- USES THE CORRECT, IMPORTED SCHEMA ---
    exercises: [exerciseSchema]
}, {
    timestamps: true
});

templateSchema.index({ user: 1, templateName: 1 }, { unique: true });

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;