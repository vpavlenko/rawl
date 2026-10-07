"""Render actual MIDI note events for a human version-choice audit (no training)."""
import gzip, json, pathlib, textwrap, math, argparse
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.collections import LineCollection
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/lakh-version-review'
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads(gzip.decompress(pathlib.Path('/private/tmp/rawl-lakh-versions/visual.json.gz').read_bytes()))
colors = ['#71c7ed','#ccaa68','#bd83da','#78cb93','#ed9470','#aaa1ff','#ffb9df','#e8cc60','#63c6b6','#a4e2e5','#d491ff','#c8abf0','#da9ba9','#e3b2ad','#f0e99c','#b5b5b5']

def bars(row):
    meters = {0:(4,4)}
    for beat,n,d in row['meters']: meters[beat] = (n,d)
    changes = sorted(meters)
    result = []
    for i, start in enumerate(changes):
        end = changes[i+1] if i+1<len(changes) else row['end']+1
        n,d = meters[start]; length = n*4/d
        if length > 0:
            result.extend(start+k*length for k in range(math.ceil((end-start)/length)))
    return result

def render(case):
    rows = case['rows']; height = 0.72 + len(rows)*1.23
    fig = plt.figure(figsize=(18.6,height),dpi=100,facecolor='#111116')
    fig.text(.012,1-.22/height,f"{case['number']:03d}   {case['title']}",color='white',size=14,weight='bold',va='top')
    fig.text(.012,1-.48/height,'Star = annotated. Colors = GM families; drums gray. Whole file / beats 32–64. Unclosed notes extended to file end; no sustain. No phrase alignment.',color='#b8b8c3',size=9,va='top')
    end = max((r.get('end',0) for r in rows),default=1)
    all_pitches = [n[2] for r in rows for n in r.get('notes',[]) if not next((v['drum'] for v in r['voices'] if v['id']==n[3]),False)]
    lo,hi = max(20,min(all_pitches,default=36)-3),min(110,max(all_pitches,default=84)+3)
    for i,row in enumerate(rows):
        bottom = 1-(.77+(i+1)*1.23)/height
        labelcolor = '#e69a3a' if row['manual'] else '#c6c6ce'
        fig.text(.012,bottom+.96/height,('★ ' if row['manual'] else '  ')+row['file'],color=labelcolor,size=10,weight='bold' if row['manual'] else 'normal',va='top')
        if row.get('error'):
            fig.text(.012,bottom+.62/height,'UNREADABLE: '+row['error'],color='#ed8888',size=9,va='top'); continue
        summary = row.get('summary',{})
        tempo = row['tempos'][0][1] if row['tempos'] else 120
        meter = row['meters'][0][1:] if row['meters'] else [4,4]
        fig.text(.012,bottom+.74/height,f"{summary.get('voices',len(row['voices']))} channels · {len(row['notes'])} notes · {row['end']:.0f} beats\n{meter[0]}/{meter[1]} · {tempo:.1f} BPM · grid {summary.get('quantizedShare',0):.0%}",color='#a8a8b3',size=9,va='top',linespacing=1.4)
        patches = ', '.join(v['patch'] or '?' for v in sorted(row['voices'],key=lambda v:-v['count'])[:8])
        fig.text(.012,bottom+.38/height,'\n'.join(textwrap.wrap(patches,40)[:3]),color='#888897',size=8,va='top')
        byvoice = {v['id']:v for v in row['voices']}
        for x,w,xmin,xmax in [(.245,.39,0,end),(.675,.31,32,64)]:
            ax = fig.add_axes([x,bottom+.17/height,w,.91/height],facecolor='#18181f')
            segments=[]; cs=[]
            for start,stop,pitch,voice,velocity in row['notes']:
                if stop<xmin or start>xmax: continue
                v = byvoice[voice]; y = lo-8+(pitch-35)%7 if v['drum'] else pitch
                segments.append([(max(start,xmin),y),(min(stop,xmax),y)])
                cs.append('#686876' if v['drum'] else colors[v['program']//8])
            ax.add_collection(LineCollection(segments,colors=cs,linewidths=.7 if xmin==0 else 1.2,alpha=.87))
            ax.set_xlim(xmin,xmax); ax.set_ylim(lo-9,hi)
            ax.set_yticks([36,60,84]); ax.tick_params(colors='#777787',labelsize=7,length=2,pad=1)
            for spine in ax.spines.values(): spine.set_color('#333340')
            ax.axhline(lo-2,color='#444452',lw=.5)
            if xmin:
                for beat in bars(row):
                    if xmin<=beat<=xmax: ax.axvline(beat,color='#393945',lw=.6,zorder=0)
                ax.set_xticks(range(32,65,4))
            else: ax.set_xticks([0,round(end/2),round(end)])
    file = f"{case['number']:03d}.png"
    fig.savefig(OUT/file,dpi=100,facecolor=fig.get_facecolor()); plt.close(fig)
    return file

for case in data['cases']:
    case['image'] = render(case)
    for row in case['rows']:
        row.pop('notes',None)
(OUT/'cases.json').write_text(json.dumps(data,ensure_ascii=False))
# Contact sheets are an inspection aid; individual PNGs retain the larger views.
pages=[]; pending=[]; size=0
for c in data['cases']:
    h=Image.open(OUT/c['image']).height
    if pending and size+h>2300:
        pages.append(pending); pending=[]; size=0
    pending.append(c); size+=h
if pending: pages.append(pending)
tmp=pathlib.Path('/private/tmp/rawl-lakh-versions/contact'); tmp.mkdir(exist_ok=True)
for p,cases in enumerate(pages,1):
    ims=[Image.open(OUT/c['image']) for c in cases]
    out=Image.new('RGB',(1860,sum(im.height for im in ims)),color='#111116');y=0
    for im in ims: out.paste(im,(0,y)); y+=im.height
    out.save(tmp/f'{p:02d}.png')
(tmp/'pages.json').write_text(json.dumps([[c['number'] for c in page] for page in pages]))
print(json.dumps({'cases':len(data['cases']),'contactPages':len(pages),'pages':[[c['number'] for c in p] for p in pages]}))
