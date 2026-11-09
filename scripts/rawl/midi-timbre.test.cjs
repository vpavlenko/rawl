const assert=require('node:assert/strict'),{test}=require('node:test'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript'),MIDIFile=require('midifile'),{writeMidi}=require('midi-file');
const root=path.resolve(__dirname,'../..');
const transpile=file=>ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
function moduleFrom(file,require){const module={exports:{}};vm.runInNewContext('(function(require,module,exports){'+transpile(file)+'\n})',{console,window:{atob:value=>Buffer.from(value,"base64").toString("binary")}})(require,module,module.exports);return module.exports;}
const timbre=moduleFrom(path.join(root,'src/players/midiTimbre.js'),name=>
 name==='./qanunSoundfont.json'?require(path.join(root,'src/players/qanunSoundfont.json')):
 name==='../sampler/qanunLevels.json'?require(path.join(root,'src/sampler/qanunLevels.json')):require(name));
const MIDIPlayer=moduleFrom(path.join(root,'src/players/MIDIPlayer.js'),name=>{
 if(name==='midifile')return MIDIFile;
 if(name==='./midiTimbre')return timbre;
 if(name==='./Player')return class {};
 return {};
}).default;
const ThreadedPlayer=moduleFrom(path.join(root,'src/players/ThreadedMIDIPlayer.ts'),name=>
 name.startsWith('worker-loader')?class {}:require(name)).default;
function midi(tag){return Buffer.from(writeMidi({header:{format:0,numTracks:1,ticksPerBeat:480},tracks:[[
 ...(tag?[{deltaTime:0,type:'text',text:tag}]:[]),
 {deltaTime:0,type:'noteOn',channel:0,noteNumber:62,velocity:90},
 {deltaTime:480,type:'noteOff',channel:0,noteNumber:62,velocity:0},
 {deltaTime:0,type:'endOfTrack'}]]}));}
function parse(data){return new MIDIFile(Uint8Array.from(data).buffer);}
test('only the exact packaged oud tag selects the sampled timbre',()=>{
 assert.equal(timbre.getMidiTimbre(parse(midi('RAWL_TIMBRE:oud'))),'oud');
 assert.equal(timbre.getMidiTimbre(parse(midi())),undefined);
 assert.equal(timbre.getMidiTimbre(parse(midi('RAWL_TIMBRE:https://example.com/a.sf2'))),undefined);
 assert(fs.statSync(path.join(root,'public',timbre.OUD_SOUNDFONT)).size>1000);
});
test('qanun has a packaged bank and only its exact portable tag selects it',()=>{
 assert.equal(timbre.getMidiTimbre(parse(midi('RAWL_TIMBRE:qanun'))),'qanun');
 assert.equal(timbre.getMidiTimbre(parse(midi('RAWL_TIMBRE:qanun-extra'))),undefined);
 assert(fs.statSync(path.join(root,'public',timbre.QANUN_SOUNDFONT)).size>1000);
});
test('the UI-to-worker boundary forwards Arabic timbre before playback',async()=>{
 let command;
 const player={state:{},control(...args){command=args;return Promise.resolve({});}};
 await ThreadedPlayer.prototype.loadData.call(player,new Uint8Array([1]),'arabic',false,[],[],0,'qanun');
 assert.equal(command[0],'loadData');
 assert.equal(command[1][6],'qanun');
 assert.equal(command[2],0);
 assert.equal(player.state.isPlaying,false);
});
test('Arabic mix gain raises quiet notes and bounds overlapping peaks, while other timbres stay unchanged',()=>{
 const pcm=new Float32Array([.1,.8,-.8,.1]);
 timbre.applyMidiTimbreGain(pcm,0,3,'qanun');
 assert.ok(Math.abs(pcm[0]-.2)<1e-6);
 assert.ok(pcm[1]>.95&&pcm[1]<=1);
 assert.ok(pcm[2]<-.95&&pcm[2]>=-1);
 assert.ok(Math.abs(pcm[3]-.1)<1e-6);
 const other=new Float32Array([.2,.8]);
 timbre.applyMidiTimbreGain(other,0,2,undefined);
 assert.deepEqual(other,new Float32Array([.2,.8]));
});
test('await oud before parsing/playback, and restore GM for the following untagged file',async()=>{
 const calls=[];
 const player={midiFilePlayer:{panic(){},load(){calls.push('parse');return {};},channelsInUse:[],channelToTrack:[],trackNames:[]},metadataFromFilepath(){return {};},core:{_tp_set_ch10_melodic(){}},params:{soundfont:'masquerade55v006.sf2'},currentSoundfont:'masquerade55v006.sf2',bestSoundfontLoaded:true,
  async setParameter(key,value){await Promise.resolve();calls.push(value);this.currentSoundfont=value;this.params[key]=value;},loadBestSoundfontInBackground(){throw Error('Unexpected download');},portSynth:{async prepare(){}},splitPans:new Map(),applyPanning(){},setDrumVoices(){},setVoiceMask(){},resume(){},emit(){},getBasePlayerState(){return {};}};
 await MIDIPlayer.prototype.loadData.call(player,midi('RAWL_TIMBRE:oud'),'samai',false);
 assert.deepEqual(calls,[timbre.OUD_SOUNDFONT,'parse']);calls.length=0;
 await MIDIPlayer.prototype.loadData.call(player,midi(),'f:other',false);
 assert.deepEqual(calls,['masquerade55v006.sf2','parse']);
 calls.length=0;
 // Arabic corpus selection takes precedence over a legacy oud tag.
 await MIDIPlayer.prototype.loadData.call(player,midi('RAWL_TIMBRE:oud'),'samai',false,[],[],0,'qanun');
 assert.deepEqual(calls,[timbre.QANUN_SOUNDFONT,'parse']);
 assert.equal(player.activeTimbre,'qanun');calls.length=0;
 await MIDIPlayer.prototype.loadData.call(player,midi(),'f:other',false);
 assert.deepEqual(calls,['masquerade55v006.sf2','parse']);
 assert.equal(player.activeTimbre,undefined);
});
