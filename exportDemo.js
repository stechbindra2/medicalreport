/**
 * Demo script for testing export functionality
 * Run with: node exportDemo.js
 */
const fs = require('fs');
const path = require('path');
const { processMedicalReport } = require('./index');
const { exportToPDF, exportToDOCX, exportToXLSX, exportToCSV, exportToHTML } = require('./src/exportService');

// Sample medical report for testing
const sampleReport = `
Patient Name: John Doe
Date of Birth: 05/15/1975
Email: john.doe@example.com
Phone: +1 (555) 123-4567
Address: 123 Main St, Anytown, CA 12345

Medical History:
Patient presents with persistent headaches for the past 3 weeks.
Pain is described as throbbing and mainly concentrated in the frontal area.
Patient reports that headaches typically occur in the afternoon and are 
exacerbated by screen time. No previous history of migraines.
BP: 125/85, Temp: 98.6°F, HR: 72 bpm.

Diagnosis:
Tension headaches, likely stress-related

Treatment Plan:
1. Ibuprofen 400mg as needed for pain, not to exceed 3 times daily
2. Reduce screen time and take regular breaks when using computers
3. Stress management techniques discussed
4. Follow-up appointment in 2 weeks if symptoms persist
`;

async function runDemo() {
  console.log('=== Export Formats Demo ===');
  console.log('Processing medical report...');
  
  try {
    // First, process the report
    const result = await processMedicalReport(sampleReport);
    console.log('Report processed successfully!');
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    // Generate exports in different formats
    console.log('\nGenerating exports in various formats...');
    
    // PDF Export with better error handling
    try {
      console.log('Creating PDF export...');
      
      try {
        // Make sure dependencies are installed
        require('pdfkit');
      } catch (e) {
        console.log('Installing PDF dependencies...');
        require('child_process').execSync('npm install pdfkit', { stdio: 'inherit' });
      }
      
      const pdfBuffer = await exportToPDF(result);
      fs.writeFileSync(path.join(exportsDir, 'report-summary.pdf'), pdfBuffer);
      console.log('✓ PDF export successful');
    } catch (error) {
      console.error('✗ PDF export failed:', error.message);
      console.error('  Details:', error.stack);
    }
    
    // DOCX Export
    try {
      console.log('Creating Word (DOCX) export...');
      const docxBuffer = await exportToDOCX(result);
      fs.writeFileSync(path.join(exportsDir, 'report-summary.docx'), docxBuffer);
      console.log('✓ DOCX export successful');
    } catch (error) {
      console.error('✗ Word export failed:', error.message);
    }
    
    // Excel Export
    try {
      console.log('Creating Excel (XLSX) export...');
      const xlsxBuffer = await exportToXLSX(result);
      fs.writeFileSync(path.join(exportsDir, 'report-summary.xlsx'), xlsxBuffer);
      console.log('✓ Excel export successful');
    } catch (error) {
      console.error('✗ Excel export failed:', error.message);
    }
    
    // CSV Export
    try {
      console.log('Creating CSV export...');
      const csvContent = await exportToCSV(result);
      fs.writeFileSync(path.join(exportsDir, 'report-summary.csv'), csvContent);
      console.log('✓ CSV export successful');
    } catch (error) {
      console.error('✗ CSV export failed:', error.message);
    }
    
    // HTML Export
    try {
      console.log('Creating HTML export...');
      const htmlContent = await exportToHTML(result);
      fs.writeFileSync(path.join(exportsDir, 'report-summary.html'), htmlContent);
      console.log('✓ HTML export successful');
    } catch (error) {
      console.error('✗ HTML export failed:', error.message);
    }
    
    console.log('\nExport generation complete!');
    console.log(`Files saved to: ${exportsDir}`);
    
  } catch (error) {
    console.error('Error in export demo:', error);
  }
}

// Run the demo if executed directly
if (require.main === module) {
  runDemo();
}

module.exports = { runDemo };
