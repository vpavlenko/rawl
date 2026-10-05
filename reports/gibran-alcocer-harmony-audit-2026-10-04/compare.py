import json, math, re, warnings
from pathlib import Path
import numpy as np
from scipy.ndimage import gaussian_filter1d
from scipy.spatial.distance import cdist
import mido
warnings.filterwarnings('ignore')
ROOT=Path('/private/tmp/rawl-gibran-audit')
PC=['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B']
DT=.25

def read_midi(path):
    mid=mido.MidiFile(path);tempo=500000; tick=0; sec=0; active={};notes=[];signatures=[(0,4,4)];tempos=[]
    for msg in mido.merge_tracks(mid.tracks):
        sec+=mido.tick2second(msg.time,mid.ticks_per_beat,tempo);tick+=msg.time
        if msg.type=='set_tempo':tempo=msg.tempo;tempos.append((tick,sec,tempo))
        if msg.type=='time_signature':signatures.append((tick,msg.numerator,msg.denominator))
        if msg.type=='note_on' and msg.velocity>0:
            active.setdefault((msg.channel,msg.note),[]).append((sec,tick,msg.velocity))
        elif msg.type=='note_off' or (msg.type=='note_on' and msg.velocity==0):
            key=(msg.channel,msg.note)
            if active.get(key):
                start,st,v=active[key].pop(0);notes.append({'start':start,'end':sec,'pitch':msg.note,'velocity':v,'tick':st})
    signatures=sorted({t:(n,d) for t,n,d in signatures}.items())
    def measure(t):
        bars=0
        for k,(st,(num,den)) in enumerate(signatures):
            span=mid.ticks_per_beat*num*4/den;nextst=signatures[k+1][0] if k+1<len(signatures) else float('inf')
            if t<nextst:return int(bars+(t-st)//span)+1
            bars+=(nextst-st)/span
        return 1
    for n in notes:n['measure']=measure(n['tick'])
    return sorted(notes,key=lambda n:(n['start'],n['pitch']))

def profile(notes):
    end=max(min(n['end'],n['start']+.7) for n in notes)+.25; frames=int(end/DT)+1
    full=np.zeros((frames,12));bass=np.zeros_like(full)
    for n in notes:
        # Cap sustain: pedal/reverb duration discrepancies are irrelevant to chord pitches.
        a=max(0,int(n['start']/DT)); b=min(frames,max(a+1,int((min(n['end'],n['start']+.7))/DT)+1))
        w=.5+min(n['velocity'],100)/100
        full[a:b,n['pitch']%12]+=w
        if n['pitch']<60:bass[a:b,n['pitch']%12]+=w
    full=gaussian_filter1d(full,.8,axis=0);bass=gaussian_filter1d(bass,.8,axis=0)
    full/=np.maximum(np.linalg.norm(full,axis=1,keepdims=True),1e-8)
    bass/=np.maximum(np.linalg.norm(bass,axis=1,keepdims=True),1e-8)
    return full,bass

def align(a,b):
    A,Ab=profile(a); B,Bb=profile(b)
    cost=.8*(1-A@B.T)+.2*(1-Ab@Bb.T)
    # Leading silence is cheap. A modest gap penalty discourages matching away wrong chords.
    silence=(np.linalg.norm(A,axis=1)<.01)[:,None] | (np.linalg.norm(B,axis=1)<.01)[None,:]
    cost[silence]=.3
    a0=int(min(n['start'] for n in a)/DT);b0=int(min(n['start'] for n in b)/DT)
    cost=cost[a0:,b0:];n,m=cost.shape;dp=np.full((n+1,m+1),np.inf);dp[0,0]=0;direction=np.zeros((n,m),np.uint8)
    for i in range(n):
        for j in range(m):
            opts=(dp[i,j],dp[i,j+1]+.10,dp[i+1,j]+.10);k=int(np.argmin(opts));dp[i+1,j+1]=cost[i,j]+opts[k];direction[i,j]=k
    path=[];i=n-1;j=m-1
    while i>=0 and j>=0:
        path.append((i,j));k=direction[i,j]
        if k==0:i-=1;j-=1
        elif k==1:i-=1
        else:j-=1
    path.reverse();path=np.array(path);mapping=np.full(n,np.nan)
    for i in range(n):
        js=path[path[:,0]==i,1]
        if len(js):mapping[i]=np.median(js)*DT
    good=np.flatnonzero(~np.isnan(mapping));mapping=np.interp(np.arange(n),good,mapping[good])+b0*DT;mapping=np.r_[np.full(a0,mapping[0]),mapping];
    return mapping,float(np.mean([1-cost[i,j] for i,j in path])),cost,A,B

def pitchname(p):return PC[p%12]+str(p//12-1)
def compare(slug,source):
    a=read_midi(ROOT/'existing'/f'{slug}.mid');b=read_midi(ROOT/'transkun'/f'idea-{source}.mid')
    mapping,sim,cost,A,B=align(a,b); starts=np.array([n['start'] for n in b]); ends=np.array([min(n['end'],n['start']+4) for n in b]); pitches=np.array([n['pitch'] for n in b]);
    mapped=[];summary={};events=[]
    for n in a:
        t=float(np.interp(n['start']/DT,np.arange(len(mapping)),mapping)); window=(np.abs(starts-t)<.5) | ((starts<t)&(ends>t-.1));opts=np.flatnonzero(window)
        pcopts=opts[(pitches[opts]%12)==n['pitch']%12]; exactopts=opts[pitches[opts]==n['pitch']]
        hit=bool(len(pcopts)); exact=bool(len(exactopts));d={**n,'audio_time':round(t,3),'pc_match':hit,'exact_match':exact,'nearby':sorted(set(pitches[opts].tolist()))};mapped.append(d)
    # Harmonic windows aggregate attacks in one MIDI measure: octave differences are tolerated.
    for measure in sorted(set(n['measure'] for n in mapped)):
        ns=[n for n in mapped if n['measure']==measure];bass=[n for n in ns if n['pitch']<60];
        missing={};
        for n in ns:
            if not n['pc_match']:missing[PC[n['pitch']%12]]=missing.get(PC[n['pitch']%12],0)+1
        row={'measure':measure,'score_time':round(min(n['start'] for n in ns),3),'audio_time':min(n['audio_time'] for n in ns),'notes':len(ns),'pc_support':round(sum(n['pc_match'] for n in ns)/len(ns),3),'bass_notes':len(bass),'bass_pc_support':round(sum(n['pc_match'] for n in bass)/len(bass),3) if bass else None,'unsupported_pcs':missing}
        events.append(row)
    # Reverse coverage catches chord tones omitted from the score.
    score_starts=np.array([n['start'] for n in a]);score_ends=np.array([min(n['end'],n['start']+4) for n in a]);score_pcs=np.array([n['pitch']%12 for n in a]);reference=[]
    for n in b:
        t=float(np.interp(n['start'],mapping,np.arange(len(mapping))*DT));w=(np.abs(score_starts-t)<.5)|((score_starts<t)&(score_ends>t-.1));hit=bool(np.any(score_pcs[w]==n['pitch']%12));reference.append({**n,'score_time':round(t,3),'pc_match':hit})
    summary={'slug':slug,'idea':source,'score_note_count':len(a),'reference_note_count':len(b),'score_duration':round(max(n['end'] for n in a),2),'reference_duration':round(max(n['end'] for n in b),2),'alignment_similarity':round(sim,3),'pc_support':round(np.mean([n['pc_match'] for n in mapped]),3),'exact_pitch_support':round(np.mean([n['exact_match'] for n in mapped]),3),'bass_pc_support':round(np.mean([n['pc_match'] for n in mapped if n['pitch']<60]),3),'reference_pc_coverage':round(np.mean([n['pc_match'] for n in reference]),3),'reference_bass_pc_coverage':round(np.mean([n['pc_match'] for n in reference if n['pitch']<60]),3),'measure_windows':events}
    out=ROOT/'comparisons';out.mkdir(exist_ok=True);(out/f'{slug}.json').write_text(json.dumps({'summary':summary,'notes':mapped,'reference_notes':reference},indent=2));return summary

def main():
    summaries=[]
    for d in json.loads((ROOT/'manifest.json').read_text()):
        slug=d['slug'];source='15' if slug=='idea_15_basic_pitch' else re.search(r'idea-(?:n\.)?(\d+)',slug).group(1)
        if not (ROOT/'transkun'/f'idea-{source}.mid').exists():continue
        summary=compare(slug,source);summaries.append(summary);print(slug, 'alignment',summary['alignment_similarity'],'PC',summary['pc_support'],'bass',summary['bass_pc_support'],flush=True)
    (ROOT/'summary.json').write_text(json.dumps(summaries,indent=2))
if __name__=='__main__':main()
