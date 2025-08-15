require('dotenv').config();

// Log environment variables (without exposing sensitive data)
console.log('Environment variables loaded:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY ? 'Present' : 'Missing'
});

module.exports = {
  // Database configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/inteliview',
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  
  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // AI API Keys
  TOGETHER_API_KEY: process.env.TOGETHER_API_KEY,
  
  // Server configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
  UPLOAD_DIR: 'uploads/',
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ],
  AI: {
    API_KEY: process.env.TOGETHER_API_KEY,
    MODEL: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
    BASE_URL: 'https://api.together.xyz/v1'
  }
}; 