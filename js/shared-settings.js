// Shared settings module for the entire application
class SharedSettings {
  constructor() {
    this.settings = {
      // Default settings (will be overridden by saved settings)
      darkMode: false,
      autoAnalyze: true,
      showNotifications: true,
      enhancedPrivacy: false,
      alerts: {
        enabled: true,
        keywords: ['arbitration', 'class action', 'data sharing', 'termination'],
        notifyOnChange: true
      },
      export: {
        format: 'pdf',
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
    
    // Initialize settings
    this.initialize();
  }

  // Initialize settings from storage
  async initialize() {
    try {
      const result = await chrome.storage.sync.get(['settings']);
      if (result.settings) {
        this.settings = { ...this.settings, ...result.settings };
      }
      
      // Set up storage change listener
      chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName === 'sync' && changes.settings) {
          this.settings = { ...this.settings, ...changes.settings.newValue };
          this.dispatchSettingsChanged();
        }
      });
      
      // Dispatch initial settings
      this.dispatchSettingsChanged();
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }
  
  // Get a setting value by path (e.g., 'alerts.enabled')
  get(path, defaultValue = null) {
    return path.split('.').reduce((obj, key) => 
      (obj && obj[key] !== undefined) ? obj[key] : defaultValue, this.settings);
  }
  
  // Get all settings
  getAll() {
    return { ...this.settings };
  }
  
  // Update settings
  async update(updates) {
    this.settings = { ...this.settings, ...updates };
    await chrome.storage.sync.set({ settings: this.settings });
    this.dispatchSettingsChanged();
  }
  
  // Dispatch settings changed event
  dispatchSettingsChanged() {
    const event = new CustomEvent('settingsChanged', { 
      detail: { settings: this.settings }
    });
    window.dispatchEvent(event);
  }
  
  // Check if a keyword is in the alert list
  hasAlertKeyword(text) {
    if (!this.settings.alerts.enabled || !this.settings.alerts.keywords?.length) {
      return false;
    }
    
    const lowerText = text.toLowerCase();
    return this.settings.alerts.keywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }
  
  // Get export settings
  getExportSettings() {
    return { ...this.settings.export };
  }
  
  // Get analysis settings
  getAnalysisSettings() {
    return { ...this.settings.analysis };
  }
  
  // Get language settings
  getLanguageSettings() {
    return { ...this.settings.language };
  }
  
  // Get privacy settings
  getPrivacySettings() {
    return { ...this.settings.privacy };
  }
}

// Create a singleton instance
const settings = new SharedSettings();

// Export the instance
export default settings;
