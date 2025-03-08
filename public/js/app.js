// DOM References
const medicalReportInput = document.getElementById('medicalReport');
const processReportBtn = document.getElementById('processReport');
const pasteExampleBtn = document.getElementById('pasteExample');
const clearReportBtn = document.getElementById('clearReport');
const fileInput = document.getElementById('reportFile');
const dropArea = document.getElementById('dropArea');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const removeFileBtn = document.getElementById('removeFile');
const processFileBtn = document.getElementById('processFile');
const inputTabBtns = document.querySelectorAll('.input-tab-btn');
const inputSections = document.querySelectorAll('.input-section');
const loadingIndicator = document.getElementById('loadingIndicator');
const resultContainer = document.getElementById('resultContainer');
const summaryText = document.getElementById('summaryText');
const maskedText = document.getElementById('maskedText');
const copyResultBtn = document.getElementById('copyResult');
const downloadResultBtn = document.getElementById('downloadResult');
const newReportBtn = document.getElementById('newReport');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Additional DOM References
const toggleFormatMenuBtn = document.getElementById('toggleFormatMenu');
const formatMenu = document.getElementById('formatMenu');
const formatOptions = document.querySelectorAll('.format-option');

// Additional DOM References for image processing
const imageInput = document.getElementById('imageFile');
const imageDropArea = document.getElementById('imageDropArea');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreview = document.getElementById('imagePreview');
const removeImageBtn = document.getElementById('removeImage');
const processImageBtn = document.getElementById('processImage');
const analysisPromptInput = document.getElementById('analysisPrompt');
const imageTab = document.querySelector('.image-tab');
const analysisImage = document.getElementById('analysisImage');
const imageAnalysisText = document.getElementById('imageAnalysisText');

// Global state
let currentTab = 'summary';
let currentResult = null;
let currentInputMode = 'text';
let selectedFile = null;
let selectedImage = null;

// Sample medical report for the "Paste Example" button
const sampleReport = `Patient Name: Jane Smith
Date of Birth: 03/24/1968
Email: jsmith@emailprovider.com
Phone: +1 (555) 987-6543
Address: 456 Oak Avenue, Apt 7C, Chicago, IL 60601

Medical History:
Patient presents with persistent joint pain in knees and hands for the past 8 months.
Blood tests show elevated rheumatoid factor (RF) at 38 IU/mL and anti-CCP antibodies positive.
ESR: 42 mm/hr, CRP: 3.8 mg/dL.
X-rays of hands show early erosive changes in MCP joints bilaterally.

Diagnosis:
Rheumatoid Arthritis, seropositive, moderate activity (DAS28 score: 4.6)

Treatment Plan:
1. Methotrexate 15mg weekly with folic acid 1mg daily (except methotrexate day)
2. Prednisone 10mg daily with 2-month taper to 5mg
3. NSAIDs as needed for breakthrough pain
4. Physical therapy referral for joint protection techniques
5. Follow-up appointment in 6 weeks to assess medication efficacy and tolerance
`;

// Initialize the application
function init() {
  console.log("Initializing application...");
  attachEventListeners();
  setupFileUpload();
  
  // Make sure the initial mode is correctly displayed
  const activeTabBtn = document.querySelector('.input-tab-btn.active');
  if (activeTabBtn) {
    currentInputMode = activeTabBtn.dataset.input;
    console.log(`Initial mode: ${currentInputMode}`);
    
    // Find the active input section by ID
    const activeSection = document.querySelector(`#${currentInputMode}InputSection`);
    if (activeSection) {
      inputSections.forEach(section => section.classList.remove('active'));
      activeSection.classList.add('active');
    } else {
      console.error(`Could not find active section for mode: ${currentInputMode}`);
    }
  }
}

