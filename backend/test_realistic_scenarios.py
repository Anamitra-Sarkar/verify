import requests
import time

print('\n' + '='*70)
print('🌐 TESTING REALISTIC WEBPAGE SCENARIOS')
print('='*70 + '\n')

test_cases = [
    {"text": "Elon Musk announces Tesla's new AI robot", "expected": "REAL"},
    {"text": "Scientists discover cure for all types of cancer using lemon juice", "expected": "FAKE"},
    {"text": "Apple announces iPhone 16 with new camera features", "expected": "REAL"},
    {"text": "Bill Gates caught using mind control chips in vaccines", "expected": "FAKE"},
    {"text": "India launches Chandrayaan-3 mission to the Moon", "expected": "REAL"},
    {"text": "5G towers confirmed to spread COVID-19 virus", "expected": "FAKE"},
    {"text": "NASA confirms Mars has water ice at the poles", "expected": "REAL"},
    {"text": "Government admits aliens visited Earth in 1947", "expected": "FAKE"}
]

correct = 0
total = len(test_cases)
results = []

for idx, test in enumerate(test_cases, 1):
    print(f'🔍 Test {idx}/{total}: {test["text"][:60]}...')
    
    try:
        response = requests.post(
            'http://localhost:8000/api/v1/check-text',
            json={'text': test['text']},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            verdict = result.get('verdict', 'UNKNOWN')
            confidence = result.get('confidence', 0) * 100
            is_fake = result.get('is_fake', False)
            
            is_correct = (verdict == test['expected'])
            if is_correct:
                correct += 1
                status = '✅ CORRECT'
                color_code = '\033[92m'
            else:
                status = f'❌ WRONG (Expected: {test["expected"]})'
                color_code = '\033[91m'
            
            reset_code = '\033[0m'
            print(f'   Result: {color_code}{verdict}{reset_code} ({confidence:.0f}%) {status}')
            
            results.append({
                'test': test['text'][:50],
                'expected': test['expected'],
                'verdict': verdict,
                'confidence': confidence,
                'correct': is_correct
            })
        else:
            print(f'   ❌ Error: {response.status_code}')
    
    except Exception as e:
        print(f'   ❌ Failed: {str(e)[:100]}')
    
    print()
    time.sleep(1)  # Rate limiting

# Summary
print('='*70)
print('📊 REALISTIC SCENARIO TESTING SUMMARY')
print('='*70)
print(f'\n✅ Correct: {correct}/{total} ({correct/total*100:.0f}%)')
print(f'❌ Incorrect: {total-correct}/{total}\n')

print('Detailed Results:')
print('-' * 70)
for r in results:
    status_icon = '✅' if r['correct'] else '❌'
    print(f'{status_icon} {r["test"][:45]:45s} → {r["verdict"]:4s} ({r["confidence"]:.0f}%)')
print()
