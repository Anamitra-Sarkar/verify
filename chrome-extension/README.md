# 🛡️ VeriFy - AI Deepfake Detector Chrome Extension

A powerful Chrome extension that detects fake content (text, images, and videos) on any webpage using state-of-the-art AI models.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-orange)

---

## 🌟 Features

### 🔍 **Real-Time Content Scanning**
- Automatically detects and analyzes text, images, and videos on any webpage
- Highlights potentially fake content with visual indicators
- Provides confidence scores and detailed analysis

### 🤖 **State-of-the-Art AI Models**
- **Text Detection**: RoBERTa fake news classifier (125M parameters, 85-90% accuracy)
- **Image Detection**: EfficientNetV2-S deepfake detector (~98% accuracy)
- **Video Detection**: Xception/EfficientNetV2-M DFD-SOTA model
- **Voice Detection**: Wav2Vec2 + BiGRU + Multi-Head Attention (95-97% accuracy)

### 🧠 **Intelligent Verification**
- **3-Tier System**: Model prediction → Tavily context → Gemini 2.0 Flash final arbiter
- **Temporal Awareness**: Understands past vs present facts
- **Semantic Analysis**: Goes beyond keyword matching

### ⚡ **Easy to Use**
- One-click page scanning
- Right-click context menu for quick checks
- Visual highlighting of fake content
- Browser notifications for scan results

---

## 📦 Installation

### Prerequisites

1. **Backend Server Running**
   - Make sure your backend is running at `http://localhost:8000`
   - See backend setup instructions in main project README

2. **Generate Icons** (First time only)
   ```bash
   cd chrome-extension
   pip install Pillow
   python generate_icons.py
   ```

### Install Extension

#### Method 1: Developer Mode (Recommended)

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **Load unpacked**
4. Select the `chrome-extension` folder
5. Extension installed! Look for the VeriFy icon in your toolbar

#### Method 2: Pack and Install

1. In `chrome://extensions/`, click **Pack extension**
2. Select the `chrome-extension` folder
3. Click **Pack Extension** to create a `.crx` file
4. Drag and drop the `.crx` file into Chrome to install

---

## 🚀 Usage

### Basic Scanning

1. **Navigate to any webpage**
2. **Click the VeriFy icon** in your toolbar
3. **Click "Scan This Page"**
4. Wait for analysis to complete
5. View results and highlighted content

### Quick Analysis (Context Menu)

**Right-click on:**
- **Text**: Select text → Right-click → "Check if this text is fake"
- **Image**: Right-click image → "Check if this image is fake"
- **Video**: Right-click video → "Check if this video is fake"

### Reading Results

**Visual Indicators:**
- 🔴 **Red border + pulsing animation** = Potentially fake content
- ✅ **Green checkmark** = Verified real content
- 📊 **Confidence score** = Model's certainty level

---

## ⚙️ Settings

Access settings by clicking the **⚙️ Settings** button in the extension popup.

### Available Options

| Setting | Description | Default |
|---------|-------------|---------|
| **Auto-Scan Pages** | Automatically scan pages when they load | Off |
| **Show Notifications** | Display browser notifications for results | On |
| **Highlight Content** | Visually highlight detected fake content | On |
| **Backend API URL** | URL of your backend server | `http://localhost:8000/api/v1` |
| **Confidence Threshold** | Minimum confidence to flag content | 70% |
| **Max Items to Scan** | Maximum items to analyze per page | 20 |

---

## 🏗️ Architecture

### Extension Components

```
chrome-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── content.js            # Page content extraction & highlighting
├── content.css           # Highlight styles injected into pages
├── background.js         # Background service worker
├── options.html          # Settings page
├── options.js            # Settings logic
├── generate_icons.py     # Icon generator script
└── icons/                # Extension icons
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

### Analysis Flow

```
User clicks "Scan This Page"
         ↓
Content Script extracts page elements
  ├─ Text paragraphs, headings, articles
  ├─ Images (> 100×100px)
  └─ Videos (native <video>, YouTube iframes)
         ↓
