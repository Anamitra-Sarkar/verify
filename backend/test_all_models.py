"""
Comprehensive Test of All VeriFy AI Endpoints
Tests: Text, Image, Video, Voice, URL
"""
import requests
import os
from pathlib import Path

API_BASE = "http://localhost:8000/api/v1"

def test_text():
    """Test text detection endpoint"""
    print("\n" + "="*70)
    print("1️⃣  TESTING TEXT DETECTION")
    print("="*70)
    
    test_cases = [
        ("The earth is flat", "Should detect FAKE"),
        ("Vaccines cause autism", "Should detect FAKE"),
        ("Water is H2O", "Should detect REAL"),
        ("The sun rises in the east", "Should detect REAL"),
    ]
    
    for text, expected in test_cases:
        try:
            response = requests.post(
                f"{API_BASE}/check-text",
                json={"text": text},
                timeout=30
            )
            result = response.json()
            verdict = result.get('verdict', result.get('is_fake'))
            confidence = result.get('confidence', 0)
            
            print(f"\n📝 Text: '{text}'")
            print(f"   {expected}")
            print(f"   ✅ Verdict: {verdict} | Confidence: {confidence*100:.1f}%")
        except Exception as e:
            print(f"   ❌ Error: {str(e)}")

def test_url():
    """Test URL verification endpoint"""
    print("\n" + "="*70)
    print("2️⃣  TESTING URL VERIFICATION")
    print("="*70)
    
    test_urls = [
        ("https://www.cdc.gov", "Official CDC site - should be REAL"),
        ("https://www.snopes.com", "Fact-checking site - should be REAL"),
        ("https://example.com", "Example domain - neutral"),
    ]
    
    for url, expected in test_urls:
        try:
            print(f"\n🔗 URL: {url}")
            print(f"   {expected}")
            response = requests.post(
                f"{API_BASE}/check-url",
                json={"url": url},
                timeout=30
            )
            result = response.json()
            verdict = result.get('verdict', result.get('is_fake'))
            confidence = result.get('confidence', 0)
            
            print(f"   ✅ Verdict: {verdict} | Confidence: {confidence*100:.1f}%")
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:100]}")

def test_image():
    """Test image detection endpoint"""
    print("\n" + "="*70)
    print("3️⃣  TESTING IMAGE DETECTION")
    print("="*70)
    
    # Look for test images
    test_dir = Path("test-data")
    if test_dir.exists():
        image_files = list(test_dir.glob("*.jpg")) + list(test_dir.glob("*.png"))
        if image_files:
            img_file = image_files[0]
            try:
                print(f"\n🖼️  Testing with: {img_file.name}")
                with open(img_file, 'rb') as f:
                    response = requests.post(
                        f"{API_BASE}/check-image",
                        files={'file': f},
                        timeout=30
                    )
                result = response.json()
                verdict = result.get('verdict', result.get('is_fake'))
                confidence = result.get('confidence', 0)
                
                print(f"   ✅ Verdict: {verdict} | Confidence: {confidence*100:.1f}%")
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:100]}")
        else:
            print("   ⚠️  No test images found in test-data/")
    else:
        print("   ⚠️  test-data/ directory not found")
        print("   ℹ️  You can test by uploading an image via the web UI")

def test_video():
    """Test video detection endpoint"""
    print("\n" + "="*70)
    print("4️⃣  TESTING VIDEO DETECTION")
    print("="*70)
    
    # Look for test videos
    test_dir = Path("test-data")
    if test_dir.exists():
        video_files = list(test_dir.glob("*.mp4"))
        if video_files:
            vid_file = video_files[0]
            try:
                print(f"\n🎥 Testing with: {vid_file.name}")
                with open(vid_file, 'rb') as f:
                    response = requests.post(
                        f"{API_BASE}/check-video",
                        files={'file': f},
                        timeout=30
                    )
                result = response.json()
                job_id = result.get('job_id')
                
                print(f"   ✅ Video uploaded! Job ID: {job_id}")
                print(f"   ℹ️  Video processing is async - check result later")
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:100]}")
        else:
            print("   ⚠️  No test videos found in test-data/")
    else:
        print("   ⚠️  test-data/ directory not found")
        print("   ℹ️  You can test by uploading a video via the web UI")

def test_voice():
    """Test voice detection endpoint"""
    print("\n" + "="*70)
    print("5️⃣  TESTING VOICE DETECTION")
    print("="*70)
    
    # Look for test audio
    test_dir = Path("test-data")
    if test_dir.exists():
        audio_files = list(test_dir.glob("*.mp3")) + list(test_dir.glob("*.wav"))
        if audio_files:
            audio_file = audio_files[0]
            try:
                print(f"\n🎤 Testing with: {audio_file.name}")
                with open(audio_file, 'rb') as f:
                    response = requests.post(
                        f"{API_BASE}/check-voice",
                        files={'file': f},
                        timeout=30
                    )
                result = response.json()
                verdict = result.get('verdict', result.get('is_fake'))
                confidence = result.get('confidence', 0)
                
                print(f"   ✅ Verdict: {verdict} | Confidence: {confidence*100:.1f}%")
            except Exception as e:
                print(f"   ❌ Error: {str(e)[:100]}")
        else:
            print("   ⚠️  No test audio found in test-data/")
    else:
        print("   ⚠️  test-data/ directory not found")
        print("   ℹ️  You can test by uploading audio via the web UI")

def main():
    print("\n" + "="*70)
    print("🧪 VeriFy AI - COMPREHENSIVE MODEL TESTING")
    print("="*70)
    print(f"\nAPI Base: {API_BASE}")
    
    # Check server health
    try:
        health = requests.get(f"{API_BASE}/health", timeout=5)
        print(f"✅ Backend: ONLINE")
    except:
        print(f"❌ Backend: OFFLINE - Start with: python ai_server_sota.py")
        return
    
    # Run all tests
    test_text()
    test_url()
    test_image()
    test_video()
    test_voice()
    
    # Summary
    print("\n" + "="*70)
    print("✅ TESTING COMPLETE!")
    print("="*70)
    print("\n📱 Frontend Test:")
    print("   1. Visit: http://localhost:3000")
    print("   2. Go to Analyze tab")
    print("   3. Try each content type (Text, Image, Video, Voice, URL)")
    print("   4. Verify results match expectations")
    print("\n" + "="*70 + "\n")

if __name__ == "__main__":
    main()
