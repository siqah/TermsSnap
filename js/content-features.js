import settings from './shared-settings.js';

class ContentFeatures {
  constructor() {
    this.initialize();
  }

  async initialize() {
    // Wait for settings to be loaded
    await new Promise(resolve => {
      if (settings) resolve();
      else window.addEventListener('settingsChanged', resolve, { once: true });
    });

    // Apply initial settings
    this.applySettings();

    // Listen for settings changes
    window.addEventListener('settingsChanged', () => this.applySettings());

    // Start content analysis if auto-analyze is enabled
    if (settings.get('autoAnalyze', true)) {
      this.analyzePage();
    }
  }

  applySettings() {
    const currentSettings = settings.getAll();
    
    // Apply dark mode to the page if enabled
    if (currentSettings.darkMode) {
      document.documentElement.setAttribute('data-termsnap-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-termsnap-theme');
    }
    
    // Apply other content-related settings
    this.applyAnalysisSettings(currentSettings.analysis);
    this.applyAlertMonitoring(currentSettings.alerts);
  }

  applyAnalysisSettings(analysisSettings = {}) {
    // Apply analysis settings to the page
    if (analysisSettings.highlightKeyPoints) {
      this.highlightKeyPoints();
    }
    
    // Other analysis settings can be applied here
  }

  applyAlertMonitoring(alertSettings = {}) {
    if (alertSettings.enabled && alertSettings.keywords?.length) {
      this.monitorForKeywords(alertSettings.keywords);
    }
  }

  async analyzePage() {
    try {
      const analysisSettings = settings.get('analysis', {});
      const content = this.getPageContent();
      
      // Perform analysis based on settings
      if (analysisSettings.sentimentAnalysis) {
        await this.performSentimentAnalysis(content);
      }
      
      if (analysisSettings.riskScoring) {
        await this.calculateRiskScores(content);
      }
      
      if (analysisSettings.generateSummary) {
        await this.generateSummary(content);
      }
      
    } catch (error) {
      console.error('Error analyzing page:', error);
    }
  }

  getPageContent() {
    // Get the main content of the page, excluding navigation and other non-content elements
    const selectors = [
      'main',
      'article',
      '.main-content',
      '#content',
      '.content',
      'body'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return element.innerText;
      }
    }
    
    return document.body.innerText;
  }

  highlightKeyPoints() {
    // Implementation for highlighting key points in the document
    const keywords = [
      'privacy', 'data', 'collection', 'use', 'sharing', 'security',
      'cookies', 'tracking', 'rights', 'consent', 'opt-out', 'gdpr',
      'ccpa', 'compliance', 'third-party', 'service providers',
      'personal information', 'sensitive data', 'retention', 'deletion'
    ];

    const regex = new RegExp(`\\b(${keywords.join('|')})\\`, 'gi');
    
    // This is a simple implementation - in a real app, you'd want to be more sophisticated
    // to avoid modifying the DOM too much and breaking the page
    document.body.innerHTML = document.body.innerHTML.replace(
      regex,
      '<span class="termsnap-highlight" style="background-color: #fff3cd; padding: 0 2px; border-radius: 3px;">$&</span>'
    );
  }

  monitorForKeywords(keywords) {
    // Implementation for monitoring the page for specific keywords
    const text = document.body.innerText.toLowerCase();
    const foundKeywords = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      this.showKeywordAlert(foundKeywords);
    }
  }

  showKeywordAlert(keywords) {
    // Show a notification for found keywords
    if (settings.get('showNotifications', true)) {
      chrome.runtime.sendMessage({
        type: 'SHOW_NOTIFICATION',
        title: 'Important Terms Found',
        message: `The page contains important terms: ${keywords.join(', ')}`
      });
    }
  }

  async performSentimentAnalysis(content) {
    // Implementation for sentiment analysis
    // This would typically call an API or use a local library
    console.log('Performing sentiment analysis on content');
  }

  async calculateRiskScores(content) {
    // Implementation for risk scoring
    console.log('Calculating risk scores for content');
  }

  async generateSummary(content) {
    // Implementation for generating a summary
    console.log('Generating summary of content');
  }
}

// Initialize the content features when the script loads
const contentFeatures = new ContentFeatures();
