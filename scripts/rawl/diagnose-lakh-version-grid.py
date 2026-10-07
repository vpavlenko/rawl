"""Investigate global onset phase; this does not infer musical bar placement."""
import argparse
import gzip
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--data', default='/private/tmp/rawl-lakh-versions/visual.json.gz')
parser.add_argument('--cases', nargs='+', type=int, default=[40, 76, 133])
args = parser.parse_args()
data = json.loads(gzip.decompress(Path(args.data).read_bytes()))
report = []

def share(onsets, phase):
    shifted = onsets - phase
    error = np.minimum(np.abs(shifted * 4 - np.round(shifted * 4)) / 4,
                       np.abs(shifted * 3 - np.round(shifted * 3)) / 3)
    return float(np.mean(error < .02))

for case in data['cases']:
    if case['number'] not in args.cases:
        continue
    selected = [r for r in case['rows'] if r['manual']]
    if len(selected) != 1 or selected[0].get('error'):
        raise ValueError(f"Need one readable annotated version: {case['id']}")
    row = selected[0]
    pitched = {v['id'] for v in row['voices'] if not v['drum']}
    onsets = np.asarray([n[0] for n in row['notes'] if n[3] in pitched])
    if not len(onsets):
        raise ValueError(f"No pitched onsets: {case['id']}")
    phases = np.arange(120) / 480
    scores = [share(onsets, phase) for phase in phases]
    best = int(np.argmax(scores))
    report.append({
        'number': case['number'], 'id': case['id'], 'key': row['key'],
        'unshiftedQuantizedShare': share(onsets, 0),
        'bestQuarterBeatPhase': float(phases[best]),
        'phaseCorrectedShare': scores[best],
        'semantics': 'Diagnostic in-sample search of global phase [0,.25), step 1/480 quarter beat; pitched onsets, straight sixteenth / triplet grid, tolerance <.02. Does not establish correct musical bar phase or meter.',
    })
if len(report) != len(set(args.cases)):
    raise ValueError('Requested case missing')
target = ROOT / 'reports/lakh-version-model/visual-review/grid-diagnostics.json'
target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(report, ensure_ascii=False))
