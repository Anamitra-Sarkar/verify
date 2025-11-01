// Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Get current tab
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Update status counts
function updateCounts(data) {
  document.getElementById('textCount').textContent = data.textCount || 0;
  document.getElementById('imageCount').textContent = data.imageCount || 0;
  document.getElementById('videoCount').textContent = data.videoCount || 0;
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// Render results
function renderResults(results) {
  const container = document.getElementById('resultsContainer');
  
  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-text">
          Scan complete! No suspicious content detected.
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(result => {
    const isFake = result.is_fake;
    const typeEmoji = {
      'text': '📄',
      'image': '🖼️',
      'video': '🎬'
    }[result.type] || '📋';

    let contentPreview = '';
    if (result.type === 'text') {
      contentPreview = result.content.substring(0, 100) + (result.content.length > 100 ? '...' : '');
    } else {
      contentPreview = result.url ? new URL(result.url).pathname.split('/').pop() : 'Media file';
    }

    return `
      <div class="result-item ${isFake ? 'fake' : 'real'}">
        <div class="result-type">${typeEmoji} ${result.type.toUpperCase()}</div>
        <div class="result-content">${contentPreview}</div>
        <div class="result-verdict">
          <span class="verdict-label">${isFake ? '⚠️ FAKE' : '✅ REAL'}</span>
          <span class="confidence">${(result.confidence * 100).toFixed(1)}% confident</span>
        </div>
      </div>
    `;
  }).join('');
}

// Scan page
async function scanPage() {
  const scanButton = document.getElementById('scanButton');
  const scanButtonText = document.getElementById('scanButtonText');
  const resultsContainer = document.getElementById('resultsContainer');

  try {
    // Get current tab
    const tab = await getCurrentTab();
    
    // Update button state
    scanButton.disabled = true;
    scanButton.classList.add('scanning');
    scanButtonText.textContent = 'Scanning...';

    // Show loading
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div>Analyzing page content...</div>
      </div>
    `;

    // Ensure content script is loaded
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Inject CSS as well
      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });
      
      // Wait for script to initialize
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (e) {
      // Content script might already be loaded
      console.log('Content script injection:', e.message);
    }

    // Request page analysis from content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'analyzePage'
    });

    if (response.error) {
      throw new Error(response.error);
    }

    // Update counts
    updateCounts({
      textCount: response.textElements?.length || 0,
      imageCount: response.images?.length || 0,
      videoCount: response.videos?.length || 0
    });

    // Prepare items to analyze (with smart limits)
    const textsToAnalyze = response.textElements
      ?.filter(text => text.length > 100 && text.length < 5000) // Only substantial, not huge
      .slice(0, 5) || []; // Limit to 5 texts

    const imagesToAnalyze = response.images?.slice(0, 3) || []; // Limit to 3 images
    const videosToAnalyze = response.videos?.slice(0, 2) || []; // Limit to 2 videos

    const totalItems = textsToAnalyze.length + imagesToAnalyze.length + videosToAnalyze.length;

    // Show progress
    let completed = 0;
    function updateProgress() {
      completed++;
      const percent = Math.round((completed / totalItems) * 100);
      resultsContainer.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <div>Analyzing content... ${completed}/${totalItems}</div>
          <div style="width: 100%; background: #eee; border-radius: 10px; height: 6px; margin-top: 10px;">
            <div style="width: ${percent}%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; border-radius: 10px; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }

    // Show initial analyzing state
    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div>Starting analysis...</div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.8;">
          Found ${totalItems} items to check
        </div>
      </div>
    `;

    // Analyze content with backend API - PARALLEL PROCESSING
    const analysisResults = [];

    // Helper function to analyze with timeout
    async function analyzeWithTimeout(promise, timeout = 15000) {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    }

    // Batch analyze texts in parallel (2 at a time)
    const textPromises = textsToAnalyze.map(text => 
      analyzeWithTimeout(
        fetch(`${API_BASE_URL}/check-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
        .then(res => res.ok ? res.json() : null)
        .then(result => {
          updateProgress();
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
          updateProgress();
          return null;
        })
      )
    );

    // Batch analyze images in parallel
    const imagePromises = imagesToAnalyze.map(imageUrl => 
      analyzeWithTimeout(
        fetch(imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'image.jpg');
          return fetch(`${API_BASE_URL}/check-image`, {
            method: 'POST',
            body: formData
          });
        })
        .then(res => res.ok ? res.json() : null)
        .then(result => {
          updateProgress();
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
          updateProgress();
          return null;
        }),
        20000 // 20 second timeout for images
      )
    );

    // Batch analyze videos in parallel
    const videoPromises = videosToAnalyze.map(videoUrl => 
      analyzeWithTimeout(
        fetch(videoUrl)
        .then(res => res.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'video.mp4');
          return fetch(`${API_BASE_URL}/check-video`, {
            method: 'POST',
            body: formData
          });
        })
        .then(res => res.ok ? res.json() : null)
        .then(result => {
          updateProgress();
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
          updateProgress();
          return null;
        }),
        30000 // 30 second timeout for videos
      )
    );

    // Wait for all analyses to complete
    const allResults = await Promise.allSettled([
      ...textPromises,
      ...imagePromises,
      ...videoPromises
    ]);

    // Collect successful results
    allResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        analysisResults.push(result.value);
      }
    });

    // Render results
    renderResults(analysisResults);

    // Store results for content script highlighting
    chrome.storage.local.set({ lastScanResults: analysisResults });

    // Send results to content script for highlighting
    chrome.tabs.sendMessage(tab.id, {
      action: 'highlightResults',
      results: analysisResults
    });

  } catch (error) {
    console.error('Scan error:', error);
    showError(`Error: ${error.message}`);
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-text">
          Failed to scan page. Make sure the backend is running.
        </div>
      </div>
    `;
  } finally {
    // Reset button
    scanButton.disabled = false;
    scanButton.classList.remove('scanning');
    scanButtonText.textContent = 'Scan This Page';
  }
}

// Initialize popup
async function initialize() {
  try {
    // Get current tab
    const tab = await getCurrentTab();

    // Try to inject content script if it's not already loaded
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      // Content script might already be loaded, that's OK
      console.log('Content script may already be loaded');
    }

    // Wait a bit for content script to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Request initial counts from content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getCounts'
      });

      if (response && !response.error) {
        updateCounts(response);
      }
    } catch (error) {
      console.log('Could not get initial counts:', error);
      // Show default state
      updateCounts({ textCount: 0, imageCount: 0, videoCount: 0 });
    }

    // Check for stored results
    const stored = await chrome.storage.local.get('lastScanResults');
    if (stored.lastScanResults && stored.lastScanResults.length > 0) {
      renderResults(stored.lastScanResults);
    }

  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Event listeners
document.getElementById('scanButton').addEventListener('click', scanPage);

document.getElementById('settingsButton').addEventListener('click', () => {
  // Open settings page
  chrome.runtime.openOptionsPage();
});

// Initialize on load
initialize();
