/**
 * Installation script for Gemini dependencies
 * Run with: node install-gemini.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('=== Installing Gemini Vision API Dependencies ===');

// Check if the package is already installed
const checkPackage = (packageName) => {
  try {
    require.resolve(packageName);
    return true;
  } catch (e) {
    return false;
  }
};

// Install the Gemini API package
const installGemini = () => {
  if (checkPackage('@google/generative-ai')) {
    console.log('✅ @google/generative-ai is already installed');
    return true;
  }
  
  console.log('Installing @google/generative-ai...');
  try {
    execSync('npm install @google/generative-ai', { stdio: 'inherit' });
    console.log('✅ @google/generative-ai installed successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to install @google/generative-ai:', error.message);
    return false;
  }
};

// Update the .env file with Gemini settings
const updateEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  
  // Check if .env exists
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env file not found. Please run npm run setup first.');
    return false;
  }
  
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Check if GEMINI_API_KEY already exists
  if (envContent.includes('GEMINI_API_KEY=')) {
    console.log('✅ Gemini settings already in .env file');
    return true;
  }
  
  // Add Gemini settings
  const geminiSettings = `
# Gemini API configuration
GEMINI_API_KEY=
GEMINI_MODEL=Gemini 2.0 Flash Experimental
`;

  envContent += geminiSettings;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Added Gemini settings to .env file');
  
  return true;
};

// Main installation process
const main = async () => {
  const geminiInstalled = installGemini();
  const envUpdated = updateEnvFile();
  
  if (geminiInstalled && envUpdated) {
    console.log('\n✅ Gemini setup complete!');
    console.log('Next steps:');
    console.log('1. Edit your .env file to add your Gemini API key');
    console.log('2. Restart your server');
    console.log('3. Try the image analysis feature');
  } else {
    console.log('\n❌ Gemini setup incomplete. Please check the errors above.');
  }
};

// Run the installation
main();
