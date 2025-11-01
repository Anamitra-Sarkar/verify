# 📥 VeriFy Chrome Extension - Installation Guide

## Quick Setup (5 Minutes)

Follow these steps to install and start using the VeriFy AI Deepfake Detector Chrome Extension.

---

## ✅ Prerequisites Checklist

Before installing the extension, make sure:

- [ ] **Chrome Browser** installed (version 88 or later)
- [ ] **Backend Server** running at `http://localhost:8000`
- [ ] **Python 3.11+** installed (for icon generation)
- [ ] **Extension icons** generated (run `python generate_icons.py`)

---

## 🚀 Step-by-Step Installation

### Step 1: Start Backend Server

```powershell
# In terminal, navigate to backend folder
cd "e:\OneDrive\Desktop\Gen Ai Project Final\backend"

# Start the backend
python ai_server_sota.py
```

**Expected Output:**
```
🚀 LOADING SOTA DEEPFAKE DETECTION MODELS
✅ Text Detector (RoBERTa): ⏳ Lazy-loaded
✅ Gemini 2.0 Flash Backup: ✅ Ready
🖼️ Image Detector: ✅ Loaded
🎥 Video Detector: ✅ Loaded
📡 Server running at: http://localhost:8000
```

**Verify Backend:**
Open browser → `http://localhost:8000/api/v1/health`

Expected response:
```json
{
  "status": "healthy",
  "ai_status": {
    "fake_news_detector": true,
    "gemini_backup": true,
    "image_deepfake_detector": true,
    "video_deepfake_detector": true
  }
}
```

---

### Step 2: Generate Extension Icons (First Time Only)

```powershell
# Navigate to extension folder
cd "e:\OneDrive\Desktop\Gen Ai Project Final\chrome-extension"

# Install Pillow (if not already installed)
pip install Pillow

# Generate icons
python generate_icons.py
```

**Expected Output:**
```
Created icons/icon16.png
Created icons/icon32.png
Created icons/icon48.png
Created icons/icon128.png
✅ All icons generated successfully!
```

---

### Step 3: Install Extension in Chrome

#### Option A: Load Unpacked (Development Mode)

1. **Open Chrome Extensions Page**
   - Method 1: Type `chrome://extensions/` in address bar
   - Method 2: Menu (⋮) → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle switch in **top-right corner**
   - Should turn blue when enabled

3. **Load Extension**
   - Click **"Load unpacked"** button
   - Navigate to: `e:\OneDrive\Desktop\Gen Ai Project Final\chrome-extension`
   - Select the `chrome-extension` folder
   - Click **"Select Folder"**

4. **Verify Installation**
   - Extension card should appear with:
     - ✅ Name: "VeriFy - AI Deepfake Detector"
     - ✅ Version: 1.0.0
     - ✅ Icon showing checkmark logo
   - Extension icon appears in Chrome toolbar

---

#### Option B: Pack Extension (Production Mode)

1. **Pack Extension**
   - In `chrome://extensions/`, click **"Pack extension"**
   - Root directory: `e:\OneDrive\Desktop\Gen Ai Project Final\chrome-extension`
   - Private key: Leave empty (first time)
   - Click **"Pack Extension"**

2. **Install CRX File**
   - Chrome creates `.crx` and `.pem` files
   - Drag `.crx` file into Chrome
   - Click **"Add extension"** when prompted

3. **Keep PEM Safe**
   - Save `.pem` file securely
   - Needed for future updates

---

### Step 4: Configure Extension

1. **Click Extension Icon** in toolbar
   - Purple gradient icon with checkmark

2. **Click "⚙️ Settings"** button

3. **Configure Settings:**
   - **Backend API URL**: `http://localhost:8000/api/v1` (default)
   - **Auto-Scan**: Off (recommended for manual control)
   - **Show Notifications**: On
   - **Highlight Content**: On

4. **Click "💾 Save Settings"**

---

## 🧪 Test Installation

### Test 1: Health Check

1. Click extension icon
2. Check status card shows:
   - 📄 Text Elements: -
   - 🖼️ Images: -
   - 🎬 Videos: -

### Test 2: Quick Scan

1. Navigate to any news website (e.g., `https://edition.cnn.com`)
2. Click extension icon
3. Click **"Scan This Page"**
4. Wait for analysis (~30-60 seconds)
5. View results in popup

**Expected Behavior:**
- Button changes to "Scanning..." with animation
- Status counts update (e.g., "📄 Text Elements: 45")
- Results appear showing FAKE/REAL verdicts
- Fake content highlighted on page with red borders

### Test 3: Context Menu

1. Select any text on webpage
2. Right-click
3. Choose **"Check if this text is fake"**
4. Wait for notification
5. See result in browser notification

---

## 🎯 Usage Examples

### Example 1: Scan News Article

1. Go to: `https://www.bbc.com/news`
2. Click VeriFy icon → "Scan This Page"
3. Extension analyzes:
   - Article headlines and text
   - Featured images
   - Embedded videos
4. View flagged content in popup
5. Hover over highlighted items for details

### Example 2: Quick Image Check

1. Find an image on webpage
2. Right-click image
3. Select "Check if this image is fake"
4. Wait 3-5 seconds
5. See notification: "✅ REAL (87.2% confident)"

