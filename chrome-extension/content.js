// Content script - Runs on every webpage

console.log('VeriFy Deepfake Detector: Content script loaded');

// Store analyzed elements
let analyzedElements = {
  texts: [],
  images: [],
  videos: []
};

// Extract text content from page - OPTIMIZED
function extractTextContent() {
  const textElements = [];
  
  // Priority selectors - most likely to contain meaningful content
  const prioritySelectors = [
    'article p',
    'article h1', 'article h2', 'article h3',
    'main p',
    'div[role="main"] p',
    '.content p',
    '.article p',
    'blockquote'
  ];

  // Try priority selectors first
  prioritySelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        const text = el.textContent.trim();
        // Filter: substantial length (100-2000 chars), not navigation/UI
        if (text.length >= 100 && 
            text.length <= 2000 && // Avoid huge blocks
            !el.closest('script') && 
            !el.closest('style') &&
            !el.closest('nav') &&
            !el.closest('header') &&
            !el.closest('footer') &&
            !text.toLowerCase().includes('cookie') &&
            !text.toLowerCase().includes('subscribe') &&
            !text.toLowerCase().includes('sign up') &&
            !text.toLowerCase().includes('log in')) {
          textElements.push({
            text: text,
            element: el
          });
        }
      });
    } catch (e) {
      console.warn('Selector error:', e);
    }
  });

  // If we found enough content, use it
  if (textElements.length >= 3) {
    return removeDuplicates(textElements).slice(0, 10); // Max 10
  }

  // Fallback: get all paragraphs
  const paragraphs = document.querySelectorAll('p');
  paragraphs.forEach(p => {
    const text = p.textContent.trim();
    if (text.length >= 100 && text.length <= 2000) {
      textElements.push({
        text: text,
        element: p
      });
    }
  });

  return removeDuplicates(textElements).slice(0, 10); // Max 10
}

// Remove duplicate text
function removeDuplicates(textElements) {
  const uniqueTexts = [];
  const seenTexts = new Set();
  
  textElements.forEach(item => {
    const normalized = item.text.toLowerCase().substring(0, 150);
    if (!seenTexts.has(normalized)) {
      seenTexts.add(normalized);
      uniqueTexts.push(item);
    }
  });

  return uniqueTexts;
}

// Extract images from page
function extractImages() {
  const images = [];
  const imgElements = document.querySelectorAll('img');
  
  imgElements.forEach(img => {
    const src = img.src || img.dataset.src;
    if (src && 
        !src.includes('icon') && 
        !src.includes('logo') &&
        !src.includes('avatar') &&
        img.width > 100 && 
        img.height > 100) {
      images.push({
        url: src,
        element: img
      });
    }
  });

  return images;
}

// Extract videos from page
function extractVideos() {
  const videos = [];
  
  // Native video elements
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => {
    const src = video.src || video.currentSrc;
    if (src) {
      videos.push({
        url: src,
        element: video
      });
    }
  });

  // YouTube iframes
  const youtubeIframes = document.querySelectorAll('iframe[src*="youtube.com"], iframe[src*="youtu.be"]');
  youtubeIframes.forEach(iframe => {
    videos.push({
      url: iframe.src,
      element: iframe,
      type: 'youtube'
    });
  });

  return videos;
}

// Get counts of elements
function getCounts() {
  const texts = extractTextContent();
  const images = extractImages();
  const videos = extractVideos();

  analyzedElements = { texts, images, videos };

  return {
    textCount: texts.length,
    imageCount: images.length,
    videoCount: videos.length
  };
}

// Analyze page content
function analyzePage() {
  const texts = extractTextContent();
  const images = extractImages();
  const videos = extractVideos();

  analyzedElements = { texts, images, videos };

  return {
    textElements: texts.map(t => t.text),
    images: images.map(i => i.url),
    videos: videos.map(v => v.url)
  };
}

