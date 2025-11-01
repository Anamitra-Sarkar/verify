"""
Focused Text Accuracy Test
"""
import requests
import time

API_BASE = "http://localhost:8000/api/v1"

test_cases = [
    # KNOWN FAKE CLAIMS
    ("Vaccines cause autism", "FAKE"),
    ("The earth is flat", "FAKE"),
    ("5G causes COVID-19", "FAKE"),
    ("The moon landing was fake", "FAKE"),
    
    # KNOWN TRUE FACTS
    ("Water is H2O", "REAL"),
    ("The sun rises in the east", "REAL"),
    ("Barack Obama was the 44th US President", "REAL"),
    ("Paris is the capital of France", "REAL"),
]

print("\n" + "="*80)
print("🧪 TEXT DETECTION ACCURACY TEST")
print("="*80 + "\n")

correct = 0
total = len(test_cases)

for text, expected in test_cases:
    try:
        response = requests.post(
            f"{API_BASE}/check-text",
            json={"text": text},
            timeout=30
        )
        result = response.json()
        verdict = result.get('verdict', result.get('analysis', 'UNKNOWN'))
        confidence = result.get('confidence', 0)
        
        is_correct = verdict.upper() == expected.upper()
        if is_correct:
            correct += 1
            status = "✅"
        else:
            status = "❌"
        
        print(f"{status} Claim: {text[:60]}")
        print(f"   Expected: {expected} | Got: {verdict} ({confidence*100:.1f}%)\n")
        
        time.sleep(1)  # Respect API rate limits
        
    except Exception as e:
        print(f"❌ Error: {text[:60]}")
        print(f"   {str(e)}\n")

print("="*80)
print(f"📊 ACCURACY: {correct}/{total} ({correct/total*100:.1f}%)")
print("="*80 + "\n")
