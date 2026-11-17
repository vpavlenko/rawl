const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const {createShiftHoverAudition}=require('librawl/native');
const source=fs.readFileSync(path.join(__dirname,'../../src/components/rawl/Rawl.tsx'),'utf8');
const handlers=source.slice(source.indexOf('  const shiftHoverAudition ='),source.indexOf('  const futureSavedAnalysis ='));
const playback=source.slice(source.indexOf('  const playNote = useCallback('),source.indexOf('  const [shiftHeld,'));
const compiled=ts.transpileModule(playback+handlers,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
function harness(options={}){
 const state={auditions:[],hovered:null,tonic:null,cents:null,cleanup:[],selectedMeasureRef:{current:null},...options};
 const values={createShiftHoverAudition,useMemo:factory=>factory(),useCallback:callback=>callback,useEffect:effect=>state.cleanup.push(effect()),showProvisionalAnalysis:false,onsetEditing:false,enableManualRemeasuring:false,showNoteCents:false,slug:'source',transpose:2,arabicTimbre:false,qanunAudition:{current:null},selectedMeasureRef:state.selectedMeasureRef,playRawMidiNote:(...args)=>state.auditions.push(['midi',...args]),playQanun:notes=>{state.auditions.push(['qanun',notes]);return()=>{};},getNotePitchAtTime:(note,time)=>note.note.midiNumber+(note.pitchBend?0.5:0),setCentsHover:value=>state.cents=value,setHoveredNote:value=>state.hovered=typeof value==='function'?value(state.hovered):value,setHoveredTonicPitch:value=>state.tonic=value,...options};
 const run=new Function(...Object.keys(values),compiled+'\nreturn {handleMouseEnter,handleMouseLeave};');
 return {...run(...Object.values(values)),state};
}
const note=(id='n',extra={})=>({id,span:[0,2],note:{midiNumber:60},isDrum:false,...extra});
const enter={type:'mouseenter',shiftKey:true,clientX:10,clientY:20};
test('Rawl delegates Shift entry audition once per visit; moves retain cents updates and leave permits re-entry',()=>{
 const h=harness({showNoteCents:true}),n=note();h.handleMouseEnter(n,enter,0.5);h.handleMouseEnter(n,enter,0.7);h.handleMouseEnter(n,{...enter,type:'mousemove',clientX:40},1);assert.deepEqual(h.state.auditions,[['midi',62,2000]]);assert.equal(h.state.cents.x,40);assert.equal(h.state.cents.time,1);h.handleMouseLeave();assert.equal(h.state.cents,null);h.handleMouseEnter(n,enter);assert.equal(h.state.auditions.length,2);for(const cleanup of h.state.cleanup)cleanup?.();h.handleMouseEnter(n,enter);assert.equal(h.state.auditions.length,3);
});
test('Rawl retains provisional, manual, selected-tonic and onset-editing gates',()=>{
 for(const props of [{enableManualRemeasuring:true},{onsetEditing:true},{selectedMeasureRef:{current:2}}]){const h=harness(props),n=note();h.handleMouseEnter(n,enter,1);assert.equal(h.state.auditions.length,0);if(!props.enableManualRemeasuring)assert.equal(h.state.hovered,n);if(props.selectedMeasureRef)assert.equal(h.state.tonic,60);}
 const p=harness({showProvisionalAnalysis:true,enableManualRemeasuring:true});p.handleMouseEnter(note(),enter);assert.deepEqual(p.state.auditions,[['midi',62,2000]]);
 const selected=harness({selectedMeasureRef:{current:2}});selected.handleMouseEnter(note(),{...enter,type:'mousemove'},1);assert.equal(selected.state.hovered.id,'n');assert.equal(selected.state.tonic,60);assert.equal(selected.state.auditions.length,0);
});
test('Rawl keeps its own microtonal Qanun and drum audition owner',()=>{
 const q=harness({arabicTimbre:true});q.handleMouseEnter(note('bent',{pitchBend:[{time:0,value:10240}]}),enter);assert.deepEqual(q.state.auditions,[['qanun',[{midi:62.5,start:0,duration:2}]]]);q.handleMouseLeave();q.handleMouseEnter(note('drum',{isDrum:true,note:{midiNumber:38}}),enter);assert.deepEqual(q.state.auditions[1],['midi',38,2000]);
 const normal=harness();normal.handleMouseEnter(note(),{...enter,shiftKey:false});normal.handleMouseEnter(note(),{...enter,type:'pointermove'});assert.equal(normal.state.auditions.length,0);
});
