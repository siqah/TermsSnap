// Simple debug logging
function log(message) {
  console.log(`[TermsSnap] ${message}`);
}

// Apply theme and update UI
function applyTheme(isDark) {
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.backgroundColor = '#121212';
    log('Applied dark theme');
  } else {
    document.documentElement.removeAttribute('data-theme');
    document.body.style.backgroundColor = '#f5f5f5';
    log('Applied light theme');
  }
}

// Show status message
function showStatus(message, type) {
  const statusMessage = document.getElementById('status-message');
  if (!statusMessage) return;
  
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';
  
  setTimeout(() => {
    statusMessage.style.display = 'none';
  }, 2000);
}

// Save settings function
function saveSettings() {
  const darkMode = document.getElementById('dark-mode').checked;
  const settings = {
    darkMode: darkMode,
    autoAnalyze: document.getElementById('auto-analyze').checked,
    showNotifications: document.getElementById('show-notifications').checked,
    enhancedPrivacy: document.getElementById('enhanced-privacy').checked
  };
  
  log('Saving settings: ' + JSON.stringify(settings));
  
  // Save to Chrome's sync storage
  chrome.storage.sync.set({ settings }, () => {
    if (chrome.runtime.lastError) {
      log('Error saving settings: ' + chrome.runtime.lastError);
      showStatus('Error saving settings', 'error');
    } else {
      log('Settings saved successfully');
      showStatus('Settings saved', 'success');
    }
  });
  
  // Also save to local storage for immediate access
  chrome.storage.local.set({ settings }, () => {
    log('Settings saved to local storage');
  });
}

// Go back to popup.html
function goBackToPopup() {
  // Close the current tab and focus on the popup
  chrome.tabs.getCurrent((tab) => {
    if (chrome.runtime.lastError) {
      // If we can't get the current tab, try opening the popup directly
      chrome.tabs.create({ url: 'popup.html' });
    } else {
      // Close the current settings tab
      chrome.tabs.remove(tab.id);
import settings from './shared-settings.js';

// Settings page functionality
document.addEventListener('DOMContentLoaded', async function() {
  // Back button functionality
  const backButton = document.getElementById('back-button');
  if (backButton) {
    backButton.addEventListener('click', function() {
      // Close the settings page and return to the popup
      window.close();
      a.click();
      showStatus('Data exported successfully', 'success');
    });
  });
  
  // Set version number
  const versionElement = document.getElementById('version');
  if (versionElement) {
    versionElement.textContent = chrome.runtime.getManifest().version;
  }
});