Send to Backend API (http://localhost:8000/api/v1)
  ├─ POST /check-text    → RoBERTa + Tavily + Gemini
  ├─ POST /check-image   → EfficientNetV2-S + Gemini
  └─ POST /check-video   → Xception DFD + Gemini
         ↓
Backend analyzes with SOTA models
         ↓
3-Tier Intelligent Verification
  1. Model prediction
  2. Tavily context gathering
  3. Gemini 2.0 Flash final decision
         ↓
Return results to extension
         ↓
Highlight fake content on page + show popup results
```

---

## 🎨 Visual Highlighting

### Fake Content Indicators

**Text:**
- Red semi-transparent background
- Red pulsing border
- Hover tooltip with details

**Images:**
- Red border overlay
- "⚠️ Potentially Fake" badge in corner
- Pulsing animation

**Videos:**
- Red border overlay
- "⚠️ Potentially Fake Video" badge
- Warning overlay

### Notifications

- **Top-right slide-in notification** for scan completion
- **Browser notification** for context menu analysis
- **Auto-dismiss after 5 seconds**

---

## 🔒 Permissions

The extension requests the following permissions:

| Permission | Purpose |
|------------|---------|
| `activeTab` | Access current tab content for scanning |
| `scripting` | Inject content scripts and styles |
| `storage` | Save settings and scan history |
| `tabs` | Query and message tabs |
| `<all_urls>` | Access any webpage for scanning |

**Privacy:** All processing happens locally via your backend. No data is sent to external servers except your own API.

---

## 🛠️ Development

### Project Structure

```javascript
// manifest.json - Chrome Extension v3
{
  "manifest_version": 3,
  "name": "VeriFy - AI Deepfake Detector",
  "permissions": ["activeTab", "scripting", "storage", "tabs"],
  "host_permissions": ["<all_urls>"]
}
```

### Key APIs Used

**Chrome Extensions API:**
- `chrome.tabs` - Tab management
- `chrome.storage` - Settings persistence
- `chrome.runtime` - Message passing
- `chrome.contextMenus` - Right-click menus
- `chrome.notifications` - Browser notifications

**Backend API:**
- `POST /api/v1/check-text` - Text analysis
- `POST /api/v1/check-image` - Image analysis
- `POST /api/v1/check-video` - Video analysis
- `GET /api/v1/health` - Backend health check

### Debugging

1. **Popup Debugging:**
   - Right-click extension icon → Inspect popup
   - Console logs appear in popup DevTools

2. **Content Script Debugging:**
   - Open webpage DevTools (F12)
   - Check Console for content script logs
   - Look for: "VeriFy Deepfake Detector: Content script loaded"

3. **Background Script Debugging:**
   - Go to `chrome://extensions/`
   - Click "Inspect views: background page"
   - Check Console for background worker logs

---

## 🧪 Testing

### Test Scenarios

**1. Test Text Detection:**
```javascript
// Example fake news
"Breaking: Scientists discover that Earth is actually flat"
// Expected: 🔴 FAKE with high confidence
```

**2. Test Image Detection:**
- Upload a known deepfake image
- Expected: Red border + warning badge

**3. Test Video Detection:**
- Analyze a deepfake video
- Expected: Overlay warning + confidence score

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] "Scan This Page" button works
- [ ] Page content is extracted correctly
- [ ] API calls succeed (check Network tab)
- [ ] Results display in popup
- [ ] Fake content is highlighted on page
- [ ] Context menu items work
- [ ] Settings page opens and saves
- [ ] Notifications appear

---

## 🚨 Troubleshooting

### Common Issues

**❌ "Cannot connect to backend"**
- **Solution**: Make sure backend is running at `http://localhost:8000`
- Check: Open `http://localhost:8000/api/v1/health` in browser

**❌ "Extension doesn't load"**
- **Solution**: Check Chrome DevTools for errors
- Ensure `manifest.json` is valid JSON
- Verify all files exist in extension folder

**❌ "Icons not showing"**
- **Solution**: Run `python generate_icons.py` to create icons
- Ensure `icons/` folder exists with all 4 icon sizes

**❌ "Nothing happens when scanning"**
- **Solution**: Open Console and check for errors
- Verify content script is loaded (check for log message)
- Check if page blocks content scripts (some sites do)

**❌ "CORS errors in console"**
- **Solution**: Backend must allow CORS from extension
- Backend should have `allow_origins=["*"]` or specific origins

---

## 📊 Performance

### Optimization Strategies

**1. Lazy Loading:**
- Text detector lazy-loads on first use
- Voice detector lazy-loads on first audio analysis

**2. Batch Processing:**
- Limits: 10 texts, 5 images, 3 videos per scan
- Prevents timeout and excessive API calls

**3. Caching:**
- Stores last scan results in `chrome.storage.local`
- Avoids re-scanning same content

**4. Debouncing:**
- Auto-scan (if enabled) has 2-second delay
- Prevents duplicate scans on rapid navigation

### Performance Metrics

| Operation | Average Time |
|-----------|--------------|
| Extract page content | < 100ms |
| Analyze 1 text | ~2-3s |
| Analyze 1 image | ~3-5s |
| Analyze 1 video | ~10-15s |
| Full page scan | ~30-60s |

---

## 🤝 Contributing

### How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use ES6+ JavaScript features
- Follow Chrome extension best practices
- Add comments for complex logic
- Keep functions small and focused

---

## 📜 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

### AI Models

- **RoBERTa**: `hamzab/roberta-fake-news-classification`
- **EfficientNetV2-S**: `Arko007/deepfake-image-detector`
- **Xception DFD**: `Arko007/deepfake-detector-dfd-sota`
- **Wav2Vec2**: `koyelog/deepfake-voice-detector-sota`
- **Gemini 2.0 Flash**: Google Generative AI
- **Tavily API**: Real-time search and fact-checking

### Technologies

- Chrome Extensions Manifest V3
- FastAPI backend
- PyTorch for AI models
- HuggingFace Transformers

---

## 📞 Support

**Issues?** Open an issue on GitHub  
**Questions?** Check documentation or contact maintainers  

---

## 🔮 Future Enhancements

- [ ] Support for audio deepfake detection on webpages
- [ ] Batch export of scan results as PDF
- [ ] Integration with social media platforms
- [ ] Real-time monitoring mode
- [ ] Browser-wide protection (not just current tab)
- [ ] Custom model training interface
- [ ] Multi-language support
- [ ] Collaborative fact-checking community

---

**Made with ❤️ by the VeriFy Team**

*Protecting truth in the age of AI*
