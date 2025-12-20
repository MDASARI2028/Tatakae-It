const mongoose = require('mongoose');

const XPHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['GAIN', 'LOSS'],
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['FITNESS', 'NUTRITION', 'STREAK', 'LEVEL_UP', 'PENALTY', 'OTHER', 'MIXED'],
        default: 'OTHER'
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('XPHistory', XPHistorySchema);
