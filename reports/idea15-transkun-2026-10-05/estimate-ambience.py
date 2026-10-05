import json,subprocess,numpy as np
from scipy.signal import butter,sosfilt
from pathlib import Path
p=Path(__file__).parent
raw=subprocess.check_output(['ffmpeg','-v','error','-i','/private/tmp/rawl-gibran-audit/audio/hyUct2htiNk.wav','-f','f32le','-ac','2','-ar','22050','pipe:1'])
x=np.frombuffer(raw,np.float32).reshape(-1,2);sr=22050
mid=x.mean(axis=1);side=(x[:,0]-x[:,1])/2
hi=sosfilt(butter(4,[2000,8000],btype='bandpass',fs=sr,output='sos'),mid)
rows=[]
for a in np.arange(103,len(x)/sr,.5):
 sl=slice(int(a*sr),min(len(x),int((a+.5)*sr)))
 db=lambda y:round(float(20*np.log10(np.sqrt(np.mean(y[sl]**2))+1e-12)),2)
 rows.append({'seconds':round(float(a),2),'midDbFS':db(mid),'sideDbFS':db(side),'highBandDbFS':db(hi)})
r={'audioDurationSeconds':len(x)/sr,'tailHalfSecondWindows':rows,'limitations':'Decay combines piano-string sustain, pedal resonance, production reverb and possible fade. No isolated dry signal or room impulse response; cannot infer wet fraction, RT60 or CC91 uniquely.'}
(p/'ambience-evidence.json').write_text(json.dumps(r,indent=2)+'\n');print(json.dumps(r,indent=2))
