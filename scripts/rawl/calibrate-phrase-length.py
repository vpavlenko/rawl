"""Calibrate a strong four-bar preference without refitting boundary trees."""
import argparse
import copy
import gzip
import hashlib
import json
import math
import subprocess
import sys
from pathlib import Path

import numpy as np

from phrase_decoder import (decode, metrics, length_profile,
                            NON_FOUR_BAR_PENALTIES, PROBABILITY_FLOOR)

ROOT = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser()
parser.add_argument('--data', default='/private/tmp/rawl-phrase-training/data.json.gz')
parser.add_argument('--model', default=str(ROOT / 'src/harmony/phraseModel.json'))
parser.add_argument('--promote', action='store_true')
args = parser.parse_args()
data_bytes = Path(args.data).read_bytes()
data = json.loads(gzip.decompress(data_bytes))
model_bytes = Path(args.model).read_bytes()
model = json.loads(model_bytes)
manifest = data['manifest']
assert model['annotationHash'] == manifest['annotationHash']
assert model['featureVersion'] == manifest['featureVersion']
assert model['featureNames'] == data['featureNames']
assert hashlib.sha256((ROOT / manifest['annotations']).read_bytes()).hexdigest() == manifest['annotationHash']
splits = {s: [row for row in data['songs'] if row['split'] == s]
          for s in ['train', 'validation', 'test']}
for a in splits:
    for b in splits:
        if a != b:
            for field in ['group', 'midiHash']:
                assert not ({s[field] for s in splits[a]} & {s[field] for s in splits[b]})
maximum = max(model['phraseLengths'].values())
length_cost = np.asarray([0] + [math.log(.002 + model['phraseLengths'].get(str(n), 0) / maximum)
                                    for n in range(1, 33)])


def tree_probabilities(x, forest):
    """Vectorized evaluation of the already exported numeric trees."""
    score = np.full(len(x), forest['bias'], dtype=float)
    for tree in forest['trees']:
        nodes = np.asarray(tree)
        at = np.zeros(len(x), dtype=int)
        while True:
            internal = np.flatnonzero(nodes[at, 5] == 0)
            if not len(internal):
                break
            current = nodes[at[internal]]
            left = x[internal, current[:, 0].astype(int)] <= current[:, 1]
            at[internal] = np.where(left, current[:, 2], current[:, 3]).astype(int)
        score += nodes[at, 4]
    return 1 / (1 + np.exp(-score))


def probabilities(subset):
    result = [None] * len(subset)
    for branch in ['teacher', 'student']:
        indices = [i for i, s in enumerate(subset)
                   if s['hasDrums'] == (branch == 'teacher')]
        if not indices:
            continue
        rows = [np.asarray(subset[i]['features'][1:], dtype=float) for i in indices]
        x = np.concatenate(rows)
        if branch == 'student':
            x[:, data['drumIndices']] = 0
        q = tree_probabilities(x, model[branch])
        start = 0
        for i, xx in zip(indices, rows):
            result[i] = q[start:start + len(xx)]
            start += len(xx)
    return result


def predictions(qq, subset, configs):
    return [decode(q, s['count'], configs['teacher' if s['hasDrums'] else 'student'], length_cost)
            for q, s in zip(qq, subset)]


def evaluate(pp, subset):
    report = {'exact': metrics(pp, subset), 'withinOneBar': metrics(pp, subset, 1),
              'offGridExact': metrics(pp, subset, offgrid=True),
              'lengths': length_profile(pp, subset)}
    for label, drums in [('withDrums', True), ('withoutDrums', False)]:
        indices = [i for i, s in enumerate(subset) if s['hasDrums'] == drums]
        ss = [subset[i] for i in indices]
        pred = [pp[i] for i in indices]
        report[label] = {'songs': len(ss), 'exact': metrics(pred, ss),
                         'offGridExact': metrics(pred, ss, offgrid=True),
                         'lengths': length_profile(pred, ss)}
    return report


val = splits['validation']
val_q = probabilities(val)
previous_val = evaluate(predictions(val_q, val, model['decoder']), val)
candidates = []
for penalty in NON_FOUR_BAR_PENALTIES:
    configs = {branch: {**config, 'nonFourBarPenalty': penalty,
                       'probabilityFloor': PROBABILITY_FLOOR}
               for branch, config in model['decoder'].items()}
    pp = predictions(val_q, val, configs)
    report = evaluate(pp, val)
    score = .65 * report['exact']['f1'] + .35 * report['offGridExact']['f1']
    candidates.append({'penalty': penalty, 'decoder': configs, 'score': score,
                       'validation': report, 'predictions': pp})
    print(json.dumps({'penalty': penalty, 'validationScore': score,
                      'exactF1': report['exact']['f1'],
                      'fourBarShare': report['lengths']['fourBarShare']}), flush=True)
