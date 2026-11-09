// Render isolated notes through the production FluidSynth WASM for pitch auditing.
// Usage: node scripts/rawl/render-qanun-tuning.cjs OUTPUT_DIRECTORY
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const out = path.resolve(process.argv[2] || '/private/tmp/rawl-qanun-tuning');
fs.mkdirSync(out, {recursive:true});
(async () => {
 const errors=[];
 const scope=vm.createContext({console,WebAssembly,TextDecoder,TextEncoder,URL,setTimeout,clearTimeout,performance,fetch});
 vm.runInContext(fs.readFileSync(path.join(root,'src/chip-core.js'),'utf8').replace('export default CHIP_CORE;','')+';this.factory=CHIP_CORE;',scope);
 const core=await scope.factory({wasmBinary:fs.readFileSync(path.join(root,'public/chip-core.wasm')),print(){},printErr:m=>errors.push(m)});
 core._tp_init(44100);
 const font=require(path.join(root,'src/players/qanunSoundfont.json'));
 core.FS.writeFile('/qanun.sf2',fs.readFileSync(path.join(root,'public',font.file)));
 if(core.ccall('tp_load_soundfont','number',['string'],['/qanun.sf2'])===-1) throw Error('font loading failed');
 core._tp_set_reverb(0);
 core._fluid_synth_set_chorus_on(core._tp_get_fluid_synth(),false);
 const count=4096, buffer=core._malloc(count*4);
 const notes=[];
 for (const pitch of [48,...Array.from({length:69},(_,i)=>53+i/2),96]) {
  core._tp_reset(); core._tp_program_change(0,0);
  core._tp_pitch_bend(0,8192+(pitch%1)*4096);
  core._tp_note_on(0,Math.floor(pitch),100);
  const chunks=[];
  for(let i=0;i<Math.ceil(44100*2*1.2/count);i++) {
   core._tp_render(buffer,count);
   chunks.push(Buffer.from(core.HEAPF32.slice(buffer>>2,(buffer>>2)+count).buffer));
  }
  fs.writeFileSync(path.join(out,`midi-${pitch}.f32`),Buffer.concat(chunks));
  notes.push(pitch);
 }
 fs.writeFileSync(path.join(out,'render.json'),JSON.stringify({font,sampleRate:44100,channels:2,notes,errors},null,2));
 console.log(`Rendered ${notes.length} isolated notes; ${errors.length} synth messages`);

})().catch(e=>{console.error(e);process.exitCode=1});
