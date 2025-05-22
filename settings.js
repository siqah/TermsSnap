document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const autoDetectToggle = document.getElementById('autoDetect');
  const showNotificationsToggle = document.getElementById('showNotifications');
  const analysisMethodSelect = document.getElementById('analysisMethod');
  const apiKeyInput = document.getElementById('apiKey');
  const apiKeyContainer = document.getElementById('apiKeyContainer');
  const saveButton = document.getElementById('saveSettings');
  const statusMessage = document.getElementById('statusMessage');

  // Load saved settings
  chrome.storage.sync.get('settings', (data) => {
    const settings = data.settings || {};
    
    // Set toggle states
    autoDetectToggle.checked = settings.autoDetect !== false; // Default to true
    showNotificationsToggle.checked = settings.showNotifications !== false; // Default to true
    
    // Set analysis method
    if (settings.analysisMethod) {
      analysisMethodSelect.value = settings.analysisMethod;
      toggleApiKeyField(settings.analysisMethod === 'api');
    }
    
    // Set API key if it exists
    if (settings.apiEndpoint) {
      apiKeyInput.value = settings.apiEndpoint;
    }
  });

  // Toggle API key field based on analysis method
  analysisMethodSelect.addEventListener('change', (e) => {
    toggleApiKeyField(e.target.value === 'api');
  });

  // Save settings
  saveButton.addEventListener('click', saveSettings);

  // Function to toggle API key field visibility
  function toggleApiKeyField(show) {
    apiKeyContainer.style.display = show ? 'block' : 'none';
  }

  // Function to save settings
  function saveSettings() {
    const settings = {
      autoDetect: autoDetectToggle.checked,
      showNotifications: showNotificationsToggle.checked,
      analysisMethod: analysisMethodSelect.value,
      apiEndpoint: apiKeyInput.value.trim()
    };

    // Validate API key if using API method
    if (settings.analysisMethod === 'api' && !settings.apiEndpoint) {
      showStatus('Please enter an API key for cloud analysis', 'error');
      return;
    }

    // Save to Chrome storage
    chrome.storage.sync.set({ settings }, () => {
      if (chrome.runtime.lastError) {
        showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('Settings saved successfully!', 'success');
        // Notify other parts of the extension about the settings change
        chrome.runtime.sendMessage({ action: 'settingsUpdated', settings });
        
        // Close the settings page after a short delay
        setTimeout(() => {
          window.close();
        }, 1000);
      }
    });
  }

  // Function to show status message
  function showStatus(message, type = '') {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
  }

  // Handle keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Save on Ctrl+S or Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveSettings();
    }
    // Close on Escape
    else if (e.key === 'Escape') {
      window.close();
    }
  });
});