### Example 3: Verify Viral Claim

1. See suspicious text claim
2. Select the text
3. Right-click → "Check if this text is fake"
4. Get instant verdict from AI models + Gemini verification

---

## 🔧 Troubleshooting

### Issue: "Extension failed to load"

**Symptom:** Error message when loading unpacked extension

**Solutions:**
1. Check `manifest.json` is valid JSON (no syntax errors)
2. Ensure all files are present in folder
3. Run icon generation script again
4. Reload extension: chrome://extensions/ → Reload button

---

### Issue: "Cannot connect to backend"

**Symptom:** Error message in popup when scanning

**Solutions:**
1. **Check backend is running:**
   ```powershell
   # Should show Python process
   Get-Process python*
   ```

2. **Test backend health:**
   ```powershell
   Invoke-RestMethod http://localhost:8000/api/v1/health
   ```

3. **Restart backend:**
   ```powershell
   # Stop existing processes
   Get-Process python* | Stop-Process -Force
   
   # Start backend
   cd "e:\OneDrive\Desktop\Gen Ai Project Final\backend"
   python ai_server_sota.py
   ```

4. **Check firewall:** Ensure port 8000 is not blocked

---

### Issue: "Icons not showing"

**Symptom:** Extension shows default puzzle piece icon

**Solutions:**
1. Navigate to extension folder:
   ```powershell
   cd "e:\OneDrive\Desktop\Gen Ai Project Final\chrome-extension"
   ```

2. Generate icons:
   ```powershell
   python generate_icons.py
   ```

3. Reload extension in chrome://extensions/

---

### Issue: "Nothing happens when scanning"

**Symptom:** Button clicks but no response

**Solutions:**
1. **Open DevTools:**
   - Right-click extension icon → Inspect popup
   - Check Console for errors

2. **Check content script:**
   - Open webpage DevTools (F12)
   - Look for: "VeriFy Deepfake Detector: Content script loaded"

3. **Try different website:**
   - Some sites block content scripts
   - Test on: `https://example.com`

4. **Reload page and extension:**
   - Refresh webpage (F5)
   - Reload extension in chrome://extensions/

---

### Issue: "CORS errors in console"

**Symptom:** Console shows: "has been blocked by CORS policy"

**Solutions:**
1. **Check backend CORS settings:**
   - File: `backend/ai_server_sota.py`
   - Look for: `allow_origins=["http://localhost:3000"]`
   - Should allow all origins for extension

2. **Update CORS:**
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Allow all origins
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Restart backend** after changes

---

## 📱 First-Time User Guide

### What is VeriFy?

VeriFy is a Chrome extension that uses artificial intelligence to detect:
- 📄 **Fake news and misinformation** in text
- 🖼️ **Deepfake images** (AI-generated or manipulated photos)
- 🎬 **Deepfake videos** (synthetic or manipulated videos)

### How Does It Work?

1. **You browse normally** - extension runs in background
2. **Click to scan** - analyzes current page content
3. **AI processes** - uses 5 state-of-the-art models
4. **Get results** - see what's fake vs real
5. **Stay informed** - make better decisions about what you see online

### Why Use VeriFy?

✅ **Protect yourself** from misinformation  
✅ **Verify suspicious content** before sharing  
✅ **Stay informed** about what's real online  
✅ **Free and open-source** - no hidden costs  
✅ **Privacy-focused** - all processing on your local backend  

---

## 🎓 Tips for Best Results

### 1. **Understand Confidence Scores**

- **90-100%**: Very confident (highly likely accurate)
- **70-89%**: Confident (generally accurate)
- **50-69%**: Uncertain (manual verification recommended)

### 2. **When to Trust Results**

✅ **High confidence + Gemini confirmation**  
✅ **Multiple sources support verdict**  
✅ **Recent content with current context**  

⚠️ **Be cautious if:**
- Low confidence (<70%)
- Gemini override conflicts with model
- Historical content (past vs present confusion)

### 3. **Best Practices**

- **Scan before sharing** viral content
- **Use context menu** for quick checks
- **Check settings** if results seem wrong
- **Update backend** regularly for latest models
- **Report false positives** to improve system

---

## 🔄 Updating Extension

### When to Update

- New features released
- Bug fixes available
- Model improvements

### How to Update

1. **For unpacked extension:**
   - Pull latest code
   - Go to chrome://extensions/
   - Click Reload button on VeriFy card

2. **For packed extension:**
   - Download new `.crx` file
   - Drag into Chrome
   - Accept update

---

## 📞 Support

### Get Help

- **Documentation**: Read `README.md` in extension folder
- **Backend Issues**: Check `backend/README.md`
- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions

### Report a Bug

Include:
1. Chrome version
2. Extension version
3. Error message (from Console)
4. Steps to reproduce
5. Expected vs actual behavior

---

## ✅ Installation Complete!

You're all set! The VeriFy extension is now ready to protect you from fake content.

**Next Steps:**
1. ✅ Test on a news website
2. ✅ Try the context menu features
3. ✅ Configure settings to your preference
4. ✅ Start browsing with confidence!

---

**Happy Browsing! 🛡️**

*Stay safe from misinformation with VeriFy*
