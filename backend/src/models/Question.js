const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['technical', 'behavioral'],
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    options: {
        type: [String],
        required: true
    },
    correctAnswer: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    testType: {
        type: String,
        enum: ['technical', 'behavioral', 'mixed'],
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Question', questionSchema); 