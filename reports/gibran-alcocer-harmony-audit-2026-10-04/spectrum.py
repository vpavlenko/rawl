import json,subprocess,wave
from pathlib import Path
import numpy as np
from scipy.signal import stft
from scipy.optimize import nnls
from compare import ROOT,PC,pitchname

def evidence(idea,start,end):
 sources=json.loads((ROOT/'sources.json').read_text());audio=ROOT/sources[str(idea)]['audio']
 raw=subprocess.check_output(['ffmpeg','-v','error','-ss',str(start),'-t',str(end-start),'-i',str(audio),'-f','f32le','-ac','1','-ar','22050','pipe:1'])
 samples=np.frombuffer(raw,np.float32);freq,t,z=stft(samples,22050,nperseg=8192,noverlap=6144,boundary=None)
 mag=np.mean(np.abs(z),axis=1);idx=(freq>=30)&(freq<=4500);f=freq[idx];y=mag[idx]
 pitches=np.arange(24,97);templates=[]
 for p in pitches:
  f0=440*2**((p-69)/12);v=np.zeros_like(f)
  for h in range(1,16):v+=np.exp(-.5*((f-f0*h)/2.8)**2)/(h**1.3)
  templates.append(v/max(np.linalg.norm(v),1e-10))
 basis=np.array(templates).T;weights,_=nnls(basis,y);pcs=np.bincount(pitches%12,weights,minlength=12);pcs/=max(pcs.max(),1e-10)
 return {'idea':idea,'start':start,'end':end,'pitch_class_salience':{PC[k]:round(float(v),3) for k,v in enumerate(pcs)},'top_pitches':[(pitchname(int(pitches[i])),round(float(weights[i]/max(weights.max(),1e-10)),3)) for i in np.argsort(weights)[-12:][::-1]]}
if __name__=='__main__':
 import sys
 print(json.dumps(evidence(int(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3])),ensure_ascii=False,indent=2))
