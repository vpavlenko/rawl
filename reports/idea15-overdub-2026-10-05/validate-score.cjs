const fs=require('fs'),ts=require('/Users/chipfocus/repos/rawl/node_modules/typescript'),assert=require('assert');
require('/Users/chipfocus/repos/rawl/node_modules/ts-node').register({transpileOnly:true,compilerOptions:{module:'commonjs',jsx:'react'}});
const base='/Users/chipfocus/repos/rawl',p=require(base+'/src/components/rawl/editor/commandParser'),score=require(base+'/src/components/rawl/editor/scores').scores['idea-15---gibran-alcocer'];
const source=fs.readFileSync(base+'/src/components/rawl/editor/Editor.tsx','utf8');let fn=source.slice(source.indexOf('function executeCopyForChannels('),source.lastIndexOf('export default'));
const copy=new Function(...Object.keys(p),ts.transpile(fn)+';return executeCopyForChannels;')(...Object.values(p));
function parse(score){const c={currentKey:{tonic:0,mode:'major'},currentTrack:1,timeSignatures:[{numerator:4,measureStart:1}],channelOctaves:{0:4,1:2},commentToEndOfFile:false,currentBpm:120,analysis:{modulations:{},phrasePatch:[],sections:[]}},tracks=new Map();
score.split('\n').forEach((line,i)=>{const cmd=p.parseCommand(line,c,i+1);if(!cmd)return;switch(cmd.type){case 'track':c.currentTrack=cmd.track;break;case 'key':c.currentKey=cmd.key;break;case 'time':c.timeSignatures=cmd.signatures;break;case 'bpm':c.currentBpm=cmd.tempo;break;case 'insert':tracks.set(c.currentTrack,[...(tracks.get(c.currentTrack)||[]),...cmd.notes]);break;case 'copy':copy(cmd,[c.currentTrack],c,tracks,i+1);break;case 'ac':copy(cmd,[...tracks.keys()],c,tracks,i+1);}});
const notes=[...tracks].flatMap(([track,ns])=>ns.map(n=>p.logicalNoteToMidi(n,track,c.timeSignatures)).filter(Boolean));return notes;}
const notes=parse(score);const final=notes.filter(n=>n.startTick>=91*384);
console.log('Final notes per channel', [0,1,2].map(channel=>({channel,count:final.filter(n=>n.channel===channel).length})));
const m=JSON.parse(fs.readFileSync(base+'/reports/idea15-overdub-2026-10-05/manifest.json'));
assert.equal(final.filter(n=>n.channel===0).length,m.arpeggioNotes);
console.log('Editor seed has complete arpeggio and third-voice melody');

const cp=require('child_process');const oldModule=ts.transpile(cp.execFileSync('git',['show','HEAD:src/components/rawl/editor/scores.ts'],{cwd:base,encoding:'utf8'}),{module:ts.ModuleKind.CommonJS});const oldExports={};new Function('exports',oldModule)(oldExports);const before=parse(oldExports.scores['idea-15---gibran-alcocer']);
const key=n=>[n.startTick,n.durationTicks,n.midiNumber].join(':');const oldFinal=before.filter(n=>n.startTick>=91*384);
assert.deepEqual(final.filter(n=>n.channel===0).map(key).sort(),oldFinal.filter(n=>n.channel===1&&n.startTick<107*384).map(key).sort());
assert.deepEqual(final.filter(n=>n.channel===2).map(key).sort(),oldFinal.filter(n=>n.channel===0).map(key).sort());
console.log('Editor seed preserves existing final arpeggio/melody pitches and timing while separating voices');
