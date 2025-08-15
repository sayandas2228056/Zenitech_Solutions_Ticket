const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const axios = require('axios');
const TestResult = require('../models/TestResult');
const Question = require('../models/Question');
const config = require('../config/config');

// Log all requests to mock test routes
router.use((req, res, next) => {
  console.log(`Mock Test Route: ${req.method} ${req.url}`);
  next();
});

// Start a new mock test
router.post('/start', authenticateToken, async (req, res) => {
    try {
        console.log('Starting mock test with data:', req.body);
        const { company, role, experience, jobDescription, skills, testType, duration } = req.body;

        // Validate required fields
        if (!company || !role || !experience || !jobDescription || !skills || !testType || !duration) {
            console.log('Missing required fields:', { company, role, experience, jobDescription, skills, testType, duration });
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required',
                missing: Object.entries({ company, role, experience, jobDescription, skills, testType, duration })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Check if API key exists
        if (!config.TOGETHER_API_KEY) {
            console.error('API Key missing');
            return res.status(500).json({ 
                success: false,
                message: 'API configuration error' 
            });
        }

        // Create the prompt for MCQ generation
        const prompt = `<|im_start|>system
You are an expert interviewer creating multiple choice questions. You must respond with ONLY a valid JSON object, no other text or explanations.
<|im_end|>

<|im_start|>user
Create 15 multiple choice questions for a ${testType} interview for:
- Position: ${role}
- Company: ${company}
- Experience Level: ${experience} years

Job Description:
${jobDescription}

Required Skills:
${skills}

Return ONLY a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation of why this is the correct answer"
    }
  ]
}

Requirements:
- Generate exactly 15 questions
- Questions should be relevant to the skills: ${skills}
- Options should be plausible but only one should be correct
- Include a brief explanation for the correct answer
- Questions should be appropriate for ${experience} years of experience
- Make questions specific to ${company} and ${role}
<|im_end|>

<|im_start|>assistant
{`;

        console.log('Sending request to Together AI API...');

        // Make request to Together AI API
        const response = await axios.post(
            'https://api.together.xyz/v1/completions',
            {
                model: 'mistralai/Mistral-7B-Instruct-v0.2',
                prompt: prompt,
                max_tokens: 2500,
                temperature: 0.3,
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
                const cleanedJson = jsonString
                    .replace(/,(\s*[}\]])/g, '$1')
                    .replace(/[\r\n\t]/g, ' ')
                    .replace(/\s+/g, ' ');
                    
                parsedResponse = JSON.parse(cleanedJson);
            } catch (fallbackError) {
                console.error('Fallback JSON Parse Error:', fallbackError);
                throw new Error('Failed to parse AI response as JSON');
            }
        }

        // Validate the parsed response structure
        if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
            throw new Error('Invalid response format: missing questions array');
        }

        console.log('Creating questions in database...');

        // Create questions in the database
        const questions = await Promise.all(
            parsedResponse.questions.map(async (q, index) => {
                const question = await Question.create({
                    question: q.question,
                    type: testType,
                    number: index + 1,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    explanation: q.explanation,
                    company,
                    role,
                    testType
                });
                return question;
            })
        );

        console.log('Creating test result...');

        // Create a new test result
        const testResult = await TestResult.create({
            user: req.user.userId,
            company,
            role,
            testType,
            duration,
            questions: questions.map(q => q._id),
            currentQuestion: 1,
            status: 'in_progress'
        });

        console.log('Test created successfully:', testResult._id);

        res.json({
            success: true,
            test: {
                _id: testResult._id,
                questions: questions.map(q => ({
                    _id: q._id,
                    question: q.question,
                    options: q.options,
                    number: q.number
                })),
                totalQuestions: questions.length
            }
        });
    } catch (error) {
        console.error('Error starting mock test:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to start mock test',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Submit an answer
router.post('/submit-answer', authenticateToken, async (req, res) => {
    try {
        console.log('Submitting answer:', req.body);
        const { testId, questionId, selectedOption } = req.body;

        const testResult = await TestResult.findById(testId);
        if (!testResult) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }

        if (testResult.user.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ success: false, message: 'Question not found' });
        }

        const isCorrect = selectedOption === question.correctAnswer;
        const score = isCorrect ? 100 : 0;

        // Update test result with answer
        testResult.answers.push({
            question: questionId,
            answer: selectedOption,
            isCorrect,
            score,
            feedback: question.explanation
        });

        // Always recalculate correctAnswers and totalQuestions
        const correctAnswers = testResult.answers.filter(ans => ans.isCorrect).length;
        testResult.correctAnswers = correctAnswers;
        testResult.totalQuestions = testResult.questions.length;

        // If this was the last question, calculate final score and mark as completed
        if (testResult.answers.length === testResult.questions.length) {
            const finalScore = Math.round(
                (correctAnswers / testResult.questions.length) * 100
            );
            testResult.finalScore = finalScore;
            testResult.status = 'completed';
            testResult.completedAt = new Date();
        }

        await testResult.save();

        res.json({
            success: true,
            feedback: question.explanation,
            isCorrect,
            score,
            isLastQuestion: testResult.answers.length === testResult.questions.length,
            finalScore: testResult.finalScore,
            correctAnswers,
            totalQuestions: testResult.totalQuestions
        });
    } catch (error) {
        console.error('Error submitting answer:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to submit answer',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Get test results
router.get('/results', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching test results for user:', req.user.userId);
        const testResults = await TestResult.find({ user: req.user.userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('questions');

        res.json({
            success: true,
            results: testResults
        });
    } catch (error) {
        console.error('Error fetching test results:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch test results',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Submit final test result
router.post('/submit-result', authenticateToken, async (req, res) => {
    try {
        const { testId, finalScore } = req.body;
        const testResult = await TestResult.findById(testId);
        if (!testResult) {
            return res.status(404).json({ success: false, message: 'Test not found' });
        }
        if (testResult.user.toString() !== req.user.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }
        // Always recalculate correctAnswers and totalQuestions
        const correctAnswers = testResult.answers.filter(ans => ans.isCorrect).length;
        testResult.correctAnswers = correctAnswers;
        testResult.totalQuestions = testResult.questions.length;
        testResult.finalScore = finalScore;
        testResult.status = 'completed';
        testResult.completedAt = new Date();
        await testResult.save();
        res.json({ success: true, message: 'Test result submitted successfully', correctAnswers, totalQuestions: testResult.totalQuestions });
    } catch (error) {
        console.error('Error submitting test result:', error);
        res.status(500).json({ success: false, message: 'Failed to submit test result' });
    }
});

module.exports = router; 