// Highlight fake content
function highlightResults(results) {
  // Remove previous highlights
  document.querySelectorAll('.verify-fake-highlight').forEach(el => {
    el.classList.remove('verify-fake-highlight');
  });

  results.forEach(result => {
    if (result.type === 'text') {
      // Find and highlight matching text elements
      analyzedElements.texts.forEach(item => {
        if (item.text === result.content) {
          item.element.classList.add('verify-fake-highlight');
          
          // Add tooltip
          const tooltip = document.createElement('div');
          tooltip.className = 'verify-tooltip';
          tooltip.innerHTML = `
            <div class="verify-tooltip-header">⚠️ Potentially Fake Content</div>
            <div class="verify-tooltip-content">
              Confidence: ${(result.confidence * 100).toFixed(1)}%
            </div>
          `;
          
          item.element.style.position = 'relative';
          item.element.appendChild(tooltip);
        }
      });
    } else if (result.type === 'image') {
      // Highlight matching images
      analyzedElements.images.forEach(item => {
        if (item.url === result.url) {
          item.element.classList.add('verify-fake-highlight');
          
          // Add overlay
          const overlay = document.createElement('div');
          overlay.className = 'verify-image-overlay';
          overlay.innerHTML = `
            <div class="verify-overlay-badge">
              ⚠️ Potentially Fake<br>
              ${(result.confidence * 100).toFixed(0)}% confident
            </div>
          `;
          
          // Wrap image
          const wrapper = document.createElement('div');
          wrapper.style.position = 'relative';
          wrapper.style.display = 'inline-block';
          item.element.parentNode.insertBefore(wrapper, item.element);
          wrapper.appendChild(item.element);
          wrapper.appendChild(overlay);
        }
      });
    } else if (result.type === 'video') {
      // Highlight matching videos
      analyzedElements.videos.forEach(item => {
        if (item.url === result.url) {
          item.element.classList.add('verify-fake-highlight');
          
          // Add overlay
          const overlay = document.createElement('div');
          overlay.className = 'verify-video-overlay';
          overlay.innerHTML = `
            <div class="verify-overlay-badge">
              ⚠️ Potentially Fake Video<br>
              ${(result.confidence * 100).toFixed(0)}% confident
            </div>
          `;
          
          // Add to parent
          if (item.element.parentNode) {
            item.element.parentNode.style.position = 'relative';
            item.element.parentNode.appendChild(overlay);
          }
        }
      });
    }
  });

  // Show notification
  if (results.length > 0) {
    showNotification(`⚠️ Found ${results.length} potentially fake item(s) on this page`);
  }
}

// Show notification banner
function showNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.verify-notification');
  if (existing) {
    existing.remove();
  }

  const notification = document.createElement('div');
  notification.className = 'verify-notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  // Auto-hide after 5 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCounts') {
    sendResponse(getCounts());
  } else if (request.action === 'analyzePage') {
    try {
      const data = analyzePage();
      sendResponse(data);
    } catch (error) {
      sendResponse({ error: error.message });
    }
  } else if (request.action === 'highlightResults') {
    highlightResults(request.results);
    sendResponse({ success: true });
  } else if (request.action === 'showNotification') {
    showNotification(request.message);
    sendResponse({ success: true });
  } else if (request.action === 'settingsUpdated') {
    console.log('Settings updated:', request.settings);
    sendResponse({ success: true });
  }
  return true; // Keep message channel open for async response
});

// ============================================
// 🤖 INTELLIGENT AUTO-SCAN SYSTEM
// ============================================

let isScanning = false;
let lastScanTime = 0;
let scanResults = null;
const SCAN_COOLDOWN = 30000; // 30 seconds between scans

