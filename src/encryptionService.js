/**
 * Service for encrypting and decrypting sensitive data
 */

const crypto = require('crypto');
const config = require('../config/config');

// Encryption algorithm
const ALGORITHM = 'aes-256-gcm';

/**
 * Encrypt text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Encrypted data in format: iv:authTag:encryptedData
 */
function encrypt(text) {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(config.ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt text using AES-256-GCM
 * @param {string} encryptedData - Data in format: iv:authTag:encryptedData
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData) {
  if (!encryptedData) return encryptedData;
  
  const [ivHex, authTagHex, encryptedText] = encryptedData.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(config.ENCRYPTION_KEY, 'hex'), iv);
  
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

module.exports = { encrypt, decrypt };
