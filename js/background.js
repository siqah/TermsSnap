import settings from './shared-settings.js';

// Initialize background script
chrome.runtime.onInstalled.addListener(() => {
  console.log('TermsSnap extension installed');
  // Initialize default settings if not set
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      settings.update(settings.getAll());
    }
  });
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHOW_NOTIFICATION') {
    showNotification(request.title, request.message);
  } else if (request.type === 'GET_SETTINGS') {
    sendResponse(settings.getAll());
    return true; // Required for async response
  } else if (request.type === 'UPDATE_SETTINGS') {
    settings.update(request.settings).then(() => {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});

// Show desktop notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title || 'TermsSnap',
    message: message || '',
    priority: 2
  });
}

// Listen for tab updates to check for terms and conditions pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkForTermsPage(tab);
  }
});

// Check if the current page is a terms and conditions page
function checkForTermsPage(tab) {
  const termsKeywords = [
    'terms', 'conditions', 'privacy', 'policy', 'legal', 'agreement',
    't&c', 'tos', 'eula', 'terms-of-service', 'privacy-policy'
  ];
  
  const url = tab.url.toLowerCase();
  const title = tab.title?.toLowerCase() || '';
  
  const isTermsPage = termsKeywords.some(keyword => 
    url.includes(keyword) || title.includes(keyword)
  );
  
  if (isTermsPage) {
    // Notify the user about the terms page
    if (settings.get('showNotifications', true)) {
      showNotification(
        'Terms & Conditions Detected',
        'Click the TermsSnap icon to analyze this page.'
      );
    }
    
    // Update the extension icon to indicate a terms page
    chrome.action.setIcon({
      path: {
        '16': 'icons/icon16-active.png',
        '32': 'icons/icon32-active.png',
        '48': 'icons/icon48-active.png'
      },
      tabId: tab.id
    });
  }
}

// Clear browsing data when auto-clear is enabled
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (result.settings?.privacy?.autoClearHistory) {
      const retentionDays = result.settings.privacy.dataRetentionDays || 90;
      const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
      
      chrome.browsingData.remove({
        since: cutoffTime
      }, {
        appcache: true,
        cache: true,
        cookies: true,
        downloads: true,
        fileSystems: true,
        formData: true,
        history: true,
        indexedDB: true,
        localStorage: true,
        pluginData: true,
        passwords: true,
        serviceWorkers: true,
        webSQL: true
      });
    }
  });
});

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open the popup or show analysis options
  chrome.action.setPopup({
    tabId: tab.id,
    popup: 'popup.html'
  });
});