// Auto-scan when page loads
async function autoScanPage() {
  // Prevent multiple simultaneous scans
  if (isScanning) {
    console.log('VeriFy: Scan already in progress');
    return;
  }

  // Cooldown check
  const now = Date.now();
  if (now - lastScanTime < SCAN_COOLDOWN) {
    console.log('VeriFy: Waiting for cooldown period');
    return;
  }

  // Check if auto-scan is enabled
  const settings = await chrome.storage.sync.get(['autoScan', 'showNotifications']);
  if (!settings.autoScan) {
    console.log('VeriFy: Auto-scan is disabled');
    return;
  }

  isScanning = true;
  lastScanTime = now;

  console.log('🤖 VeriFy: Auto-scanning page for misinformation...');

  // Show subtle notification that scan started
  showSubtleNotification('🔍 VeriFy is scanning this page...');

  try {
    // Extract content
    const data = analyzePage();
    
    // Send to background script for analysis
    chrome.runtime.sendMessage({
      action: 'autoScanPage',
      data: data
    }, (response) => {
      if (response && response.results) {
        scanResults = response.results;
        
        // Filter only fake items
        const fakeItems = response.results.filter(r => r.is_fake);
        
        if (fakeItems.length > 0) {
          // ALERT USER: Found fake content!
          showFakeContentAlert(fakeItems);
          highlightResults(fakeItems);
          
          // Update badge
          chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: fakeItems.length
          });
        } else {
          // Page is clean
          console.log('✅ VeriFy: No fake content detected');
          showSubtleNotification('✅ VeriFy: Page looks good!', 'success');
          
          chrome.runtime.sendMessage({
            action: 'updateBadge',
            count: 0
          });
        }
      }
      isScanning = false;
    });
  } catch (error) {
    console.error('VeriFy auto-scan error:', error);
    isScanning = false;
  }
}

