// Options/Settings page script

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get([
    'autoScan',
    'notificationsEnabled',
    'highlightContent',
    'apiUrl',
    'confidenceThreshold',
    'maxItems'
  ], (result) => {
    document.getElementById('autoScan').checked = result.autoScan || false;
    document.getElementById('notifications').checked = result.notificationsEnabled !== false;
    document.getElementById('highlightContent').checked = result.highlightContent !== false;
    document.getElementById('apiUrl').value = result.apiUrl || 'http://localhost:8000/api/v1';
    document.getElementById('confidenceThreshold').value = result.confidenceThreshold || 70;
    document.getElementById('maxItems').value = result.maxItems || 20;
    
    // Update confidence value display
    document.getElementById('confidenceValue').textContent = 
      (result.confidenceThreshold || 70) + '%';
  });
}

// Save settings
function saveSettings() {
  const settings = {
    autoScan: document.getElementById('autoScan').checked,
    notificationsEnabled: document.getElementById('notifications').checked,
    highlightContent: document.getElementById('highlightContent').checked,
    apiUrl: document.getElementById('apiUrl').value.trim(),
    confidenceThreshold: parseInt(document.getElementById('confidenceThreshold').value),
    maxItems: parseInt(document.getElementById('maxItems').value)
  };

  // Validate API URL
  try {
    new URL(settings.apiUrl);
  } catch (e) {
    showStatus('Invalid API URL. Please enter a valid URL.', 'error');
    return;
  }

  // Validate max items
  if (settings.maxItems < 5 || settings.maxItems > 50) {
    showStatus('Max items must be between 5 and 50.', 'error');
    return;
  }

  // Save to storage
  chrome.storage.sync.set(settings, () => {
    showStatus('✅ Settings saved successfully!', 'success');
    
    // Notify all tabs about settings change
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'settingsUpdated',
          settings: settings
        }).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      });
    });
  });
}

// Reset to defaults
function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to default values?')) {
    const defaults = {
      autoScan: false,
      notificationsEnabled: true,
      highlightContent: true,
      apiUrl: 'http://localhost:8000/api/v1',
      confidenceThreshold: 70,
      maxItems: 20
    };

    chrome.storage.sync.set(defaults, () => {
      loadSettings();
      showStatus('✅ Settings reset to defaults!', 'success');
    });
  }
}

// Show status message
function showStatus(message, type) {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.style.display = 'block';

  setTimeout(() => {
    statusEl.style.display = 'none';
  }, 3000);
}

// Update confidence threshold display
document.getElementById('confidenceThreshold').addEventListener('input', (e) => {
  document.getElementById('confidenceValue').textContent = e.target.value + '%';
});

// Event listeners
document.getElementById('saveButton').addEventListener('click', saveSettings);
document.getElementById('resetButton').addEventListener('click', resetSettings);

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);

// Test API connection
async function testApiConnection() {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  
  try {
    const response = await fetch(`${apiUrl.replace('/api/v1', '')}/api/v1/health`);
    if (response.ok) {
      const data = await response.json();
      showStatus('✅ Backend connection successful!', 'success');
      return true;
    } else {
      showStatus('⚠️ Backend responded but may not be fully operational', 'error');
      return false;
    }
  } catch (error) {
    showStatus('❌ Cannot connect to backend. Make sure it\'s running.', 'error');
    return false;
  }
}

// Add test connection button functionality
document.getElementById('apiUrl').addEventListener('blur', () => {
  const apiUrl = document.getElementById('apiUrl').value.trim();
  if (apiUrl) {
    testApiConnection();
  }
});
