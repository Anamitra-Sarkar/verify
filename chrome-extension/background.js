// Background service worker

console.log('VeriFy Deepfake Detector: Background service worker initialized');

// Listen for extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('Extension icon clicked for tab:', tab.id);
});

// Handle installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('VeriFy extension installed');
    
    // Set default settings - AUTO-SCAN ENABLED BY DEFAULT
    chrome.storage.sync.set({
      autoScan: true, // 🤖 Enable auto-scan by default
      notificationsEnabled: true,
      showAlerts: true,
      apiUrl: 'https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1'
    });

    // Open welcome page
    chrome.tabs.create({
      url: 'https://github.com/yourusername/verify-deepfake-detector'
    });
  } else if (details.reason === 'update') {
    console.log('VeriFy extension updated');
  }
});

// Context menu integration
chrome.runtime.onInstalled.addListener(() => {
  // Create context menu for text selection
  chrome.contextMenus.create({
    id: 'verifyText',
    title: 'Check if this text is fake',
    contexts: ['selection']
  });

  // Create context menu for images
  chrome.contextMenus.create({
    id: 'verifyImage',
    title: 'Check if this image is fake',
    contexts: ['image']
  });

  // Create context menu for videos
  chrome.contextMenus.create({
    id: 'verifyVideo',
    title: 'Check if this video is fake',
    contexts: ['video']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const apiUrl = await getApiUrl();

  if (info.menuItemId === 'verifyText' && info.selectionText) {
    // Analyze selected text
    analyzeText(info.selectionText, tab.id);
  } else if (info.menuItemId === 'verifyImage' && info.srcUrl) {
    // Analyze image
    analyzeImage(info.srcUrl, tab.id);
  } else if (info.menuItemId === 'verifyVideo' && info.srcUrl) {
    // Analyze video
    analyzeVideo(info.srcUrl, tab.id);
  }
});

// Get API URL from storage
async function getApiUrl() {
  const result = await chrome.storage.sync.get(['apiUrl']);
  return result.apiUrl || 'https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1';
}

// Analyze text
async function analyzeText(text, tabId) {
  try {
    const apiUrl = await getApiUrl();
    
    // Show loading notification
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '🔍 Analyzing text...'
    });

    const response = await fetch(`${apiUrl}/check-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (response.ok) {
      const result = await response.json();
      
      // Show result notification
      const verdict = result.is_fake ? '⚠️ FAKE' : '✅ REAL';
      const confidence = (result.confidence * 100).toFixed(1);
      
      chrome.tabs.sendMessage(tabId, {
        action: 'showNotification',
        message: `${verdict} (${confidence}% confident)`
      });

      // Create notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'VeriFy - Text Analysis Result',
        message: `${verdict} - ${confidence}% confident\n\n${result.analysis.substring(0, 150)}...`,
        priority: 2
      });
    }
  } catch (error) {
    console.error('Text analysis error:', error);
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '❌ Analysis failed. Is the backend running?'
    });
  }
}

// Analyze image
async function analyzeImage(imageUrl, tabId) {
  try {
    const apiUrl = await getApiUrl();
    
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '🔍 Analyzing image...'
    });

    // Fetch image
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    // Create form data
    const formData = new FormData();
    formData.append('file', imageBlob, 'image.jpg');

    const response = await fetch(`${apiUrl}/check-image`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      
      const verdict = result.is_fake ? '⚠️ FAKE' : '✅ REAL';
      const confidence = (result.confidence * 100).toFixed(1);
      
      chrome.tabs.sendMessage(tabId, {
        action: 'showNotification',
        message: `${verdict} Image (${confidence}% confident)`
      });

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'VeriFy - Image Analysis Result',
        message: `${verdict} - ${confidence}% confident`,
        priority: 2
      });
    }
  } catch (error) {
    console.error('Image analysis error:', error);
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '❌ Image analysis failed'
    });
  }
}

// Analyze video
async function analyzeVideo(videoUrl, tabId) {
  try {
    const apiUrl = await getApiUrl();
    
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '🔍 Analyzing video (this may take a moment)...'
    });

    // Fetch video
    const videoResponse = await fetch(videoUrl);
    const videoBlob = await videoResponse.blob();

    // Create form data
    const formData = new FormData();
    formData.append('file', videoBlob, 'video.mp4');

    const response = await fetch(`${apiUrl}/check-video`, {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      const result = await response.json();
      
      const verdict = result.is_fake ? '⚠️ FAKE' : '✅ REAL';
      const confidence = (result.confidence * 100).toFixed(1);
      
      chrome.tabs.sendMessage(tabId, {
        action: 'showNotification',
        message: `${verdict} Video (${confidence}% confident)`
      });

      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'VeriFy - Video Analysis Result',
        message: `${verdict} - ${confidence}% confident`,
        priority: 2
      });
    }
  } catch (error) {
    console.error('Video analysis error:', error);
    chrome.tabs.sendMessage(tabId, {
      action: 'showNotification',
      message: '❌ Video analysis failed'
    });
  }
}

// ============================================
// 🤖 AUTO-SCAN MESSAGE HANDLERS
// ============================================

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'autoScanPage') {
    // Handle auto-scan request from content script
    handleAutoScan(request.data, sender.tab.id).then(results => {
      sendResponse({ results });
    });
    return true; // Keep channel open for async response
  } else if (request.action === 'updateBadge') {
    // Update extension badge with fake content count
    updateBadge(sender.tab.id, request.count);
    sendResponse({ success: true });
  } else if (request.action === 'analyzeInBackground') {
    // Handle background analysis requests
    handleBackgroundAnalysis(request.data, sender.tab.id);
    sendResponse({ success: true });
  }
  return true;
});

// Update badge with count
function updateBadge(tabId, count) {
  if (count > 0) {
    chrome.action.setBadgeText({
      text: count.toString(),
      tabId: tabId
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#ff4757',
      tabId: tabId
    });
  } else {
    chrome.action.setBadgeText({
      text: '',
      tabId: tabId
    });
  }
}

// Handle auto-scan - analyze content in background
async function handleAutoScan(data, tabId) {
  console.log('🤖 Auto-scan requested for tab:', tabId);
  
  const apiUrl = await getApiUrl();
  const results = [];

  // Prepare items with smart limits
  const textsToAnalyze = data.textElements
    ?.filter(text => text.length > 100 && text.length < 3000)
    .slice(0, 5) || [];

  const imagesToAnalyze = data.images?.slice(0, 3) || [];
  const videosToAnalyze = data.videos?.slice(0, 2) || [];

  console.log(`Analyzing: ${textsToAnalyze.length} texts, ${imagesToAnalyze.length} images, ${videosToAnalyze.length} videos`);

  // Helper function with timeout
  async function analyzeWithTimeout(promise, timeout = 15000) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeout)
      )
    ]);
  }

  // Analyze texts in parallel
  const textPromises = textsToAnalyze.map(text => 
    analyzeWithTimeout(
      fetch(`${apiUrl}/check-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      .then(res => res.ok ? res.json() : null)
      .then(result => {
        if (result?.is_fake) {
          return {
            type: 'text',
            content: text,
            is_fake: result.is_fake,
            confidence: result.confidence,
            analysis: result.analysis
          };
        }
        return null;
      })
      .catch(err => {
        console.error('Text analysis error:', err);
        return null;
      })
    )
  );

  // Analyze images in parallel
  const imagePromises = imagesToAnalyze.map(imageUrl => 
    analyzeWithTimeout(
      fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('file', blob, 'image.jpg');
        return fetch(`${apiUrl}/check-image`, {
          method: 'POST',
          body: formData
        });
      })
      .then(res => res.ok ? res.json() : null)
      .then(result => {
        if (result?.is_fake) {
          return {
            type: 'image',
            url: imageUrl,
            is_fake: result.is_fake,
            confidence: result.confidence,
            analysis: result.analysis
          };
        }
        return null;
      })
      .catch(err => {
        console.error('Image analysis error:', err);
        return null;
      }),
      20000
    )
  );

  // Analyze videos in parallel
  const videoPromises = videosToAnalyze.map(videoUrl => 
    analyzeWithTimeout(
      fetch(videoUrl)
      .then(res => res.blob())
      .then(blob => {
        const formData = new FormData();
        formData.append('file', blob, 'video.mp4');
        return fetch(`${apiUrl}/check-video`, {
          method: 'POST',
          body: formData
        });
      })
      .then(res => res.ok ? res.json() : null)
      .then(result => {
        if (result?.is_fake) {
          return {
            type: 'video',
            url: videoUrl,
            is_fake: result.is_fake,
            confidence: result.confidence,
            analysis: result.analysis
          };
        }
        return null;
      })
      .catch(err => {
        console.error('Video analysis error:', err);
        return null;
      }),
      30000
    )
  );

  // Wait for all analyses
  const allResults = await Promise.allSettled([
    ...textPromises,
    ...imagePromises,
    ...videoPromises
  ]);

  // Collect successful results
  allResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value) {
      results.push(result.value);
    }
  });

  console.log(`✅ Auto-scan complete: ${results.length} fake items found`);

  // Store results
  chrome.storage.local.set({
    [`scan_${tabId}`]: {
      timestamp: Date.now(),
      results: results
    }
  });

  return results;
}

// Handle background analysis
async function handleBackgroundAnalysis(data, tabId) {
  // Process analysis in background without blocking UI
  console.log('Background analysis requested:', data);
}

// Periodic cleanup of storage
chrome.alarms.create('cleanupStorage', { periodInMinutes: 60 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanupStorage') {
    // Clean up old scan results
    chrome.storage.local.get(['lastScanResults', 'scanHistory'], (result) => {
      // Keep only last 10 scan results
      if (result.scanHistory && result.scanHistory.length > 10) {
        chrome.storage.local.set({
          scanHistory: result.scanHistory.slice(-10)
        });
      }
    });
  }
});
