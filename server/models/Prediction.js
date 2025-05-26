const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    race: {
        type: String,
        required: true
    },
    driver: {
        type: String,
        required: true
    },
    position: {
        type: Number,
        required: true,
        min: 1,
        max: 20
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Prediction', predictionSchema); 