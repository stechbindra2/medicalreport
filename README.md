# Medical Report Processor

A secure system for processing medical reports with PII masking and AI-generated summaries. Supports English language and complies with GDPR.

## Features

- 🔒 **PII Masking** - Anonymize patient data (names, DOB, contacts, etc.) before processing
- 🧠 **AI Integration** - Generates structured summaries from medical reports
- 🇬🇧 **English Support** - Process and generate reports in English
- 🔐 **Secure Data Handling** - Includes encryption and complies with GDPR requirements
- 🌐 **Web Interface** - Modern, professional UI for easy interaction

## Quick Start

1. **Install dependencies**

```bash
npm install
```

2. **Run the setup script**

```bash
npm run setup
```

Follow the prompts to configure your API keys and settings.

3. **Start the web server**

```bash
npm start
```

4. **Open the application**

Open your browser and navigate to http://localhost:3000

## Manual Setup

If you prefer to set up manually:

1. **Install dependencies**

```bash
npm install
```

2. **Create and configure environment variables**

```bash
cp .env.example .env
```

Edit the `.env` file to add:
- Your OpenRouter API key (from https://openrouter.ai)
- Site information
- A secure encryption key (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)

3. **Start the web server**

```bash
node server.js
```

## Usage

### Using the Web Interface

1. Open the application in your browser
2. Enter or paste a medical report into the text area
3. Click "Process Report"
4. View the AI-generated summary and masked report
5. Download or copy the results as needed

### Using the API

```javascript
const { processMedicalReport } = require('./index');

// Process a report
const result = await processMedicalReport('Patient report text...');
console.log(result.summary);
```

### API Endpoint

```
POST /api/process-report
Content-Type: application/json

{
  "reportText": "Your medical report text here..."
}
```

## Security Notes

- All PII is masked before being sent to any AI service
- Original reports are encrypted for storage
- No medical data is retained in the AI service
- API keys should be kept secure and never committed to repositories

## GDPR Compliance

This system helps with GDPR compliance by:
- Anonymizing personal data before processing
- Using encryption for data at rest
- Providing tools to implement data subject rights
- Maintaining minimal necessary data retention

## Development

To run the application in development mode with auto-restart:

```bash
npm run dev
```
