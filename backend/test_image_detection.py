import requests
import os
from pathlib import Path

print('\n' + '='*70)
print('🖼️  IMAGE DEEPFAKE DETECTION TESTS')
print('='*70 + '\n')

# Test 1: Real photograph
test_images = []
test_dir = Path('test-data')

# Find test images
for img_file in test_dir.glob('*.jpg'):
    test_images.append(img_file)
for img_file in test_dir.glob('*.png'):
    test_images.append(img_file)

if not test_images:
    print('⚠️  No test images found in test-data folder')
    print('   Creating synthetic test images...\n')
    
    # Create simple test images using PIL
    try:
        from PIL import Image, ImageDraw, ImageFont
        import numpy as np
        
        # Test 1: Solid color image (should be REAL - too simple to be deepfake)
        img1 = Image.new('RGB', (400, 400), color=(73, 109, 137))
        img1.save(test_dir / 'test_solid.jpg')
        test_images.append(test_dir / 'test_solid.jpg')
        print('✅ Created test_solid.jpg')
        
        # Test 2: Gradient image
        img2 = Image.new('RGB', (400, 400))
        pixels = img2.load()
        for i in range(400):
            for j in range(400):
                pixels[i, j] = (i % 256, j % 256, (i+j) % 256)
        img2.save(test_dir / 'test_gradient.jpg')
        test_images.append(test_dir / 'test_gradient.jpg')
        print('✅ Created test_gradient.jpg')
        
        # Test 3: Random noise (might trigger as FAKE due to artifacts)
        img3_array = np.random.randint(0, 256, (400, 400, 3), dtype=np.uint8)
        img3 = Image.fromarray(img3_array)
        img3.save(test_dir / 'test_noise.jpg')
        test_images.append(test_dir / 'test_noise.jpg')
        print('✅ Created test_noise.jpg')
        
    except Exception as e:
        print(f'❌ Failed to create test images: {e}')

print(f'\n📋 Found {len(test_images)} test images\n')

# Test each image
results = []
for idx, img_path in enumerate(test_images[:5], 1):  # Test max 5 images
    print(f'🔍 Test {idx}: {img_path.name}')
    
    try:
        with open(img_path, 'rb') as f:
            files = {'file': (img_path.name, f, 'image/jpeg')}
            response = requests.post(
                'http://localhost:8000/api/v1/check-image',
                files=files,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                verdict = result.get('verdict', 'UNKNOWN')
                confidence = result.get('confidence', 0) * 100
                is_fake = result.get('is_fake', False)
                
                color_code = '\033[91m' if is_fake else '\033[92m'  # Red if fake, green if real
                reset_code = '\033[0m'
                
                print(f'   Result: {color_code}{verdict}{reset_code} (Confidence: {confidence:.1f}%)')
                results.append({
                    'image': img_path.name,
                    'verdict': verdict,
                    'confidence': confidence,
                    'is_fake': is_fake
                })
            else:
                print(f'   ❌ Error: {response.status_code} - {response.text[:100]}')
                
    except Exception as e:
        print(f'   ❌ Failed: {str(e)}')
    
    print()

# Summary
print('='*70)
print('📊 IMAGE DETECTION SUMMARY')
print('='*70)
for r in results:
    status = '❌ FAKE' if r['is_fake'] else '✅ REAL'
    img_name = r['image']
    conf = r['confidence']
    print(f'{status} - {img_name:30s} ({conf:.0f}% confidence)')
print()
