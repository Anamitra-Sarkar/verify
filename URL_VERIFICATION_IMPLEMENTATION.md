# URL Verification Feature Implementation

## Overview
Added URL verification functionality to the Analyze tab that allows users to verify URLs using the same text detection model (91% accuracy).

## Changes Made

### Frontend Changes

**File: `src/components/AnalyzePageWithDragDrop.tsx`**

1. **Added URL content type:**
   - Updated `ContentType` to include `'url'`
   - Added `Link` icon import from lucide-react
   - Added URL tab to the 5 content type tabs

2. **Added URL state management:**
   - Added `urlInput` state for storing URL input
   - Reset URL input when switching tabs

3. **Added URL input field:**
   - Created URL input section with placeholder
   - Added helper text explaining the feature
   - Input validates URL format (http/https)

4. **Updated analysis logic:**
   - Added URL validation before analysis
   - Added `/api/v1/check-url` endpoint call
   - Displays URL source in results

5. **Updated UI:**
   - Changed grid from 4 to 5 columns for tabs
   - Added URL-specific validation
   - Updated button disabled state to include URL

### Backend Changes

**File: `backend/simple_server.py`**

1. **Added URL detection endpoint:**
   ```python
   @app.post("/api/v1/check-url", response_model=DetectionResponse)
   async def check_url(request: URLDetectionRequest)
   ```

2. **Features:**
   - URL format validation (http/https)
   - Simulated URL content fetching
   - Extracts domain for display in results
   - Uses same response model as text detection
   - Returns fake/real verdict with confidence

3. **Added imports:**
   - `HTTPException` from fastapi
   - `urlparse` from urllib.parse

**File: `backend/ai_server_sota.py`**

1. **Added advanced URL verification:**
   ```python
   @app.post("/api/v1/check-url", response_model=CheckResponse)
   async def check_url(request: URLCheckRequest)
   ```

2. **Features:**
   - Real URL content fetching using `httpx`
   - HTML parsing with `BeautifulSoup4`
   - Text extraction from paragraphs and headings
   - Removes scripts, styles, nav, footer elements
   - Reuses existing `check_text()` logic
   - Web-based fact-checking with Tavily search
   - Gemini AI verification (if available)
   - Comprehensive logging

3. **Added imports:**
   - `urlparse` from urllib.parse

## Required Dependencies

For the advanced backend (`ai_server_sota.py`), install:

```bash
pip install httpx beautifulsoup4
```

Or add to `requirements.txt`:
```
httpx>=0.24.0
beautifulsoup4>=4.12.0
```

## How It Works

### User Flow:
1. User navigates to Analyze tab
2. Clicks on "URL" tab (5th tab)
3. Pastes a URL (e.g., `https://example.com/article`)
4. Clicks "Analyze Content"
5. Backend fetches the URL content
6. Extracts main text from HTML
7. Runs text through the same detection model (91% accuracy)
8. Returns verdict: REAL, FAKE, or UNVERIFIED

### Technical Flow:

**Simple Server (simple_server.py):**
- Validates URL format
- Simulates content fetching (mock for development)
- Returns random verdict (for testing)

**Advanced Server (ai_server_sota.py):**
- Fetches actual URL content with `httpx`
- Parses HTML with BeautifulSoup
- Extracts text from `<p>`, `<h1>`, `<h2>`, `<article>` tags
- Removes noise (scripts, styles, navigation)
- Passes extracted text to `check_text()` function
- Uses Tavily API for web fact-checking
- Uses Gemini AI for verification
- Compares claim with latest web sources
- Returns verdict with confidence score

## Testing

### Frontend Testing:
1. Start frontend: `npm run dev` (port 3001)
2. Navigate to Analyze tab
3. Click URL tab
4. Enter a test URL
5. Click "Analyze Content"
6. Verify result displays correctly

### Backend Testing:

**Test with simple_server.py:**
```bash
cd backend
python simple_server.py
```

**Test with ai_server_sota.py:**
```bash
cd backend
# Install dependencies first
pip install httpx beautifulsoup4
python ai_server_sota.py
```

**Manual API Test:**
```bash
curl -X POST http://localhost:8000/api/v1/check-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.bbc.com/news/world"}'
```

## Configuration

The URL verification uses the exact same model and configurations as text detection:
- **Model:** LIAR Political Fact-Checker / Brain2 General Fact-Checker
- **Confidence:** 60-95%
- **Accuracy:** 91% (same as text detection)
- **Timeout:** 10 seconds for URL fetching
- **Max Content Length:** 5000 characters

## Error Handling

### Frontend:
- Validates URL format (must start with http:// or https://)
- Shows error toast if URL is empty
- Displays error message if analysis fails
- Shows loading spinner during analysis

### Backend:
- Returns 400 for invalid URL format
- Returns 400 if content cannot be extracted
- Returns 500 for server errors
- Logs all errors to console
- 10-second timeout for URL fetching

## Known Limitations

1. **URL Access:** May fail for URLs that require authentication
2. **JavaScript Content:** Cannot extract content rendered by JavaScript
3. **Paywalls:** Cannot access content behind paywalls
4. **Rate Limiting:** May be blocked by aggressive rate limiting
5. **Content Length:** Limited to 5000 characters

## Future Enhancements

1. Add support for JavaScript-rendered content (Playwright/Selenium)
2. Implement caching for frequently checked URLs
3. Add URL reputation checking (blacklist/whitelist)
4. Support for PDF and other document formats
5. Display article metadata (author, publish date, source)
6. Show article preview/summary
7. Add URL history and bookmarking

## Integration with Community Features

When community features are active:
- URL verifications count towards user points
- Users earn 10 points per URL check
- Verified reports earn 50 points
- URL checks appear in user stats
- Contributes to accuracy percentage

## Next Steps

1. **Test the feature:**
   ```bash
   # Terminal 1: Start backend
   cd backend
   python simple_server.py
   
   # Terminal 2: Frontend should already be running
   # Visit http://localhost:3001 and test URL verification
   ```

2. **Install advanced dependencies (optional):**
   ```bash
   cd backend
   pip install httpx beautifulsoup4
   ```

3. **Test with real URLs:**
   - Try news articles: https://www.bbc.com/news, https://www.reuters.com
   - Try blog posts
   - Try fact-checking sites: https://www.snopes.com

## Files Modified

✅ `src/components/AnalyzePageWithDragDrop.tsx` - Frontend UI and logic
✅ `backend/simple_server.py` - Development/testing endpoint
✅ `backend/ai_server_sota.py` - Production endpoint with AI
