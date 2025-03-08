/**
 * API Test Tool
 * Tests the export API endpoint to ensure it's working correctly
 */
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const http = require('http');

const PORT = process.env.PORT || 3000;

console.log('=== API Test Tool ===');
console.log('This tool will test your API endpoints to ensure they are working correctly.\n');

// Check if the server is running
async function testServerConnection() {
  console.log('Testing server connection...');
  
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${PORT}`, res => {
      console.log(`✓ Server is accessible at port ${PORT} (Status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', err => {
      console.log(`✗ Cannot connect to server on port ${PORT}: ${err.message}`);
      console.log(`  Make sure the server is running with 'npm start'\n`);
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log(`✗ Connection to server on port ${PORT} timed out`);
      resolve(false);
    });
  });
}

// Test the export API endpoint
async function testExportAPI() {
  if (!(await testServerConnection())) {
    return;
  }
  
  console.log('\nTesting /api/export-report endpoint...');
  
  // Sample data for testing
  const testData = {
    format: 'html',
    reportData: {
      summary: 'This is a test summary.',
      maskedReport: 'This is a test masked report content.'
    },
    templateName: 'default'
  };
  
  try {
    // Make the API request
    const response = await fetch(`http://localhost:${PORT}/api/export-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`API response status: ${response.status} ${response.statusText}`);
    console.log(`Content-Type: ${response.headers.get('Content-Type')}`);
    
    if (response.ok) {
      const outputPath = path.join(__dirname, 'test-export.html');
      const buffer = await response.buffer();
      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Export API is working! Output saved to: ${outputPath}`);
      console.log('  Check this file to ensure it contains the expected content.');
    } else {
      console.log('✗ Export API returned an error');
      
      // Try to get more details
      try {
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.log(`  Error message: ${errorData.error || 'Unknown error'}`);
        } else {
          const text = await response.text();
          console.log(`  Response body: ${text.substring(0, 100)}...`);
        }
      } catch (parseErr) {
        console.log(`  Could not parse response: ${parseErr.message}`);
      }
    }
  } catch (error) {
    console.log(`✗ Request failed: ${error.message}`);
  }
  
  console.log('\nDone testing API endpoints');
}

// Run the tests
testExportAPI();
