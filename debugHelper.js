/**
 * Debug helper script to verify file upload configurations
 * Run with: node debugHelper.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('=== File Upload Configuration Checker ===');

// Check directory structure
const requiredDirs = ['uploads', 'public', 'public/js', 'public/css', 'public/assets'];
const rootDir = __dirname;

console.log('\nChecking directories:');
requiredDirs.forEach(dir => {
  const dirPath = path.join(rootDir, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}: Found`);
  } else {
    console.log(`❌ ${dir}: Missing - creating...`);
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`  ✓ Created ${dir}`);
    } catch (err) {
      console.log(`  ✗ Failed to create: ${err.message}`);
    }
  }
});

// Check if multer is installed
console.log('\nChecking dependencies:');
const dependencies = ['multer', 'express', 'pdf-parse', 'xlsx', 'mammoth', 'csv-parser'];
dependencies.forEach(dep => {
  try {
    require(dep);
    console.log(`✅ ${dep}: Installed`);
  } catch (err) {
    console.log(`❌ ${dep}: Missing or not accessible`);
  }
});

// Check temporary directory access
const tempDir = os.tmpdir();
console.log('\nChecking temporary directory:');
console.log(`Temp directory: ${tempDir}`);

try {
  const testFile = path.join(tempDir, `test-${Date.now()}.tmp`);
  fs.writeFileSync(testFile, 'Test data');
  fs.unlinkSync(testFile);
  console.log('✅ Temp directory is writable');
} catch (err) {
  console.log(`❌ Temp directory is not writable: ${err.message}`);
}

// Check environment variables and configs
console.log('\nChecking server configuration:');
console.log(`Server port: ${process.env.PORT || 3000}`);
console.log(`Max upload file size: 10MB`);

// Log helpful instructions
console.log('\n=== Troubleshooting File Upload ===');
console.log('1. Ensure uploads folder exists and has write permissions');
console.log('2. Check browser console for errors during upload');
console.log('3. Try a small test file first (< 1MB)');
console.log('4. Verify all dependencies are installed (npm install)');
console.log('5. Check server logs during upload attempts');

// Check server.js configuration
try {
  const serverPath = path.join(__dirname, 'server.js');
  const serverContent = fs.readFileSync(serverPath, 'utf8');
  
  console.log('\nAnalyzing server.js for upload configuration:');
  
  if (serverContent.includes('multer')) {
    console.log('✅ Multer is being used for file uploads');
    
    if (serverContent.includes('fileFilter')) {
      console.log('✅ File type filtering is configured');
    } else {
      console.log('❌ No file type filtering found - may accept all files');
    }
    
    if (serverContent.includes('limits')) {
      console.log('✅ Upload size limits are configured');
    } else {
      console.log('❌ No upload size limits found - may allow large files');
    }
    
  } else {
    console.log('❌ Multer configuration not found in server.js');
  }
} catch (err) {
  console.log(`Unable to analyze server.js: ${err.message}`);
}

console.log('\nCreating a test file you can use to verify upload functionality:');
const testFilePath = path.join(__dirname, 'test-medical-report.txt');
const testContent = `
Patient Name: Test Patient
Date of Birth: 01/01/1970
Medical Record #: MR12345

Diagnosis: Sample diagnosis for upload testing
Treatment: This is a test file for verifying file upload functionality
`;

try {
  fs.writeFileSync(testFilePath, testContent);
  console.log(`✅ Created test file at: ${testFilePath}`);
} catch (err) {
  console.log(`❌ Failed to create test file: ${err.message}`);
}

console.log('\nFile upload diagnostic check complete!');
