"""
FINAL COMPREHENSIVE ACCURACY TEST (December 2025)
Testing with correct current facts and proper endpoint
"""
import requests
import time

# Use the correct endpoint from ai_server.py
API = "http://localhost:8000/check-text"

tests = [
    # CONSPIRACY THEORIES (MUST BE FAKE)
    ("Vaccines cause autism", "fake"),
    ("The earth is flat", "fake"),
    ("5G causes COVID-19", "fake"),
    ("The moon landing was fake", "fake"),
    ("Climate change is a hoax", "fake"),
    ("Drinking bleach cures diseases", "fake"),
    
    # BASIC SCIENTIFIC FACTS (MUST BE REAL)
    ("Water is H2O", "real"),
    ("The sun rises in the east", "real"),
    ("The Earth orbits the Sun", "real"),
    ("DNA contains genetic information", "real"),
    ("Humans need oxygen to breathe", "real"),
    
    # HISTORICAL/POLITICAL FACTS (MUST BE REAL) - December 2025
    ("Barack Obama was the 44th US President", "real"),
    ("Paris is the capital of France", "real"),
    ("Donald Trump is the current US President", "real"),  # Correct for Dec 2025
    ("The COVID-19 pandemic started in 2019", "real"),
]

print("\n" + "="*80)
print("🧪 FINAL COMPREHENSIVE ACCURACY TEST (December 2025)")
print("="*80)
print("Testing AI models: RoBERTa Fake News Detector + Tavily Fact-Checking")
print("="*80 + "\n")

correct = 0
total = len(tests)
errors = []

for i, (claim, expected) in enumerate(tests, 1):
    try:
        print(f"[{i}/{total}] Testing: {claim[:55]}...")
        
        r = requests.post(API, json={"text": claim}, timeout=40)
        result = r.json()
        
        # The endpoint returns is_fake boolean
        is_fake = result.get('is_fake', False)
        verdict = "fake" if is_fake else "real"
        confidence = result.get('confidence', 0)
        analysis = result.get('analysis', '')
        
        # Normalize comparison
        is_correct = verdict.lower() == expected.lower()
        status = "✅" if is_correct else "❌"
        
        if is_correct:
            correct += 1
        else:
            errors.append({
                'claim': claim,
                'expected': expected,
                'got': verdict,
                'confidence': confidence,
                'analysis': analysis[:150]
            })
        
        print(f"   {status} Expected: {expected.upper():5s} | Got: {verdict.upper():5s} ({confidence*100:.1f}%)")
        if not is_correct:
            print(f"   Analysis preview: {analysis[:80]}...")
        print()
        
        time.sleep(1.5)
        
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)[:80]}\n")
        errors.append({
            'claim': claim,
            'expected': expected,
            'got': "ERROR",
            'confidence': 0,
            'analysis': str(e)
        })

# Results
print("="*80)
print(f"📊 FINAL RESULTS")
print("="*80 + "\n")

accuracy = (correct / total * 100) if total > 0 else 0

print(f"  ✅ Correct:   {correct}/{total}")
print(f"  ❌ Incorrect: {len(errors)}/{total}")
print(f"\n  🎯 ACCURACY: {accuracy:.1f}%\n")

if errors:
    print("="*80)
    print("❌ INCORRECT PREDICTIONS:")
    print("="*80 + "\n")
    for err in errors:
        print(f"  Claim: {err['claim']}")
        print(f"    Expected: {err['expected'].upper()} | Got: {err['got'].upper()} ({err['confidence']*100:.1f}%)")
        print(f"    Analysis: {err['analysis']}")
        print()

# Grade
print("="*80)
if accuracy >= 95:
    print("🏆 EXCELLENT! Model is highly accurate and production-ready!")
elif accuracy >= 85:
    print("✅ VERY GOOD! Model is performing well for production use!")
elif accuracy >= 75:
    print("⚠️  GOOD but could be better - acceptable for production")
else:
    print("❌ NEEDS IMPROVEMENT - requires model tuning or better training data")
print("="*80)

print()
