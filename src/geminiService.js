/**
 * Service for interacting with Google's Gemini AI
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');
const config = require('../config/config');
const os = require('os');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Downloads an image from a URL (supporting both http and https) and saves it to a temporary file
 * @param {string} imageUrl - The URL of the image to download
 * @returns {Promise<{path: string, data: Buffer}>} - The path and data of the downloaded image
 */
async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    // Check if it's a file URL
    if (imageUrl.startsWith('file://')) {
      const filePath = imageUrl.replace('file://', '');
      try {
        const data = fs.readFileSync(filePath);
        resolve({ path: filePath, data });
      } catch (error) {
        reject(new Error(`Failed to read local file: ${error.message}`));
      }
      return;
    }
    
    // Create a unique temp file path
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `medical_image_${Date.now()}.jpg`);
    
    const file = fs.createWriteStream(tempFilePath);
    
    // Parse URL to determine http or https
    const parsedUrl = url.parse(imageUrl);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    
    // Set request options with headers to improve compatibility
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'image/jpeg,image/png,image/*,*/*'
      },
      timeout: 10000 // 10 seconds timeout
    };
    
    const request = httpModule.get(imageUrl, options, (response) => {
      // Handle redirects (up to 5 levels)
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        fs.unlink(tempFilePath, () => {});
        const redirectUrl = new URL(response.headers.location, imageUrl).toString();
        console.log(`Following redirect to: ${redirectUrl}`);
        downloadImage(redirectUrl).then(resolve).catch(reject);
        return;
      }
      
      // Check if the request was successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const chunks = [];
      
      // Collect data chunks
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Handle errors during the download
      response.on('error', (err) => {
        fs.unlink(tempFilePath, () => {});
        reject(err);
      });
      
      // Finish the download
      file.on('finish', () => {
        file.close();
        const imageData = Buffer.concat(chunks);
        
        // Check if we got a valid image by checking the first few bytes
        if (imageData.length < 100) {
          fs.unlink(tempFilePath, () => {});
          reject(new Error('Downloaded file is too small to be a valid image'));
          return;
        }
        
        resolve({ path: tempFilePath, data: imageData });
      });
      
      // Handle errors during file writing
      file.on('error', (err) => {
        fs.unlink(tempFilePath, () => {});
        reject(err);
      });
    });
    
    request.setTimeout(10000, () => {
      request.abort();
      fs.unlink(tempFilePath, () => {});
      reject(new Error('Request timeout when downloading image'));
    });
    
    request.on('error', (err) => {
      fs.unlink(tempFilePath, () => {});
      reject(err);
    });
  });
}

/**
 * Analyze a medical image using Gemini AI
 * @param {string} imageUrl - URL of the image to analyze
 * @param {string} question - Question about the image
 * @returns {Promise<string>} - AI analysis of the image
 */
async function analyzeImage(imageUrl, question) {
  try {
    // Download the image
    const { path: imagePath, data: imageData } = await downloadImage(imageUrl);
    
    // Create a prompt for medical image analysis
    const medicalPrompt = question || "Please analyze this medical image in detail. Identify any abnormalities, describe the anatomical structures visible, and provide a professional assessment as a radiologist would.";
    
    // Initialize the model
    const model = genAI.getGenerativeModel({
      model: config.GEMINI_MODEL,
    });
    
    // Convert image to base64
    const base64Image = imageData.toString('base64');
    
    // Configure image part for the model
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: "image/jpeg"
      }
    };
    
    // Generate content
    const result = await model.generateContent([
      imagePart,
      { text: medicalPrompt }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Clean up the temporary file
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
    });
    
    return text;
  } catch (error) {
    console.error('Error analyzing image with Gemini:', error);
    throw new Error(`Gemini image analysis failed: ${error.message}`);
  }
}

module.exports = { analyzeImage };
