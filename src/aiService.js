/**
 * Service for interacting with the AI API (OpenRouter)
 */

const { OpenAI } = require('openai');
const config = require('../config/config');

// Initialize OpenAI client with OpenRouter configuration
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: config.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": config.SITE_URL,
    "X-Title": config.SITE_NAME,
  }
});

/**
 * Generate a summary of a medical report using AI
 * @param {string} maskedReportText - PII-masked medical report
 * @returns {Promise<string>} - The generated summary
 */
async function generateSummary(maskedReportText) {
  try {
    if (!config.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is missing. Please set it in your .env file.');
    }
    
    const promptTemplate = "Summarize this medical report, focusing on diagnosis, treatment, and recommendations: ";
    const prompt = `${promptTemplate}${maskedReportText}`;
    
    const completion = await openai.chat.completions.create({
      model: config.TEXT_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a medical assistant that summarizes medical reports concisely and accurately."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
}

module.exports = { generateSummary };
