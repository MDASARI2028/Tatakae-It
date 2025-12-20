// backend/models/hydration.model.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const hydrationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Amount in ml is required'],
        min: [1, 'Amount must be a positive number']
    }
}, {
    timestamps: true
});

const Hydration = mongoose.model('Hydration', hydrationSchema);

module.exports = Hydration;