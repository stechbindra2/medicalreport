const { processMedicalReport } = require('./index');
const fs = require('fs');
const path = require('path');
const config = require('./config/config');

// Sample medical report with PII
const sampleReport = `
Patient Name: John Smith
Date of Birth: 01/15/1975
Email: john.smith@example.com
Phone: +1 (555) 123-4567
Address: 123 Main Street, Apt 4B, New York, NY 10001

Medical History:
Patient presents with recurring chest pain that has increased in frequency over the past 3 months.
ECG shows slight irregularities. Blood pressure reading: 145/92.
Patient has family history of cardiovascular disease.

Diagnosis:
Hypertension with suspected early-stage coronary artery disease.

Treatment Plan:
1. Prescribed Lisinopril 10mg once daily
2. Recommended dietary changes: reduce sodium, increase potassium-rich foods
3. Advised 30 minutes of moderate exercise 5 days per week
4. Follow-up appointment in 4 weeks
`;

// Check if .env file exists and create it if needed
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');
  
  if (!fs.existsSync(envPath)) {
    console.log("⚠️ .env file not found. Creating one from .env.example...");
    try {
      // Copy the example file
      fs.copyFileSync(envExamplePath, envPath);
      console.log("✅ Created .env file. Please edit it with your actual API keys before running again.");
      return false;
    } catch (error) {
      console.error("❌ Failed to create .env file:", error.message);
      return false;
    }
  }
  return true;
}

// Check if config is properly set up
function checkSetup() {
  // First check if .env file exists
  if (!checkEnvFile()) {
    return { success: false, message: ".env file needs to be configured" };
  }
  
  try {
    const config = require('./config/config');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      message: error.message 
    };
  }
}

// Function to run demo
async function runDemo() {
  console.log("===== MEDICAL REPORT PROCESSOR DEMO =====\n");
  
  // Check setup first
  const setup = checkSetup();
  if (!setup.success) {
    console.error("❌ Setup error:", setup.message);
    console.log("\nTo fix this issue:");
    console.log("1. Open the .env file in your editor");
    console.log("2. Add your OpenRouter API key (get one from https://openrouter.ai)");
    console.log("3. Generate a secure encryption key: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
    console.log("4. Replace the placeholder encryption key with your generated one");
    console.log("5. Run this demo again: node demo.js");
    return;
  }
  
  try {
    // Process text report
    console.log("===== PROCESSING MEDICAL REPORT =====\n");
    console.log("Processing medical report...");
    const reportResult = await processMedicalReport(sampleReport);
    
    console.log("\nORIGINAL REPORT LENGTH:", sampleReport.length);
    console.log("\nMASKED REPORT:");
    console.log(reportResult.maskedReport);
    console.log("\nAI GENERATED SUMMARY:");
    console.log(reportResult.summary);
    console.log("\n✅ Report processing complete!\n");
  } catch (error) {
    console.error("❌ Error in demo:", error.message);
  }
}

module.exports = { runDemo };

// Run the demo if this file is executed directly
if (require.main === module) {
  runDemo();
}
