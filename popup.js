// Global state
let isLoading = false;
let currentTabId = null;
let lastAnalysis = null;
let isLocalFile = false;

// DOM Elements
const elements = {
  loading: document.getElementById('loading'),
  summary: document.getElementById('summary'),
  noContent: document.getElementById('no-content'),
  errorMessage: document.getElementById('error-message'),
  errorText: document.querySelector('#error-message p'),
  retryButton: document.getElementById('retry-button'),
  exportButton: document.getElementById('export-button'),
  riskScore: document.getElementById('risk-score'),
  verdict: document.getElementById('verdict'),
  summaryText: document.getElementById('summary-text'),
  keyPoints: document.getElementById('key-points'),
  concerns: document.querySelector('#concerns .concerns-list'),
  dataCollection: document.querySelector('#data-collection .data-list'),
  userRights: document.querySelector('#user-rights .rights-list'),
  lastUpdated: document.getElementById('last-updated')
};

// Set loading state
function setLoadingState(loading) {
  isLoading = loading;
  
  if (loading) {
    // Hide all sections first
    hideAllSections();
    // Show loading state
    elements.loading.classList.remove('hidden');
  } else {
    elements.loading.classList.add('hidden');
  }
}

// Show error message
function showError(message) {
  console.error('Showing error:', message);
  
  // Hide all sections first
  hideAllSections();
  
  // Set the error message
  if (elements.errorText) {
    elements.errorText.textContent = message || 'An unknown error occurred';
  }
  
  // Show the error section
  if (elements.errorMessage) {
    elements.errorMessage.classList.remove('hidden');
  } else {
    console.error('Error message element not found');
  }
  
  // If we have a retry button, ensure it's properly set up
  if (elements.retryButton) {
    elements.retryButton.onclick = analyzeCurrentPage;
  }
}

// Format timestamp to relative time (e.g., "2 minutes ago")
function formatRelativeTime(timestamp) {
  try {
    if (!timestamp) return 'just now';
    
    // Handle string timestamps and numeric timestamps
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return 'recently';
    }
    
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    // Handle future dates (shouldn't happen, but just in case)
    if (seconds < 0) return 'just now';
    
    // Define time intervals in seconds
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };
    
    // Find the largest appropriate interval
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'recently';
  }
}

// Update the last updated timestamp
function updateLastUpdated(timestamp) {
  if (!elements.lastUpdated) {
    console.warn('lastUpdated element not found');
    return;
  }
  
  try {
    // Ensure we have a valid date
    const date = timestamp ? new Date(timestamp) : new Date();
    
    if (isNaN(date.getTime())) {
      console.error('Invalid timestamp in updateLastUpdated:', timestamp);
      elements.lastUpdated.textContent = 'Last analyzed recently';
      return;
    }
    
    const relativeTime = formatRelativeTime(date);
    const formattedDate = date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    elements.lastUpdated.textContent = `Analyzed ${relativeTime}`;
    elements.lastUpdated.setAttribute('title', `Analyzed on ${formattedDate}`);
    
  } catch (error) {
    console.error('Error updating last updated time:', error);
    elements.lastUpdated.textContent = 'Last analyzed recently';
  }
}

// Display the analysis summary
function displaySummary(summary) {
  if (!summary) {
    showNoContent();
    return;
  }

  try {
    // Hide all sections first
    hideAllSections();
    
    // Store the analysis for export
    lastAnalysis = summary;
    
    // Update risk score with fallback
    const riskScore = parseInt(summary.riskScore, 10) || 50; // Default to medium risk if invalid
    const displayScore = Math.min(100, Math.max(0, riskScore)); // Ensure score is between 0-100
    
    if (elements.riskScore) {
      elements.riskScore.textContent = displayScore;
    }
    
    // Update verdict
    if (elements.verdict) {
      let verdictText, verdictClass;
      
      if (displayScore >= 70) {
        verdictText = 'High Risk';
        verdictClass = 'high-risk';
      } else if (displayScore >= 40) {
        verdictText = 'Moderate Risk';
        verdictClass = 'moderate-risk';
      } else {
        verdictText = 'Low Risk';
        verdictClass = 'low-risk';
      }
      
      elements.verdict.textContent = verdictText;
      elements.verdict.className = `verdict ${verdictClass}`;
    }
    
    // Helper function to safely update list content
    const updateList = (element, items, fallbackText) => {
      if (!element) return;
      
      if (Array.isArray(items) && items.length > 0) {
        element.innerHTML = items.map(item => `<li>${item}</li>`).join('');
      } else if (fallbackText) {
        element.innerHTML = `<li>${fallbackText}</li>`;
      } else {
        element.innerHTML = '';
      }
    };
    
    // Update summary text
    if (elements.summaryText) {
      elements.summaryText.textContent = summary.summary || 'No summary available';
    }
    
    // Update lists
    updateList(elements.keyPoints, summary.keyPoints, 'No key points available');
    updateList(elements.concerns, summary.concerns, 'No specific concerns identified');
    updateList(elements.dataCollection, summary.dataCollection, 'No data collection information available');
    updateList(elements.userRights, summary.userRights, 'No user rights information available');
    
    // Update timestamp
    updateLastUpdated(summary.metadata?.analyzedAt || new Date().toISOString());
    
    // Show the summary
    elements.summary.classList.remove('hidden');
    
  } catch (error) {
    console.error('Error displaying summary:', error);
    showError('Error displaying analysis results. Please try again.');
  }
}

