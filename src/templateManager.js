/**
 * Service to manage export templates
 */
const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Ensure templates directory exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

/**
 * Get list of available templates
 * @returns {Array<string>} - List of template names
 */
function listTemplates() {
  try {
    const templates = [];
    
    // Always include default template
    templates.push('default');
    
    // Get directories in templates folder (each represents a template)
    const items = fs.readdirSync(TEMPLATES_DIR, { withFileTypes: true });
    
    items.forEach(item => {
      if (item.isDirectory() && item.name !== 'default') {
        templates.push(item.name);
      }
    });
    
    return templates;
  } catch (error) {
    console.error('Error listing templates:', error);
    return ['default']; // Always return at least the default template
  }
}

/**
 * Get template configuration
 * @param {string} templateName - Name of the template
 * @returns {Object} - Template configuration
 */
function getTemplateConfig(templateName = 'default') {
  const configPath = path.join(TEMPLATES_DIR, templateName, 'config.json');
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return config;
    }
  } catch (error) {
    console.error(`Error reading template config for ${templateName}:`, error);
  }
  
  // Return default config if template config not found
  return {
    name: templateName,
    author: 'System',
    version: '1.0',
    description: 'Default template',
    primaryColor: '#1976d2',
    secondaryColor: '#26a69a',
    fontFamily: 'Arial, sans-serif'
  };
}

/**
 * Get template asset path
 * @param {string} templateName - Template name
 * @param {string} assetName - Asset name
 * @returns {string} - Path to the asset
 */
function getAssetPath(templateName, assetName) {
  const templatePath = path.join(TEMPLATES_DIR, templateName);
  const assetPath = path.join(templatePath, assetName);
  
  // Check if asset exists in the specific template
  if (fs.existsSync(assetPath)) {
    return assetPath;
  }
  
  // Fallback to default template
  const defaultAssetPath = path.join(TEMPLATES_DIR, assetName);
  if (fs.existsSync(defaultAssetPath)) {
    return defaultAssetPath;
  }
  
  // Return null if asset does not exist
  return null;
}

module.exports = {
  listTemplates,
  getTemplateConfig,
  getAssetPath
};
