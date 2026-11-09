#!/usr/bin/env python3
"""Render only the requested original book figures, at 3x reference resolution."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

SOURCE = Path(sys.argv[1]) if len(sys.argv) > 1 else next(Path('/Users/Shared/books').glob('*Inside Arabic Music*'))
OUT = Path(__file__).resolve().parents[2] / 'public' / 'maqam-figures'
# page (1 based), reference rendering height, crop x/y/width/height.
FIGURES = {
    'ajam': [(248, 1700, [352, 850, 444, 92]), (440, 1500, [232, 641, 546, 105]), (440, 1500, [98, 805, 800, 351])],
    'hijaz': [(252, 1700, [330, 1378, 490, 91]), (428, 1500, [205, 1260, 638, 100]), (429, 1500, [95, 104, 786, 293])],
    'nahawand': [(244, 1700, [336, 900, 477, 96]), (432, 1500, [240, 103, 535, 100]), (432, 1500, [118, 260, 775, 401])],
    'kurd': [(254, 1700, [370, 1250, 408, 88]), (437, 1500, [287, 908, 403, 89]), (437, 1500, [98, 1066, 785, 315])],
    'rast': [(242, 1700, [328, 1230, 493, 93]), (414, 1500, [240, 102, 535, 100]), (414, 1500, [118, 265, 775, 490])],
    'bayati': [(250, 1700, [328, 1452, 495, 94]), (420, 1500, [195, 1260, 622, 110]), (421, 1500, [95, 104, 785, 474])],
    'saba': [(256, 1700, [310, 696, 512, 89]), (443, 1500, [235, 240, 541, 115]), (443, 1500, [99, 394, 776, 485])],
    'sikah': [(258, 1700, [366, 1258, 365, 83]), (424, 1500, [320, 593, 404, 89]), (424, 1500, [118, 720, 778, 383])],
    'huzzam': [(258, 1700, [366, 1258, 365, 83]), (423, 1500, [280, 450, 415, 90]), (423, 1500, [96, 600, 780, 480])],
}

OUT.mkdir(parents=True, exist_ok=True)
manifest_path = OUT / 'figures.json'
manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {'source': SOURCE.name, 'sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'figures': {}}
assert manifest['sha256'] == hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'Source PDF changed'
selected = set(sys.argv[2:] or FIGURES.keys())
for name, figures in FIGURES.items():
    if name not in selected:
        continue
    for kind, (page, height, box) in zip(['jins', 'scale', 'sayr'], figures):
        target = OUT / f'{name}-{kind}'
        cmd = ['pdftoppm', '-f', str(page), '-l', str(page), '-scale-to', str(height * 3), '-x', str(box[0] * 3), '-y', str(box[1] * 3), '-W', str(box[2] * 3), '-H', str(box[3] * 3), '-png', '-singlefile', str(SOURCE), str(target)]
        subprocess.run(cmd, check=True)
        manifest['figures'][target.name] = {'pdfPage': page, 'printedPage': page - 35, 'referenceHeight': height, 'crop': box, 'scale': 3, 'sha256': hashlib.sha256(target.with_suffix('.png').read_bytes()).hexdigest()}
(OUT / 'figures.json').write_text(json.dumps(manifest, indent=2) + '\n')
