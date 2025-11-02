# Before & After Comparison

## 🔴 BEFORE (Broken)

### AnalyzePageWithDragDrop.tsx
```typescript
const API_BASE_URL = '/api';  // ❌ Relative URL - calls same domain

const response = await fetch(`${API_BASE_URL}/v1/check-text`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: textInput }),
});
```

**Result:** Called `https://verify-lime.vercel.app/api/v1/check-text` ❌ 404 Error

---

### CommunityPage.tsx
```typescript
const API_BASE_URL = 'http://localhost:8000/api/v1';  // ❌ Hardcoded localhost

const response = await fetch(`${API_BASE_URL}/community/leaderboard`, {
  method: 'GET',
});
```

**Result:** Called `http://localhost:8000/api/v1/community/leaderboard` ❌ Failed

---

### Chrome Extension (background.js)
```javascript
apiUrl: 'http://localhost:8000/api/v1'  // ❌ Hardcoded localhost
```

**Result:** Extension couldn't connect to backend ❌ Failed

---

## ✅ AFTER (Fixed)

### AnalyzePageWithDragDrop.tsx
```typescript
import { API_CONFIG } from '../config/api';  // ✅ Import centralized config

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;  // ✅ Uses environment variable

const response = await fetch(`${API_BASE_URL}/v1/check-text`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: textInput }),
});
```

**Result:** Calls `https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1/check-text` ✅ Success

---

### CommunityPage.tsx
```typescript
import { API_CONFIG } from '../config/api';  // ✅ Import centralized config

const API_BASE_URL = `${API_CONFIG.BASE_URL}/api/v1`;  // ✅ Uses environment variable

const response = await fetch(`${API_BASE_URL}/community/leaderboard`, {
  method: 'GET',
});
```

**Result:** Calls `https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1/community/leaderboard` ✅ Success

---

### Chrome Extension (background.js)
```javascript
apiUrl: 'https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1'  // ✅ Production URL
```

**Result:** Extension connects to backend ✅ Success

---

## 📊 API Configuration (src/config/api.ts)

### The Fix
```typescript
const getBaseUrl = () => {
  // Use environment variable if set (Vercel deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Fallback to production URL
  return 'https://verify-ai-backend-1997316706.asia-south1.run.app';
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  VERSION: 'v1',
  TIMEOUT: 30000,
};
```

---

## 🔄 URL Flow

### Before
```
User Action → Frontend Component
              ↓
         Relative URL: "/api/v1/check-text"
              ↓
         https://verify-lime.vercel.app/api/v1/check-text
              ↓
         ❌ 404 - API doesn't exist on Vercel
```

### After
```
User Action → Frontend Component
              ↓
         API_CONFIG.BASE_URL + "/api/v1/check-text"
              ↓
         https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1/check-text
              ↓
         ✅ 200 - Backend responds successfully
```

---

## 📝 Environment Variables

### Vercel Dashboard Setup (REQUIRED)
```
Name: VITE_API_URL
Value: https://verify-ai-backend-1997316706.asia-south1.run.app
Environments: ✓ Production ✓ Preview ✓ Development
```

### How It Works
1. During build, Vite reads `VITE_API_URL` from environment
2. Embeds it into the compiled JavaScript
3. `API_CONFIG.BASE_URL` returns the production URL
4. All API calls use the correct backend URL

---

## ✨ Impact

### What Changed
- **7 files** updated to use centralized configuration
- **1 critical fix** in AnalyzePageWithDragDrop.tsx
- **1 critical fix** in CommunityPage.tsx
- **4 files** updated in Chrome extension

### What Works Now
- ✅ Text detection
- ✅ Image detection
- ✅ Video detection
- ✅ Voice detection
- ✅ URL verification
- ✅ Trending topics
- ✅ Community leaderboard
- ✅ Chrome extension auto-scan

### Error Messages
Before: `POST https://verify-lime.vercel.app/api/v1/check-text 404 (Not Found)`

After: `POST https://verify-ai-backend-1997316706.asia-south1.run.app/api/v1/check-text 200 (OK)`

---

## 🎯 Summary

**Problem:** Frontend was calling APIs on its own domain (Vercel)

**Solution:** Use centralized API configuration that points to backend (Cloud Run)

**Result:** All API calls now properly routed to backend ✅
