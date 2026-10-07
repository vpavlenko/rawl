"""Small GBDT preference scorer, with within-song comparisons and frozen splits.
Uses the pinned phrase-training environment. JSON trees support browser inference.
"""
import argparse, gzip, hashlib, json, math, os, subprocess, sys
from pathlib import Path
os.environ.setdefault('OMP_NUM_THREADS', '4')
import numpy as np
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier

ROOT = Path(__file__).resolve().parents[2]
p = argparse.ArgumentParser()
p.add_argument('--data', default='/private/tmp/rawl-lakh-versions/data.json.gz')
p.add_argument('--promote', action='store_true')
args = p.parse_args()
with gzip.open(args.data, 'rt') as f: data = json.load(f)
base_names = data['manifest']['featureNames']
names = ['absolute.' + n for n in base_names] + ['relative.' + n for n in base_names]
groups = [g for g in data['groups'] if g['accepted']]
splits = {s: [g for g in groups if g['split'] == s] for s in ['train', 'validation', 'test']}
for a in splits:
    assert len(splits[a]) >= 5
    for b in splits:
        if a != b: assert not ({g['splitGroup'] for g in splits[a]} & {g['splitGroup'] for g in splits[b]})

def unique(g): return list({r['midiHash']: r for r in g['rows']}.values())
def vectors(g):
    x = np.asarray([r['features'] for r in unique(g)], dtype=np.float64)
    ranges = x.max(axis=0) - x.min(axis=0)
    rel = np.full_like(x, 0.5)
    np.divide(x - x.min(axis=0), ranges, out=rel, where=ranges > 0)
    return np.concatenate([x, rel], axis=1)

def evaluate(gs, scores):
    top1 = top2 = mrr = correct = pairs = 0; predictions = []
    for g, values in zip(gs, scores):
        rows = unique(g); at = next(i for i, r in enumerate(rows) if r['key'] in g['accepted'])
        gold = values[at]; above = sum(v > gold + 1e-9 for v in values); tied = sum(abs(v - gold) <= 1e-9 for v in values)
        credit = 1/tied if above == 0 else 0; top1 += credit
        top2 += max(0, min(tied, 2-above))/tied
        mrr += sum(1/(above+i) for i in range(1, tied+1))/tied
        for i, v in enumerate(values):
            if i != at: pairs += 1; correct += 1 if gold > v + 1e-9 else 0.5 if abs(gold-v) <= 1e-9 else 0
        ranked = sorted([{'key': r['key'], 'score': float(v)} for r, v in zip(rows, values)], key=lambda r: (-r['score'], r['key']))
        predictions.append({'id': g['id'], 'winner': g['winner'], 'accepted': g['accepted'], 'top1Credit': credit, 'ranked': ranked})
    n = len(gs)
    return {'groups': n, 'top1': top1/n, 'top2': top2/n, 'mrr': mrr/n, 'pairAccuracy': correct/max(1, pairs), 'pairs': pairs, 'predictions': predictions}
def compact(result): return {k:v for k,v in result.items() if k != 'predictions'}
def export(model, x):
    trees = []
    for stage in model._predictors:
        tree = []
        for n in stage[0].nodes:
            assert not n['is_categorical']
            tree.append([int(n['feature_idx']), float(n['num_threshold']), int(n['left']), int(n['right']), float(n['value']), int(n['is_leaf'])])
        trees.append(tree)
    result = {'bias': float(model._baseline_prediction[0,0]), 'trees': trees}
    actual = []
    for row in x:
        score = result['bias']
        for tree in trees:
            node = tree[0]
            while not node[5]: node = tree[node[2] if row[node[0]] <= node[1] else node[3]]
            score += node[4]
        actual.append(1/(1+math.exp(-score)))
    error = float(np.max(np.abs(model.predict_proba(x)[:,1] - actual)))
    assert error < 1e-10
    result['exportMaxProbabilityError'] = error
    return result

xx, yy, ww = [], [], []
for g in splits['train']:
    rows = unique(g); x = vectors(g)
    y = np.asarray([int(r['key'] in g['accepted']) for r in rows])
    weights = np.where(y == 1, 1, 1/max(1, len(rows)-1))
    xx.append(x); yy.extend(y); ww.extend(weights)
x = np.concatenate(xx); y = np.asarray(yy); w = np.asarray(ww); w *= len(w)/w.sum()
positive = ['vocal.namedPart', 'vocal.namedNoteShare', 'vocal.lyricsLogCount', 'vocal.lyricsOnsetAgreement', 'vocal.melodyCandidate', 'arrangement.logNotes', 'arrangement.logPitchedNotes', 'arrangement.voices', 'arrangement.pitchedVoices', 'arrangement.programs', 'arrangement.families', 'grid.quantizedShare']
negative = ['grid.subdivisionError', 'grid.sixteenthError', 'grid.tempoVariation', 'integrity.unmatchedOffShare', 'integrity.unclosedNoteShare', 'arrangement.exactDuplicateNotes']
signs = [1 if n in positive else -1 if n in negative else 0 for n in base_names]*2
candidates = []
configs = [(20,2,10), (40,2,10), (80,2,10), (40,3,10), (80,3,10), (80,2,20)]
for trees, depth, leaf in configs:
    config = {'trees': trees, 'depth': depth, 'minLeaf': leaf, 'l2': 2, 'learningRate': 0.08, 'seed': 41}
    model = HistGradientBoostingClassifier(max_iter=trees, max_depth=depth, max_leaf_nodes=7, min_samples_leaf=leaf, learning_rate=0.08, l2_regularization=2, max_bins=64, monotonic_cst=signs, early_stopping=False, random_state=41)
    model.fit(x,y,sample_weight=w)
    val = compact(evaluate(splits['validation'], [model.decision_function(vectors(g)) for g in splits['validation']]))
    candidates.append({'config':config, 'validation':val, 'model':model, 'export':export(model,x)})
    print(config, val, flush=True)
