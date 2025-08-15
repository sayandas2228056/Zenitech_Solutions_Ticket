const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = path.extname(req.file.originalname).toLowerCase();
    let content = '';

    // Read file content based on file type
    if (fileType === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      content = pdfData.text;
    } else if (fileType === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      content = result.value;
    } else {
      fs.unlinkSync(filePath); // Delete unsupported file
      return res.status(400).json({ message: 'Unsupported file format' });
    }

    // Check if content is a resume
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const isResumePrompt = `Is the following text a resume? Answer with only 'yes' or 'no':\n\n${content.substring(0, 1000)}`;
    const isResumeResult = await model.generateContent(isResumePrompt);
    const isResume = isResumeResult.response.text().toLowerCase().includes('yes');

    if (!isResume) {
      fs.unlinkSync(filePath); // Delete non-resume file
      return res.status(400).json({ 
        message: 'The uploaded file does not appear to be a resume',
        isResume: false 
      });
    }

    // Analyze resume content
    const analysisPrompt = `Analyze this resume and provide a detailed assessment in JSON format with the following structure:
    {
      "score": number (0-100),
      "strengths": string[],
      "weaknesses": string[],
      "suggestions": string[],
      "keywordAnalysis": {
        "found": string[],
        "missing": string[]
      }
    }
    
    Resume content:
    ${content}`;

    const analysisResult = await model.generateContent(analysisPrompt);
    const analysis = JSON.parse(analysisResult.response.text());

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.json({
      isResume: true,
      score: analysis.score,
      analysis: analysis,
      suggestions: analysis.suggestions
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (error.message.includes('API key')) {
      return res.status(500).json({ message: 'AI service configuration error' });
    }
    
    res.status(500).json({ 
      message: 'Error analyzing resume',
      error: error.message 
    });
  }
};

module.exports = {
  analyzeResume
}; 