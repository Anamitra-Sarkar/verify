"""
FINAL COMPREHENSIVE ACCURACY TEST (December 2025)
Testing with correct current facts and proper endpoint
"""
import requests
import time

# Use the correct endpoint from ai_server.py
API = "http://localhost:8000/check-text"

tests = [
    # CONSPIRACY THEORIES / MISINFORMATION (MUST BE FAKE) - News format
    ("New research confirms that vaccines cause autism and pharmaceutical companies have covered up the evidence", "fake"),
    ("Scientists prove the earth is flat and NASA has been lying to the public about the planet's shape", "fake"),
    ("Medical experts reveal that 5G towers are causing COVID-19 infections across the world", "fake"),
    ("Investigation shows the moon landing in 1969 was staged in a Hollywood film studio", "fake"),
    ("Climate researchers admit that climate change is a hoax invented to control governments", "fake"),
    ("Doctors recommend drinking bleach to cure various diseases including cancer and COVID-19", "fake"),
    
    # VERIFIED FACTS / REAL NEWS (MUST BE REAL) - News format
    ("Scientists confirm that water molecules consist of two hydrogen atoms and one oxygen atom", "real"),
    ("Astronomers verify that the sun appears to rise in the eastern horizon due to Earth's rotation", "real"),
    ("Space agencies confirm that Earth orbits the Sun in an elliptical path taking 365.25 days", "real"),
    ("Geneticists demonstrate that DNA molecules contain genetic information for all living organisms", "real"),
    ("Medical research confirms that humans require oxygen for cellular respiration and survival", "real"),
    
    # HISTORICAL/POLITICAL FACTS (MUST BE REAL) - December 2025
    ("Historical records confirm Barack Obama served as the 44th President of the United States", "real"),
    ("French government confirms that Paris is the capital city of France", "real"),
    ("Donald Trump returns as the US President following the 2024 election results", "real"),  # Correct for Dec 2025
    ("Health officials confirm the COVID-19 pandemic began in late 2019 in Wuhan, China", "real"),
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
