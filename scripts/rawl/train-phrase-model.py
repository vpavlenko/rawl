"""Fit song-grouped drum/pitched teachers and an out-of-fold distilled student.
Run prepare-phrase-training.cjs first. Requires numpy + scikit-learn 1.9.1.
Only --promote writes the model used by Rawl; reports always describe candidates.
"""
import argparse, gzip, hashlib, json, math, os
from pathlib import Path
os.environ.setdefault('OMP_NUM_THREADS', '4')
import numpy as np
import sklearn
from sklearn.ensemble import HistGradientBoostingClassifier

ROOT = Path(__file__).resolve().parents[2]
p = argparse.ArgumentParser()
p.add_argument('--data', default='/private/tmp/rawl-phrase-training/data.json.gz')
p.add_argument('--promote', action='store_true')
p.add_argument('--trees', type=int, default=140)
args = p.parse_args()
with gzip.open(args.data, 'rt') as f: data = json.load(f)
songs = data['songs']; drum_indices = data['drumIndices']; feature_names = data['featureNames']
assert len({s['group'] for s in songs if s['split']=='train'} & {s['group'] for s in songs if s['split']!='train'}) == 0

def rows(subset):
    xx, yy, ww, folds = [], [], [], []
    for s in subset:
        n=s['count']-1; truth=set(s['truth'])
        xx.extend(s['features'][1:]); yy.extend(int(m+1 in truth) for m in range(1, s['count']))
        # Keep long arrangements from dominating short pieces.
        ww.extend([100 / n] * n)
        fold=int(hashlib.sha256(s['group'].encode()).hexdigest()[:8],16)%3
        folds.extend([fold]*n)
    return np.asarray(xx,dtype=np.float64), np.asarray(yy), np.asarray(ww), np.asarray(folds)

def fit(x,y,w,trees=None):
    model=HistGradientBoostingClassifier(max_iter=trees or args.trees, max_leaf_nodes=15, max_depth=4,
        learning_rate=0.07, min_samples_leaf=100, l2_regularization=2, early_stopping=False,
        max_bins=128, random_state=17)
    model.fit(x,y,sample_weight=w); return model

def mask(x):
    x=x.copy(); x[:,drum_indices]=0; return x

train=[s for s in songs if s['split']=='train']; val=[s for s in songs if s['split']=='validation']; test=[s for s in songs if s['split']=='test']
x,y,w,folds=rows(train); print(f'Training on {len(train)} files, {len(y)} boundaries, {x.shape[1]} features',flush=True)
# Cross-fitting prevents the teacher from passing memorized labels to its student.
oof=np.zeros(len(y))
for fold in range(3):
    model=fit(x[folds!=fold],y[folds!=fold],w[folds!=fold],100)
    oof[folds==fold]=model.predict_proba(x[folds==fold])[:,1]
    print(f'Out-of-fold teacher {fold+1}/3 fitted',flush=True)
teacher=fit(x,y,w); print('Full teacher fitted',flush=True)
xp=mask(x); plain_student=fit(xp,y,w); print('Pitched-only supervised comparison fitted',flush=True)
# Soft-target cross entropy is exactly represented as weighted 0/1 copies.
# Only drum-present examples have drum-to-pitched supervision; true labels
# retain 80% weight. No pseudo-labels replace or modify curated annotations.
transfer=np.where(x[:,0]>0,0.2,0.)
xsoft=np.concatenate([xp,xp,xp]); ysoft=np.concatenate([y,np.zeros(len(y)),np.ones(len(y))])
wsoft=np.concatenate([w*(1-transfer),w*transfer*(1-oof),w*transfer*oof])
keep=wsoft>0
student=fit(xsoft[keep],ysoft[keep],wsoft[keep]); print('Drum-to-pitched distilled student fitted',flush=True)
del xsoft,ysoft,wsoft
# Train-only length distribution, including short pickups and extensions.
length_counts={}
for s in train:
    starts=[1]+s['truth']
    for a,b in zip(starts,starts[1:]):
        length=b-a
        if 1<=length<=32: length_counts[length]=length_counts.get(length,0)+1
maximum=max(length_counts.values())
length_cost=np.array([0]+[math.log(0.002+length_counts.get(n,0)/maximum) for n in range(1,33)])

def decode(probabilities,count,config):
    # probabilities[m] concerns a phrase starting at measure m+1; m=0 is
    # the fixed start. The end sentinel has no learned boundary reward.
    logits=np.log(np.clip(probabilities,0.001,0.999)/np.clip(1-probabilities,0.001,0.999))
    costs=np.full(count+1,-np.inf); costs[0]=0; back=np.zeros(count+1,dtype=int)
    for end in range(1,count+1):
        lengths=np.arange(1,min(32,end)+1); starts=end-lengths
        reward=np.where(starts>0,logits[np.maximum(starts-1,0)]-config['boundaryBias'],0)
        scores=costs[starts]+reward+length_cost[lengths]*config['lengthWeight']
        at=int(np.argmax(scores)); costs[end]=scores[at]; back[end]=starts[at]
    result=[]; end=count
    while end>0:
        start=int(back[end]);
        if start: result.append(start+1)
        end=start
    return sorted(result)

