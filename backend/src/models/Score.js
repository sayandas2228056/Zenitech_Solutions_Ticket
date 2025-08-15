const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  practiceScore: {
    type: Number,
    min: 0,
    max: 100
  },
  interviewScore: {
    type: Number,
    min: 0,
    max: 100
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Score', scoreSchema); 