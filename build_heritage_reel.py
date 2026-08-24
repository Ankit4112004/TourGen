from __future__ import annotations

import subprocess
from pathlib import Path

ROOT = Path('/home/ubuntu/tourgen')
SOURCE_DIR = ROOT / 'heritage-assets' / 'optimized'
OUTPUT_DIR = ROOT / 'client' / 'src' / 'assets' / 'heritage'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

scenes = ['bodh-gaya', 'nalanda', 'rajgir', 'golghar', 'vikramshila', 'kesariya']
scene_duration = 2.8
transition = 0.45
fps = 25
frames = int(scene_duration * fps)

command = ['ffmpeg', '-y']
for slug in scenes:
    command.extend(['-loop', '1', '-t', str(scene_duration), '-i', str(SOURCE_DIR / f'{slug}.jpg')])

filters = []
for idx in range(len(scenes)):
    zoom_expression = '1.0+0.0009*on' if idx % 2 == 0 else '1.05-0.0007*on'
    filters.append(
        f'[{idx}:v]scale=960:540:force_original_aspect_ratio=increase,'
        f'crop=960:540,zoompan=z={zoom_expression}:d=1:s=960x540:fps={fps},'
        f'setsar=1,format=yuv420p[v{idx}]'
    )

current = 'v0'
for idx in range(1, len(scenes)):
    offset = idx * (scene_duration - transition)
    output = f'x{idx}'
    filters.append(f'[{current}][v{idx}]xfade=transition=fade:duration={transition}:offset={offset:.2f}[{output}]')
    current = output

filter_complex = ';'.join(filters)
command.extend([
    '-filter_complex', filter_complex,
    '-map', f'[{current}]',
    '-an',
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '25',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
    str(OUTPUT_DIR / 'heritage-reel.mp4'),
])

subprocess.run(command, check=True)
subprocess.run([
    'ffmpeg', '-y', '-i', str(OUTPUT_DIR / 'heritage-reel.mp4'), '-frames:v', '1',
    '-q:v', '2', str(OUTPUT_DIR / 'heritage-reel-poster.jpg')
], check=True)
print(f'Created {OUTPUT_DIR / "heritage-reel.mp4"}')
print(f'Created {OUTPUT_DIR / "heritage-reel-poster.jpg"}')