selected = max(candidates, key=lambda c: (c['score'], c['penalty']))
artifact = copy.deepcopy(model)
artifact['decoder'] = selected['decoder']
artifact['decoderCalibration'] = {
    'version': 'four-bar-default-1', 'sourceModelVersion': model['version'],
    'trainingDataHash': hashlib.sha256(data_bytes).hexdigest(),
    'selection': 'Validation-only 0.65 exact F1 + 0.35 off-grid exact F1; ties prefer stronger penalty. Shared non-four-bar penalty >=2; existing lengthWeight/boundaryBias and fitted trees frozen.',
    'candidatePenalties': NON_FOUR_BAR_PENALTIES,
    'probabilityFloor': PROBABILITY_FLOOR,
}
artifact.pop('version')
artifact['version'] = 'phrase-gbdt-' + hashlib.sha256(json.dumps(artifact, sort_keys=True).encode()).hexdigest()[:12]

# Test is opened only after the selected decoder is frozen. This reuses the old
# held-out corpus, so comparisons are diagnostic rather than a fresh holdout.
test = splits['test']
test_q = probabilities(test)
previous_test = evaluate(predictions(test_q, test, model['decoder']), test)
next_test = evaluate(predictions(test_q, test, selected['decoder']), test)
regular_val = metrics([list(range(5, s['count'] + 1, 4)) for s in val], val)
report = {
    'modelVersion': artifact['version'], 'sourceModelVersion': model['version'],
    'mode': 'decoder-only calibration; boundary trees not refitted',
    'selection': artifact['decoderCalibration'],
    'dataset': {k: v for k, v in manifest.items() if k not in ['files', 'skipped']},
    'referenceValidationLengths': length_profile([s['truth'] for s in val], val),
    'candidates': [{k: v for k, v in c.items() if k != 'predictions'} for c in candidates],
    'validation': {'previous': previous_val, 'selected': selected['validation'],
                   'regularFourBarsExact': regular_val},
    'test': {'previous': previous_test, 'selected': next_test,
             'note': 'Same previously evaluated split; diagnostic comparison. No parameter selected from test.'},
}
directory = Path(args.data).parent / 'four-bar-calibration'
directory.mkdir(exist_ok=True)
fixtures = [{'key': s['key'], 'count': s['count'], 'probabilities': [1, *q.tolist()],
             'decoder': selected['decoder']['teacher' if s['hasDrums'] else 'student'],
             'phraseLengths': artifact['phraseLengths'], 'expected': [1, *pp]}
            for s, q, pp in zip(val, val_q, selected['predictions'])]
fixtures_path = directory / 'decoder-fixtures.json'
fixtures_path.write_text(json.dumps(fixtures))
verification = subprocess.run(['node', str(ROOT / 'scripts/rawl/verify-phrase-decoder.cjs'),
                               str(fixtures_path)], capture_output=True, text=True)
rejection = None
if verification.returncode:
    rejection = 'Cross-language decoder verification failed: ' + verification.stderr
elif selected['validation']['exact']['f1'] <= regular_val['f1']:
    rejection = 'Validation exact F1 failed to beat the fixed four-bar grid'
report['crossLanguageVerification'] = (json.loads(verification.stdout) if verification.returncode == 0
                                        else {'error': rejection})
report_dir = ROOT / 'reports/phrase-model'
report_path = report_dir / 'length-prior-evaluation.json'
report_path.write_text(json.dumps(report, indent=2) + '\n')
artifact_path = directory / 'candidate-model.json'
artifact_path.write_text(json.dumps(artifact, separators=(',', ':')) + '\n')
extras_path = directory / 'variants.json'
extras_path.write_text(json.dumps({'sourceArtifact': model,
                                  'decoderCandidates': report['candidates'],
                                  'validationFixtures': fixtures}))
command_path = directory / 'command.json'
command_path.write_text(json.dumps([sys.executable, *sys.argv]))
metadata_path = directory / 'metadata.json'
metadata_path.write_text(json.dumps({
    'mode': report['mode'], 'python': sys.version, 'numpy': np.__version__,
    'sourceArtifactFileHash': hashlib.sha256(model_bytes).hexdigest(),
    'trainingDataHash': hashlib.sha256(data_bytes).hexdigest(),
    'unchangedTreeHash': hashlib.sha256(json.dumps({k: model[k] for k in ['teacher', 'student']}, sort_keys=True).encode()).hexdigest(),
    'promotionRejection': rejection,
}))
status = 'failed' if rejection else 'promoted' if args.promote else 'candidate'
subprocess.run(['node', str(ROOT / 'scripts/rawl/record-model-training.cjs'),
                '--model', 'phrases', '--status', status, '--artifact', str(artifact_path),
                '--evaluation', str(report_path), '--dataset', str(report_dir / 'dataset.json'),
                '--command', str(command_path), '--extra-artifacts', str(extras_path),
                '--metadata', str(metadata_path)], check=True)
if rejection:
    raise RuntimeError(rejection)
if args.promote:
    (ROOT / 'src/harmony/phraseModel.json').write_bytes(artifact_path.read_bytes())
print(json.dumps({'version': artifact['version'], 'selectedPenalty': selected['penalty'],
                  'previousValidationF1': previous_val['exact']['f1'],
                  'validationF1': selected['validation']['exact']['f1'],
                  'previousTestF1': previous_test['exact']['f1'], 'testF1': next_test['exact']['f1'],
                  'previousTestFourBarShare': previous_test['lengths']['fourBarShare'],
                  'testFourBarShare': next_test['lengths']['fourBarShare'],
                  'promoted': args.promote}), flush=True)
