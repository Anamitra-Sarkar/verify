"""
FINAL COMPREHENSIVE ACCURACY TEST (November 2025)
Testing with correct current facts
"""
import requests
import time

API = "http://localhost:8000/api/v1/check-text"

tests = [
    # CONSPIRACY THEORIES (MUST BE FAKE)
    ("Vaccines cause autism", "FAKE"),
    ("The earth is flat", "FAKE"),
    ("5G causes COVID-19", "FAKE"),
    ("The moon landing was fake", "FAKE"),
    ("Climate change is a hoax", "FAKE"),
    ("Drinking bleach cures diseases", "FAKE"),
    
    # BASIC SCIENTIFIC FACTS (MUST BE REAL)
    ("Water is H2O", "REAL"),
    ("The sun rises in the east", "REAL"),
    ("The Earth orbits the Sun", "REAL"),
    ("DNA contains genetic information", "REAL"),
    ("Humans need oxygen to breathe", "REAL"),
    
    # HISTORICAL/POLITICAL FACTS (MUST BE REAL) - November 2025
    ("Barack Obama was the 44th US President", "REAL"),
    ("Paris is the capital of France", "REAL"),
    ("Donald Trump is the current US President", "REAL"),  # Correct for Nov 2025
    ("The COVID-19 pandemic started in 2019", "REAL"),
]

print("\n" + "="*80)
print("🧪 FINAL COMPREHENSIVE ACCURACY TEST (November 2025)")
print("="*80 + "\n")

correct = 0
total = len(tests)
errors = []

for i, (claim, expected) in enumerate(tests, 1):
    try:
        print(f"[{i}/{total}] Testing: {claim[:55]}...")
        
        r = requests.post(API, json={"text": claim}, timeout=40)
        result = r.json()
        verdict = result.get('verdict', 'UNKNOWN')
        confidence = result.get('confidence', 0)
        
        is_correct = verdict == expected
        status = "✅" if is_correct else "❌"
        
        if is_correct:
            correct += 1
        else:
            errors.append((claim, expected, verdict, confidence))
        
        print(f"   {status} Expected: {expected:4s} | Got: {verdict:4s} ({confidence*100:.1f}%)\n")
        
        time.sleep(1.5)
        
    except Exception as e:
        print(f"   ❌ ERROR: {str(e)[:80]}\n")
        errors.append((claim, expected, "ERROR", 0))

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
    for claim, expected, got, conf in errors:
        print(f"  Claim: {claim}")
        print(f"    Expected: {expected} | Got: {got} ({conf*100:.1f}%)\n")

# Grade
if accuracy >= 95:
    print("="*80)
    print("🏆 EXCELLENT! Model is highly accurate!")
    print("="*80)
elif accuracy >= 85:
    print("="*80)
    print("✅ VERY GOOD! Model is performing well!")
    print("="*80)
elif accuracy >= 75:
    print("="*80)
    print("⚠️  GOOD but could be better")
    print("="*80)
else:
    print("="*80)
    print("❌ NEEDS IMPROVEMENT")
    print("="*80)

print()
