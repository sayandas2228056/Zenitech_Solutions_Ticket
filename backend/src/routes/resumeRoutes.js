const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { extractTextFromFile, analyzeResumeWithTogetherAI } = require('../services/resumeService');
const fs = require('fs');

// Resume analysis endpoint
router.post('/analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('Analyzing resume for user:', req.user.email);
    console.log('File info:', {
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Extract text from the uploaded file
    let resumeText;
    try {
      resumeText = await extractTextFromFile(req.file);
    } catch (error) {
      console.error('Text extraction error:', error);
      return res.status(400).json({ 
        message: error.message || 'Failed to extract text from the resume'
      });
    }

    if (!resumeText || resumeText.trim().length < 100) {
      return res.status(400).json({ 
        message: 'Unable to extract sufficient text from the resume. Please ensure the file is not corrupted and contains readable text.' 
      });
    }

    console.log('Extracted text length:', resumeText.length);

    // Analyze resume with Together AI
    let analysisResult;
    try {
      analysisResult = await analyzeResumeWithTogetherAI(resumeText);
      console.log('Analysis completed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      return res.status(500).json({ 
        message: error.message || 'Failed to analyze resume with AI'
      });
    }

    res.json(analysisResult);
  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Clean up file if it still exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ 
      message: error.message || 'Failed to analyze resume' 
    });
  }
});

module.exports = router; 