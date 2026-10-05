import subprocess,json,numpy as np
from scipy.signal import butter,sosfiltfilt
from pathlib import Path
r=Path(__file__).parent;g=json.loads((r/'display.json').read_text())['measures'];raw=subprocess.check_output(['ffmpeg','-v','error','-i','/private/tmp/rawl-gibran-audit/audio/hyUct2htiNk.wav','-f','f32le','-ac','1','-ar','22050','pipe:1']);x=np.frombuffer(raw,np.float32);sr=22050;rows=[]
for start in [18,36,54,72,90,108]:
 for bar in [start,start+1]:
  time=g[bar-1];pitches=[54,59,63] if start<108 else [42,47,51];row={'bar':bar,'time':time,'frequencyBandChanges':[]}
  for pitch in pitches:
   f=440*2**((pitch-69)/12);y=sosfiltfilt(butter(3,[f*.95,f*1.05],btype='bandpass',fs=sr,output='sos'),x);db=lambda a,b:float(20*np.log10(np.sqrt(np.mean(y[int(a*sr):int(b*sr)]**2))+1e-12));before=db(time-.17,time-.04);after=db(time+.03,time+.16);row['frequencyBandChanges'].append({'pitch':pitch,'beforeDbFS':round(before,2),'afterDbFS':round(after,2),'changeDb':round(after-before,2)})
  rows.append(row)
result={'method':'Narrow fundamental bands, before(-170..-40ms)/after(+30..+160ms) each grid boundary. Supports energy changes, not independent proof of attacks; inspect source listening and repeating harmony too.','rows':rows};(r/'ending-attack-evidence.json').write_text(json.dumps(result,indent=2)+'\n')
for row in rows:print(row['bar'],[(p['pitch'],p['changeDb']) for p in row['frequencyBandChanges']])
