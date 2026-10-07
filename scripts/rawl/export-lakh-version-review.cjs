// Read-only visual audit input. No inferred preferences are written to annotations.
const fs = require("fs"), path = require("path"), crypto = require("crypto"), zlib = require("zlib");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const { versionGroups } = require("../../src/lakh/versionGroups.ts");
const ROOT = path.resolve(__dirname, "../..");
const catalog = JSON.parse(fs.readFileSync(path.join(ROOT, "public/lakh-index.json")));
const annotationBytes = fs.readFileSync(path.join(ROOT, "src/corpus/analyses.json"));
const annotations = JSON.parse(annotationBytes);
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "reports/lakh-version-model/dataset.json")));
const gmSource = fs.readFileSync(path.join(ROOT, "src/players/gm-patch-map.js"), "utf8");
const gm = [...gmSource.slice(0, gmSource.indexOf("];")).matchAll(/'([^']+)'/g)].map(x => x[1].trim());
function score(bytes) {
  const midi = parseMidi(bytes), ppq = midi.header.ticksPerBeat;
  if (!ppq || midi.header.format === 2) throw new Error("Unsupported MIDI timing/format");
  const events = [], names = new Map(); let last = 0;
  midi.tracks.forEach((track, t) => {
    let tick = 0, port = 0;
    for (const e of track) {
      if (!Number.isFinite(e.deltaTime) || e.deltaTime < 0) throw new Error("Invalid delta time");
      tick += e.deltaTime;
      if (e.type === "midiPort") port = e.port;
      if (e.type === "trackName" || e.type === "instrumentName") names.set(t, e.text);
      events.push({...e,tick,t,port});
    }
    last = Math.max(last,tick);
  });
  events.sort((a,b) => a.tick-b.tick || a.t-b.t);
  const programs = new Map(), active = new Map(), voices = new Map(), notes = [];
  const tempos = [], meters = [], lyrics = [];
  function finish(n, tick) {
    if (tick > n.tick) notes.push([n.tick/ppq,tick/ppq,n.noteNumber,n.v,n.velocity]);
  }
  for (const e of events) {
    if (e.type === "setTempo") tempos.push([e.tick/ppq,60e6/e.microsecondsPerBeat]);
    if (e.type === "timeSignature") meters.push([e.tick/ppq,e.numerator,e.denominator]);
    if (e.type === "lyrics") lyrics.push([e.tick/ppq,e.text]);
    if (e.channel == null) continue;
    const ch = `${e.port}:${e.channel}`;
    if (e.type === "programChange") programs.set(ch,e.programNumber);
    const key = `${ch}:${e.noteNumber}`;
    if (e.type === "noteOn" && e.velocity > 0) {
      // Preserve distinct channels, ports and patches; don't mistake a track title for a vocal label.
      const p = programs.get(ch) || 0, identity = `${ch}:${p}`;
      if (!voices.has(identity)) voices.set(identity,{id:identity,channel:e.channel,port:e.port,program:p,drum:e.channel===9,names:new Set(),count:0});
      const v = voices.get(identity);
      if (midi.header.format !== 0 && names.get(e.t)) v.names.add(names.get(e.t));
      v.count++;
      if (!active.has(key)) active.set(key,[]);
      active.get(key).push({...e,v:identity});
    } else if (e.type === "noteOff" || (e.type === "noteOn" && !e.velocity)) {
      const n = active.get(key)?.shift(); if (n) finish(n,e.tick);
    }
  }
  for (const pending of active.values()) for (const n of pending) finish(n,last);
  const unique = xs => xs.filter((x,i) => !i || JSON.stringify(x.slice(1))!==JSON.stringify(xs[i-1].slice(1)));
  return {notes, voices:[...voices.values()].map(v=>({...v,names:[...v.names],patch:v.drum?"Drums":gm[v.program]})),end:last/ppq,tempos:unique(tempos),meters:unique(meters),lyrics:lyrics.length};
}
const cases = [];
for (const [id, files] of versionGroups(catalog)) {
  const manual = files.filter(f => annotations[f.key]);
  if (files.length < 2 || !manual.length) continue;
  const group = manifest.groups.find(g=>g.id===id);
  const rows = files.map(f=> {
    const bytes = fs.readFileSync(path.join(ROOT,"public/lakh-data",f.artist.name,f.file));
    const row = {key:f.key,file:f.file,manual:!!annotations[f.key],url:`/lakh/${f.artist.slug}/${f.artist.trackSlugs[f.file]}`,midiHash:crypto.createHash("sha256").update(bytes).digest("hex"),summary:group?.rows.find(r=>r.key===f.key)?.summary,annotation:annotations[f.key] || null};
    try { return {...row,...score(bytes)}; } catch(e) { return {...row,error:String(e.message || e)}; }
  });
  cases.push({number:cases.length+1,id,title:`${id.slice(0,id.indexOf('/'))} — ${files[0].file.replace(/(?:\.\d+)?\.mid$/i,'')}`,winner:group?.winner,labelStatus:manifest.skipped.find(g=>g.id===id)?.reason || "Single annotated version (provisional preference)",rows});
}
const out = {format:"rawl-version-visual-review-1",annotationHash:crypto.createHash("sha256").update(annotationBytes).digest("hex"),noteSemantics:"Quarter-note beats; physical FIFO note-offs, unclosed notes extended to file end, no sustain or CC120/123 termination. Colors = GM families, drums gray. Native meter lines; no cross-version musical alignment. Labels indicate annotation presence, not independently confirmed review completeness.",cases};
fs.mkdirSync("/private/tmp/rawl-lakh-versions",{recursive:true});
fs.writeFileSync("/private/tmp/rawl-lakh-versions/visual.json.gz",zlib.gzipSync(JSON.stringify(out)));
console.log(JSON.stringify({cases:cases.length,files:cases.reduce((n,c)=>n+c.rows.length,0),errors:cases.flatMap(c=>c.rows).filter(r=>r.error).map(r=>({key:r.key,error:r.error}))}));
