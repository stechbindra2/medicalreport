/**
 * Service for processing and analyzing medical images using Google's Gemini API
 */
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../config/config');

/**
 * Process a medical image using Google's Gemini Vision API
 * @param {Object} imageFile - The uploaded image file (from multer)
 * @param {string|null} analysisPrompt - Optional custom prompt for analysis
 * @returns {Promise<Object>} - Analysis results
 */
async function processMedicalImage(imageFile, analysisPrompt = null) {
  try {
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY && !config.GEMINI_API_KEY) {
      console.log('No Gemini API key found. Using mock analysis.');
      return mockAnalysis(imageFile);
    }
    
    console.log(`Processing image: ${imageFile.originalname} (${imageFile.mimetype})`);
    console.log(`Using prompt: ${analysisPrompt || 'default medical prompt'}`);
    
    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || config.GEMINI_API_KEY);
    
    // Create a generative model instance - use Gemini 2.0 Flash Experimental
    const modelName = process.env.GEMINI_MODEL || config.GEMINI_MODEL || "Gemini 2.0 Flash Experimental";
    console.log(`Using Gemini model: ${modelName}`);
    
    const model = genAI.getGenerativeModel({ 
      model: modelName
    });
    
    // Set up the medical analysis prompt
    const prompt = analysisPrompt || 
      "As a medical imaging specialist, analyze this medical image in detail. " +
      "Include the following sections:\n\n" +
      "## Medical Image Analysis\n\n" +
      "**Image Type:** [determine type]\n" +
      "**Visual Assessment:** [describe what you see]\n" +
      "**File Size:** [include if relevant]\n\n" +
      "### Observations\n" +
      "[Provide detailed observations about structures, abnormalities, or findings]\n\n" +
      "### Analysis\n" +
      "[Provide professional interpretation of the image]\n\n" +
      "### Recommendations\n" +
      "[Suggest next steps or additional tests if appropriate]";
    
    // Convert image to base64 for the Gemini API
    const imageData = fs.readFileSync(imageFile.path);
    const base64Image = Buffer.from(imageData).toString('base64');
    
    // Create the image part
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.mimetype
      },
    };
    
    console.log('Sending image to Gemini API...');
    
    // Generate content
    const generatedContent = await model.generateContent([prompt, imagePart]);
    const response = generatedContent.response;
    const analysis = response.text();
    
    console.log('Received analysis from Gemini API');
    
    // Return the analysis with metadata
    return {
      analysis,
      metadata: {
        filename: imageFile.originalname,
        filesize: imageFile.size,
        mimetype: imageFile.mimetype,
        timestamp: new Date().toISOString(),
        model: modelName
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error processing medical image with Gemini:', error);
    
    // If there's an error with Gemini, fall back to mock analysis
    if (error.message.includes('API key') || 
        error.message.includes('authentication') || 
        error.message.includes('quota')) {
      console.log('Using fallback mock analysis due to API error');
      return mockAnalysis(imageFile);
    }
    
    throw new Error(`Failed to process medical image: ${error.message}`);
  }
}

/**
 * Generate mock analysis when Gemini API is not available
 * @param {Object} imageFile - The uploaded image file
 * @returns {Object} - Mock analysis results
 */
function mockAnalysis(imageFile) {
  const mockAnalysis = `## Medical Image Analysis

**Image Type:** ${getImageType(imageFile.mimetype)}
**Filename:** ${imageFile.originalname}
**File Size:** ${formatFileSize(imageFile.size)}

### Observations
This is a placeholder analysis since Gemini Vision API is not configured.
To get real AI analysis, you would need to:
- Get a Google Gemini API key
- Add it to your .env file
- Implement the actual image analysis service

### Sample Findings
- The image appears to be a medical scan
- No abnormalities can be detected in this mock analysis
- For demonstration purposes only

### Recommendations
- Configure the Gemini API for real image analysis
- Use high-quality medical images for best results
- Consult with a healthcare professional for actual medical advice`;

  return {
    analysis: mockAnalysis,
    metadata: {
      filename: imageFile.originalname,
      filesize: imageFile.size,
      mimetype: imageFile.mimetype,
      timestamp: new Date().toISOString()
    },
    timestamp: new Date().toISOString(),
    isMock: true
  };
}

/**
 * Extract image type from file
 * @param {string} mimeType - The image MIME type
 * @returns {string} - Simplified image type
 */
function getImageType(mimeType) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPEG';
  if (mimeType.includes('png')) return 'PNG';
  if (mimeType.includes('dicom')) return 'DICOM';
  if (mimeType.includes('gif')) return 'GIF';
  if (mimeType.includes('tiff')) return 'TIFF';
  return 'Unknown';
}

/**
 * Format file size in a human-readable way
 * @param {number} bytes - Size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
  else return (bytes / 1048576).toFixed(2) + ' MB';
}

module.exports = { processMedicalImage };
