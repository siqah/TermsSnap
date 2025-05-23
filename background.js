// Default settings
const DEFAULT_SETTINGS = {
  autoDetect: true,
  showNotifications: true,
  theme: 'light',
  analyzeLocalFiles: true
};

// Track active tabs and their analysis state
const tabAnalysisState = new Map();

// Set up listeners
chrome.runtime.onInstalled.addListener(initializeExtension);
chrome.tabs.onUpdated.addListener(handleTabUpdate);

// Listen for tab switching
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      checkIfTermsPage(activeInfo.tabId, tab.url);
    }
  });
});

// Handle extension installation or update
function initializeExtension(details) {
  console.log('Extension installed/updated:', details.reason);
  
  // Set default settings if they don't exist
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  });
}

// Handle tab updates
function handleTabUpdate(tabId, changeInfo, tab) {
  // Only proceed if the tab is fully loaded and has a URL
  if (changeInfo.status === 'complete' && tab.url) {
    console.log(`Tab ${tabId} updated:`, tab.url);
    checkIfTermsPage(tabId, tab.url);
    
    // If this is a local file and we haven't analyzed it yet, set a timeout to analyze it
    if (tab.url.startsWith('file://') && !tabAnalysisState.has(tabId)) {
      console.log('Local file detected, scheduling analysis...');
      tabAnalysisState.set(tabId, { analyzed: false });
      
      // Give the page some time to load completely
      setTimeout(() => {
        analyzeTab(tabId);
      }, 1000);
    }
  }
}

// Analyze a specific tab
function analyzeTab(tabId) {
  console.log(`Analyzing tab ${tabId}...`);
  
  // Send message to content script
  chrome.tabs.sendMessage(
    tabId,
    { action: 'analyzePage' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error analyzing tab:', chrome.runtime.lastError);
        return;
      }
      
      console.log('Analysis response:', response);
      
      if (response && response.analysis) {
        // Update the tab analysis state
        tabAnalysisState.set(tabId, { 
          analyzed: true,
          analysis: response.analysis,
          lastUpdated: new Date().toISOString()
        });
        
        // Update the extension icon
        updateExtensionIcon(tabId, true);
      }
    }
  );
}

async function checkIfTermsPage(tabId, url) {
  try {
    // Skip chrome://, chrome-extension://, etc.
    if (!url.startsWith('http') && !url.startsWith('file://')) {
      updateExtensionIcon(tabId, false);
      return;
    }
    
    console.log(`Checking if page is a terms page: ${url}`);

    // Check if the URL matches common terms page patterns
    const termsPatterns = [
      /\/terms\b/i,
      /\/privacy\b/i,
      /\/tos\b/i,
      /\/conditions\b/i,
      /\/legal\b/i,
      /\/eula\b/i,
      /\/terms-of-service\b/i,
      /\/privacy-policy\b/i
    ];
    
    const isTermsPage = termsPatterns.some(pattern => pattern.test(url));
    
    if (isTermsPage) {
      // Set the extension icon to active
      updateExtensionIcon(tabId, true);
      
      // Show a notification if enabled
      const data = await chrome.storage.sync.get('settings');
      const settings = { ...DEFAULT_SETTINGS, ...data.settings };
      
      if (settings.showNotifications && settings.autoDetect) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'images/icon128.svg',
          title: '📄 Terms & Conditions Detected',
          message: 'Click the extension icon to analyze this page.',
          priority: 1,
          buttons: [{ title: 'Analyze Now' }]
        });
        
        // Handle notification button click
        chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
          if (buttonIndex === 0) {
            chrome.tabs.sendMessage(tabId, { action: 'analyzePage' });
          }
        });
      }
    } else {
      // Reset the icon to inactive
      updateExtensionIcon(tabId, false);
    }
  } catch (error) {
    console.error('Error in checkIfTermsPage:', error);
  }
}

/**
 * Updates the extension icon based on whether the current page is a terms page
 * @param {number} tabId - The ID of the tab to update the icon for
 * @param {boolean} isActive - Whether the current page is a terms page
 */
function updateExtensionIcon(tabId, isActive) {
  try {
    // Determine which icon to use
    const iconPath = isActive 
      ? 'icons/icon48.png' 
      : 'icons/icon48-inactive.png';
    
    // Set the icon for the specific tab
    chrome.action.setIcon({
      path: {
        '16': 'icons/icon16.png',
        '32': 'icons/icon32.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png'
      },
      tabId: tabId
    }).then(() => {
      console.log(`Icon updated for tab ${tabId} (${isActive ? 'active' : 'inactive'})`);
      
      // Update the badge to indicate status
      if (isActive) {
        chrome.action.setBadgeText({ 
          text: '!', 
          tabId 
        });
        chrome.action.setBadgeBackgroundColor({ 
          color: '#4CAF50', 
          tabId 
        });
      } else {
        chrome.action.setBadgeText({ 
          text: '', 
          tabId 
        });
      }
    }).catch(error => {
      console.error('Error updating extension icon:', error);
    });
    
  } catch (error) {
    console.error('Error in updateExtensionIcon:', error);
  }
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background script received message:', { request, sender });
  
  // Handle content script ready notification
  if (request.action === 'contentScriptReady') {
    console.log('Content script ready:', sender.tab ? `Tab ${sender.tab.id}` : 'unknown tab');
    
    // If this is a local file, analyze it
    if (request.isLocalFile) {
      console.log('Local file detected, analyzing...');
      if (sender.tab && sender.tab.id) {
        analyzeTab(sender.tab.id);
      }
    }
    
    sendResponse({ status: 'ready' });
    return true;
  }
  
  // Handle settings requests
  if (request.action === 'getSettings') {
    chrome.storage.sync.get('settings', (data) => {
      const settings = { ...DEFAULT_SETTINGS, ...data.settings };
      sendResponse({ settings });
    });
    return true; // Required for async response
  } else if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  return false;
});

// Handle installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Show welcome page or onboarding
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  } else if (details.reason === 'update') {
    // Handle extension update if needed
    console.log(`Updated from version ${details.previousVersion} to ${chrome.runtime.getManifest().version}`);
  }
});
