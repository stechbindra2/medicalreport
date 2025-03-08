/**
 * Test script for Gemini API integration
 * Run with: node test-gemini.js
 */
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.cyan}=== Gemini API Test ===\n${colors.reset}`);

// Check if API key is set
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.log(`${colors.red}❌ No Gemini API key found in .env file${colors.reset}`);
  console.log('Please set GEMINI_API_KEY in your .env file');
  process.exit(1);
}

// Function to test the API with a sample image
async function testGeminiAPI() {
  try {
    console.log(`${colors.blue}Initializing Gemini API...${colors.reset}`);
    
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get the generative model using the latest version
    const modelName = process.env.GEMINI_MODEL || 'Gemini 2.0 Flash Experimental';
    console.log(`${colors.blue}Using model: ${modelName}${colors.reset}`);
    
    const model = genAI.getGenerativeModel({
      model: modelName
    });
    
    console.log(`${colors.blue}Preparing test image...${colors.reset}`);
    
    // Create or locate a test image
    const testImagesDir = path.join(__dirname, 'test-images');
    if (!fs.existsSync(testImagesDir)) {
      fs.mkdirSync(testImagesDir, { recursive: true });
    }
    
    const testImagePath = path.join(testImagesDir, 'test-image.jpg');
    
    // Create a simple test image if it doesn't exist
    if (!fs.existsSync(testImagePath)) {
      console.log(`${colors.yellow}No test image found, creating minimal test image...${colors.reset}`);
      
      // Create a minimal valid JPG
      const minimalJpg = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
        0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
        0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00,
        0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00,
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
        0x00, 0x7f, 0x00, 0xff, 0xd9
      ]);
      
      fs.writeFileSync(testImagePath, minimalJpg);
      console.log(`${colors.green}Created minimal test image at: ${testImagePath}${colors.reset}`);
    }
    
    // Convert image to base64
    const imageData = fs.readFileSync(testImagePath);
    const base64Image = Buffer.from(imageData).toString('base64');
    
    // Set up a simple prompt
    const prompt = "Describe this image briefly.";
    
    // Set up the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: 'image/jpeg'
      },
    };
    
    console.log(`${colors.blue}Sending request to Gemini API...${colors.reset}`);
    
    // Generate content
    const result = await model.generateContent([prompt, imagePart]);
    const response = result.response;
    const text = response.text();
    
    console.log(`\n${colors.green}✅ Gemini API test successful!${colors.reset}`);
    console.log(`\n${colors.magenta}API Response:${colors.reset}`);
    console.log(`${colors.cyan}${text}${colors.reset}`);
    
    console.log(`\n${colors.green}Your Gemini integration is working correctly!${colors.reset}`);
    
  } catch (error) {
    console.log(`\n${colors.red}❌ Gemini API test failed:${colors.reset}`);
    console.error(error);
    
    if (error.message.includes('API key')) {
      console.log(`\n${colors.yellow}This may be due to an invalid API key.${colors.reset}`);
      console.log('Please check your GEMINI_API_KEY in the .env file');
    } else if (error.message.includes('quota')) {
      console.log(`\n${colors.yellow}This may be due to exceeding your API quota.${colors.reset}`);
      console.log('Check your Google Cloud console for quota information.');
    }
  }
}

// Run the test
testGeminiAPI();
