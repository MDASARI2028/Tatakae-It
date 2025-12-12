// backend/models/bodyMetric.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * @desc    Beginner Explainer: This schema defines the structure for a single daily
 * entry of a user's body measurements. We make most fields optional to give the
 * user flexibility in what they choose to track.
 */
const bodyMetricSchema = new Schema({
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
    weight: {
        type: Number, // in Kilograms (kg)
        required: [true, 'Weight is a required field.'],
        min: 0
    },
    height: {
        type: Number, // in Centimeters (cm)
        min: 0
    },
    bodyFatPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    waist: {
        type: Number, // in Centimeters (cm)
        min: 0
    },
    chest: {
        type: Number, // in Centimeters (cm)
        min: 0
    },
    hips: {
        type: Number, // in Centimeters (cm)
        min: 0
    },
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

const BodyMetric = mongoose.model('BodyMetric', bodyMetricSchema);

module.exports = BodyMetric;