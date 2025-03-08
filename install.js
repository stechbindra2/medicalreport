const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Directories to ensure exist
const directories = [
  'public',
  'public/css',
  'public/js',
  'public/assets',
  'uploads' // Add uploads directory
];

console.log('=== Medical Report Processor Installation ===\n');

// Create required directories
console.log('Creating directory structure...');
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dir}`);
  } else {
    console.log(`Directory exists: ${dir}`);
  }
});

// Install dependencies
console.log('\nInstalling dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('\nDependencies installed successfully!');
} catch (error) {
  console.error('\nError installing dependencies:', error.message);
  process.exit(1);
}

console.log('\n=== Installation complete ===');
console.log('You can now run the application with: npm start');
