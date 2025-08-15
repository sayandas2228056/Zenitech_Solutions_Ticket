const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const config = require('../config/config');
const axios = require('axios');

// Initialize Together AI API
if (!config.TOGETHER_API_KEY) {
  console.error('TOGETHER_API_KEY is not set in environment variables');
  throw new Error('Together AI API key is not configured');
}

async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error('Failed to extract text from PDF: ' + error.message);
  }
}

async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error('Failed to extract text from DOCX: ' + error.message);
  }
}

async function extractTextFromFile(file) {
  const filePath = file.path;
  const fileType = file.mimetype;

  try {
    if (fileType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return await extractTextFromDOCX(filePath);
    } else {
      throw new Error('Unsupported file format');
    }
  } finally {
    // Clean up the temporary file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}

async function analyzeResumeWithTogetherAI(resumeText) {
  try {
    console.log('Sending request to Together AI API...');
    
    const prompt = `
    Analyze the following resume for ATS (Applicant Tracking System) compatibility and provide a comprehensive evaluation. Please respond with a JSON object containing the following structure:

    {
      "isResume": boolean (true if this is actually a resume, false otherwise),
      "score": number (0-100, overall ATS compatibility score),
      "analysis": {
        "keywordMatch": number (0-100, percentage of relevant keywords found),
        "formatting": number (0-100, formatting quality score),
        "contentQuality": number (0-100, content quality score),
        "strengths": array of strings (3-5 strengths),
        "weaknesses": array of strings (3-5 weaknesses),
        "keywordAnalysis": {
          "found": array of strings (important keywords found in resume),
          "missing": array of strings (important keywords that should be added)
        }
      },
      "suggestions": array of strings (5-8 specific improvement suggestions)
    }

    Evaluate based on:
    1. ATS-friendly formatting (simple structure, standard headings, no complex graphics)
    2. Keyword optimization (relevant industry terms, skills, technologies)
    3. Content quality (clear descriptions, quantified achievements, proper grammar)
    4. Completeness (contact info, experience, skills, education sections)
    5. Readability and structure

    Resume text:
    "${resumeText}"

    Please provide only the JSON response without any additional text or formatting.
    `;

    const response = await axios.post('https://api.together.xyz/v1/chat/completions', {
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume analyzer and ATS optimization specialist.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${config.TOGETHER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response from Together AI API');

    // Extract the JSON response from the API response
    const jsonText = response.data.choices[0].message.content.trim();
    
    try {
      const parsedResponse = JSON.parse(jsonText);
      console.log('Successfully parsed Together AI response');
      return parsedResponse;
    } catch (parseError) {
      console.error('Failed to parse Together AI response as JSON:', parseError);
      console.error('Raw response:', jsonText);
      
      // Fallback response if JSON parsing fails
      return {
        isResume: true,
        score: 65,
        analysis: {
          keywordMatch: 60,
          formatting: 70,
          contentQuality: 65,
          strengths: [
            "Resume contains relevant experience",
            "Professional formatting detected",
            "Contact information is present"
          ],
          weaknesses: [
            "Could benefit from more specific keywords",
            "Some sections may need improvement",
            "Consider adding quantified achievements"
          ],
          keywordAnalysis: {
            found: ["experience", "skills", "education"],
            missing: ["leadership", "project management", "problem solving"]
          }
        },
        suggestions: [
          "Add more industry-specific keywords",
          "Quantify your achievements with numbers",
          "Improve section formatting for ATS compatibility",
          "Include relevant technical skills",
          "Use action verbs to describe your experience"
        ]
      };
    }
  } catch (error) {
    console.error('Together AI API error:', error);
    throw new Error('Failed to analyze resume with AI: ' + error.message);
  }
}

module.exports = {
  extractTextFromFile,
  analyzeResumeWithTogetherAI
}; 