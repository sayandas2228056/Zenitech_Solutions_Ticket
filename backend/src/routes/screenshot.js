const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { sendScreenshotEmail } = require('../services/screenshotService');
const { authenticateToken } = require('../middleware/auth');

// Apply authentication middleware
router.use(authenticateToken);

// POST /api/screenshot - Upload and email screenshot
router.post('/', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded or invalid file type' });
    }

    const { description } = req.body;
    const user = req.user; // From auth middleware

    await sendScreenshotEmail(
      user.email,
      user.name || 'User',
      description || 'No description provided',
      {
        buffer: req.file.buffer,
        mimetype: req.file.mimetype
      }
    );

    res.status(200).json({ message: 'Screenshot submitted successfully' });
  } catch (error) {
    console.error('Error processing screenshot:', error);
    res.status(500).json({ 
      error: 'Failed to process screenshot',
      details: error.message 
    });
  }
});

module.exports = router;
