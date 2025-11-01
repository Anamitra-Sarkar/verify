"""
Testing Improved Tavily-Based Fact Checking
Should now correctly identify fake claims!
"""
import requests
import time

API_BASE = "http://localhost:8000/api/v1"

# Extended test cases with various types of claims
test_cases = [
    # === KNOWN CONSPIRACY THEORIES (Should be FAKE) ===
    ("Vaccines cause autism", "FAKE", "Medical conspiracy theory"),
    ("The earth is flat", "FAKE", "Scientific conspiracy theory"),
    ("5G causes COVID-19", "FAKE", "Technology conspiracy theory"),
    ("The moon landing was fake", "FAKE", "Space conspiracy theory"),
    ("Climate change is a hoax", "FAKE", "Environmental conspiracy theory"),
    
    # === SIMPLE FACTUAL TRUTHS (Should be REAL) ===
    ("Water is H2O", "REAL", "Basic chemistry fact"),
    ("The sun rises in the east", "REAL", "Basic astronomy fact"),
    ("Barack Obama was the 44th US President", "REAL", "Historical fact"),
    ("Paris is the capital of France", "REAL", "Geography fact"),
    ("DNA contains genetic information", "REAL", "Biology fact"),
    
    # === CURRENT EVENTS/POLITICS (Should be REAL) ===
    ("Joe Biden is the current US President", "REAL", "Current politics"),
    ("The COVID-19 pandemic started in 2019", "REAL", "Recent history"),
    
    # === RANDOM CLAIMS TO TEST ===
    ("Drinking bleach cures diseases", "FAKE", "Dangerous misinformation"),
    ("Humans need oxygen to breathe", "REAL", "Basic biology"),
    ("The Earth orbits the Sun", "REAL", "Basic astronomy"),
]

print("\n" + "="*90)
print("🧪 TESTING IMPROVED TAVILY-BASED FACT CHECKING")
print("="*90 + "\n")

results = {
    'correct': 0,
    'incorrect': 0,
    'total': len(test_cases),
    'failed': 0
}

details = []

for i, (text, expected, category) in enumerate(test_cases, 1):
    try:
        print(f"[{i}/{len(test_cases)}] Testing: {text[:60]}...")
        
        response = requests.post(
            f"{API_BASE}/check-text",
            json={"text": text},
            timeout=40  # Longer timeout for web searches
        )
        
        if response.status_code != 200:
            print(f"   ❌ API Error: {response.status_code}")
            results['failed'] += 1
            continue
        
        result = response.json()
        verdict = result.get('verdict', result.get('analysis', 'UNKNOWN')).upper()
        confidence = result.get('confidence', 0)
        
        is_correct = verdict == expected
        
        if is_correct:
            results['correct'] += 1
            status = "✅"
            color = "PASS"
        else:
            results['incorrect'] += 1
            status = "❌"
            color = "FAIL"
        
        print(f"   {status} Expected: {expected} | Got: {verdict} ({confidence*100:.1f}%) - {color}")
        
        details.append({
            'claim': text,
            'category': category,
            'expected': expected,
            'got': verdict,
            'confidence': confidence,
            'correct': is_correct
        })
        
        # Small delay to avoid rate limits
        time.sleep(2)
        
    except requests.exceptions.Timeout:
        print(f"   ⏱️ Timeout - web search took too long")
        results['failed'] += 1
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:80]}")
        results['failed'] += 1

# Print detailed results
print("\n" + "="*90)
print("📊 DETAILED RESULTS BY CATEGORY")
print("="*90 + "\n")

# Group by category
categories = {}
for d in details:
    cat = d['category']
    if cat not in categories:
        categories[cat] = {'correct': 0, 'total': 0}
    categories[cat]['total'] += 1
    if d['correct']:
        categories[cat]['correct'] += 1

for cat, stats in categories.items():
    accuracy = (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
    print(f"  {cat:40s} {stats['correct']}/{stats['total']} ({accuracy:.1f}%)")

# Print failed cases
print("\n" + "="*90)
print("❌ INCORRECT PREDICTIONS:")
print("="*90 + "\n")

failed_cases = [d for d in details if not d['correct']]
if failed_cases:
    for f in failed_cases:
        print(f"  Claim: {f['claim']}")
        print(f"    Expected: {f['expected']} | Got: {f['got']} ({f['confidence']*100:.1f}%)")
        print(f"    Category: {f['category']}\n")
else:
    print("  🎉 NO INCORRECT PREDICTIONS! Perfect score!")

# Final summary
print("\n" + "="*90)
print("📈 FINAL ACCURACY")
print("="*90 + "\n")

tested = results['correct'] + results['incorrect']
if tested > 0:
    accuracy = (results['correct'] / tested * 100)
    print(f"  ✅ Correct:   {results['correct']}/{tested}")
    print(f"  ❌ Incorrect: {results['incorrect']}/{tested}")
    print(f"  ⏱️ Failed:    {results['failed']}/{results['total']}")
    print(f"\n  🎯 ACCURACY: {accuracy:.1f}%")
    
    if accuracy >= 90:
        print(f"\n  🏆 EXCELLENT! System is working great!")
    elif accuracy >= 80:
        print(f"\n  ✅ GOOD! System is working well!")
    elif accuracy >= 70:
        print(f"\n  ⚠️ ACCEPTABLE but needs improvement")
    else:
        print(f"\n  ❌ POOR - needs significant fixes")
else:
    print("  ⚠️ No tests completed successfully")

print("\n" + "="*90 + "\n")
