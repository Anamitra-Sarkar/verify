"""Quick Accuracy Test - Fast iteration"""
import requests
import time

API = "http://localhost:8000/api/v1/check-text"

tests = [
    # MUST BE FAKE
    ("Vaccines cause autism", "FAKE"),
    ("The earth is flat", "FAKE"),
    ("5G causes COVID-19", "FAKE"),
    ("The moon landing was fake", "FAKE"),
    ("Climate change is a hoax", "FAKE"),
    
    # MUST BE REAL
    ("Water is H2O", "REAL"),
    ("The sun rises in the east", "REAL"),
    ("Barack Obama was the 44th US President", "REAL"),
    ("Paris is the capital of France", "REAL"),
    ("DNA contains genetic information", "REAL"),
    ("Joe Biden is the current US President", "REAL"),
    ("The Earth orbits the Sun", "REAL"),
]

print("\n" + "="*70)
print("🧪 QUICK ACCURACY TEST")
print("="*70)

correct = 0
total = 0
errors = []

for claim, expected in tests:
    try:
        r = requests.post(API, json={"text": claim}, timeout=35)
        verdict = r.json().get('verdict', 'UNKNOWN')
        conf = r.json().get('confidence', 0)
        
        status = "✅" if verdict == expected else "❌"
        if verdict == expected:
            correct += 1
        else:
            errors.append(f"{claim[:40]} -> Expected {expected}, got {verdict}")
        
        total += 1
        print(f"{status} {claim[:45]:45s} {verdict:4s} {conf*100:5.1f}%")
        time.sleep(1.5)
    except Exception as e:
        print(f"❌ {claim[:45]:45s} ERROR")
        total += 1

print("\n" + "="*70)
print(f"📊 ACCURACY: {correct}/{total} = {correct/total*100:.1f}%")

if errors:
    print("\n❌ ERRORS:")
    for e in errors:
        print(f"   {e}")

print("="*70 + "\n")
