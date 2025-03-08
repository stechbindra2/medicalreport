/**
 * Configuration settings for the application
 */

require('dotenv').config();

const config = {
  // OpenRouter API configuration
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  SITE_URL: process.env.SITE_URL || 'https://yourcompany.com',
  SITE_NAME: process.env.SITE_NAME || 'Medical Report Processor',
  
  // Encryption settings
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '', // 64-character hex string (32 bytes)
  
  // Application settings
  DEFAULT_LANGUAGE: 'en',
  SUPPORTED_LANGUAGES: ['en'],
  
  // Model settings
  TEXT_MODEL: process.env.TEXT_MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free',
  
  // Gemini API configuration
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'Gemini 2.0 Flash Experimental',
};

// Validate required configuration
function validateConfig() {
  const requiredKeys = ['OPENROUTER_API_KEY', 'ENCRYPTION_KEY'];
  const missingKeys = requiredKeys.filter(key => !config[key]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration: ${missingKeys.join(', ')}. Make sure to set up your .env file.`);
  }
  
  // Validate encryption key format
  if (!/^[a-f0-9]{64}$/i.test(config.ENCRYPTION_KEY)) {
    throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
  }
}

// Validate on load unless testing
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

module.exports = config;
