// backend/models/recipe.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// NOTE: This schema for a food item is identical to the one in nutrition.model.js.
// This is intentional, making it easy to convert meals to recipes and vice-versa.
const foodItemSchema = new Schema({
    foodName: { type: String, required: true, trim: true },
    calories: { type: Number, required: true },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    servingSize: { type: Number, required: true },
    servingUnit: { type: String, required: true, trim: true }
}, { _id: false });

const recipeSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: [true, 'Recipe name is required'],
        trim: true,
        maxlength: 100
    },
    items: {
        type: [foodItemSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'A recipe must have at least one item']
    }
}, {
    timestamps: true
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;