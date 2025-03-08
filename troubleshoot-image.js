/**
 * Image processing troubleshooting script
 * This helps diagnose issues with the image analysis feature
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== Image Processing Troubleshooter ===\n');

// Check if the server is running
console.log('1. Checking server status...');
const serverCheck = new Promise((resolve) => {
  const req = http.get('http://localhost:3000', (res) => {
    console.log(`✅ Server is running on port 3000 (Status: ${res.statusCode})`);
    resolve(true);
  });
  
  req.on('error', () => {
    console.log('❌ Server is not running on port 3000');
    resolve(false);
  });
  
  req.setTimeout(2000, () => {
    req.destroy();
    console.log('❌ Connection to server timed out');
    resolve(false);
  });
});

// Main troubleshooting function
async function runTroubleshooter() {
  const serverRunning = await serverCheck;
  
  if (!serverRunning) {
    console.log('\n⚠️ The server must be running for image analysis to work.');
    console.log('Please start the server with: npm start');
    return;
  }
  
  // Check for required files
  console.log('\n2. Checking for required files...');
  
  const requiredFiles = [
    { path: 'src/imageProcessorService.js', message: 'Image processor service' },
    { path: 'public/js/app.js', message: 'Client-side application code' }
  ];
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file.path))) {
      console.log(`✅ ${file.message} found`);
    } else {
      console.log(`❌ ${file.message} is missing at ${file.path}`);
    }
  });
  
  // Check if image processing endpoint is available
  console.log('\n3. Testing /api/process-image endpoint...');
  
  // Create sample image data
  const testImagePath = path.join(__dirname, 'test-image.jpg');
  if (!fs.existsSync(testImagePath)) {
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
    console.log(`Created test image at ${testImagePath}`);
  }
  
  console.log('\n4. Troubleshooting instructions:');
  console.log('   a. Make sure your server is running on the correct port (usually 3000)');
  console.log('   b. Check browser console for network errors when uploading an image');
  console.log('   c. Verify all DOM elements exist in the HTML by running this in browser console:');
  console.log(`      console.log({
        imageInput: !!document.getElementById('imageFile'),
        dropArea: !!document.getElementById('imageDropArea'),
        preview: !!document.getElementById('imagePreview'),
        previewContainer: !!document.getElementById('imagePreviewContainer'),
        removeBtn: !!document.getElementById('removeImage'),
        processBtn: !!document.getElementById('processImage'),
        promptInput: !!document.getElementById('analysisPrompt'),
        imageTab: !!document.querySelector('.image-tab'),
        analysisImage: !!document.getElementById('analysisImage'),
        analysisText: !!document.getElementById('imageAnalysisText')
      });`);
  
  console.log('\n5. CURL test command:');
  console.log(`curl -X POST -F "image=@${testImagePath}" http://localhost:3000/api/process-image`);
  
  console.log('\n6. If issues persist, try these fixes:');
  console.log('   - Restart the server (npm start)');
  console.log('   - Clear browser cache and refresh');
  console.log('   - Use a smaller image file (<1MB)');
  console.log('   - Check server logs for detailed error messages');
}

runTroubleshooter();
