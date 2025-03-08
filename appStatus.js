/**
 * App Status Checker
 * Quickly checks all components of the application
 * Run with: node appStatus.js
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const http = require('http');

console.log('=== Medical Report Processor Status Check ===');

// Check if server is running
console.log('\nChecking server status...');
http.get('http://localhost:3000', (res) => {
  console.log(`✅ Server is running! Status code: ${res.statusCode}`);
}).on('error', (err) => {
  console.log('❌ Server is not running');
  console.log('   Run "npm start" to start the server');
});

// Check directory structure
console.log('\nChecking directory structure...');
const requiredDirs = ['src', 'public', 'public/js', 'public/css', 'public/assets', 'uploads', 'config'];
let allDirsExist = true;

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}: Exists`);
  } else {
    console.log(`❌ ${dir}: Missing`);
    allDirsExist = false;
  }
});

if (!allDirsExist) {
  console.log('   Run "node fix-all.js" to create missing directories');
}

// Check file system accessibility
console.log('\nChecking file system access...');
try {
  const testFilePath = path.join(__dirname, 'uploads', `test-file-${Date.now()}.txt`);
  fs.writeFileSync(testFilePath, 'Test content');
  fs.unlinkSync(testFilePath);
  console.log('✅ File system is writable');
} catch (err) {
  console.log(`❌ File system is not writable: ${err.message}`);
  console.log('   This could prevent file uploads from working');
}

// Check environment configuration
console.log('\nChecking environment configuration...');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  console.log('✅ .env file exists');
  
  // Check for key configuration items
  const envContents = fs.readFileSync(envPath, 'utf8');
  const apiKeyPattern = /OPENROUTER_API_KEY=\S+/;
  const encKeyPattern = /ENCRYPTION_KEY=[0-9a-f]{64}/i;
  
  if (apiKeyPattern.test(envContents)) {
    console.log('✅ API key configuration found');
  } else {
    console.log('❌ API key configuration is missing or invalid');
  }
  
  if (encKeyPattern.test(envContents)) {
    console.log('✅ Encryption key configuration found (correctly formatted)');
  } else {
    console.log('❌ Encryption key is missing or incorrectly formatted');
  }
} else {
  console.log('❌ .env file is missing');
  console.log('   Run "node fix-all.js" to create it');
}

// Check system resources
console.log('\nChecking system resources...');
console.log(`   Platform: ${os.platform()}`);
console.log(`   Memory total: ${Math.round(os.totalmem() / (1024 * 1024))} MB`);
console.log(`   Memory free: ${Math.round(os.freemem() / (1024 * 1024))} MB`);
console.log(`   CPUs: ${os.cpus().length}`);

// Show helpful commands
console.log('\n=== Available Commands ===');
console.log('npm start         - Start the server');
console.log('node fix-all.js   - Fix common issues');
console.log('node debugHelper.js - Troubleshoot file upload issues');
console.log('npm run dev       - Start the server in development mode with auto-restart');

console.log('\nStatus check complete!');