// Set up event listeners
function attachEventListeners() {
  // Text mode listeners
  if (processReportBtn) processReportBtn.addEventListener('click', processReport);
  if (pasteExampleBtn) pasteExampleBtn.addEventListener('click', pasteExample);
  if (clearReportBtn) clearReportBtn.addEventListener('click', clearReport);
  
  // File mode listeners
  if (fileInput) fileInput.addEventListener('change', handleFileSelect);
  if (processFileBtn) processFileBtn.addEventListener('click', processFile);
  if (removeFileBtn) removeFileBtn.addEventListener('click', removeFile);
  
  // Input tab switching
  inputTabBtns.forEach(button => {
    button.addEventListener('click', switchInputMode);
  });
  
  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener('click', switchTab);
  });
  
  // Result actions
  if (copyResultBtn) copyResultBtn.addEventListener('click', copyResult);
  if (downloadResultBtn) downloadResultBtn.addEventListener('click', downloadResult);
  if (newReportBtn) newReportBtn.addEventListener('click', resetForm);
  
  // Format menu with improved handling
  if (toggleFormatMenuBtn) {
    toggleFormatMenuBtn.addEventListener('click', toggleFormatMenu);
    console.log("Format menu toggle button listener attached");
  } else {
    console.warn("Format menu toggle button not found");
  }
  
  if (formatOptions.length > 0) {
    formatOptions.forEach(option => {
      option.addEventListener('click', handleFormatSelection);
    });
    console.log(`${formatOptions.length} format option listeners attached`);
  } else {
    console.warn("No format options found");
  }
  
  // Close format menu when clicking outside using capture phase for better reliability
  document.addEventListener('click', (e) => {
    if (formatMenu && !formatMenu.classList.contains('hidden') && 
        !e.target.closest('#toggleFormatMenu') && 
        !e.target.closest('#formatMenu')) {
      console.log("Clicked outside menu - hiding format menu");
      formatMenu.classList.add('hidden');
    }
  }, true);
  
  // Image mode listeners
  if (imageInput) imageInput.addEventListener('change', handleImageSelect);
  if (processImageBtn) processImageBtn.addEventListener('click', processImage);
  if (removeImageBtn) removeImageBtn.addEventListener('click', removeImage);
}

// Set up file upload functionality
function setupFileUpload() {
  if (!dropArea) return;
  
  // Setup drag and drop
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });
  
  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
  });
  
  dropArea.addEventListener('drop', handleDrop, false);
  dropArea.addEventListener('click', () => fileInput.click());
  
  // Setup image upload drag and drop
  if (imageDropArea) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      imageDropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      imageDropArea.addEventListener(eventName, function() {
        imageDropArea.classList.add('dragover');
      }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      imageDropArea.addEventListener(eventName, function() {
        imageDropArea.classList.remove('dragover');
      }, false);
    });
    
    imageDropArea.addEventListener('drop', handleImageDrop, false);
    imageDropArea.addEventListener('click', () => imageInput.click());
  }
}

// Prevent default drag behaviors
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop area when dragging over it
function highlight() {
  dropArea.classList.add('dragover');
}

// Remove highlight when dragging stops
function unhighlight() {
  dropArea.classList.remove('dragover');
}

// Handle dropped files
function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    fileInput.files = files;
    handleFileSelect();
  }
}

// Handle dropped images
function handleImageDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    imageInput.files = files;
    handleImageSelect();
  }
}

// Handle file selection with improved validation
function handleFileSelect() {
  if (fileInput.files.length > 0) {
    selectedFile = fileInput.files[0];
    
    console.log(`Selected file: ${selectedFile.name} (${selectedFile.type}, ${selectedFile.size} bytes)`);
    
    fileName.textContent = selectedFile.name;
    fileInfo.classList.remove('hidden');
    processFileBtn.disabled = false;
    
    // Get file extension
    const fileExt = selectedFile.name.split('.').pop().toLowerCase();
    
    // Validate file type
    const validExts = ['pdf', 'docx', 'xlsx', 'xls', 'csv', 'txt'];
    if (!validExts.includes(fileExt)) {
      alert(`Unsupported file type: .${fileExt}\nPlease upload PDF, DOCX, XLSX, CSV or TXT.`);
      removeFile();
      return;
    }
    
    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB.');
      removeFile();
      return;
    }
  }
}

// Handle image selection with validation and preview
function handleImageSelect() {
  if (imageInput.files.length > 0) {
    selectedImage = imageInput.files[0];
    
    console.log(`Selected image: ${selectedImage.name} (${selectedImage.type}, ${selectedImage.size} bytes)`);
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'application/dicom'];
    if (!validImageTypes.includes(selectedImage.type)) {
      alert('Please select a valid image file (JPEG, PNG, GIF, BMP, TIFF, or DICOM)');
      removeImage();
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedImage.size > 5 * 1024 * 1024) {
      alert('Image too large. Maximum size is 5MB.');
      removeImage();
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      imagePreview.src = e.target.result;
      imagePreviewContainer.classList.remove('hidden');
      imageDropArea.classList.add('hidden');
    };
    reader.readAsDataURL(selectedImage);
    
    processImageBtn.disabled = false;
  }
}

