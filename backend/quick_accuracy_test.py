"""Quick Accuracy Test - Fast iteration"""
import requests
import time

# Use the correct endpoint - ai_server.py uses /check-text, not /api/v1/check-text
API = "http://localhost:8000/check-text"

tests = [
    # FAKE - Conspiracy theories and misinformation (direct claims work better)
    ("Vaccines cause autism and lead to developmental disorders", "fake"),
    ("The earth is flat and Antarctica forms an ice wall at the edge", "fake"),  
    ("5G towers spread coronavirus and cause COVID-19 infections", "fake"),
    ("The moon landing was faked in a Hollywood studio", "fake"),
    ("Climate change is a hoax invented by scientists to get funding", "fake"),
    ("Drinking bleach cures cancer and other diseases", "fake"),
    
    # REAL - Actual news and verified facts
    ("NASA launched Perseverance rover to Mars in 2020 to search for ancient life", "real"),
    ("Scientists discover DNA structure contains genetic instructions using double helix", "real"),
    ("Barack Obama elected as 44th US President serving from 2009 to 2017", "real"),
    ("Paris serves as France's capital with over 2 million residents in the city", "real"),
    ("Earth completes orbit around the Sun in 365.25 days causing seasons", "real"),
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
