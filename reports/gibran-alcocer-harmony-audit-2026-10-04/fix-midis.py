import json,hashlib,collections
from pathlib import Path
import mido
from compare import ROOT,read_midi,pitchname
OUT=ROOT/'corrected';OUT.mkdir(exist_ok=True)
B_MOTIF={23,24,31,32,59,60,67,68,93,94,101,102,109,110,117,118,125,126}
CODA={73:{0:[64,68,71,76],1:[40,52,56,59]},74:{0:[61,64,68,73],1:[37,49,52,56]},75:{0:[56,59,63,68],1:[32,44,47,51]},76:{0:[56,59],1:[32,47,51]}}

def retune(idea,track,bar,pitch,tick,bar_start,ordinal):
 if idea==1 and track==1:
  if bar in B_MOTIF and pitch==59:return 58
  if bar in {35,36} and pitch==59:return 52
  if bar in {39,40,47,48} and pitch==61:return 63
 if idea==8 and track==1:
  if bar==33 and pitch==58:return 57
  if bar==58:return {43:46,55:53}.get(pitch,pitch)
 if idea==15 and track==1:
  first=tick==bar_start
  if bar in {74,82}:
   return ({42:45,54:57} if first else {54:61,57:64}).get(pitch,pitch)
  if bar in {75,83}:return {49:52,54:61,57:64}.get(pitch,pitch)
  if bar in {76,84} and first:return {45:42,57:54}.get(pitch,pitch)
  if bar in {77,85} and first:return {52:54}.get(pitch,pitch)
  if bar==80:
   return ({47:40,59:52} if first else {59:64,63:68}).get(pitch,pitch)
  if bar==81:return {54:47,59:64,63:68}.get(pitch,pitch)
 if idea==2 and bar in CODA:return CODA[bar][track][ordinal]
 return pitch

manifest=[]
for idea,slug in [(1,'idea-1---gibran-alcocer'),(2,'idea-2---gibran-alcocer'),(8,'idea-8---gibran-alcocer'),(15,'idea-15---gibran-alcocer')]:
 src=ROOT/'existing'/f'{slug}.mid';mid=mido.MidiFile(src);old=read_midi(src);bars={n['tick']:n['measure'] for n in old};bar_starts={bar:min(n['tick'] for n in old if n['measure']==bar) for bar in bars.values()};changes=[]
 for track,tr in enumerate(mid.tracks):
  tick=0;active=collections.defaultdict(list);ordinals=collections.Counter()
  for event in tr:
   tick+=event.time
   if event.type=='note_on' and event.velocity>0:
    original=event.note;bar=bars[tick];ordinal=ordinals[bar];ordinals[bar]+=1
    new=retune(idea,track,bar,original,tick,bar_starts[bar],ordinal)
    active[(event.channel,original)].append(new)
    if new!=original:changes.append({'track':track,'measure':bar,'tick':tick,'from':original,'to':new,'from_name':pitchname(original),'to_name':pitchname(new)});event.note=new
   elif event.type=='note_off' or (event.type=='note_on' and event.velocity==0):
    key=(event.channel,event.note)
    if not active[key]:raise AssertionError(f'Unpaired note-off {slug} {track} {tick} {key}')
    event.note=active[key].pop(0)
  assert not any(active.values()),f'Unterminated original notes {slug}'
 if idea==2:
  for bar in CODA:
   for track,expected in CODA[bar].items():
    events=[];t=0
    for e in mid.tracks[track]:
     t+=e.time
     if e.type=='note_on' and e.velocity and bars[t]==bar:events.append(e.note)
    assert events==expected,(bar,track,events,expected)
 target=OUT/f'{slug}.mid';mid.save(target);new=read_midi(target)
 # Verify only pitch bytes change semantically: all time deltas, meta events,
 # controllers, velocities, note counts, durations and track order are preserved.
 original=mido.MidiFile(src);rewritten=mido.MidiFile(target)
 assert original.type==rewritten.type and original.ticks_per_beat==rewritten.ticks_per_beat
 assert len(original.tracks)==len(rewritten.tracks)
 for ta,tb in zip(original.tracks,rewritten.tracks):
  assert len(ta)==len(tb)
  for ea,eb in zip(ta,tb):
   a=ea.dict();b=eb.dict()
   if ea.type in ['note_on','note_off']:a.pop('note');b.pop('note')
   assert a==b,(slug,ea,eb)
 assert len(old)==len(new);assert abs(max(n['end'] for n in old)-max(n['end'] for n in new))<1e-8
 # Reject new overlapping identical pitches on the shared piano channel.
 old_overlaps=collections.Counter();new_overlaps=collections.Counter()
 for notes,counter in [(old,old_overlaps),(new,new_overlaps)]:
  for pitch in {n['pitch'] for n in notes}:
   ns=sorted([n for n in notes if n['pitch']==pitch],key=lambda n:n['start']);end=-1
   for n in ns:
    if n['start']<end-.005:counter[pitch]+=1
    end=max(end,n['end'])
 # Cross-hand unisons are legitimate. Within each track, new repeated pitches
 # must still have balanced note-on/off pairs (already checked above).
 row={'slug':slug,'idea':idea,'originalSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'correctedSha256':hashlib.sha256(target.read_bytes()).hexdigest(),'changedNoteCount':len(changes),'noteCount':len(new),'durationSeconds':max(n['end'] for n in new),'changes':changes};manifest.append(row)
 print(slug,'corrected pitches',len(changes),'notes',len(new),'duration unchanged',round(row['durationSeconds'],3),flush=True)
(ROOT/'corrections.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')