// Remove selected file
function removeFile() {
  fileInput.value = '';
  selectedFile = null;
  fileName.textContent = 'No file selected';
  fileInfo.classList.add('hidden');
  processFileBtn.disabled = true;
}

// Remove selected image
function removeImage() {
  imageInput.value = '';
  selectedImage = null;
  imagePreview.src = '';
  imagePreviewContainer.classList.add('hidden');
  imageDropArea.classList.remove('hidden');
  processImageBtn.disabled = true;
}

// Switch between text input and file upload
function switchInputMode(e) {
  const mode = e.target.dataset.input;
  
  if (!mode) return;
  
  console.log(`Switching to mode: ${mode}`);
  
  // Update active tab
  inputTabBtns.forEach(button => {
    button.classList.toggle('active', button.dataset.input === mode);
  });
  
  // Update active section
  inputSections.forEach(section => {
    const isActive = section.id === `${mode}InputSection`;
    section.classList.toggle('active', isActive);
  });
  
  // Update current mode
  currentInputMode = mode;
}

// Process uploaded file
async function processFile() {
  if (!selectedFile) {
    alert('Please select a file to process.');
    return;
  }
  
  try {
    // Show loading indicator
    showLoading(true);
    
    console.log(`Preparing to upload: ${selectedFile.name} (${selectedFile.type})`);
    
    // Create form data
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Send the file to the API
    console.log('Sending file to server...');
    
    const response = await fetch('/api/process-file', {
      method: 'POST',
      body: formData
    });
    
    console.log('Response status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `Server error (${response.status})`);
    }
    
    // Store and display results
    currentResult = data;
    displayResults(data);
    
    console.log('File processed successfully');
  } catch (error) {
    console.error('Error processing file:', error);
    alert(`Failed to process file: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Process the report (text mode)
async function processReport() {
  const reportText = medicalReportInput.value.trim();
  
  if (!reportText) {
    alert('Please enter a medical report to process.');
    return;
  }
  
  try {
    // Show loading indicator
    showLoading(true);
    
    // Send the report to the API
    const response = await fetch('/api/process-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reportText }),
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }
    
    // Parse the result
    const result = await response.json();
    currentResult = result;
    
    // Display the results
    displayResults(result);
  } catch (error) {
    console.error('Error processing report:', error);
    alert(`Failed to process report: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Display the processing results
function displayResults(result) {
  // Set the text content
  summaryText.textContent = result.summary;
  maskedText.textContent = result.maskedReport;
  
  // Show the result container
  resultContainer.classList.remove('hidden');
  
  // Hide the input sections
  inputSections.forEach(section => section.classList.add('hidden'));
}

// Reset the form to process a new report
function resetForm() {
  // Clear the inputs
  medicalReportInput.value = '';
  removeFile();
  
  // Hide the results
  resultContainer.classList.add('hidden');
  
  // Show the appropriate input section based on current mode
  const activeSection = document.getElementById(`${currentInputMode}InputSection`);
  if (activeSection) {
    activeSection.classList.add('active');
  }
  
  // Reset global state
  currentResult = null;
}

// Show or hide the loading indicator
function showLoading(isLoading) {
  if (isLoading) {
    loadingIndicator.classList.remove('hidden');
    if (processReportBtn) processReportBtn.disabled = true;
    if (processFileBtn) processFileBtn.disabled = true;
  } else {
    loadingIndicator.classList.add('hidden');
    if (processReportBtn) processReportBtn.disabled = false;
    if (processFileBtn) processFileBtn.disabled = false;
  }
}

// Insert the sample report
function pasteExample() {
  medicalReportInput.value = sampleReport;
}

// Clear the report text
function clearReport() {
  medicalReportInput.value = '';
}

// Switch between tabs
function switchTab(e) {
  const tabId = e.target.dataset.tab;
  
  if (!tabId) return;
  
  // Update active tab button
  tabButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.tab === tabId);
  });
  
  // Update active tab pane
  tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === tabId);
  });
  
  // Update current tab
  currentTab = tabId;
}

// Copy the current result to clipboard
function copyResult() {
  if (!currentResult) return;
  
  const textToCopy = currentTab === 'summary' 
    ? currentResult.summary 
    : currentResult.maskedReport;
    
  navigator.clipboard.writeText(textToCopy)
    .then(() => {
      // Show a brief success message
      const originalText = copyResultBtn.textContent;
      copyResultBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        copyResultBtn.innerHTML = originalText;
      }, 2000);
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy to clipboard');
    });
}

