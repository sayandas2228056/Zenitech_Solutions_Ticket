const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['practice', 'interview', 'resume_upload'],
    required: true
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  details: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', activitySchema); 