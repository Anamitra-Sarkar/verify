# Backend Model Improvements - Implementation Guide

## Overview
This document provides guidance for implementing the remaining backend model improvements that require additional API integrations and model refinements.

## Completed Items
✅ Frontend location-based trending with user consent
✅ Tavily API integration for real-time trending data
✅ Location parameter support in trending endpoint

## Remaining Backend Tasks

### 1. Text Classification Enhancement with Gemini + Tavily

**Current Implementation:**
- Text is classified using pre-trained models (fake-news-liar-political, fact-check1-v3-final)

**Required Enhancement:**
- Add Gemini API integration for cross-verification
- Use Tavily API for real-time fact-checking when content references recent events (post June 2024)
- Gemini should override the model verdict only when it's confident and has real-time data to support it

**Implementation Steps:**

1. **Update `backend/services/gateway/routers/detection.py`:**
```python
# Add after imports
from google import generativeai as genai
from tavily import TavilyClient
import os

# Initialize clients
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
gemini_model = genai.GenerativeModel('gemini-pro')
tavily = TavilyClient(api_key=os.getenv('TAVILY_API_KEY'))

async def verify_with_gemini_and_tavily(text: str, initial_verdict: dict) -> dict:
    """
    Cross-verify text classification with Gemini and Tavily.
    
    Args:
        text: Text to verify
        initial_verdict: Initial model verdict with confidence
        
    Returns:
        Enhanced verdict with explanation
    """
    # Check if text references recent events
    prompt = f'''Analyze this text and determine if it references events after June 2024:
    "{text}"
    
    If yes, use real-time information to fact-check. Return format:
    - needs_realtime: true/false
    - verdict: REAL/FAKE
    - confidence: 0-1
    - explanation: brief explanation
    '''
    
    gemini_response = await gemini_model.generate_content_async(prompt)
    analysis = parse_gemini_response(gemini_response.text)
    
    if analysis['needs_realtime']:
        # Use Tavily for real-time fact-checking
        search_results = tavily.search(query=text[:200], max_results=3)
        # Analyze search results with Gemini
        fact_check_prompt = f'''Based on these search results:
        {search_results}
        
        Is this claim accurate: "{text}"
        Provide verdict (REAL/FAKE), confidence (0-1), and explanation.
        '''
        final_response = await gemini_model.generate_content_async(fact_check_prompt)
        final_analysis = parse_gemini_response(final_response.text)
        
        # Override only if Gemini is confident
        if final_analysis['confidence'] > 0.8:
            return final_analysis
    
    return initial_verdict
```

2. **Update the text detection endpoint:**
```python
@router.post("/check-text", response_model=DetectionResponse)
async def check_text(request: TextDetectionRequest, ...):
    # ... existing code ...
    
    # Perform initial detection
    initial_result = await detection_service.check_text(...)
    
    # Enhanced verification with Gemini + Tavily
    if os.getenv('GEMINI_API_KEY') and os.getenv('TAVILY_API_KEY'):
        enhanced_result = await verify_with_gemini_and_tavily(
            text_to_analyze,
            initial_result
        )
        return enhanced_result
    
    return initial_result
```

### 2. Image Classification Enhancement with Gemini

**Current Implementation:**
- Images are classified using deepfake-image-detector model

**Required Enhancement:**
- Gemini double-checks image classification
- Confidence threshold logic: if confidence < 70%, flip the verdict
- Gemini can override if it detects obvious manipulation

**Implementation Steps:**

1. **Update image detection in `detection.py`:**
```python
async def verify_image_with_gemini(image_file, initial_verdict: dict) -> dict:
    """
    Verify image classification with Gemini vision model.
    
    Args:
        image_file: Image file data
        initial_verdict: Initial model verdict with confidence
        
    Returns:
        Enhanced verdict with confidence logic
    """
    confidence = initial_verdict['confidence']
    verdict = initial_verdict['verdict']
    
    # Apply confidence threshold logic
    if confidence < 0.70:
        # Flip the verdict if confidence is below 70%
        verdict = 'FAKE' if verdict == 'REAL' else 'REAL'
        explanation = f"Low confidence ({confidence*100:.1f}%) triggered verdict flip"
        initial_verdict['verdict'] = verdict
        initial_verdict['explanation'] = explanation
    
    # Cross-verify with Gemini Vision
    if os.getenv('GEMINI_API_KEY'):
        vision_model = genai.GenerativeModel('gemini-pro-vision')
        prompt = '''Analyze this image for signs of manipulation or deepfake:
        - Check for inconsistent lighting
        - Look for unnatural facial features
        - Check for artifacts or distortions
        - Assess overall authenticity
        
        Return: REAL or FAKE with confidence score and explanation
        '''
        
        response = await vision_model.generate_content_async([prompt, image_file])
        gemini_analysis = parse_gemini_response(response.text)
        
        # Override if Gemini is highly confident and disagrees
        if gemini_analysis['confidence'] > 0.85 and \
           gemini_analysis['verdict'] != initial_verdict['verdict']:
            return gemini_analysis
    
    return initial_verdict
```

