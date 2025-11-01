"""
Test URL Verification Feature
Tests the /api/v1/check-url endpoint with various URLs
"""
import requests
import json
from time import sleep

API_BASE = "http://localhost:8000/api/v1"

def test_url(url, expected_verdict=None):
    """Test a single URL"""
    print(f"\n{'='*70}")
    print(f"🔗 Testing URL: {url}")
    print(f"{'='*70}")
    
    try:
        response = requests.post(
            f"{API_BASE}/check-url",
            json={"url": url},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            verdict = result.get('verdict', 'UNKNOWN')
            confidence = result.get('confidence', 0)
            analysis = result.get('analysis', 'No analysis')
            
            print(f"✅ Success!")
            print(f"   Verdict: {verdict}")
            print(f"   Confidence: {confidence*100:.1f}%")
            print(f"   Analysis: {analysis[:100]}...")
            
            if expected_verdict:
                match = "✅ MATCH" if verdict == expected_verdict else "❌ MISMATCH"
                print(f"   Expected: {expected_verdict} - {match}")
            
            return {
                'url': url,
                'verdict': verdict,
                'confidence': confidence,
                'success': True
            }
        else:
            print(f"❌ Failed: HTTP {response.status_code}")
            print(f"   Error: {response.text}")
            return {
                'url': url,
                'verdict': 'ERROR',
                'confidence': 0,
                'success': False,
                'error': response.text
            }
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return {
            'url': url,
            'verdict': 'ERROR',
            'confidence': 0,
            'success': False,
            'error': str(e)
        }

def main():
    """Run URL verification tests"""
    print("\n" + "="*70)
    print("🧪 URL VERIFICATION TESTING")
    print("="*70)
    
    # Test cases: (url, expected_verdict)
    test_cases = [
        # Trusted News Sources (should be REAL)
        ("https://www.bbc.com/news", "REAL"),
        ("https://www.snopes.com", "REAL"),
        ("https://apnews.com", "REAL"),
        
        # Simple test pages
        ("https://example.com", None),  # Neutral
        ("https://www.wikipedia.org", "REAL"),
        
        # Government/Official sites (should be REAL)
        ("https://www.cdc.gov", "REAL"),
        ("https://www.who.int", "REAL"),
    ]
    
    results = []
    
    for url, expected in test_cases:
        result = test_url(url, expected)
        results.append(result)
        sleep(2)  # Be polite to servers
    
    # Summary
    print("\n" + "="*70)
    print("📊 TEST SUMMARY")
    print("="*70)
    
    success_count = sum(1 for r in results if r['success'])
    total_count = len(results)
    
    print(f"\nTotal Tests: {total_count}")
    print(f"Successful: {success_count}")
    print(f"Failed: {total_count - success_count}")
    
    print("\n📋 Results:")
    for r in results:
        status = "✅" if r['success'] else "❌"
        print(f"{status} {r['url'][:50]:50} → {r['verdict']:10} ({r['confidence']*100:.0f}%)")
    
    # Verdict distribution
    verdicts = {}
    for r in results:
        if r['success']:
            v = r['verdict']
            verdicts[v] = verdicts.get(v, 0) + 1
    
    print("\n📈 Verdict Distribution:")
    for verdict, count in verdicts.items():
        print(f"   {verdict}: {count}")
    
    print("\n" + "="*70)
    print("✅ URL VERIFICATION TESTING COMPLETE!")
    print("="*70 + "\n")

if __name__ == "__main__":
    main()
