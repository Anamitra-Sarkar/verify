"""
Generate placeholder icons for Chrome extension
Run: python generate_icons.py
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple icon with the VeriFy logo"""
    # Create image with gradient background
    img = Image.new('RGB', (size, size), '#667eea')
    draw = ImageDraw.Draw(img)
    
    # Draw gradient effect
    for i in range(size):
        # Create vertical gradient from #667eea to #764ba2
        r = int(102 + (118 - 102) * i / size)
        g = int(126 + (75 - 126) * i / size)
        b = int(234 + (162 - 234) * i / size)
        draw.line([(0, i), (size, i)], fill=(r, g, b))
    
    # Draw white circle background
    circle_size = int(size * 0.7)
    circle_pos = (size - circle_size) // 2
    draw.ellipse(
        [circle_pos, circle_pos, circle_pos + circle_size, circle_pos + circle_size],
        fill='white'
    )
    
    # Draw checkmark
    checkmark_size = int(size * 0.5)
    checkmark_offset = (size - checkmark_size) // 2
    
    # Checkmark coordinates (simplified ✓)
    check_points = [
        (checkmark_offset + checkmark_size * 0.2, checkmark_offset + checkmark_size * 0.5),
        (checkmark_offset + checkmark_size * 0.4, checkmark_offset + checkmark_size * 0.7),
        (checkmark_offset + checkmark_size * 0.8, checkmark_offset + checkmark_size * 0.3)
    ]
    
    # Draw checkmark with thick line
    line_width = max(3, size // 20)
    draw.line(
        [check_points[0], check_points[1]], 
        fill='#667eea', 
        width=line_width
    )
    draw.line(
        [check_points[1], check_points[2]], 
        fill='#667eea', 
        width=line_width
    )
    
    # Save
    img.save(filename, 'PNG')
    print(f'Created {filename}')

# Create icons directory if it doesn't exist
os.makedirs('icons', exist_ok=True)

# Generate icons in different sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    create_icon(size, f'icons/icon{size}.png')

print('✅ All icons generated successfully!')
