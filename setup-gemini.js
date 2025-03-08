/**
 * Gemini API Setup Helper
 * This script helps set up the Gemini API for image analysis
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('=== Gemini API Setup Helper ===\n');
console.log('This script will help you configure Google\'s Gemini API for image analysis.\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function setupGemini() {
  // Check if the .env file exists
  const envPath = path.join(__dirname, '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  } else {
    console.log('❌ .env file not found. Please run npm run setup first.');
    rl.close();
    return;
  }
  
  // Check if GEMINI_API_KEY is already set
  if (envContent.includes('GEMINI_API_KEY=') && !envContent.includes('GEMINI_API_KEY=\'\'') && !envContent.includes('GEMINI_API_KEY=""')) {
    console.log('✅ Gemini API key is already configured in your .env file.');
    const shouldContinue = await askQuestion('Do you want to update it? (y/n): ');
    if (shouldContinue.toLowerCase() !== 'y') {
      console.log('Keeping existing configuration.');
      rl.close();
      return;
    }
  }
  
  console.log('\nTo use Google\'s Gemini API for image analysis:');
  console.log('1. Go to https://ai.google.dev/');
  console.log('2. Create or select a project');
  console.log('3. Get an API key from the API credentials section');
  
  const apiKey = await askQuestion('\nEnter your Gemini API key: ');
  
  if (!apiKey.trim()) {
    console.log('❌ No API key provided. Setup cancelled.');
    rl.close();
    return;
  }
  
  // Update or add GEMINI settings in .env file
  let updatedContent = envContent;
  
  if (updatedContent.includes('GEMINI_API_KEY=')) {
    updatedContent = updatedContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${apiKey}`);
  } else {
    updatedContent += `\n# Gemini API configuration\nGEMINI_API_KEY=${apiKey}\nGEMINI_MODEL=Gemini 2.0 Flash Experimental\n`;
  }
  
  // Save the updated .env file
  fs.writeFileSync(envPath, updatedContent);
  
  console.log('\n✅ Gemini API key has been saved to your .env file.');
  console.log('Now you can use the image analysis feature with real AI capabilities!');
  
  rl.close();
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

setupGemini();
