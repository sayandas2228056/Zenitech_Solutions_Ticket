const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('../config/config');

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

// Example interview tips endpoint
router.get('/tips', authenticateToken, (req, res) => {
  res.json({ tips: [
    'Research the company before your interview.',
    'Practice common interview questions.',
    'Dress appropriately and be on time.'
  ] });
});

module.exports = router; 