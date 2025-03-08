/**
 * Service for processing different file types and extracting text
 */

const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const mammoth = require('mammoth');
const csv = require('csv-parser');
const { Readable } = require('stream');

/**
 * Extract text content from various file formats
 * @param {Object} file - The uploaded file object (from multer)
 * @returns {Promise<string>} - Extracted text content
 */
async function extractTextFromFile(file) {
  try {
    const filePath = file.path;
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    switch (fileExt) {
      case '.pdf':
        return await extractFromPDF(filePath);
      case '.docx':
        return await extractFromDOCX(filePath);
      case '.xlsx':
      case '.xls':
        return await extractFromExcel(filePath);
      case '.csv':
        return await extractFromCSV(filePath);
      case '.txt':
      case '.md':
        return await extractFromTextFile(filePath);
      default:
        throw new Error(`Unsupported file type: ${fileExt}`);
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to process ${file.originalname}: ${error.message}`);
  } finally {
    // Clean up: Remove the temporary file
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error('Error deleting temporary file:', error);
    }
  }
}

/**
 * Extract text from PDF files
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromPDF(filePath) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
}

/**
 * Extract text from DOCX files
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromDOCX(filePath) {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Extract text from Excel files
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  let result = [];
  
  // Iterate through each sheet
  workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Add sheet name as header
    result.push(`--- Sheet: ${sheetName} ---`);
    
    // Process each row
    jsonData.forEach(row => {
      if (row && row.length > 0) {
        result.push(row.join('\t'));
      }
    });
    
    result.push('\n');
  });
  
  return result.join('\n');
}

/**
 * Extract text from CSV files
 * @param {string} filePath - Path to the CSV file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromCSV(filePath) {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const results = [];
  
  return new Promise((resolve, reject) => {
    const parser = csv();
    const readableStream = Readable.from([fileContent]);
    
    readableStream.pipe(parser)
      .on('data', (data) => results.push(JSON.stringify(data)))
      .on('end', () => resolve(results.join('\n')))
      .on('error', (err) => reject(err));
  });
}

/**
 * Extract text from plain text files
 * @param {string} filePath - Path to the text file
 * @returns {Promise<string>} - Extracted text
 */
async function extractFromTextFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  return content;
}

module.exports = { extractTextFromFile };
