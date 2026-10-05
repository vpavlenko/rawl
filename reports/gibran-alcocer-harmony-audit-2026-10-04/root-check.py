import json
from compare import ROOT,read_midi,pitchname,PC
allrows=[]
for path in sorted((ROOT/'comparisons').glob('*.json')):
 data=json.loads(path.read_text());slug=data['summary']['slug'];ref=read_midi(ROOT/'transkun'/f"idea-{data['summary']['idea']}.mid");rows=[]
 for m in sorted(set(n['measure'] for n in data['notes'])):
  ns=[n for n in data['notes'] if n['measure']==m];low=min(ns,key=lambda n:n['pitch'])
  if low['pitch']>52:continue
  t=low['audio_time'];candidates=[n for n in ref if n['pitch']<=52 and abs(n['start']-t)<=.9]
  if not candidates:continue
  near=min(candidates,key=lambda n:abs(n['start']-t));group=[n for n in candidates if abs(n['start']-near['start'])<.1];r=min(group,key=lambda n:n['pitch'])
  if r['pitch']%12!=low['pitch']%12:rows.append({'measure':m,'score_bass':pitchname(low['pitch']),'ref_bass':pitchname(r['pitch']),'audio_time':t,'ref_time':r['start'],'score_time':low['start']})
 print(slug,rows,flush=True);allrows.append({'slug':slug,'candidates':rows})
(ROOT/'bass-root-candidates.json').write_text(json.dumps(allrows,indent=2))