candidates.sort(key=lambda c: (-c['validation']['top1'], -c['validation']['mrr'], c['config']['trees'], c['config']['depth']))
selected = candidates[0]
metrics = {}
for split, gs in splits.items():
    baselines = {
        'mostVoices': [[r['summary']['voices'] for r in unique(g)] for g in gs],
        'mostNotes': [[r['summary']['notes'] for r in unique(g)] for g in gs],
        'baseFilename': [[int(not __import__('re').search(r'\.\d+\.mid$', r['file'], __import__('re').I)) for r in unique(g)] for g in gs],
        'random': [[0 for r in unique(g)] for g in gs],
    }
    metrics[split] = {'model': compact(evaluate(gs, [selected['model'].decision_function(vectors(g)) for g in gs])),
                     'baselines': {name: compact(evaluate(gs,scores)) for name,scores in baselines.items()}}
test_predictions = evaluate(splits['test'], [selected['model'].decision_function(vectors(g)) for g in splits['test']])['predictions']
strongest_content_baseline = max(metrics['validation']['baselines'][b]['top1'] for b in ['mostVoices','mostNotes','random'])
rejection = bool(selected['validation']['top1'] <= strongest_content_baseline)
artifact = {'version':'lakh-version-gbdt-1', 'featureVersion':data['manifest']['featureVersion']+'-relative-1', 'baseFeatureVersion':data['manifest']['featureVersion'], 'featureNames':names, 'annotationHash':data['manifest']['annotationHash'], 'model':selected['export'],
    'training': {'task':'group-balanced pointwise preference classification, ranked within each song', 'counts':data['manifest']['counts'], **selected['config'], 'maxLeaves':7, 'maxBins':64, 'earlyStopping':False, 'monotonicSigns':signs, 'sampleWeight':'Each song has total positive weight 1 and total comparison weight 1; globally normalized to mean 1.', 'selection':'Validation top-1 then MRR, ties prefer fewer/smaller trees. No test refit.'}}
artifact['version'] = 'lakh-version-gbdt-'+hashlib.sha256(json.dumps(artifact,sort_keys=True).encode()).hexdigest()[:12]
report = {'modelVersion':artifact['version'], 'selection':artifact['training']['selection'], 'candidates':[{k:v for k,v in c.items() if k in ['config','validation']} for c in candidates], 'metrics':metrics, 'testPredictions':test_predictions,
    'promotionRejected':rejection, 'promotionRule':'Must beat random/most-notes/most-voices validation top-1. Filename baseline is reported but excluded from this content-model promotion criterion.',
    'limitations':'136 preference groups, 17 test groups. The first linear experiment opened this same test set; subsequent results are exploratory. Reserve fresh reviewed songs for an unbiased future test. Vocal and timbre descriptors are not independent vocal/audio-quality validation.'}
directory = Path(args.data).parent; report_dir = ROOT/'reports/lakh-version-model'
candidate_path=directory/'candidate-tree-model.json'; candidate_path.write_text(json.dumps(artifact,indent=2)+'\n')
(report_dir/'evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
command_path=directory/'tree-command.json';command_path.write_text(json.dumps([sys.executable,*sys.argv]))
extras_path=directory/'tree-experiments.json';extras_path.write_text(json.dumps({'candidates':[{k:v for k,v in c.items() if k != 'model'} for c in candidates],'labeledGroups':groups}))
metadata_path=directory/'tree-metadata.json';metadata_path.write_text(json.dumps({'python':sys.version,'numpy':np.__version__,'sklearn':sklearn.__version__,'trainingDataHash':hashlib.sha256(Path(args.data).read_bytes()).hexdigest(),'promotionRejected':rejection}))
status = 'failed' if rejection else 'promoted' if args.promote else 'candidate'
subprocess.run(['node',str(ROOT/'scripts/rawl/record-model-training.cjs'),'--model','versionRanking','--status',status,'--artifact',str(candidate_path),'--evaluation',str(report_dir/'evaluation.json'),'--dataset',str(report_dir/'dataset.json'),'--command',str(command_path),'--metadata',str(metadata_path),'--extra-artifacts',str(extras_path)],check=True)
if rejection and args.promote: raise RuntimeError('Promotion rejected: no validation improvement over content baselines')
if args.promote: (ROOT/'src/lakh/versionModel.json').write_text(json.dumps(artifact,indent=2)+'\n')
print(json.dumps({'version':artifact['version'],'validation':metrics['validation'],'test':metrics['test'],'promoted':args.promote and not rejection},indent=2),flush=True)
