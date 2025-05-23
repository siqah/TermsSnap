import settings from './shared-settings.js';

// Settings page functionality
document.addEventListener('DOMContentLoaded', async function() {
  // Back button functionality
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      // Navigate back to the extension popup
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Fallback: Open the popup.html in a new tab if history is not available
        chrome.tabs.create({ url: 'popup.html' });
      }
    });
  }
  
  // Load saved settings
  await loadSettings();
  
  // Add event listeners for all settings
  document.getElementById('dark-mode').addEventListener('change', saveSettings);
  document.getElementById('auto-analyze').addEventListener('change', saveSettings);
  document.getElementById('show-notifications').addEventListener('change', saveSettings);
  document.getElementById('enhanced-privacy').addEventListener('change', saveSettings);
  
  // Add event listeners for alerts section
  document.getElementById('alerts-enabled').addEventListener('change', saveSettings);
  document.getElementById('alert-keywords').addEventListener('change', saveSettings);
  document.getElementById('notify-on-change').addEventListener('change', saveSettings);
  
  // Add event listeners for export settings
  document.getElementById('export-format').addEventListener('change', saveSettings);
  document.getElementById('include-summary').addEventListener('change', saveSettings);
  document.getElementById('include-full-text').addEventListener('change', saveSettings);
  
  // Add event listeners for privacy settings
  document.getElementById('data-retention').addEventListener('change', saveSettings);
  document.getElementById('collect-usage-data').addEventListener('change', saveSettings);
  document.getElementById('auto-clear-history').addEventListener('change', saveSettings);
  
  // Add event listeners for language settings
  document.getElementById('detect-language').addEventListener('change', saveSettings);
  document.getElementById('translate-to').addEventListener('change', saveSettings);
  
  // Add event listeners for analysis settings
  document.getElementById('sentiment-analysis').addEventListener('change', saveSettings);
  document.getElementById('risk-scoring').addEventListener('change', saveSettings);
  document.getElementById('generate-summary').addEventListener('change', saveSettings);
  document.getElementById('highlight-key-points').addEventListener('change', saveSettings);
  
  // Initialize language dropdown
  initializeLanguageDropdown();
});

// Initialize language dropdown with supported languages
function initializeLanguageDropdown() {
  const languageSelect = document.getElementById('translate-to');
  if (!languageSelect) return;
  
  const languages = settings.get('language.supportedLanguages', ['en']);
  const currentLang = settings.get('language.translateTo', 'en');
  
  languageSelect.innerHTML = '';
  
  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = languageNames.of(lang) || lang.toUpperCase();
    option.selected = lang === currentLang;
    languageSelect.appendChild(option);
  });
}