// Download the result as a text file
function downloadResult() {
  if (!currentResult) return;
  
  const textToDownload = currentTab === 'summary' 
    ? currentResult.summary 
    : currentResult.maskedReport;
  
  const filename = currentTab === 'summary' 
    ? 'medical-report-summary.txt' 
    : 'masked-medical-report.txt';
  
  // Create a blob and download link
  const blob = new Blob([textToDownload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Toggle format selection menu - Fixed for reliable display
function toggleFormatMenu(e) {
  e.preventDefault();
  e.stopPropagation();
  
  // Force display state rather than toggling classes
  if (formatMenu.classList.contains('hidden')) {
    // Show the menu
    formatMenu.classList.remove('hidden');
    console.log("Format menu should now be visible");
    
    // Set inline styles to ensure visibility
    formatMenu.style.display = 'block';
    formatMenu.style.visibility = 'visible';
    formatMenu.style.opacity = '1';
    
    // Position check - ensure it's positioned correctly
    const btnRect = toggleFormatMenuBtn.getBoundingClientRect();
    formatMenu.style.top = (btnRect.height + 5) + 'px';
    formatMenu.style.left = '0';
    
    // Add safety timeout to remove hidden class again (backup)
    setTimeout(() => {
      if (formatMenu.classList.contains('hidden')) {
        formatMenu.classList.remove('hidden');
      }
    }, 50);
  } else {
    // Hide the menu
    formatMenu.classList.add('hidden');
    formatMenu.style.display = 'none';
    console.log("Format menu hidden");
  }
}

// Handle format selection with improved error handling and response type detection
async function handleFormatSelection(e) {
  e.preventDefault();
  e.stopPropagation();
  
  const format = e.currentTarget.dataset.format;
  const formatName = e.currentTarget.textContent.trim();
  formatMenu.classList.add('hidden');
  
  console.log(`Selected format: ${format} (${formatName})`);
  
  if (!currentResult) {
    alert('No report data available for download');
    return;
  }
  
  // Show immediate feedback on the download button
  const originalBtnText = toggleFormatMenuBtn.innerHTML;
  toggleFormatMenuBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Preparing ${formatName}...`;
  
  try {
    // For simple text download, use browser download
    if (format === 'txt') {
      downloadAsTextFile();
      toggleFormatMenuBtn.innerHTML = `<i class="fas fa-check"></i> Downloaded!`;
      setTimeout(() => {
        toggleFormatMenuBtn.innerHTML = originalBtnText;
      }, 2000);
      return;
    }
    
    // Show loading while generating the file
    showLoading(true);
    
    console.log('Sending export request to server...');
    
    // Use absolute path to ensure we're hitting the correct endpoint
    // This ensures we use the exact same origin as the current page
    const apiUrl = `/api/export-report`;
    console.log(`Using API URL: ${apiUrl}`);
    
    // For other formats, request from server
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*' // Accept any content type in response
      },
      body: JSON.stringify({
        format,
        reportData: {
          summary: currentResult.summary,
          maskedReport: currentResult.maskedReport
        },
        templateName: 'default'
      }),
    });
    
    console.log('Server response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    
    if (!response.ok) {
      // FIXED: Only attempt to read the response once
      let errorMessage;
      const contentType = response.headers.get('Content-Type');
      
      if (contentType && contentType.includes('application/json')) {
        // It's JSON, parse as JSON
        const errorData = await response.json();
        errorMessage = errorData.error || `Error: ${response.statusText}`;
      } else {
        // Just use status text if not JSON
        errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    // Get response as blob for any file type
    const blob = await response.blob();
    console.log(`Received file of type: ${blob.type}, size: ${blob.size} bytes`);
    
    const url = window.URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `medical-summary-${timestamp}.${format}`;
    
    // Create download link
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    // Show success feedback
    toggleFormatMenuBtn.innerHTML = `<i class="fas fa-check"></i> Downloaded!`;
    setTimeout(() => {
      toggleFormatMenuBtn.innerHTML = originalBtnText;
    }, 2000);
    
  } catch (error) {
    console.error('Error downloading file:', error);
    alert(`Failed to download file: ${error.message}`);
    toggleFormatMenuBtn.innerHTML = originalBtnText;
  } finally {
    showLoading(false);
  }
}

// Simple text download (using browser-side functionality)
function downloadAsTextFile() {
  if (!currentResult) return;
  
  const textToDownload = currentTab === 'summary' 
    ? currentResult.summary 
    : currentResult.maskedReport;
  
  const fileName = currentTab === 'summary' 
    ? 'medical-report-summary.txt' 
    : 'masked-medical-report.txt';
  
  // Create a blob and download link
  const blob = new Blob([textToDownload], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  
  // Trigger the download
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Process the image for analysis
async function processImage() {
  if (!selectedImage) {
    alert('Please select an image to analyze.');
    return;
  }
  
  try {
    // Show loading indicator
    showLoading(true);
    
    // Create form data
    const formData = new FormData();
    formData.append('image', selectedImage);
    
    // Add analysis prompt if provided
    const promptText = analysisPromptInput ? analysisPromptInput.value.trim() : '';
    if (promptText) {
      formData.append('prompt', promptText);
    }
    
    // Send the image to the API
    console.log('Sending image for analysis...');
    const apiUrl = '/api/process-image';
    console.log(`Using API URL: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData
    });
    
    console.log('Server response status:', response.status);
    console.log('Content-Type:', response.headers.get('Content-Type'));
    
    if (!response.ok) {
      let errorMessage = `Server Error: ${response.status} ${response.statusText}`;
      
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Received analysis data:', data);
    
    // Show the image analysis tab
    if (imageTab) {
      imageTab.classList.remove('hidden');
    }
    
    // Set the analyzed image
    if (analysisImage) {
      analysisImage.src = URL.createObjectURL(selectedImage);
    }
    
    // Set the analysis text with proper formatting
    if (imageAnalysisText) {
      // Create properly formatted HTML from the markdown
      const formattedText = data.analysis
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Fix the bullet point formatting issues
        .replace(/- (.*$)/gm, '<li>$1</li>')
        .replace(/\d\. (.*$)/gm, '<li>$1</li>');
      
      // Wrap lists in proper ul tags
      let finalHTML = formattedText;
      // Find consecutive li elements and wrap them in ul
      finalHTML = finalHTML.replace(/(<li>.*?<\/li>)\s*(<li>.*?<\/li>)/gs, '<ul>$1$2</ul>');
      // Fix any remaining li elements that aren't in ul
      finalHTML = finalHTML.replace(/(<li>.*?<\/li>)(?!\s*<\/ul>)/g, '<ul>$1</ul>');
      
      // Assign the formatted HTML
      imageAnalysisText.innerHTML = finalHTML;
    }
    
    // Store result
    currentResult = {
      ...data,
      summary: data.analysis, // Add summary for compatibility with other features
      maskedReport: 'Image analysis - no masked report', // Placeholder for masked report
      imageUrl: URL.createObjectURL(selectedImage)
    };
    
    // Show the result container
    resultContainer.classList.remove('hidden');
    
    // Hide the input sections
    inputSections.forEach(section => section.classList.add('hidden'));
    
    // Switch to image analysis tab
    switchToImageTab();
    
  } catch (error) {
    console.error('Error analyzing image:', error);
    alert(`Failed to analyze image: ${error.message}`);
  } finally {
    showLoading(false);
  }
}

// Switch to image analysis tab
function switchToImageTab() {
  // Find the image analysis tab button
  const imageTabBtn = document.querySelector('.tab-btn[data-tab="image-analysis"]');
  if (imageTabBtn) {
    tabButtons.forEach(button => {
      button.classList.toggle('active', button === imageTabBtn);
    });
    
    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === 'image-analysis');
    });
    
    currentTab = 'image-analysis';
  }
}

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM content loaded, initializing app...");
  
  // Verify key elements exist
  const elements = [
    { name: "toggleFormatMenuBtn", element: toggleFormatMenuBtn },
    { name: "formatMenu", element: formatMenu },
    { name: "formatOptions", count: formatOptions.length }
  ];
  
  elements.forEach(item => {
    if (item.element) {
      console.log(`✓ Element '${item.name}' found`);
    } else if (item.count !== undefined) {
      console.log(`✓ Found ${item.count} ${item.name}`);
    } else {
      console.warn(`✗ Element '${item.name}' not found!`);
    }
  });
  
  // Add additional format menu initialization
  if (formatMenu && toggleFormatMenuBtn) {
    // Ensure format menu is properly initialized
    formatMenu.classList.add('hidden');
    
    // Debug click handlers
    toggleFormatMenuBtn.addEventListener('click', function(e) {
      console.log("Format menu button clicked");
      if (formatMenu.classList.contains('hidden')) {
        console.log("Menu is hidden, will try to show it");
      } else {
        console.log("Menu is visible, will hide it");
      }
    }, true);
    
    // Add diagnostic info
    console.log("Format menu setup complete");
  }
  
  init();
});