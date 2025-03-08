const { maskPII } = require('./src/piiMasker');
const { generateSummary } = require('./src/aiService');
const { encrypt, decrypt } = require('./src/encryptionService');
const config = require('./config/config');

/**
 * Process a medical report: mask PII, generate summary, and handle securely
 * @param {string} reportText - The raw medical report text
 * @returns {Promise<Object>} - The processed report with summary
 */
async function processMedicalReport(reportText) {
  try {
    // Step 1: Encrypt the original report for secure storage
    const encryptedOriginal = encrypt(reportText);
    
    // Step 2: Mask PII from the report
    const maskedReport = maskPII(reportText);
    
    // Step 3: Generate summary using AI
    const summary = await generateSummary(maskedReport);
    
    // Step 4: Return processed result (keeping the encrypted original for audit purposes)
    return {
      summary,
      maskedReport,
      encryptedOriginal,
      timestamp: new Date().toISOString(),
      language: 'en'
    };
  } catch (error) {
    console.error('Error processing medical report:', error);
    throw new Error(`Failed to process report: ${error.message}`);
  }
}

module.exports = { processMedicalReport };
