const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const foodItemSchema = new Schema({
    foodName: { 
        type: String, 
        required: [true, 'Food name is required'],
        trim: true 
    },
    calories: { 
        type: Number, 
        required: [true, 'Calories are required'] 
    },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    servingSize: { 
        type: Number, 
        required: [true, 'Serving size is required']
    },
    servingUnit: { 
        type: String, 
        required: [true, 'Serving unit is required'],
        trim: true
    }
}, { _id: false });

const nutritionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String, // This is correct
        required: true
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snacks'],
        required: true
    },
    // This mealName field was missing from your provided model but is used in your routes
    mealName: {
        type: String,
        trim: true,
        maxlength: 100
    },
    items: {
        type: [foodItemSchema],
        validate: [v => Array.isArray(v) && v.length > 0, 'A meal must have at least one item']
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    }
}, {
    timestamps: true
});

const Nutrition = mongoose.model('Nutrition', nutritionSchema);

module.exports = Nutrition;