def metrics(predictions,subset,tolerance=0,offgrid=False):
    tp=pred_n=truth_n=0
    for predicted,s in zip(predictions,subset):
        truth=s['truth']
        if offgrid: predicted=[m for m in predicted if (m-1)%4]; truth=[m for m in truth if (m-1)%4]
        available=set(truth)
        for m in predicted:
            matches=[t for t in available if abs(t-m)<=tolerance]
            if matches:
                found=min(matches,key=lambda t:abs(t-m)); available.remove(found);tp+=1
        pred_n+=len(predicted);truth_n+=len(truth)
    precision=tp/max(1,pred_n);recall=tp/max(1,truth_n)
    return {'precision':precision,'recall':recall,'f1':2*precision*recall/max(1e-12,precision+recall),'matched':tp,'predicted':pred_n,'reference':truth_n}

def probs(model,subset,pitched=False):
    result=[]
    for s in subset:
        xx=np.asarray(s['features'][1:],dtype=np.float64)
        if pitched: xx=mask(xx)
        result.append(model.predict_proba(xx)[:,1])
    return result

def calibrate(probabilities,subset):
    # Exact boundaries first, explicitly include off-grid phrase shifts.
    best=None
    for weight in [0.15,0.3,0.5,0.8,1.2,1.8]:
        for bias in [-2.,-1.5,-1.,-0.5,0.,0.5]:
            config={'lengthWeight':weight,'boundaryBias':bias}
            predictions=[decode(q,s['count'],config) for q,s in zip(probabilities,subset)]
            score=0.65*metrics(predictions,subset)['f1']+0.35*metrics(predictions,subset,offgrid=True)['f1']
            if best is None or score>best[0]: best=(score,config,predictions)
    return best

val_teacher=probs(teacher,val); val_plain=probs(plain_student,val,True); val_student=probs(student,val,True)
cal_teacher=calibrate(val_teacher,val);cal_plain=calibrate(val_plain,val);cal_student=calibrate(val_student,val)
student_selected=cal_student[0]>=cal_plain[0]
selected_student=student if student_selected else plain_student
student_cal=cal_student if student_selected else cal_plain
print(json.dumps({'validationTeacher':cal_teacher[0],'validationPlainStudent':cal_plain[0],'validationDistilledStudent':cal_student[0],'selectedStudent':'distilled' if student_selected else 'supervised'}),flush=True)

def evaluate(name,model,config,pitched=False):
    qq=probs(model,test,pitched); predictions=[decode(q,s['count'],config) for q,s in zip(qq,test)]
    report={'exact':metrics(predictions,test),'withinOneBar':metrics(predictions,test,1),'offGridExact':metrics(predictions,test,offgrid=True)}
    for label,present in [('withDrums',True),('withoutDrums',False)]:
        selected=[i for i,s in enumerate(test) if s['hasDrums']==present]
        ss=[test[i] for i in selected]; pp=[predictions[i] for i in selected]
        report[label]={'songs':len(ss),'exact':metrics(pp,ss),'offGridExact':metrics(pp,ss,offgrid=True)}
    return report,predictions,qq
teacher_report,teacher_predictions,teacher_probs=evaluate('teacher',teacher,cal_teacher[1])
plain_report,plain_predictions,plain_probs=evaluate('pitchedSupervised',plain_student,cal_plain[1],True)
student_report,student_predictions,student_probs=evaluate('pitchedDistilled',student,cal_student[1],True)
selected_predictions=student_predictions if student_selected else plain_predictions
runtime_predictions=[teacher_predictions[i] if s['hasDrums'] else selected_predictions[i] for i,s in enumerate(test)]
regular=[list(range(5,s['count']+1,4)) for s in test]

