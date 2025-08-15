const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const feedbacks = [];

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Submit feedback
router.post('/', authenticateToken, (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Feedback message required' });
  feedbacks.push({ user: req.user.userId, message, date: new Date() });
  res.json({ message: 'Feedback submitted' });
});

module.exports = router; 