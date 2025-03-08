/**
 * Masks personally identifiable information in medical reports
 */

// Regular expressions for common PII patterns
const PII_PATTERNS = {
  names: /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?[0-9]{1,3}[-\s]?)?(\([0-9]{1,4}\)|[0-9]{1,4})[-\s]?[0-9]{1,4}[-\s]?[0-9]{1,9}\b/g,
  dates: /\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}\b|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b|\b\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])\b/g,
  idNumbers: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b|\b\d{9}\b|\b[A-Z]{2}[\d]{6}[A-Z]?\b/g,
  addresses: /\b\d+\s+[A-Za-z\s]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?\s*(?:Apt|Unit)?\s*(?:#|No\.?)?\s*\d*\b/gi,
  postalCodes: /\b[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}\b|\b\d{5}(?:-\d{4})?\b/g // UK/US formats
};

/**
 * Mask PII in the given text
 * @param {string} text - The text to mask
 * @return {string} - Text with PII masked
 */
function maskPII(text) {
  if (!text) return text;
  
  let maskedText = text;
  
  // Apply masks
  maskedText = maskedText.replace(PII_PATTERNS.names, '[NAME]');
  maskedText = maskedText.replace(PII_PATTERNS.email, '[EMAIL]');
  maskedText = maskedText.replace(PII_PATTERNS.phone, '[PHONE]');
  maskedText = maskedText.replace(PII_PATTERNS.idNumbers, '[ID_NUMBER]');
  maskedText = maskedText.replace(PII_PATTERNS.addresses, '[ADDRESS]');
  maskedText = maskedText.replace(PII_PATTERNS.dates, '[DATE]');
  maskedText = maskedText.replace(PII_PATTERNS.postalCodes, '[POSTAL_CODE]');
  
  return maskedText;
}

module.exports = { maskPII };