// Load saved settings from shared settings
async function loadSettings() {
  try {
    // Wait for settings to be loaded
    await new Promise(resolve => {
      if (settings) resolve();
      else window.addEventListener('settingsChanged', resolve, { once: true });
    });
    
    const currentSettings = settings.getAll();
    
    // General settings
    document.getElementById('dark-mode').checked = currentSettings.darkMode || false;
    document.getElementById('auto-analyze').checked = currentSettings.autoAnalyze !== undefined ? currentSettings.autoAnalyze : true;
    document.getElementById('show-notifications').checked = currentSettings.showNotifications !== undefined ? currentSettings.showNotifications : true;
    document.getElementById('enhanced-privacy').checked = currentSettings.enhancedPrivacy || false;
    
    // Alerts settings
    document.getElementById('alerts-enabled').checked = currentSettings.alerts?.enabled !== false;
    document.getElementById('alert-keywords').value = Array.isArray(currentSettings.alerts?.keywords) 
      ? currentSettings.alerts.keywords.join(', ')
      : 'arbitration, class action, data sharing, termination';
    document.getElementById('notify-on-change').checked = currentSettings.alerts?.notifyOnChange !== false;
    
    // Export settings
    document.getElementById('export-format').value = currentSettings.export?.format || 'pdf';
    document.getElementById('include-summary').checked = currentSettings.export?.includeSummary !== false;
    document.getElementById('include-full-text').checked = currentSettings.export?.includeFullText || false;
    
    // Privacy settings
    document.getElementById('data-retention').value = currentSettings.privacy?.dataRetentionDays || 90;
    document.getElementById('collect-usage-data').checked = currentSettings.privacy?.collectUsageData !== false;
    document.getElementById('auto-clear-history').checked = currentSettings.privacy?.autoClearHistory || false;
    
    // Language settings
    document.getElementById('detect-language').checked = currentSettings.language?.detectLanguage !== false;
    
    // Analysis settings
    document.getElementById('sentiment-analysis').checked = currentSettings.analysis?.sentimentAnalysis !== false;
    document.getElementById('risk-scoring').checked = currentSettings.analysis?.riskScoring !== false;
    document.getElementById('generate-summary').checked = currentSettings.analysis?.generateSummary !== false;
    document.getElementById('highlight-key-points').checked = currentSettings.analysis?.highlightKeyPoints !== false;
    
    // Apply dark mode if enabled
    if (currentSettings.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
    // Initialize language dropdown
    initializeLanguageDropdown();
    
  } catch (error) {
    console.error('Error loading settings:', error);
    showStatus('Error loading settings. Please refresh the page.', 'error');
  }
}

// Save settings to shared settings
async function saveSettings() {
  try {
    const settingsToUpdate = {
      // General settings
      darkMode: document.getElementById('dark-mode').checked,
      autoAnalyze: document.getElementById('auto-analyze').checked,
      showNotifications: document.getElementById('show-notifications').checked,
      enhancedPrivacy: document.getElementById('enhanced-privacy').checked,
      
      // Alerts settings
      alerts: {
        enabled: document.getElementById('alerts-enabled').checked,
        keywords: document.getElementById('alert-keywords').value
          .split(',')
          .map(k => k.trim())
          .filter(k => k.length > 0),
        notifyOnChange: document.getElementById('notify-on-change').checked
      },
      
      // Export settings
      export: {
        format: document.getElementById('export-format').value,
        includeSummary: document.getElementById('include-summary').checked,
        includeFullText: document.getElementById('include-full-text').checked
      },
      
      // Privacy settings
      privacy: {
        dataRetentionDays: parseInt(document.getElementById('data-retention').value) || 90,
        collectUsageData: document.getElementById('collect-usage-data').checked,
        autoClearHistory: document.getElementById('auto-clear-history').checked
      },
      
      // Language settings
      language: {
        detectLanguage: document.getElementById('detect-language').checked,
        translateTo: document.getElementById('translate-to').value
      },
      
      // Analysis settings
      analysis: {
        sentimentAnalysis: document.getElementById('sentiment-analysis').checked,
        riskScoring: document.getElementById('risk-scoring').checked,
        generateSummary: document.getElementById('generate-summary').checked,
        highlightKeyPoints: document.getElementById('highlight-key-points').checked
      }
    };
    
    // Update settings
    await settings.update(settingsToUpdate);
    
    // Show success message
    showStatus('Settings saved successfully!', 'success');
    
    // Apply dark mode if needed
    if (settingsToUpdate.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    
  } catch (error) {
    console.error('Error saving settings:', error);
    showStatus('Error saving settings. Please try again.', 'error');
  }
}

// Show status message
function showStatus(message, type = 'success') {
  const statusElement = document.getElementById('status-message');
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = 'status-message ' + type;
    statusElement.style.display = 'block';
    
    // Hide the message after 3 seconds
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Listen for settings changes from other parts of the extension
window.addEventListener('settingsChanged', (event) => {
  // Update the UI if settings were changed from another tab
  if (event.detail && event.detail.settings) {
    loadSettings();
  }
});
