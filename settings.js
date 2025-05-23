document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const autoDetectToggle = document.getElementById('autoDetect');
  const showNotificationsToggle = document.getElementById('showNotifications');
  const saveButton = document.getElementById('saveSettings');
  const statusMessage = document.getElementById('statusMessage');
  
  // Load saved settings
  const data = await new Promise(resolve => {
    chrome.storage.sync.get('settings', resolve);
  });
  
  const settings = data.settings || {};
  
  // Set initial values with defaults
  autoDetectToggle.checked = settings.autoDetect !== false; // Default to true
  showNotificationsToggle.checked = settings.showNotifications !== false; // Default to true
  
  // Show last updated time if available
  if (settings.lastUpdated) {
    const lastUpdated = new Date(settings.lastUpdated).toLocaleString();
    statusMessage.textContent = `Last saved: ${lastUpdated}`;
    statusMessage.style.color = '#4CAF50';
    setTimeout(() => {
      statusMessage.textContent = '';
    }, 5000);
  }
  
  // Save settings
  saveButton.addEventListener('click', async () => {
    const settings = {
      autoDetect: autoDetectToggle.checked,
      showNotifications: showNotificationsToggle.checked,
      lastUpdated: new Date().toISOString()
    };
    
    // Save settings
    chrome.storage.sync.set({ settings }, () => {
      showStatus('Settings saved successfully!', 'success');
      
      // Notify other parts of the extension about the settings change
      chrome.runtime.sendMessage(
        { action: 'settingsUpdated', settings },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('Error notifying extension:', chrome.runtime.lastError);
          }
        }
      );
      
      // Close the popup after a short delay
      setTimeout(() => {
        window.close();
      }, 1000);
    });
  });

  // Cancel button functionality
  document.getElementById('cancelButton').addEventListener('click', () => {
    window.close();
  });

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
