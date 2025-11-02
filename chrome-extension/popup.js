// Configuration
const API_BASE_URL = 'https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1';

// Get current tab
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Update status counts
function updateCounts(data) {
  const textCountEl = document.getElementById('textCount');
  const imageCountEl = document.getElementById('imageCount');
  const videoCountEl = document.getElementById('videoCount');

  if (textCountEl) textCountEl.textContent = data.textCount || 0;
  if (imageCountEl) imageCountEl.textContent = data.imageCount || 0;
  if (videoCountEl) videoCountEl.textContent = data.videoCount || 0;
}

// Show error message
function showError(message) {
  const errorEl = document.getElementById('errorMessage');
  if (!errorEl) return;

  errorEl.textContent = message;
  errorEl.style.display = 'block';
  setTimeout(() => {
    errorEl.style.display = 'none';
  }, 5000);
}

// Render results - FIXED TO SHOW VERDICTS
function renderResults(results) {
  const container = document.getElementById('resultsContainer');
  if (!container) return;

  if (!results || results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✅</div>
        <div class="empty-state-text">Scan complete! No suspicious content detected.</div>
      </div>
    `;
    return;
  }

  container.innerHTML = results.map(result => {
    const isFake = result.is_fake;
    const confidence = (result.confidence * 100).toFixed(1);
    const verdict = isFake ? `⚠️ FAKE - ${confidence}%` : `✅ REAL - ${confidence}%`;
    const verdictClass = isFake ? 'fake-verdict' : 'real-verdict';

    const typeEmoji = {
      'text': '📄',
      'image': '🖼️',
      'video': '🎬'
    }[result.type] || '📋';

    let contentPreview = '';
    if (result.type === 'text') {
      contentPreview = result.content.substring(0, 80) + (result.content.length > 80 ? '...' : '');
    } else {
      contentPreview = result.url ? new URL(result.url).pathname.split('/').pop().substring(0, 40) : 'Media file';
    }

    return `
      <div class="result-item ${isFake ? 'result-fake' : 'result-real'}">
        <div class="result-header">
          <span class="result-type">${typeEmoji}</span>
          <span class="result-title">${result.type.toUpperCase()}</span>
        </div>
        <div class="result-content">${contentPreview}</div>
        <div class="result-footer">
          <span class="verdict ${verdictClass}">${verdict}</span>
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

  if (!scanButton || !resultsContainer) return;

  try {
    const tab = await getCurrentTab();

    scanButton.disabled = true;
    scanButton.classList.add('scanning');
    if (scanButtonText) scanButtonText.textContent = 'Scanning...';

    resultsContainer.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <div>Analyzing page content...</div>
      </div>
    `;

    // Inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      await chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        files: ['content.css']
      });

      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (e) {
      console.log('Content script may already be loaded:', e.message);
    }

    // Get page data from content script
    let response;
    try {
      response = await chrome.tabs.sendMessage(tab.id, {
        action: 'analyzePage'
      });
    } catch (error) {
      console.error('Failed to get page data:', error);
      throw new Error('Could not analyze page. Content script may not be loaded.');
    }

    if (response.error) {
      throw new Error(response.error);
    }

    // Update counts
    updateCounts({
      textCount: response.textElements?.length || 0,
      imageCount: response.images?.length || 0,
      videoCount: response.videos?.length || 0
    });

    // Filter items for analysis
    const textsToAnalyze = response.textElements
      ?.filter(text => text && text.length > 100 && text.length < 5000)
      .slice(0, 3) || [];

    const imagesToAnalyze = response.images?.slice(0, 2) || [];
    const videosToAnalyze = response.videos?.slice(0, 1) || [];

    const totalItems = textsToAnalyze.length + imagesToAnalyze.length + videosToAnalyze.length;

    if (totalItems === 0) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">ℹ️</div>
          <div class="empty-state-text">No analyzable content found on this page.</div>
        </div>
      `;
      return;
    }

    // Show progress
    let completed = 0;
    function updateProgress(status) {
      completed++;
      const percent = totalItems > 0 ? Math.round((completed / totalItems) * 100) : 0;
      resultsContainer.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <div>${status}</div>
          <div style="width: 100%; background: #eee; border-radius: 10px; height: 6px; margin-top: 10px;">
            <div style="width: ${percent}%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; border-radius: 10px; transition: width 0.3s;"></div>
          </div>
        </div>
      `;
    }

    // Helper for timeout
    async function analyzeWithTimeout(promise, timeout = 15000) {
      return Promise.race([
        promise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);
    }

    const analysisResults = [];

    // Analyze texts
    const textPromises = textsToAnalyze.map(text => 
      analyzeWithTimeout(
        fetch(`${API_BASE_URL}/check-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(result => {
          updateProgress(`Analyzing text (${completed + 1}/${totalItems})`);
          if (result) {
            return {
              type: 'text',
              content: text.substring(0, 150),
              is_fake: result.is_fake || false,
              confidence: result.confidence || 0.5
            };
          }
          return null;
        })
        .catch(err => {
          console.error('Text analysis error:', err);
          updateProgress(`Analyzing text (${completed + 1}/${totalItems})`);
          return null;
        })
      )
    );

    // Analyze images
    const imagePromises = imagesToAnalyze.map(imageUrl => 
      analyzeWithTimeout(
        fetch(imageUrl, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'image.jpg');
          return fetch(`${API_BASE_URL}/check-image`, {
            method: 'POST',
            body: formData
          });
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(result => {
          updateProgress(`Analyzing image (${completed + 1}/${totalItems})`);
          if (result) {
            return {
              type: 'image',
              url: imageUrl,
              is_fake: result.is_fake || false,
              confidence: result.confidence || 0.5
            };
          }
          return null;
        })
        .catch(err => {
          console.error('Image analysis error:', err);
          updateProgress(`Analyzing image (${completed + 1}/${totalItems})`);
          return null;
        }),
        20000
      )
    );

    // Analyze videos
    const videoPromises = videosToAnalyze.map(videoUrl => 
      analyzeWithTimeout(
        fetch(videoUrl, { mode: 'cors' })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.blob();
        })
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, 'video.mp4');
          return fetch(`${API_BASE_URL}/check-video`, {
            method: 'POST',
            body: formData
          });
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(result => {
          updateProgress(`Analyzing video (${completed + 1}/${totalItems})`);
          if (result) {
            return {
              type: 'video',
              url: videoUrl,
              is_fake: result.is_fake || false,
              confidence: result.confidence || 0.5
            };
          }
          return null;
        })
        .catch(err => {
          console.error('Video analysis error:', err);
          updateProgress(`Analyzing video (${completed + 1}/${totalItems})`);
          return null;
        }),
        30000
      )
    );

    // Wait for all to complete
    const allResults = await Promise.allSettled([
      ...textPromises,
      ...imagePromises,
      ...videoPromises
    ]);

    // Collect results
    allResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        analysisResults.push(result.value);
      }
    });

    // Sort by fake first
    analysisResults.sort((a, b) => (b.is_fake ? 1 : 0) - (a.is_fake ? 1 : 0));

    // Render final results
    renderResults(analysisResults);

    // Store results
    chrome.storage.local.set({ lastScanResults: analysisResults });

    // Highlight on page
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightResults',
        results: analysisResults
      });
    } catch (e) {
      console.log('Could not highlight on page:', e);
    }

  } catch (error) {
    console.error('Scan error:', error);
    showError(`Error: ${error.message}`);
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <div class="empty-state-text">Failed to scan. Please check your connection and try again.</div>
        </div>
      `;
    }
  } finally {
    scanButton.disabled = false;
    scanButton.classList.remove('scanning');
    if (scanButtonText) scanButtonText.textContent = 'Scan This Page';
  }
}

// Initialize
async function initialize() {
  try {
    const tab = await getCurrentTab();

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (e) {
      console.log('Content script may already be loaded');
    }

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'getCounts'
      });

      if (response && !response.error) {
        updateCounts(response);
      }
    } catch (error) {
      console.log('Could not get counts:', error);
      updateCounts({ textCount: 0, imageCount: 0, videoCount: 0 });
    }

    const stored = await chrome.storage.local.get('lastScanResults');
    if (stored.lastScanResults && stored.lastScanResults.length > 0) {
      renderResults(stored.lastScanResults);
    }

  } catch (error) {
    console.error('Initialization error:', error);
  }
}

// Event listeners
const scanButton = document.getElementById('scanButton');
if (scanButton) scanButton.addEventListener('click', scanPage);

const settingsButton = document.getElementById('settingsButton');
if (settingsButton) {
  settingsButton.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);