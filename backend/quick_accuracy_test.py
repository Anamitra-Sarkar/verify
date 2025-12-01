"""Quick Accuracy Test - Fast iteration"""
import requests
import time

# Use the correct endpoint - ai_server.py uses /check-text, not /api/v1/check-text
API = "http://localhost:8000/check-text"

tests = [
    # MUST BE FAKE - Conspiracy theories and misinformation
    ("Vaccines cause autism", "fake"),
    ("The earth is flat", "fake"),
    ("5G causes COVID-19", "fake"),
    ("The moon landing was fake", "fake"),
    ("Climate change is a hoax", "fake"),
    
    # MUST BE REAL - Scientific and historical facts
    ("Water is H2O", "real"),
    ("The sun rises in the east", "real"),
    ("Barack Obama was the 44th US President", "real"),
    ("Paris is the capital of France", "real"),
    ("DNA contains genetic information", "real"),
    ("The Earth orbits the Sun", "real"),
]

print("\n" + "="*70)
print("🧪 QUICK ACCURACY TEST - AI Models")
print("="*70)
print("Testing fake news detection with RoBERTa + Tavily fact-checking")
print("="*70 + "\n")

correct = 0
total = 0
errors = []

for claim, expected in tests:
    try:
        r = requests.post(API, json={"text": claim}, timeout=35)
        data = r.json()
        
        # The endpoint returns is_fake boolean, not verdict string
        is_fake = data.get('is_fake', False)
        verdict = "fake" if is_fake else "real"
        conf = data.get('confidence', 0)
        model = data.get('model_used', 'Unknown')
        
        # Normalize comparison
        expected_lower = expected.lower()
        verdict_lower = verdict.lower()
        
        is_correct = verdict_lower == expected_lower
        status = "✅" if is_correct else "❌"
        
        if is_correct:
            correct += 1
        else:
            errors.append({
                'claim': claim,
                'expected': expected,
                'got': verdict,
                'confidence': conf,
                'analysis': data.get('analysis', '')[:100]
            })
        
        total += 1
        print(f"{status} {claim[:45]:45s} {verdict.upper():6s} {conf*100:5.1f}%")
        time.sleep(1.5)
    except Exception as e:
        print(f"❌ {claim[:45]:45s} ERROR: {str(e)[:30]}")
        errors.append({'claim': claim, 'expected': expected, 'got': 'ERROR', 'confidence': 0})
        total += 1

print("\n" + "="*70)
accuracy = (correct / total * 100) if total > 0 else 0
print(f"📊 ACCURACY: {correct}/{total} = {accuracy:.1f}%")

if errors:
    print("\n" + "="*70)
    print("❌ INCORRECT PREDICTIONS:")
    print("="*70)
    for err in errors:
        print(f"\n  Claim: {err['claim']}")
        print(f"  Expected: {err['expected'].upper()} | Got: {err.get('got', 'ERROR').upper()} ({err.get('confidence', 0)*100:.1f}%)")
        if 'analysis' in err and err['analysis']:
            print(f"  Analysis: {err['analysis']}")

# Grade the results
print("\n" + "="*70)
if accuracy >= 95:
    print("🏆 EXCELLENT! Model is highly accurate!")
elif accuracy >= 85:
    print("✅ VERY GOOD! Model is performing well!")
elif accuracy >= 70:
    print("⚠️  ACCEPTABLE but could be better")
else:
    print("❌ NEEDS IMPROVEMENT - Model requires tuning")
print("="*70 + "\n")