// Export analysis as JSON
function exportAnalysis(analysis) {
  if (!analysis) return;
  
  const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(analysis, null, 2))}`;
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', dataStr);
  downloadAnchorNode.setAttribute('download', `terms-analysis-${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

// Analyzes the current page by extracting content and performing local analysis
// @returns {Promise<void>}
async function analyzeCurrentPage() {
  console.log('Starting page analysis...');
  setLoadingState(true);
  
  try {
    // Send a message to the content script to analyze the page
    const response = await chrome.tabs.sendMessage(currentTabId, { action: 'analyzePage' });
    
    if (response && response.analysis) {
      lastAnalysis = response.analysis;
      displaySummary(response.analysis);
      updateLastUpdated(new Date().toISOString());
    } else if (response && response.error) {
      throw new Error(response.error.message || 'Unknown error during analysis');
    } else {
      // No content to analyze
      showNoContent();
    }
  } catch (error) {
    console.error('Error analyzing page:', error);
    
    // Check if the error is because the content script isn't loaded
    if (error.message && error.message.includes('Could not establish connection')) {
      // Try to inject the content script manually
      console.log('Attempting to inject content script...');
      await injectContentScript();
      // Try analyzing again
      await analyzeCurrentPage();
      return;
    } else {
      showError('Failed to analyze page: ' + error.message);
    }
  } finally {
    setLoadingState(false);
  }
}

// Special handling for local files
async function analyzeLocalFile(tab) {
  console.log('Analyzing local file...');
  setLoadingState(true);
  
  try {
    // First, try to execute the content script
    await injectContentScript();
    
    // Then try to analyze the page
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'analyzePage',
      isLocalFile: true
    });
    
    if (response && response.analysis) {
      lastAnalysis = response.analysis;
      displaySummary(response.analysis);
      updateLastUpdated(new Date().toISOString());
    } else {
      showError('No analysis results received');
    }
  } catch (error) {
    console.error('Error analyzing local file:', error);
    showError('Failed to analyze local file: ' + error.message);
  } finally {
    setLoadingState(false);
  }
}

// Inject content script programmatically
async function injectContentScript() {
  console.log('Injecting content script...');
  try {
    // Try to execute the content script
    await chrome.scripting.executeScript({
      target: { tabId: currentTabId },
      files: ['content.js']
    });
    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Error injecting content script:', error);
    throw new Error('Could not inject content script: ' + error.message);
  }
}

// Show the no content message
function showNoContent() {
  hideAllSections();
  elements.noContent.classList.remove('hidden');
}

// Hide all sections
function hideAllSections() {
  elements.loading.classList.add('hidden');
  elements.summary.classList.add('hidden');
  elements.errorMessage.classList.add('hidden');
  elements.noContent.classList.add('hidden');
}

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Popup initialized');
  
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTabId = tab.id;
    
    // Check if we're on a local file
    isLocalFile = tab.url && tab.url.startsWith('file://');
    
    if (isLocalFile) {
      console.log('Local file detected, analyzing...');
      // For local files, we need to use a different approach
      await analyzeLocalFile(tab);
    } else {
      // For web pages, use the standard approach
      await analyzeCurrentPage();
    }
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to initialize popup: ' + error.message);
  }

  try {
    // Add settings button event listener with enhanced error handling
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
      console.log('Settings button found, adding click handler');
      settingsButton.addEventListener('click', () => {
        console.log('Settings button clicked');
        try {
          chrome.runtime.openOptionsPage(() => {
            if (chrome.runtime.lastError) {
              console.error('Error opening options page:', chrome.runtime.lastError);
            } else {
              console.log('Options page opened successfully');
            }
          });
        } catch (error) {
          console.error('Error in settings button click handler:', error);
        }
      });
    } else {
      console.error('Settings button not found in the DOM');
    }
    
    // Initialize buttons with proper error handling
    const initializeButton = (element, handler, buttonName) => {
      if (!element) {
        console.warn(`${buttonName} button not found`);
        return;
      }
      
      try {
        element.addEventListener('click', handler);
      } catch (error) {
        console.error(`Error initializing ${buttonName} button:`, error);
      }
    };
    
    // Set up all interactive elements
    initializeButton(elements.exportButton, () => {
      if (lastAnalysis) {
        exportAnalysis(lastAnalysis);
      }
    }, 'Export');
    initializeButton(elements.retryButton, analyzeCurrentPage, 'Retry');
    
    // Show loading state while we check the current tab
    setLoadingState(true);
    
    // Check if we have a valid tab before analyzing
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      showError('Could not access the current tab. Please refresh the page and try again.');
      return;
    }
    
    // Special handling for chrome://, chrome-extension://, etc.
    if (tab.url && (tab.url.startsWith('chrome://') || 
                    tab.url.startsWith('chrome-extension://') ||
                    tab.url.startsWith('edge://') ||
                    tab.url.startsWith('about:'))) {
      showNoContent();
      return;
    }
    
    // Start the analysis
    await analyzeCurrentPage();
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('An error occurred while initializing the extension. Please try again.');
  }
});
