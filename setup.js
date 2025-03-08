const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main setup function
async function setupApplication() {
  console.log("\n===== MEDICAL REPORT PROCESSOR SETUP =====\n");
  
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  // Create .env from example if it doesn't exist
  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log("✅ Created .env file from template");
  }
  
  // Read current .env content
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Ask for OpenRouter API key
  console.log("\n-- API Configuration --");
  const apiKey = await prompt("Enter your OpenRouter API key (leave empty to use placeholder): ");
  
  if (apiKey) {
    envContent = envContent.replace(/OPENROUTER_API_KEY=.*/, `OPENROUTER_API_KEY=${apiKey}`);
    console.log("✅ Updated OpenRouter API key");
  } else {
    console.log("⚠️ Using placeholder API key. Remember to update it later.");
  }
  
  // Ask for site information
  console.log("\n-- Site Information --");
  const siteUrl = await prompt("Enter your site URL (leave empty for default): ");
  const siteName = await prompt("Enter your site name (leave empty for default): ");
  
  if (siteUrl) {
    envContent = envContent.replace(/SITE_URL=.*/, `SITE_URL=${siteUrl}`);
    console.log("✅ Updated site URL");
  }
  
  if (siteName) {
    envContent = envContent.replace(/SITE_NAME=.*/, `SITE_NAME=${siteName}`);
    console.log("✅ Updated site name");
  }
  
  // Generate encryption key
  console.log("\n-- Security Configuration --");
  const generateKey = await prompt("Generate a new encryption key? (y/n): ");
  
  if (generateKey.toLowerCase() === 'y') {
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    envContent = envContent.replace(/ENCRYPTION_KEY=.*/, `ENCRYPTION_KEY=${encryptionKey}`);
    console.log("✅ Generated and updated encryption key");
  } else {
    console.log("⚠️ Using placeholder encryption key. This is not secure for production use.");
  }
  
  // Write updated content back to .env
  fs.writeFileSync(envPath, envContent);
  
  console.log("\n✅ Setup complete! You can now run the demo with: node demo.js");
  rl.close();
}

setupApplication();