### 3. Video Classification Improvements

**Current Issue:**
- Inconsistent labeling causing same fake video to be classified as real

**Required Fixes:**

1. **Review and update video model training data:**
```bash
# Check current model labels
python backend/inspect_checkpoint.py --model deepfake-detector-dfd-sota

# Retrain or fine-tune if necessary
python backend/test_video_detection.py --verify-labels
```

2. **Add Gemini verification for videos:**
```python
async def verify_video_with_gemini(video_path: str, initial_verdict: dict) -> dict:
    """
    Extract key frames and verify with Gemini.
    """
    # Extract frames from video
    frames = extract_key_frames(video_path, num_frames=5)
    
    # Analyze each frame with Gemini Vision
    verdicts = []
    for frame in frames:
        analysis = await verify_image_with_gemini(frame, {})
        verdicts.append(analysis)
    
    # Aggregate results
    fake_count = sum(1 for v in verdicts if v['verdict'] == 'FAKE')
    avg_confidence = sum(v['confidence'] for v in verdicts) / len(verdicts)
    
    final_verdict = 'FAKE' if fake_count > len(verdicts) / 2 else 'REAL'
    
    return {
        'verdict': final_verdict,
        'confidence': avg_confidence,
        'explanation': f'Analyzed {len(frames)} frames: {fake_count} detected as fake'
    }
```

### 4. URL Classification Enhancement

**Current Issue:**
- Wikipedia URLs incorrectly classified as fake

**Required Fixes:**

1. **Add trusted domain whitelist:**
```python
TRUSTED_DOMAINS = [
    'wikipedia.org',
    'bbc.com', 'bbc.co.uk',
    'reuters.com',
    'apnews.com',
    'nature.com',
    'sciencedirect.com',
    'who.int',
    'gov.in', 'gov.uk', 'gov',
    # Add more trusted domains
]

def is_trusted_domain(url: str) -> bool:
    from urllib.parse import urlparse
    domain = urlparse(url).netloc
    return any(trusted in domain for trusted in TRUSTED_DOMAINS)
```

2. **Update URL verification logic:**
```python
async def verify_url_with_models_and_gemini(url: str) -> dict:
    """
    Verify URL using multiple approaches.
    """
    # Check if trusted domain
    if is_trusted_domain(url):
        return {
            'verdict': 'REAL',
            'confidence': 0.95,
            'explanation': 'URL from trusted domain'
        }
    
    # Fetch and analyze content
    content = await fetch_url_content(url)
    
    # Analyze with existing model
    model_verdict = await detect_fake_content(content)
    
    # Cross-verify with Gemini
    if os.getenv('GEMINI_API_KEY'):
        gemini_verdict = await verify_with_gemini_and_tavily(content, model_verdict)
        return gemini_verdict
    
    return model_verdict
```

## Environment Variables Required

Add these to your `.env` file:

```bash
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Tavily API (for real-time fact-checking)
TAVILY_API_KEY=your_tavily_api_key_here

# Feature flags
ENABLE_GEMINI_VERIFICATION=true
ENABLE_TAVILY_REALTIME=true
CONFIDENCE_THRESHOLD=0.70
```

## Testing

After implementing these changes, test with:

```bash
# Test text classification with recent events
python backend/test_text_accuracy.py --with-gemini

# Test image classification with confidence threshold
python backend/test_image_detection.py --threshold=0.70

# Test video classification consistency
python backend/test_video_detection.py --consistency-check

# Test URL classification
python backend/test_url_verification.py --include-wikipedia
```

## Deployment Checklist

- [ ] Add GEMINI_API_KEY to production environment
- [ ] Add TAVILY_API_KEY to production environment
- [ ] Update Google Cloud secrets
- [ ] Update Vercel environment variables
- [ ] Test all detection endpoints
- [ ] Monitor API usage and costs
- [ ] Set up alerts for failed API calls

## Notes

- Gemini API has rate limits - implement caching for frequent requests
- Tavily API has monthly search limits - use wisely
- Consider implementing response caching to reduce API costs
- Monitor confidence scores and adjust thresholds as needed

## Support

For issues or questions:
- Email: anamitrasarkar13@gmail.com
- GitHub: https://github.com/Anamitra-Sarkar
