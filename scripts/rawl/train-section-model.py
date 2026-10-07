"""Supervised candidate-section GBDT, followed by whole-file semi-Markov DP.
Fit on /f/ training groups; tune decoder/feature ablation on validation only.
Test scoring is a separate explicit step after configuration is frozen.
"""
import argparse, gzip, hashlib, json, math, os, subprocess, sys
from pathlib import Path
os.environ.setdefault('OMP_NUM_THREADS', '4')
import numpy as np
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier

ROOT = Path(__file__).resolve().parents[2]
p = argparse.ArgumentParser()
p.add_argument('step', choices=['fit', 'select', 'test'])
p.add_argument('--data', default='/private/tmp/rawl-section-training/data.jsonl.gz')
p.add_argument('--directory', default='/private/tmp/rawl-section-training')
p.add_argument('--promote', action='store_true')
args = p.parse_args(); directory = Path(args.directory); directory.mkdir(parents=True, exist_ok=True)
manifest = json.loads((ROOT / 'reports/section-model/dataset.json').read_text())
splits = {split: [s for s in manifest['files'] if s['split'] == split] for split in ['train', 'validation', 'test']}
assert not ({s['group'] for s in splits['train']} & {s['group'] for s in splits['validation'] + splits['test']})
assert not ({s['group'] for s in splits['validation']} & {s['group'] for s in splits['test']})

