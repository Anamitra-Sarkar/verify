import requests
import os
from pathlib import Path

print('\n' + '='*70)
print('🎥 VIDEO DEEPFAKE DETECTION TESTS')
print('='*70 + '\n')

# Find test videos
test_videos = []
test_dir = Path('test-data')

for vid_file in test_dir.glob('*.mp4'):
    test_videos.append(vid_file)
for vid_file in test_dir.glob('*.avi'):
    test_videos.append(vid_file)
for vid_file in test_dir.glob('*.mov'):
    test_videos.append(vid_file)

if not test_videos:
    print('⚠️  No test videos found in test-data folder')
    print('   Creating synthetic test video...\n')
    
    # Create a simple test video using OpenCV
    try:
        import cv2
        import numpy as np
        
        # Test 1: Solid color video (3 seconds, 30fps)
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(str(test_dir / 'test_solid_video.mp4'), fourcc, 30.0, (640, 480))
        
        print('Creating test_solid_video.mp4 (3 seconds)...')
        for i in range(90):  # 90 frames = 3 seconds at 30fps
            frame = np.full((480, 640, 3), (100, 150, 200), dtype=np.uint8)
            out.write(frame)
        
        out.release()
        test_videos.append(test_dir / 'test_solid_video.mp4')
        print('✅ Created test_solid_video.mp4')
        
        # Test 2: Animated video (changing colors)
        out2 = cv2.VideoWriter(str(test_dir / 'test_animated_video.mp4'), fourcc, 30.0, (640, 480))
        
        print('Creating test_animated_video.mp4 (3 seconds)...')
        for i in range(90):
            color = (i % 256, (i * 2) % 256, (i * 3) % 256)
            frame = np.full((480, 640, 3), color, dtype=np.uint8)
            out2.write(frame)
        
        out2.release()
        test_videos.append(test_dir / 'test_animated_video.mp4')
        print('✅ Created test_animated_video.mp4')
        
        # Test 3: Noise video (might trigger as FAKE)
        out3 = cv2.VideoWriter(str(test_dir / 'test_noise_video.mp4'), fourcc, 30.0, (640, 480))
        
        print('Creating test_noise_video.mp4 (2 seconds)...')
        for i in range(60):
            frame = np.random.randint(0, 256, (480, 640, 3), dtype=np.uint8)
            out3.write(frame)
        
        out3.release()
        test_videos.append(test_dir / 'test_noise_video.mp4')
        print('✅ Created test_noise_video.mp4')
        
    except Exception as e:
        print(f'❌ Failed to create test videos: {e}')
        print('   Install opencv-python: pip install opencv-python')

print(f'\n📋 Found {len(test_videos)} test videos\n')

# Test each video
results = []
for idx, vid_path in enumerate(test_videos[:5], 1):  # Test max 5 videos
    print(f'🔍 Test {idx}: {vid_path.name}')
    print(f'   File size: {vid_path.stat().st_size / (1024*1024):.2f} MB')
    
    try:
        with open(vid_path, 'rb') as f:
            files = {'file': (vid_path.name, f, 'video/mp4')}
            print('   ⏳ Uploading and analyzing (this may take 30-60 seconds)...')
            response = requests.post(
                'http://localhost:8000/api/v1/check-video',
                files=files,
                timeout=120  # 2 minutes timeout for video processing
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
                    'video': vid_path.name,
                    'verdict': verdict,
                    'confidence': confidence,
                    'is_fake': is_fake
                })
            else:
                print(f'   ❌ Error: {response.status_code} - {response.text[:200]}')
                
    except requests.Timeout:
        print(f'   ⏱️ Timeout: Video processing took too long (>2 minutes)')
    except Exception as e:
        print(f'   ❌ Failed: {str(e)}')
    
    print()

# Summary
print('='*70)
print('📊 VIDEO DETECTION SUMMARY')
print('='*70)
for r in results:
    status = '❌ FAKE' if r['is_fake'] else '✅ REAL'
    vid_name = r['video']
    conf = r['confidence']
    print(f'{status} - {vid_name:35s} ({conf:.0f}% confidence)')
print()
