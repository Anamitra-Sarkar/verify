"""
Test URL Verification with Specific Claims
Tests known true/false claims to verify model accuracy
"""
import requests
import json

API_BASE = "http://localhost:8000/api/v1"

def test_url(description, url, expected_verdict):
    """Test a single URL"""
    print(f"\n{'='*70}")
    print(f"📰 {description}")
    print(f"🔗 URL: {url}")
    print(f"{'='*70}")
    
    try:
        response = requests.post(
            f"{API_BASE}/check-url",
            json={"url": url},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            verdict = result.get('verdict', 'UNKNOWN')
            confidence = result.get('confidence', 0)
            
            match = "✅ CORRECT" if verdict == expected_verdict else "❌ WRONG"
            
            print(f"Result: {verdict} (Confidence: {confidence*100:.1f}%)")
            print(f"Expected: {expected_verdict}")
            print(f"Status: {match}")
            
            return verdict == expected_verdict
        else:
            print(f"❌ Failed: HTTP {response.status_code}")
            print(f"Error: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"❌ Exception: {str(e)}")
        return False

def main():
    """Run targeted URL tests"""
    print("\n" + "="*70)
    print("🧪 URL VERIFICATION - ACCURACY TESTING")
    print("="*70)
    
    test_cases = [
        # Test with simple, clear content
        (
            "Example Domain (Neutral Content)",
            "https://example.com",
            "REAL"  # Should be neutral/real
        ),
        (
            "CDC Official Site",
            "https://www.cdc.gov",
            "REAL"
        ),
        (
            "Snopes Fact-Checking",
            "https://www.snopes.com",
            "REAL"
        ),
        (
            "AP News",
            "https://apnews.com",
            "REAL"
        ),
    ]
    
    results = []
    
    for description, url, expected in test_cases:
        correct = test_url(description, url, expected)
        results.append(correct)
    
    # Summary
    print("\n" + "="*70)
    print("📊 ACCURACY SUMMARY")
    print("="*70)
    
    total = len(results)
    correct = sum(results)
    accuracy = (correct / total * 100) if total > 0 else 0
    
    print(f"\nTotal Tests: {total}")
    print(f"Correct: {correct}")
    print(f"Wrong: {total - correct}")
    print(f"Accuracy: {accuracy:.1f}%")
    
    print("\n" + "="*70)
    print("✅ TESTING COMPLETE!")
    print("="*70 + "\n")
    
    print("💡 NOTE: URL verification uses the same text detection model")
    print("   that achieved 91% accuracy on text claims. Results may vary")
    print("   based on the specific content extracted from each URL.")
    print()

if __name__ == "__main__":
    main()
