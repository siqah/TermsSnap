// Settings Features Module
class SettingsFeatures {
  constructor() {
    this.settings = {
      alerts: {
        enabled: true,
        keywords: ['arbitration', 'class action', 'data sharing', 'termination'],
        notifyOnChange: true
      },
      export: {
        format: 'pdf', // 'pdf' or 'html'
        includeSummary: true,
        includeFullText: false
      },
      privacy: {
        dataRetentionDays: 90,
        collectUsageData: true,
        autoClearHistory: false
      },
      language: {
        detectLanguage: true,
        translateTo: 'en',
        supportedLanguages: ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ar']
      },
      analysis: {
        sentimentAnalysis: true,
        riskScoring: true,
        generateSummary: true,
        highlightKeyPoints: true
      }
    };
    this.loadSettings();
  }

  // Load settings from Chrome storage
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }
      this.initializeUI();
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Save settings to Chrome storage
  async saveSettings() {
    try {
      await chrome.storage.sync.set({ settings: this.settings });
      this.showStatus('Settings saved successfully', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showStatus('Error saving settings', 'error');
    }
  }

  // Initialize the UI components
  initializeUI() {
    // Alerts Section
    this.initializeAlertsSection();
    
    // Export Section
    this.initializeExportSection();
    
    // Privacy Section
    this.initializePrivacySection();
    
    // Language Section
    this.initializeLanguageSection();
    
    // Analysis Section
    this.initializeAnalysisSection();
    
    // Add event listeners
    this.addEventListeners();
  }

  // Initialize Alerts Section
  initializeAlertsSection() {
    const alertsEnabled = document.getElementById('alerts-enabled');
    const notifyOnChange = document.getElementById('notify-on-change');
    const keywordsInput = document.getElementById('alert-keywords');
    
    if (alertsEnabled) alertsEnabled.checked = this.settings.alerts.enabled;
    if (notifyOnChange) notifyOnChange.checked = this.settings.alerts.notifyOnChange;
    if (keywordsInput) keywordsInput.value = this.settings.alerts.keywords.join(', ');
  }

  // Initialize Export Section
  initializeExportSection() {
    const exportFormat = document.getElementById('export-format');
    const includeSummary = document.getElementById('include-summary');
    const includeFullText = document.getElementById('include-full-text');
    
    if (exportFormat) exportFormat.value = this.settings.export.format;
    if (includeSummary) includeSummary.checked = this.settings.export.includeSummary;
    if (includeFullText) includeFullText.checked = this.settings.export.includeFullText;
  }

  // Initialize Privacy Section
  initializePrivacySection() {
    const dataRetention = document.getElementById('data-retention');
    const collectUsageData = document.getElementById('collect-usage-data');
    const autoClearHistory = document.getElementById('auto-clear-history');
    
    if (dataRetention) dataRetention.value = this.settings.privacy.dataRetentionDays;
    if (collectUsageData) collectUsageData.checked = this.settings.privacy.collectUsageData;
    if (autoClearHistory) autoClearHistory.checked = this.settings.privacy.autoClearHistory;
  }

  // Initialize Language Section
  initializeLanguageSection() {
    const detectLanguage = document.getElementById('detect-language');
    const translateTo = document.getElementById('translate-to');
    
    if (detectLanguage) detectLanguage.checked = this.settings.language.detectLanguage;
    
    if (translateTo) {
      // Clear existing options
      translateTo.innerHTML = '';
      
      // Add language options
      this.settings.language.supportedLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang;
        option.textContent = this.getLanguageName(lang);
        option.selected = (lang === this.settings.language.translateTo);
        translateTo.appendChild(option);
      });
    }
  }

  // Initialize Analysis Section
  initializeAnalysisSection() {
    const sentimentAnalysis = document.getElementById('sentiment-analysis');
    const riskScoring = document.getElementById('risk-scoring');
    const generateSummary = document.getElementById('generate-summary');
    const highlightKeyPoints = document.getElementById('highlight-key-points');
    
    if (sentimentAnalysis) sentimentAnalysis.checked = this.settings.analysis.sentimentAnalysis;
    if (riskScoring) riskScoring.checked = this.settings.analysis.riskScoring;
    if (generateSummary) generateSummary.checked = this.settings.analysis.generateSummary;
    if (highlightKeyPoints) highlightKeyPoints.checked = this.settings.analysis.highlightKeyPoints;
  }

  // Add event listeners
  addEventListeners() {
    // Alerts
    this.addToggleListener('alerts-enabled', 'alerts.enabled');
    this.addToggleListener('notify-on-change', 'alerts.notifyOnChange');
    this.addInputListener('alert-keywords', 'alerts.keywords', (value) => 
      value.split(',').map(k => k.trim()).filter(k => k.length > 0)
    );
    
    // Export
    this.addSelectListener('export-format', 'export.format');
    this.addToggleListener('include-summary', 'export.includeSummary');
    this.addToggleListener('include-full-text', 'export.includeFullText');
    
    // Privacy
    this.addInputListener('data-retention', 'privacy.dataRetentionDays', parseInt);
    this.addToggleListener('collect-usage-data', 'privacy.collectUsageData');
    this.addToggleListener('auto-clear-history', 'privacy.autoClearHistory');
    
    // Language
    this.addToggleListener('detect-language', 'language.detectLanguage');
    this.addSelectListener('translate-to', 'language.translateTo');
    
    // Analysis
    this.addToggleListener('sentiment-analysis', 'analysis.sentimentAnalysis');
    this.addToggleListener('risk-scoring', 'analysis.riskScoring');
    this.addToggleListener('generate-summary', 'analysis.generateSummary');
    this.addToggleListener('highlight-key-points', 'analysis.highlightKeyPoints');
  }

  // Helper to add toggle listeners
  addToggleListener(id, settingPath) {
    const element = document.getElementById(id);
    if (!element) return;
    
    element.addEventListener('change', (e) => {
      this.setNestedProperty(this.settings, settingPath, e.target.checked);
      this.saveSettings();
    });
  }

  // Helper to add select listeners
  addSelectListener(id, settingPath) {
    const element = document.getElementById(id);
    if (!element) return;
    
    element.addEventListener('change', (e) => {
      this.setNestedProperty(this.settings, settingPath, e.target.value);
      this.saveSettings();
    });
  }

  // Helper to add input listeners
  addInputListener(id, settingPath, transform = (v) => v) {
    const element = document.getElementById(id);
    if (!element) return;
    
    element.addEventListener('change', (e) => {
      this.setNestedProperty(this.settings, settingPath, transform(e.target.value));
      this.saveSettings();
    });
  }

  // Helper to set nested properties
  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  // Helper to get language name from code
  getLanguageName(code) {
    const languages = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ar': 'Arabic'
    };
    
    return languages[code] || code;
  }

  // Show status message
  showStatus(message, type) {
    const statusElement = document.getElementById('status-message');
    if (!statusElement) return;
    
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
    statusElement.style.display = 'block';
    
    setTimeout(() => {
      statusElement.style.display = 'none';
    }, 3000);
  }
}

// Initialize the settings features when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.settingsFeatures = new SettingsFeatures();
});
