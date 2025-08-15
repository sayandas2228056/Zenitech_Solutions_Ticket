const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    },
    duration: {
        type: Number,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
    answers: [{
        question: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
        },
        answer: String,
        feedback: String,
        score: Number,
        strengths: [String],
        improvements: [String],
        isCorrect: Boolean
    }],
    currentQuestion: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed'],
        default: 'in_progress'
    },
    finalScore: {
        type: Number
    },
    correctAnswers: {
        type: Number
    },
    totalQuestions: {
        type: Number
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TestResult', testResultSchema); 