import requests, time
API = 'http://localhost:8000/api/v1/check-text'
tests = [
    ('Vaccines cause autism', 'FAKE'),
    ('The earth is flat', 'FAKE'),
    ('5G causes COVID-19', 'FAKE'),
    ('Donald Trump is the current US President', 'REAL'),
    ('Water is H2O', 'REAL'),
    ('Paris is the capital of France', 'REAL'),
    ('The Earth orbits the Sun', 'REAL'),
]
print('\n' + '='*70); print('ACCURACY TEST (Nov 2025)'); print('='*70)
correct = 0
for claim, expected in tests:
    try:
        r = requests.post(API, json={'text': claim}, timeout=40)
        verdict = r.json().get('verdict', 'UNKNOWN')
        conf = r.json().get('confidence', 0)
        status = '' if verdict == expected else ''
        if verdict == expected: correct += 1
        print(f'{status} {claim[:40]:40s} {verdict:4s} {conf*100:5.1f}%')
        time.sleep(2)
    except Exception as e:
        print(f' {claim[:40]:40s} ERROR: {str(e)[:30]}')
print(f'\n ACCURACY: {correct}/{len(tests)} = {correct/len(tests)*100:.1f}%\n' + '='*70)
