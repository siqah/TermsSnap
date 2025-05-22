// Default settings
const DEFAULT_SETTINGS = {
  autoDetect: true,
  showNotifications: true,
  analysisMethod: 'local', // 'local' or 'api'
  apiEndpoint: ''
};

// Handle installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('TermsSnap extension installed');
  
  // Set default settings if not already set
  chrome.storage.sync.get('settings', (data) => {
    if (!data.settings) {
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  });
});

// Listen for tab updates to detect when a terms page is loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    checkIfTermsPage(tabId, tab.url);
  }
});

// Listen for tab switching
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      checkIfTermsPage(activeInfo.tabId, tab.url);
    }
  });
});

async function checkIfTermsPage(tabId, url) {
  try {
    // Skip chrome://, chrome-extension://, etc.
    if (!url.startsWith('http')) {
      updateExtensionIcon(tabId, false);
      return;
    }

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

function updateExtensionIcon(tabId, isActive) {
  const iconPath = isActive ? 'active' : 'inactive';
  const iconSizes = [16, 48, 128];
  
  const iconPaths = iconSizes.reduce((acc, size) => {
    acc[size] = `images/icon${isActive ? '_active' : ''}${size}.svg`;
    return acc;
  }, {});
  
  chrome.action.setIcon({
    tabId: tabId,
    path: iconPaths
  });
}

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    analyzeText(request.text).then(analysis => {
      sendResponse({ analysis });
    });
    return true; // Required for async response
  } else if (request.action === 'getSettings') {
    chrome.storage.sync.get('settings', (data) => {
      const settings = { ...DEFAULT_SETTINGS, ...data.settings };
      sendResponse({ settings });
    });
    return true;
  } else if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Mock analysis function - in a real app, this would call an API
async function analyzeText(text) {
  // This is a simplified analysis
  // In a real implementation, you would:
  // 1. Check user preferences for analysis method
  // 2. Either analyze locally or call an API
  // 3. Process and return the results
  
  return new Promise(resolve => {
    setTimeout(() => {
      // Mock analysis based on common terms patterns
      const hasDataCollection = /data\s*collection|collect\s*data|personal\s*information/i.test(text);
      const hasThirdParty = /third[\s-]*party|share.*data|partner.*data/i.test(text);
      const hasArbitration = /arbitration|dispute\s*resolution|waive.*rights/i.test(text);
      const hasAutoRenew = /auto[\s-]*renew|automatic.*renewal|subscription.*renew/i.test(text);
      const hasCancellation = /cancel.*subscription|terminate.*agreement|cancellation.*policy/i.test(text);
      
      const sections = [];
      
      if (hasDataCollection) {
        sections.push({
          title: 'Data Collection',
          summary: 'This service collects personal information including name, email, and browsing data.',
          riskLevel: 'high',
          impact: 0.8
        });
      }
      
      if (hasThirdParty) {
        sections.push({
          title: 'Third-Party Sharing',
          summary: 'Your data may be shared with third parties for analytics and advertising purposes.',
          riskLevel: 'high',
          impact: 0.9
        });
      }
      
      if (hasArbitration) {
        sections.push({
          title: 'Arbitration Clause',
          summary: 'This agreement includes an arbitration clause that may limit your legal options in case of disputes.',
          riskLevel: 'medium',
          impact: 0.7
        });
      }
      
      if (hasAutoRenew) {
        sections.push({
          title: 'Auto-Renewal',
          summary: 'This service may automatically renew your subscription unless canceled before the renewal date.',
          riskLevel: 'medium',
          impact: 0.6
        });
      }
      
      if (hasCancellation) {
        sections.push({
          title: 'Cancellation Policy',
          summary: 'You can cancel your subscription, but terms may apply for refunds or early termination.',
          riskLevel: 'low',
          impact: 0.3
        });
      }
      
      // Add default sections if none were matched
      if (sections.length === 0) {
        sections.push(
          {
            title: 'Standard Terms',
            summary: 'This appears to be a standard terms and conditions document.',
            riskLevel: 'low',
            impact: 0.2
          }
        );
      }
      
      // Calculate overall risk score (0-100)
      const riskScore = Math.min(100, Math.round(
        sections.reduce((sum, section) => sum + (section.impact * 100), 0) / sections.length
      ));
      
      // Generate key points
      const keyPoints = [];
      if (hasDataCollection) keyPoints.push('Collects personal data' + (hasThirdParty ? ' and shares with third parties' : ''));
      if (hasArbitration) keyPoints.push('Includes arbitration clause');
      if (hasAutoRenew) keyPoints.push('Automatic renewal terms may apply');
      if (hasCancellation) keyPoints.push('Specific cancellation policy in place');
      
      resolve({
        riskScore,
        keyPoints: keyPoints.length > 0 ? keyPoints : ['Standard terms and conditions'],
        sections,
        analyzedAt: new Date().toISOString()
      });
    }, 800); // Simulate processing time
  });
}

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
