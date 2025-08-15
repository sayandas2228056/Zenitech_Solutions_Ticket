const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/config');
const { authenticateToken } = require('../middleware/auth');

router.post('/generate', authenticateToken, async (req, res) => {
  try {
    const { jobRole, company, experience, jobDescription, skills, interviewType } = req.body;

    // Validate required fields
    if (!jobRole || !company || !experience || !jobDescription || !skills || !interviewType) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    console.log('Received request with data:', req.body);

    // Check if API key exists
    if (!config.TOGETHER_API_KEY) {
      console.error('API Key missing');
      return res.status(500).json({ message: 'API configuration error' });
    }

    console.log('Sending request to Together AI API...');

    // Create the improved prompt
    const prompt = `<|im_start|>system
You are an expert interview preparation coach. You must respond with ONLY a valid JSON object, no other text or explanations.
<|im_end|>

<|im_start|>user
Create interview preparation content for:
- Position: ${jobRole}
- Company: ${company}
- Experience Level: ${experience} years
- Interview Type: ${interviewType}

Job Description:
${jobDescription}

Required Skills:
${skills}

Return ONLY a JSON object with this exact structure:
{
  "technicalQuestions": [
    "question1",
    "question2", 
    "question3",
    "question4",
    "question5"
  ],
  "behavioralQuestions": [
    "question1",
    "question2",
    "question3", 
    "question4",
    "question5"
  ],
  "companySpecificQuestions": [
    "question1",
    "question2",
    "question3"
  ],
  "tipsForSuccess": [
    "tip1",
    "tip2",
    "tip3",
    "tip4",
    "tip5"
  ]
}

Requirements:
- Technical questions should be relevant to the skills: ${skills}
- Behavioral questions should assess problem-solving, teamwork, and leadership
- Company questions should show knowledge of ${company}
- Tips should be actionable and specific to ${interviewType} interviews
- All questions should be appropriate for ${experience} years of experience
<|im_end|>

<|im_start|>assistant
{`;

    // Make request to Together AI API with better parameters
    const response = await axios.post(
      'https://api.together.xyz/v1/completions',
      {
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        prompt: prompt,
        max_tokens: 2500,
        temperature: 0.3, // Lower temperature for more consistent JSON output
        top_p: 0.8,
        top_k: 40,
        repetition_penalty: 1.1,
        stop: ['<|im_end|>', '</s>', 'Human:', 'User:']
      },
      {
        headers: {
          'Authorization': `Bearer ${config.TOGETHER_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Received response from Together AI API');
    console.log('Response status:', response.status);

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      throw new Error('Invalid response format from Together AI');
    }

    // Extract and clean the response text
    let responseText = response.data.choices[0].text.trim();
    
    // Since we ended the prompt with '{', we need to add it back
    if (!responseText.startsWith('{')) {
      responseText = '{' + responseText;
    }

    // Find the complete JSON object
    let jsonString = '';
    let braceCount = 0;
    let startFound = false;

    for (let i = 0; i < responseText.length; i++) {
      const char = responseText[i];
      
      if (char === '{') {
        if (!startFound) startFound = true;
        braceCount++;
      } else if (char === '}') {
        braceCount--;
      }
      
      if (startFound) {
        jsonString += char;
      }
      
      if (startFound && braceCount === 0) {
        break;
      }
    }

    console.log('Extracted JSON string:', jsonString);

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', responseText);
      
      // Fallback: try to fix common JSON issues
      try {
        // Remove any trailing commas and fix common issues
        const cleanedJson = jsonString
          .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
          .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
          .replace(/\s+/g, ' '); // Normalize whitespace
          
        parsedResponse = JSON.parse(cleanedJson);
      } catch (fallbackError) {
        console.error('Fallback JSON Parse Error:', fallbackError);
        throw new Error('Failed to parse AI response as JSON');
      }
    }

    // Validate the parsed response structure
    const requiredFields = ['technicalQuestions', 'behavioralQuestions', 'companySpecificQuestions', 'tipsForSuccess'];
    const missingFields = requiredFields.filter(field => !parsedResponse[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields in AI response: ${missingFields.join(', ')}`);
    }

    // Ensure all arrays are valid and have content
    for (const field of requiredFields) {
      if (!Array.isArray(parsedResponse[field]) || parsedResponse[field].length === 0) {
        throw new Error(`Invalid or empty array for field: ${field}`);
      }
    }

    // Clean up the questions and tips (remove any quotes, trim whitespace)
    const cleanupArray = (arr) => arr.map(item => 
      typeof item === 'string' ? item.trim().replace(/^["']|["']$/g, '') : item
    );

    parsedResponse.technicalQuestions = cleanupArray(parsedResponse.technicalQuestions);
    parsedResponse.behavioralQuestions = cleanupArray(parsedResponse.behavioralQuestions);
    parsedResponse.companySpecificQuestions = cleanupArray(parsedResponse.companySpecificQuestions);
    parsedResponse.tipsForSuccess = cleanupArray(parsedResponse.tipsForSuccess);

    console.log('Successfully parsed and validated response');
    res.json({ data: parsedResponse });

  } catch (error) {
    console.error('Error generating interview prep:', error.response?.data || error.message);
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Unauthorized access to AI service' });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
    }
    if (error.response?.status === 400) {
      return res.status(400).json({ message: 'Invalid request to AI service' });
    }
    
    res.status(500).json({ 
      message: 'Failed to generate interview preparation content',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;