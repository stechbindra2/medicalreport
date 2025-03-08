/**
 * Export functionality diagnostic tool
 * Run with: node diagnose-export.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

console.log('=== Export Functionality Diagnostic Tool ===\n');

// Check required dependencies
console.log('Checking export dependencies:');
const deps = ['pdfkit', 'exceljs', 'docx', 'handlebars'];
const missingDeps = [];

deps.forEach(dep => {
  try {
    require.resolve(dep);
    console.log(`✓ ${dep}: Installed`);
  } catch (e) {
    missingDeps.push(dep);
    console.log(`✗ ${dep}: Missing`);
  }
});

if (missingDeps.length > 0) {
  console.log('\nInstalling missing dependencies...');
  try {
    execSync(`npm install ${missingDeps.join(' ')}`, { stdio: 'inherit' });
    console.log('✓ Dependencies installed successfully');
  } catch (error) {
    console.log('✗ Failed to install dependencies:', error.message);
  }
}

// Check templates directory
console.log('\nChecking templates directory:');
const templatesDir = path.join(__dirname, 'templates');
if (!fs.existsSync(templatesDir)) {
  console.log('✗ Templates directory is missing, creating it...');
  fs.mkdirSync(templatesDir, { recursive: true });
  console.log('✓ Created templates directory');
} else {
  console.log('✓ Templates directory exists');
}

// Check if server is running
console.log('\nChecking if server is running:');
const checkServer = () => {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000', (res) => {
      console.log(`✓ Server is running on port 3000 (status: ${res.statusCode})`);
      resolve(true);
    });
    
    req.on('error', () => {
      console.log('✗ Server is not running');
      console.log('  Try starting the server with: npm start');
      resolve(false);
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      console.log('✗ Server connection timed out');
      resolve(false);
    });
  });
};

// Check server endpoint for export
const testExport = async () => {
  if (!await checkServer()) {
    return;
  }
  
  console.log('\nTesting export endpoint with minimal data:');
  
  // Create a test file with minimal export data
  const testPath = path.join(__dirname, 'test-export-request.json');
  const testData = {
    format: 'html', // HTML is usually most reliable
    reportData: {
      summary: 'Test summary for export functionality.',
      maskedReport: 'Test [NAME] with [DATE] for masked report.'
    },
    templateName: 'default'
  };
  
  fs.writeFileSync(testPath, JSON.stringify(testData, null, 2));
  console.log(`✓ Created test request data at ${testPath}`);
  
  console.log('\nExport test instructions:');
  console.log('1. Make sure your server is running (npm start)');
  console.log('2. Run this curl command to test the API directly:');
  console.log(`   curl -X POST -H "Content-Type: application/json" -d @${testPath} http://localhost:3000/api/export-report --output test-export.html`);
  console.log('3. Check if test-export.html was created and contains the expected content');
  console.log('\n4. Alternative test in browser console:');
  console.log(`
  fetch('/api/export-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(${JSON.stringify(testData)})
  })
  .then(response => {
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    return response.blob();
  })
  .then(blob => {
    console.log('Response type:', blob.type);
    console.log('Size:', blob.size);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'test-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  })
  .catch(error => console.error('Error:', error));
  `);

  console.log('\nDiagnostic complete! Please fix any identified issues and try downloading files again.');
};

testExport();
