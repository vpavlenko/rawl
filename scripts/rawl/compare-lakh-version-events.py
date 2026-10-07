"""Corroborate visual near-copies; onset matches are not audio equivalence."""
import collections, gzip, json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
data=json.loads(gzip.decompress(pathlib.Path('/private/tmp/rawl-lakh-versions/visual.json.gz').read_bytes()))
out=[]
def sig(row):
    drums={v['id']:v['drum'] for v in row['voices']}
    return collections.Counter((round(n[0]*24),n[2],drums[n[3]]) for n in row['notes'])
for c in data['cases']:
    selected=[r for r in c['rows'] if r['manual']]
    if len(selected)!=1 or selected[0].get('error'):continue
    w=selected[0]; a=sig(w); comparisons=[]
    for r in c['rows']:
        if r is w or r.get('error'):continue
        b=sig(r); denominator=max(len(w['notes']),len(r['notes']))
        scores=[]
        for shift in range(-8,9):
            overlap=sum(min(count,b.get((t-shift*24,p,d),0)) for (t,p,d),count in a.items())
            scores.append((overlap/denominator,shift))
        match,shift=max(scores,key=lambda x:(x[0],-abs(x[1])))
        comparisons.append({'key':r['key'],'onsetPitchMatch':match,'shiftBeatsToSelected':shift,'byteIdentical':r['midiHash']==w['midiHash']})
    out.append({'number':c['number'],'id':c['id'],'selected':w['key'],'comparisons':comparisons})
report={'semantics':'Multiset match of all pitched/drum onset-pitch events, rounded to 1/24 quarter note; maximize over integer shifts -8..8 quarter notes. Ignores note durations, voice identity, velocity, programs, banks, controllers and tempo. High agreement does not prove equivalent playback or human preference.','groups':out}
target=ROOT/'reports/lakh-version-model/visual-review/event-comparisons.json'
target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'groups':len(out),'nearCopyGroups98':sum(any(r['onsetPitchMatch']>=.98 for r in c['comparisons']) for c in out),'byteCopyGroups':sum(any(r['byteIdentical'] for r in c['comparisons']) for c in out)}))