# Numeric export of the actual fitted trees; browser needs no Python runtime.
def export(model):
    trees=[]
    for stage in model._predictors:
        nodes=stage[0].nodes; tree=[]
        for n in nodes:
            if n['is_categorical']: raise RuntimeError('Categorical tree export unsupported')
            tree.append([int(n['feature_idx']),float(n['num_threshold']),int(n['left']),int(n['right']),float(n['value']),int(n['is_leaf'])])
        trees.append(tree)
    result={'bias':float(model._baseline_prediction[0,0]),'trees':trees}
    # Verify private sklearn export against its public predict_proba.
    sample=x[::max(1,len(x)//1000)]; expected=model.predict_proba(sample)[:,1]; actual=[]
    for row in sample:
        score=result['bias']
        for tree in trees:
            node=tree[0]
            while not node[5]: node=tree[node[2] if row[node[0]]<=node[1] else node[3]]
            score+=node[4]
        actual.append(1/(1+math.exp(-score)))
    error=float(np.max(np.abs(expected-np.asarray(actual))))
    if error>1e-10: raise RuntimeError(f'Export prediction mismatch {error}')
    result['exportMaxProbabilityError']=error
    return result

artifact={'version':'phrase-gbdt-1','featureVersion':data['manifest']['featureVersion'],'featureNames':feature_names,
    'annotationHash':data['manifest']['annotationHash'],'training':{'songs':len(train),'groups':len({s['group'] for s in train}),'boundaries':len(y),'drumSongs':sum(s['hasDrums'] for s in train),'sklearn':sklearn.__version__, 'seed':17, 'trees':args.trees,'transferWeight':0.2,'student':'distilled' if student_selected else 'supervised'},
    'phraseLengths':length_counts,'teacher':export(teacher),'student':export(selected_student),'decoder':{'teacher':cal_teacher[1],'student':student_cal[1]}}
artifact['version']='phrase-gbdt-'+hashlib.sha256(json.dumps(artifact,sort_keys=True).encode()).hexdigest()[:12]
report={'modelVersion':artifact['version'],'dataset':{k:v for k,v in data['manifest'].items() if k!='skipped'},
    'selection':'Parameters and student chosen on validation songs only; test opened after selection. No test refit.',
    'validation':{'teacher':{'score':cal_teacher[0],**cal_teacher[1]},'pitchedSupervised':{'score':cal_plain[0],**cal_plain[1]},'pitchedDistilled':{'score':cal_student[0],**cal_student[1]}},
    'test':{'regularFourBars':{'exact':metrics(regular,test),'withinOneBar':metrics(regular,test,1),'offGridExact':metrics(regular,test,offgrid=True)},'teacher':teacher_report,'pitchedSupervised':plain_report,'pitchedDistilled':student_report,
    'runtime':{'exact':metrics(runtime_predictions,test),'withinOneBar':metrics(runtime_predictions,test,1),'offGridExact':metrics(runtime_predictions,test,offgrid=True)}}}
old_subset=[i for i,s in enumerate(test) if s['baseline'] is not None]
if old_subset:
    ss=[test[i] for i in old_subset]; old=[s['baseline'] for s in ss]; new=[runtime_predictions[i] for i in old_subset]
    report['test']['lakhOldVsNew']={'songs':len(ss),'old':metrics(old,ss),'new':metrics(new,ss),'oldOffGrid':metrics(old,ss,offgrid=True),'newOffGrid':metrics(new,ss,offgrid=True),'note':'Old cached heuristic used a different length-prior training split; comparison is diagnostic.'}
# Prioritize disagreements for human feedback, without overwriting references.
errors=[]; position=0
for s in train:
    n=s['count']-1; q=oof[position:position+n]; position+=n
    predicted=decode(q,s['count'],cal_teacher[1])
    missing=sorted(set(s['truth'])-set(predicted));extra=sorted(set(predicted)-set(s['truth']))
    if missing or extra: errors.append({'key':s['key'],'group':s['group'],'split':s['split'],'hasDrums':s['hasDrums'],'missing':missing,'extra':extra,'reference':s['truth'],'predicted':predicted,'url':('/lakh/'+s['key'][7:-4] if s['key'].startswith('c/MIDI/') else '/'+s['key'])+'?harmony=1&measure='+str((missing+extra)[0])})
errors.sort(key=lambda s:-(len(s['missing'])+len(s['extra'])))
report_dir=ROOT/'reports/phrase-model';report_dir.mkdir(exist_ok=True)
(report_dir/'evaluation.json').write_text(json.dumps(report,indent=2)+'\n')
(report_dir/'review.json').write_text(json.dumps({'modelVersion':artifact['version'],'note':'Training-only out-of-fold teacher disagreements are review candidates, not automatic annotation corrections. Validation/test songs are excluded from this feedback queue.','songs':errors},indent=2)+'\n')
candidate_path=Path(args.data).parent/'candidate-model.json'
candidate_path.write_text(json.dumps(artifact,separators=(',',':'))+'\n')
if args.promote:
    validation_runtime=[cal_teacher[2][i] if s['hasDrums'] else student_cal[2][i] for i,s in enumerate(val)]
    baseline=[list(range(5,s['count']+1,4)) for s in val]
    if metrics(validation_runtime,val)['f1'] <= metrics(baseline,val)['f1']: raise RuntimeError('Promotion rejected: no validation improvement over four-bar grid')
    (ROOT/'src/harmony/phraseModel.json').write_text(json.dumps(artifact,separators=(',',':'))+'\n')
    print('Promoted validated model to src/harmony/phraseModel.json',flush=True)
print(json.dumps(report['test'],indent=2),flush=True)