// Show Comet-style sidebar panel for fake content
function showFakeContentAlert(fakeItems) {
  // Remove existing sidebar
  const existing = document.querySelector('.verify-comet-sidebar');
  if (existing) {
    // Update existing sidebar instead of removing
    const results = existing.querySelector('.verify-comet-results');
    const subtitle = existing.querySelector('.verify-comet-subtitle');
    const badge = existing.querySelector('.verify-comet-toggle-badge');
    
    if (results && subtitle && badge) {
      subtitle.textContent = `${fakeItems.length} issue${fakeItems.length > 1 ? 's' : ''} detected`;
      badge.textContent = fakeItems.length;
      results.innerHTML = fakeItems.map((item, index) => `
        <div class="verify-comet-item" onclick="document.querySelectorAll('.verify-fake-highlight')[${index}]?.scrollIntoView({behavior: 'smooth', block: 'center'})">
          <div class="verify-comet-item-header">
            <span class="verify-comet-item-icon">${getTypeEmoji(item.type)}</span>
            <span class="verify-comet-item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
            <span class="verify-comet-item-confidence">${(item.confidence * 100).toFixed(0)}%</span>
          </div>
          <div class="verify-comet-item-preview">
            ${item.type === 'text' ? truncateText(item.content, 120) : 'Click to highlight on page'}
          </div>
          <div class="verify-comet-item-action">
            <button class="verify-comet-item-btn" onclick="event.stopPropagation(); document.querySelectorAll('.verify-fake-highlight')[${index}]?.scrollIntoView({behavior: 'smooth', block: 'center'})">
              📍 Show on page
            </button>
          </div>
        </div>
      `).join('');
      
      // Make sure it's visible
      existing.classList.add('verify-comet-visible');
      return;
    }
  }

  // Create Comet-style sidebar (PERSISTENT - stays visible)
  const sidebar = document.createElement('div');
  sidebar.className = 'verify-comet-sidebar verify-comet-visible'; // Start visible
  sidebar.innerHTML = `
    <div class="verify-comet-header">
      <div class="verify-comet-icon">🛡️</div>
      <div class="verify-comet-title">
        <div class="verify-comet-name">VeriFy Assistant</div>
        <div class="verify-comet-subtitle">${fakeItems.length} issue${fakeItems.length > 1 ? 's' : ''} detected</div>
      </div>
      <button class="verify-comet-minimize" onclick="this.closest('.verify-comet-sidebar').classList.toggle('verify-comet-minimized')" title="Minimize sidebar">
        ─
      </button>
    </div>
    
    <div class="verify-comet-content">
      <div class="verify-comet-message">
        <div class="verify-comet-message-icon">⚠️</div>
        <div class="verify-comet-message-text">
          I found ${fakeItems.length} potentially fake item${fakeItems.length > 1 ? 's' : ''} on this page. 
          This sidebar will stay here so you can reference it anytime.
        </div>
      </div>

      <div class="verify-comet-results">
        ${fakeItems.map((item, index) => `
          <div class="verify-comet-item" onclick="document.querySelectorAll('.verify-fake-highlight')[${index}]?.scrollIntoView({behavior: 'smooth', block: 'center'})">
            <div class="verify-comet-item-header">
              <span class="verify-comet-item-icon">${getTypeEmoji(item.type)}</span>
              <span class="verify-comet-item-type">${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
              <span class="verify-comet-item-confidence">${(item.confidence * 100).toFixed(0)}%</span>
            </div>
            <div class="verify-comet-item-preview">
              ${item.type === 'text' ? truncateText(item.content, 120) : 'Click to highlight on page'}
            </div>
            <div class="verify-comet-item-action">
              <button class="verify-comet-item-btn" onclick="event.stopPropagation(); document.querySelectorAll('.verify-fake-highlight')[${index}]?.scrollIntoView({behavior: 'smooth', block: 'center'})">
                📍 Show on page
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="verify-comet-footer-info">
        <div class="verify-comet-tip">
          💡 <strong>Tip:</strong> Click minimize (─) to collapse the sidebar. Click items to jump to them on the page.
        </div>
      </div>
    </div>

    <div class="verify-comet-footer">
      <button class="verify-comet-footer-btn verify-comet-primary" onclick="chrome.runtime.sendMessage({action: 'openPopup'})">
        📊 View Full Report
      </button>
    </div>

    <div class="verify-comet-toggle" onclick="this.parentElement.classList.toggle('verify-comet-minimized')">
      <div class="verify-comet-toggle-icon">🛡️</div>
      <div class="verify-comet-toggle-badge">${fakeItems.length}</div>
    </div>
  `;
  
  document.body.appendChild(sidebar);

  // Play subtle notification sound
  playAlertSound();
}

// Helper function to truncate text
function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Show subtle notification (bottom-right, less intrusive)
function showSubtleNotification(message, type = 'info') {
  const existing = document.querySelector('.verify-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = `verify-notification verify-notification-${type}`;
  
  // Create icon based on type
  const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '🔍';
  
  notification.innerHTML = `
    <div class="verify-notification-icon">${icon}</div>
    <div class="verify-notification-text">${message}</div>
  `;
  
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Helper function
function getTypeEmoji(type) {
  return { 'text': '📄', 'image': '🖼️', 'video': '🎬' }[type] || '📋';
}

// Play subtle alert sound
function playAlertSound() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } catch (e) {
    // Audio not supported
  }
}

// ============================================
// 🎯 SMART TRIGGERS
// ============================================

// Trigger 1: Page fully loaded
window.addEventListener('load', () => {
  console.log('VeriFy: Page loaded, waiting 3 seconds before scan...');
  setTimeout(autoScanPage, 3000);
});

// Trigger 2: User scrolls to new content (lazy-loaded content detection)
let scrollTimeout;
let lastScrollPosition = 0;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    const currentScroll = window.scrollY;
    const scrollDelta = Math.abs(currentScroll - lastScrollPosition);
    
    // If user scrolled significantly (new content visible)
    if (scrollDelta > 500) {
      console.log('VeriFy: New content visible, re-scanning...');
      lastScrollPosition = currentScroll;
      autoScanPage();
    }
  }, 2000);
});

// Trigger 3: DOM changes (dynamic content loaded)
const observer = new MutationObserver((mutations) => {
  // Check if significant content was added
  const significantChange = mutations.some(mutation => {
    return mutation.addedNodes.length > 0 && 
           Array.from(mutation.addedNodes).some(node => 
             node.nodeType === 1 && 
             (node.tagName === 'ARTICLE' || 
              node.tagName === 'IMG' || 
              node.tagName === 'VIDEO' ||
              node.querySelector('p, article, img, video'))
           );
  });

  if (significantChange) {
    console.log('VeriFy: New content detected, scheduling scan...');
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(autoScanPage, 2000);
  }
});

// Observe body for changes
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Trigger 4: User focuses back on tab (might have new content)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    console.log('VeriFy: Tab became visible, checking for updates...');
    setTimeout(autoScanPage, 1000);
  }
});

// Initial setup
chrome.storage.sync.get(['autoScan'], (result) => {
  if (result.autoScan === undefined) {
    // Enable auto-scan by default
    chrome.storage.sync.set({ autoScan: true, showNotifications: true });
  }
});