def export(model, x):
    trees = []
    for stage in model._predictors:
        tree = []
        for n in stage[0].nodes:
            if n['is_categorical']: raise RuntimeError('Categorical tree unsupported')
            tree.append([int(n['feature_idx']), float(n['num_threshold']), int(n['left']), int(n['right']), float(n['value']), int(n['is_leaf'])])
        trees.append(tree)
    result = {'bias': float(model._baseline_prediction[0, 0]), 'trees': trees}
    sample = x[::max(1, len(x)//500)]; actual = []
    for row in sample:
        score = result['bias']
        for tree in trees:
            node = tree[0]
            while not node[5]: node = tree[node[2] if row[node[0]] <= node[1] else node[3]]
            score += node[4]
        actual.append(1/(1+math.exp(-score)))
    error = float(np.max(np.abs(model.predict_proba(sample)[:, 1] - actual)))
    assert error < 1e-10, error
    result['exportMaxProbabilityError'] = error
    return result

def metrics(predictions, songs, tolerance=0):
    matched = predicted = reference = 0
    for pp, s in zip(predictions, songs):
        pp = sorted(set(pp) - {1}); truth = sorted(s['truth']); used = set()
        predicted += len(pp); reference += len(truth)
        for m in pp:
            options = [(abs(m-t), j) for j, t in enumerate(truth) if j not in used and abs(m-t) <= tolerance]
            if options: used.add(min(options)[1]); matched += 1
    precision = matched/max(1, predicted); recall = matched/max(1, reference)
    return {'precision': precision, 'recall': recall, 'f1': 2*precision*recall/max(1e-12, precision+recall), 'matched': matched, 'predicted': predicted, 'reference': reference}

decode_cache = {}
def decode(spans, column, count, config):
    if id(spans) not in decode_cache:
        starts, ends = spans[:,0].astype(int), spans[:,1].astype(int)
        maximum = max(manifest['trainLengthCounts'].values())
        priors = np.asarray([math.log(0.002 + manifest['trainLengthCounts'].get(str(int(n)), 0)/maximum) for n in ends-starts])*np.where(ends == count, 0.25, 1)
        offsets = np.searchsorted(ends, np.arange(count+1), side='right')
        decode_cache[id(spans)] = starts, priors, offsets
    starts, priors, offsets = decode_cache[id(spans)]
    scores = spans[:,column]-config['sectionBias'] + config['lengthWeight']*priors
    costs = np.full(count+1, -np.inf); back = np.full(count+1, -1); costs[0] = 0
    # Vectorize candidates sharing the same end; starts always precede end.
    lo = 0
    for end in range(1, count+1):
        hi = int(offsets[end])
        values = costs[starts[lo:hi]] + scores[lo:hi]
        if len(values):
            at = lo + int(np.argmax(values)); costs[end] = values[at-lo]; back[end] = starts[at]
        lo = hi
    result = [1]; end = count
    while end:
        start = int(back[end]); assert start >= 0
        if start: result.append(start+1)
        end = start
    return sorted(result)

if args.step == 'fit':
    xx, yy, ww = [], [], []
    with gzip.open(args.data, 'rt') as f:
        schema = json.loads(next(f))
        for line in f:
            row = json.loads(line)
            if 'examples' not in row: continue
            examples = row['examples']; xx.append(np.asarray([e[1] for e in examples], dtype=np.float32)); yy.extend(e[0] for e in examples); ww.extend([100/len(examples)]*len(examples))
    x = np.concatenate(xx); y = np.asarray(yy); w = np.asarray(ww); del xx
    print(f'Fit on {len(splits["train"])} /f/ songs, {len(y)} candidate spans, {x.shape[1]} features', flush=True)
    models = {}
    for name, prefixes in [('lengthOnly', ('length.',)), ('visualLength', ('length.', 'visual.')), ('full', None)]:
        train_x = x.copy()
        if prefixes: train_x[:, [i for i, n in enumerate(schema['featureNames']) if not n.startswith(prefixes)]] = 0
        model = HistGradientBoostingClassifier(max_iter=100, max_leaf_nodes=15, max_depth=4, learning_rate=0.08, min_samples_leaf=80, l2_regularization=2, max_bins=128, early_stopping=False, random_state=29)
        model.fit(train_x, y, sample_weight=w); models[name] = export(model, train_x)
        print(f'{name} fitted; export error {models[name]["exportMaxProbabilityError"]}', flush=True)
    (directory/'models.json').write_text(json.dumps(models))
    (directory/'schema.json').write_text(json.dumps(schema))
    # Archive fitted ablations even if no selection/test/promotion follows.
    (directory/'fit-artifact.json').write_text(json.dumps({'featureVersion':schema['featureVersion'],'featureNames':schema['featureNames'],'models':models,'configuration':{'trees':100,'maxDepth':4,'maxLeafNodes':15,'learningRate':0.08,'minSamplesLeaf':80,'l2Regularization':2,'maxBins':128,'earlyStopping':False,'seed':29,'sklearn':sklearn.__version__}}))
    (directory/'training-command.json').write_text(json.dumps([sys.executable,*sys.argv]))
    (directory/'training-environment.json').write_text(json.dumps({'python':sys.version,'numpy':np.__version__,'sklearn':sklearn.__version__,'trainingDataHash':hashlib.sha256(Path(args.data).read_bytes()).hexdigest()}))
    subprocess.run(['node',str(ROOT/'scripts/rawl/record-model-training.cjs'),'--model','sections','--status','candidate','--artifact',str(directory/'fit-artifact.json'),'--dataset',str(ROOT/'reports/section-model/dataset.json'),'--command',str(directory/'training-command.json'),'--metadata',str(directory/'training-environment.json')],check=True)
elif args.step == 'select':
    with gzip.open(directory/'validation-scores.json.gz', 'rt') as f: scored = json.load(f)
    assert scored['modelsHash'] == hashlib.sha256((directory/'models.json').read_bytes()).hexdigest()
    by_key = {s['key']: np.asarray(s['spans']) for s in scored['songs']}; songs = splits['validation']; selections = {}
    for column, name in enumerate(scored['models'], 2):
        best = None
        for weight in [0., 0.2, 0.5, 1.]:
            for bias in [-4., -3., -2., -1., 0., 1., 2., 3.]:
                config = {'sectionBias': bias, 'lengthWeight': weight}
                pp = [decode(by_key[s['key']], column, s['count'], config) for s in songs]
                score = metrics(pp, songs)['f1']
                if best is None or score > best['exact']['f1']: best = {'decoder': config, 'exact': metrics(pp, songs), 'withinOneBar': metrics(pp, songs, 1)}
        selections[name] = best; print(name, best, flush=True)
    selected = max(selections, key=lambda name: selections[name]['exact']['f1'])
    result = {'selected': selected, 'modelsHash': scored['modelsHash'], 'validation': selections, 'selection': 'Feature family and decoder chosen on validation groups only. Test scored after freezing configuration; no test refit.'}
    (directory/'selection.json').write_text(json.dumps(result, indent=2))
    print('Frozen selection:', selected, flush=True)
else:
    selection = json.loads((directory/'selection.json').read_text())
    with gzip.open(directory/'test-scores.json.gz', 'rt') as f: scored = json.load(f)
    assert scored['modelsHash'] == selection['modelsHash'] == hashlib.sha256((directory/'models.json').read_bytes()).hexdigest()
    by_key = {s['key']: np.asarray(s['spans']) for s in scored['songs']}; songs = splits['test']; results = {}
    for column, name in enumerate(scored['models'], 2):
        pp = [decode(by_key[s['key']], column, s['count'], selection['validation'][name]['decoder']) for s in songs]
        report = {'exact': metrics(pp, songs), 'withinOneBar': metrics(pp, songs, 1)}
        for label, drums in [('withDrums', True), ('withoutDrums', False)]:
            idx = [i for i, s in enumerate(songs) if s['hasDrums'] == drums]
            report[label] = {'songs': len(idx), 'exact': metrics([pp[i] for i in idx], [songs[i] for i in idx])}
        results[name] = report
    for label, pp in [('eightBarGrid', [list(range(9, s['count']+1, 8)) for s in songs]), ('sixteenBarGrid', [list(range(17, s['count']+1, 16)) for s in songs]), ('previousHeuristic', [s['baseline'] for s in songs])]:
        results[label] = {'exact': metrics(pp, songs), 'withinOneBar': metrics(pp, songs, 1)}
    schema = json.loads((directory/'schema.json').read_text()); models = json.loads((directory/'models.json').read_text()); selected = selection['selected']
    artifact = {'version': 'section-gbdt-1', 'featureVersion': schema['featureVersion'], 'featureNames': schema['featureNames'], 'annotationHash': manifest['annotationHash'], 'training': {'songs': len(splits['train']), 'groups': len({s['group'] for s in splits['train']}), 'drumSongs': sum(s['hasDrums'] for s in splits['train']), 'positiveSpans': manifest['positive'], 'negativeSpans': manifest['negative'], 'sklearn': sklearn.__version__, 'seed': 29, 'trees': 100, 'maxDepth': 4, 'maxLeafNodes': 15, 'learningRate': 0.08, 'minSamplesLeaf': 80, 'l2Regularization': 2, 'maxBins': 128, 'earlyStopping': False, 'selected': selected}, 'lengthCounts': manifest['trainLengthCounts'], 'model': models[selected], 'decoder': selection['validation'][selected]['decoder']}
    artifact['version'] = 'section-gbdt-' + hashlib.sha256(json.dumps(artifact, sort_keys=True).encode()).hexdigest()[:12]
    report = {'modelVersion': artifact['version'], 'dataset': {k:v for k,v in manifest.items() if k not in ['files', 'skipped']}, **selection, 'test': results}
    (ROOT/'reports/section-model/evaluation.json').write_text(json.dumps(report, indent=2))
    (directory/'candidate-model.json').write_text(json.dumps(artifact))
    (ROOT/'reports/section-model/test-predictions.json').write_text(json.dumps([{'key': s['key'], 'truth': s['truth'], 'prediction': decode(by_key[s['key']], 2+scored['models'].index(selected), s['count'], artifact['decoder'])} for s in songs], indent=2))
    if args.promote: (ROOT/'src/harmony/sectionModel.json').write_text(json.dumps(artifact))
    (directory/'training-command.json').write_text(json.dumps([sys.executable,*sys.argv]))
    archive_command=['node',str(ROOT/'scripts/rawl/record-model-training.cjs'),'--model','sections','--status','promoted' if args.promote else 'candidate','--artifact',str(directory/'candidate-model.json'),'--evaluation',str(ROOT/'reports/section-model/evaluation.json'),'--dataset',str(ROOT/'reports/section-model/dataset.json'),'--command',str(directory/'training-command.json'),'--extra-artifacts',str(directory/'models.json')]
    if (directory/'training-environment.json').exists(): archive_command += ['--metadata',str(directory/'training-environment.json')]
    subprocess.run(archive_command,check=True)
    print(json.dumps({'selected': selected, 'test': results}, indent=2), flush=True)
