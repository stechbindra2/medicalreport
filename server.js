const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { processMedicalReport } = require('./index');
const { extractTextFromFile } = require('./src/fileProcessorService');
const { exportToPDF, exportToDOCX, exportToXLSX, exportToCSV, exportToHTML } = require('./src/exportService');

const app = express();
// Allow port to be specified via environment variable or use a range of ports if default is busy
const PORT_START = parseInt(process.env.PORT || 3000);
const MAX_PORT_ATTEMPTS = 10; // Try 10 ports before giving up (3000-3009)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Add helper function to check if a file is an image
function isImageFile(file) {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.dicom', '.dcm'];
  return imageExtensions.includes(fileExt) || file.mimetype.startsWith('image/');
}

// Improve file type validation
function checkFileType(file, cb) {
  // File extensions - add support for image files
  const filetypes = /pdf|docx|xlsx|xls|csv|txt|md|jpg|jpeg|png|gif|bmp|tiff|dicom|dcm/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mime type - add support for image mime types
  const mimetypeRegex = /application\/pdf|application\/vnd.openxmlformats|application\/vnd.ms-excel|text\/csv|text\/plain|application\/msword|image\/jpeg|image\/png|image\/gif|image\/bmp|image\/tiff|application\/dicom/;
  const mimetype = mimetypeRegex.test(file.mimetype);
  
  if (mimetype || extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload PDF, DOCX, XLSX, CSV, TXT, or image files (JPEG, PNG, etc).'));
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enable detailed logging for uploads
app.use((req, res, next) => {
  if (req.path === '/api/process-file') {
    console.log(`Received file upload request at ${new Date().toISOString()}`);
  }
  next();
});

// API endpoints
app.post('/api/process-report', async (req, res) => {
  try {
    const { reportText } = req.body;
    
    if (!reportText) {
      return res.status(400).json({ error: 'Report text is required' });
    }
    
    const result = await processMedicalReport(reportText);
    res.json(result);
  } catch (error) {
    console.error('Error processing report:', error);
    res.status(500).json({ error: error.message });
  }
});

// Improved file processing endpoint with better error handling
app.post('/api/process-file', (req, res) => {
  console.log('File upload request received');
  
  upload.single('file')(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred during upload
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      // Some other error occurred
      console.error('Non-Multer error:', err);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
    
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a file.' });
    }
    
    try {
      console.log(`Processing file: ${req.file.originalname} (${req.file.mimetype})`);
      
      // Extract text from the file
      const extractedText = await extractTextFromFile(req.file);
      console.log(`Extracted ${extractedText.length} characters of text`);
      
      if (extractedText.length === 0) {
        throw new Error('No text could be extracted from the file');
      }
      
      // Process the extracted text as a medical report
      const result = await processMedicalReport(extractedText);
      
      // Add file metadata to the result
      result.fileInfo = {
        name: req.file.originalname,
        type: req.file.mimetype,
        size: req.file.size
      };
      
      res.json(result);
    } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

// New endpoint for exporting reports in different formats
app.post('/api/export-report', async (req, res) => {
  try {
    console.log('Received export request');
    const { format, reportData, templateName } = req.body;
    
    if (!reportData || !reportData.summary || !reportData.maskedReport) {
      return res.status(400).json({ error: 'Valid report data is required' });
    }
    
    let result;
    let contentType;
    let fileName;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    console.log(`Requested format: ${format}`);
    
    switch (format) {
      case 'pdf':
        result = await exportToPDF(reportData, templateName);
        contentType = 'application/pdf';
        fileName = `medical-summary-${timestamp}.pdf`;
        break;
        
      case 'docx':
        result = await exportToDOCX(reportData, templateName);
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        fileName = `medical-summary-${timestamp}.docx`;
        break;
        
      case 'xlsx':
        result = await exportToXLSX(reportData, templateName);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        fileName = `medical-summary-${timestamp}.xlsx`;
        break;
        
      case 'csv':
        result = await exportToCSV(reportData, templateName);
        contentType = 'text/csv';
        fileName = `medical-summary-${timestamp}.csv`;
        break;
        
      case 'html':
        result = await exportToHTML(reportData, templateName);
        contentType = 'text/html';
        fileName = `medical-summary-${timestamp}.html`;
        break;
        
      default:
        console.log(`Unsupported format: ${format}`);
        return res.status(400).json({ error: 'Unsupported format' });
    }
    
    // Set headers and send the result
    console.log(`Sending ${format} file with Content-Type: ${contentType}`);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    // Ensure we have content to send
    if (!result) {
      throw new Error('Export function returned empty result');
    }
    
    // Send the file data
    return res.send(result);
  } catch (error) {
    console.error('Error exporting report:', error);
    // Return proper JSON error instead of HTML error page
    return res.status(500).json({ error: error.message || 'An unknown error occurred during export' });
  }
});

// Improved image processing endpoint with better error handling
app.post('/api/process-image', (req, res) => {
  console.log('Image upload request received');
  
  upload.single('image')(req, res, async function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Non-Multer error:', err);
      return res.status(500).json({ error: `Server error: ${err.message}` });
    }
    
    // Check if file was provided
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded. Please select an image file.' });
    }
    
    try {
      // Verify that the file is an image
      if (!isImageFile(req.file)) {
        return res.status(400).json({ error: 'The uploaded file is not a supported image format.' });
      }
      
      console.log(`Processing image: ${req.file.originalname} (${req.file.mimetype})`);
      
      // Get the optional analysis prompt if provided
      const analysisPrompt = req.body.prompt || null;
      
      try {
        // Import the image processor service
        const { processMedicalImage } = require('./src/imageProcessorService');
        
        // Process the image
        const result = await processMedicalImage(req.file, analysisPrompt);
        
        // Add file metadata
        result.fileInfo = {
          name: req.file.originalname,
          type: req.file.mimetype,
          size: req.file.size
        };
        
        return res.json(result);
      } catch (processingError) {
        console.error('Image processing error:', processingError);
        return res.status(500).json({ 
          error: `Failed to analyze image: ${processingError.message}`
        });
      }
    } catch (error) {
      console.error('Error processing image:', error);
      return res.status(500).json({ error: error.message });
    } finally {
      // Optional: Clean up uploaded file after processing
      // This is optional as extractTextFromFile already does cleanup
      // but we might want to handle file cleanup differently for images
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          // Uncomment below if we want to delete the file
          // fs.unlinkSync(req.file.path);
        }
      } catch (err) {
        console.error('File cleanup error:', err);
      }
    }
  });
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handler for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

// Function to attempt starting the server on multiple ports
function startServer(port) {
  app.listen(port)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE' && port < PORT_START + MAX_PORT_ATTEMPTS) {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1);
      } else {
        console.error('Failed to start server:', err.message);
        process.exit(1);
      }
    })
    .on('listening', () => {
      const serverPort = port;
      console.log(`Server is running on http://localhost:${serverPort}`);
      console.log(`To test the export API: curl -X POST -H "Content-Type: application/json" -d '{"format":"html","reportData":{"summary":"test","maskedReport":"test"}}' http://localhost:${serverPort}/api/export-report --output test.html`);
      
      // Create a port info file for clients to know the correct port
      const portInfoPath = path.join(__dirname, 'port-info.json');
      fs.writeFileSync(portInfoPath, JSON.stringify({ port: serverPort }));
      console.log(`Port information saved to: ${portInfoPath}`);
    });
}

// Start the server on the first available port
startServer(PORT_START);
