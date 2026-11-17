/* Diagrams use Rawl's palette and semitone geometry. Examples are synthetic.
 * Approved prose is rendered into index.html by generate-whitepaper.cjs. */
"use strict";
(() => {
  const palette = ["#ffffff", "#820000", "#ff0000", "#007000", "#00fb47", "#9500b3", "#ea7eff", "#787878", "#0000ff", "#03b9d5", "#ff7328", "#ffff00"];
  const degrees = ["1", "♭2", "2", "♭3", "3", "4", "♯4", "5", "♭6", "6", "♭7", "7"];
  const names = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
  const mod = n => (n % 12 + 12) % 12;
  const esc = text => String(text).replace(/[&<>"']/g, c => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[c]));
  const blend = p => {
    p = mod(p);
    const a = Math.floor(p), f = p - a;
    if (!f) return palette[a];
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const left = rgb(palette[a]), right = rgb(palette[(a + 1) % 12]);
    return `rgb(${left.map((v, i) => Math.round(v * (1 - f) + right[i] * f)).join(",")})`;
  };
  const inside = p => {
    const n = Math.round(p), pc = mod(n);
    return Math.abs(p - n) <= .25 && [1, 6].includes(pc) ? pc : null;
  };
  const outer = p => {
    if (inside(p) !== null) return null;
    const fraction = p - Math.floor(p);
    return fraction >= .25 && fraction <= .75 ? ([1, 3, 5, 8, 10].includes(mod(Math.floor(p))) ? "below" : "above") : null;
  };
  let uid = 0;
  const text = (x, y, value, extra = "") => `<text x="${x}" y="${y}" fill="#90908b" font-size="10" font-family="Arial, sans-serif" ${extra}>${esc(value)}</text>`;
  const svg = (body, height, label = "Rawl example") => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 ${height}" role="img" aria-label="${esc(label)}">${body}</svg>`;
  const shape = (x, y, w, h, v = 0) => {
    const r = Math.min(6, h / 2, w / 2);
    const corners = [[r,r,r,r],[r,0,r,0],[0,r,0,r],[r,0,0,r]][v % 4];
    const [a,b,c,d] = corners;
    return `M${x+a},${y}H${x+w-b}Q${x+w},${y} ${x+w},${y+b}V${y+h-c}Q${x+w},${y+h} ${x+w-c},${y+h}H${x+d}Q${x},${y+h} ${x},${y+h-d}V${y+a}Q${x},${y} ${x+a},${y}Z`;
  };
  const tone = (pitch, start, duration = .65, extra = {}) => ({pitch, start, duration, ...extra});
  const chord = (pitches, start, duration = .7, extra = {}) => pitches.map(p => tone(p, start, duration, extra));
  function score(notes, options = {}) {
    const min = options.min ?? Math.floor(Math.min(...notes.map(n => n.pitch)) - 2);
    const max = options.max ?? Math.ceil(Math.max(...notes.map(n => n.pitch)) + 2);
    const step = options.step ?? 4;
    const height = Math.max(110, (max-min) * step + 62);
    const y = pitch => 27 + (max - pitch) * step;
    const duration = options.duration ?? Math.max(...notes.map(n => n.start+n.duration)) + .2;
    const x = seconds => 34 + seconds / duration * 420;
    const tonicAt = t => options.changes?.reduce((tonic, c) => t >= c.time ? c.tonic : tonic, options.tonic ?? 0) ?? options.tonic ?? 0;
    let body = "";
    const regions = options.changes ? [{time:0,tonic:options.tonic??0}, ...options.changes] : [{time:0,tonic:options.tonic??0}];
    if (options.grid !== false) regions.forEach((region, i) => {
      const width = x(regions[i+1]?.time ?? duration) - x(region.time);
      for (let p = min; p <= max; p++) {
        if (mod(p - region.tonic) === 0) {
          const gradient = `tonal-${uid++}`;
          body += `<defs><linearGradient id="${gradient}" x1="0" y1="1" x2="0" y2="0"><stop stop-color="#333"/><stop offset="1" stop-color="#050505"/></linearGradient></defs><rect x="${x(region.time)}" y="${y(p)+step*.5}" width="${width}" height="${step*.5}" fill="url(#${gradient})"/>`;
          body += text(9,y(p)+3,names[mod(p)]);
        } else if (mod(p - region.tonic) === 7) body += `<line x1="${x(region.time)}" x2="${x(region.time)+width}" y1="${y(p)+step}" y2="${y(p)+step}" stroke="#4b4b46" stroke-width=".6" stroke-dasharray="3 3"/>`;
      }
    });
    (options.lines ?? [0,1,2,3,4]).filter(t => t <= duration).forEach((t,i) => {
      const measure = options.measureLines?.includes(t);
      body += `<line x1="${x(t)}" x2="${x(t)}" y1="17" y2="${height-22}" stroke="${measure?'#999':'#383833'}" stroke-width="${measure?1:.6}" ${options.dashed&&!measure ? 'stroke-dasharray="2 3"' : ""}/>`;
      body += text(x(t)+3,12,options.lineLabels?.[i] ?? `${t}s`);
    });
    notes.forEach(n => {
      const pc = mod(n.pitch - tonicAt(n.start));
      const top = y(n.pitch)-4, width = Math.max(3,x(n.start+n.duration)-x(n.start));
      const paint = n.white ? "#fff" : blend(pc);
      body += `<path d="${shape(x(n.start),top,width,8,n.voice??0)}" fill="${paint}"><title>${esc(n.label ?? `${names[mod(Math.round(n.pitch))]}${Math.floor(n.pitch/12)-1}`)}</title></path>`;
      const dot = n.white ? null : inside(pc);
      if(dot !== null) body += `<circle cx="${x(n.start)+width/2}" cy="${top+4}" r="${dot===1?.5:1}" fill="${dot===1?'white':'black'}"/>`;
      const marker = n.white ? null : outer(pc);
      if(marker) body += `<circle data-quartertone="${marker}" cx="${x(n.start)+width/2}" cy="${marker==='above'?top-2:top+10}" r=".5" fill="white"/>`;
      if(n.label) body += text(x(n.start)+2,top-8,n.label);
    });
    if(options.label) body += text(34,height-4,options.label);
    return svg(body,height,options.label??"Rawl example");
  }
  function stacked(chords, labels, options = {}) {
    return score(chords.flatMap((c,i)=>chord(c,Number((i*1.2).toFixed(6)),.85)), {duration:chords.length*1.2,lines:chords.map((_,i)=>i*1.2),lineLabels:labels,...options});
  }
  function paletteView() {
    return `<div class="palette-list">${palette.map((color,i)=>`<div class="palette-note"><strong>${degrees[i]}</strong><span class="swatch" style="background:${color}">${i===1||i===6?`<span class="dot" style="width:${i===1?1:2}px;height:${i===1?1:2}px;background:${i===1?'white':'black'}"></span>`:""}</span><span>${names[i]}</span></div>`).join("")}</div>`;
  }
  function pitchBend() {
    const id = `bend-${uid++}`;
    let body = `<defs><linearGradient id="${id}"><stop stop-color="${palette[2]}"/><stop offset="1" stop-color="${palette[3]}"/></linearGradient></defs>`;
    body += text(25,20,"D → E♭") + `<path d="M40 91 L435 53 L435 61 L40 99Z" fill="url(#${id})"/>`;
    body += text(40,128,"0s")+text(425,128,"1s");
    return svg(body,145,"Pitch bend");
  }
  function beatGroups(groups, label) {
    const total = groups.reduce((a,b)=>a+b,0), left=22, width=438;
    let body = text(left,15,label), count=0;
    for(let i=0;i<=total;i++) {
      const boundary = i===0||i===total||groups.slice(0,-1).some((_,j)=>groups.slice(0,j+1).reduce((a,b)=>a+b,0)===i);
      const x=left+i/total*width;
      if(boundary)body += `<line x1="${x}" x2="${x}" y1="28" y2="82" stroke="${i===0||i===total?'#aaa':'#555'}" stroke-width="${i===0||i===total?1:.6}"/>`;
      if(i<total) {
        body += `<rect x="${x+4}" y="53" width="${width/total-8}" height="8" rx="4" fill="${palette[[0,2,4,7,11][i%5]]}"/>`;
        if(boundary)count=0;
        body += text(x+width/total/2-3,98,++count);
      }
    }
    return svg(body,112,"Beat grouping");
  }
  function phrases(extended=false) {
    const total=extended?9:8;
    let body="";
    for(let i=0;i<total;i++) {
      const x=25+i*47;
      body += `<line x1="${x}" x2="${x}" y1="30" y2="99" stroke="${i===0||i===(extended?5:4)?'#aaa':'#373733'}"/>`+text(x+4,19,i+1);
      body += `<rect x="${x+5}" y="${76-[0,4,7,4,0][i%(extended?5:4)]*4}" width="35" height="8" rx="4" fill="${palette[[0,4,7,4,0][i%(extended?5:4)]]}"/>`;
    }
    const split=extended?5:4;
    body += `<path d="M25 113 V119 H${25+split*47-6} V113 M${25+split*47} 113 V119 H${25+total*47-6} V113" fill="none" stroke="#777"/>`;
    body += text(26,138,extended?"5 + 4":"4 + 4");
    return svg(body,150,"Phrase lengths");
  }
  function sections(aligned=false,end=false) {
    let body="";
    const phrase=(x,y,dim=false)=>[0,4,7,4].map((pc,i)=>`<rect x="${x+i*21}" y="${y-pc*2}" width="17" height="7" rx="3.5" fill="${dim?'#42423e':palette[pc]}"/>`).join("");
    body += text(20,18,"A")+phrase(50,68,true)+phrase(160,68)+phrase(270,68)+phrase(380,68);
    const start=aligned?(end?270:160):50;
    body += text(20,111,"B")+phrase(start,155)+phrase(start+110,155);
    if(aligned)body+=`<line x1="${end?460:160}" x2="${end?460:160}" y1="27" y2="167" stroke="#aaa" stroke-dasharray="3 3"/>`;
    body+=text(50,193,end?"End":"Start");
    return svg(body,205,"Section alignment");
  }
  function realTempo() {
    const rows=[{label:"120 bpm",times:[0,.5,1,1.5,2]}, {label:"60 bpm",times:[0,1,2,3,4]}, {label:"Acceleration",times:[0,.9,1.6,2.1,2.4]}, {label:"Slowdown",times:[0,.4,1,1.9,3.1]}];
    return svg(rows.map((row,i)=>{
      const y=35+i*55;
      let body=text(20,y-10,row.label);
      row.times.forEach((t,j)=>{const x=120+t*82;body+=`<line x1="${x}" x2="${x}" y1="${y-21}" y2="${y+12}" stroke="#4c4c47"/>`;if(j<row.times.length-1)body+=`<rect x="${x+2}" y="${y}" width="${Math.max(4,(row.times[j+1]-t)*82-7)}" height="7" rx="3.5" fill="${palette[j%2?7:0]}"/>`;});
      return body;
    }).join("")+text(120,264,"0s")+text(446,264,"4s"),280,"Real tempo");
  }
  const melody=[tone(60,0,.55),tone(64,.65,.4),tone(67,1.15,.4),tone(65,1.65,.3),tone(62,2,.45),tone(59,2.55,.45),tone(60,3.1,.8)];
  const examples={
    opening:()=>({html:score([...melody,...chord([48,55],0,1.5,{voice:1}),...chord([43,53],1.65,1.25,{voice:1}),...chord([48,55],3.1,.8,{voice:1})],{duration:4,lines:[0,1,2,3,4],label:"C"})}),
    time:()=>({html:score([tone(60,0,1),tone(64,0,.5,{voice:1}),tone(64,1,.5,{voice:1}),tone(60,2,1)],{duration:3.2,lines:[0,.5,1,1.5,2,2.5,3],label:"Seconds"}),notes:[tone(60,0,1),tone(64,0,.5),tone(64,1,.5),tone(60,2,1)]}),
    pitch:()=>({html:score([60,61,62,64,67,72].map((p,i)=>tone(p,i*.6,.45,{label:String(p-60)})),{grid:false,duration:3.6,lines:[],label:"Semitones"}),notes:[60,61,62,64,67,72].map((p,i)=>tone(p,i*.6,.45))}),
    shapes:()=>({html:score([...melody,...[tone(48,0,1.4,{voice:1}),tone(55,1.65,1.2,{voice:1}),tone(48,3.1,.8,{voice:1})]],{label:"Parts"}),notes:[...melody,tone(48,0,1.4),tone(55,1.65,1.2),tone(48,3.1,.8)]}),
    tonic:()=>({html:stacked([[60,64,67]],['C'],{tonic:0})+stacked([[62,66,69]],['D'],{tonic:2}),notes:[...chord([60,64,67],0),...chord([62,66,69],1.2)]}),
    palette:()=>({html:paletteView()}),
    pairs:()=>({html:score([61,62,63,64,65,66,68,69,70,71].map((p,i)=>tone(p,i*.5,.38)),{grid:false,lines:[0,1,2,3,4],lineLabels:['♭2 / 2','♭3 / 3','4 / ♯4','♭6 / 6','♭7 / 7'],duration:5}),notes:[61,62,63,64,65,66,68,69,70,71].map((p,i)=>tone(p,i*.5,.38))}),
    flags:()=>({html:stacked([[60,64,67],[60,63,67],[65,69,72],[65,68,72],[55,59,62],[55,59,62,65]],['I','i','IV','iv','V','V7'])+`<div class="thirds">${[1,2,5,6,8,9,0,3,4,7,10,11].map(pc=>`<span><i style="background:${palette[pc]}"></i>${degrees[pc]}</span>`).join('')}</div>`,notes:[[60,64,67],[60,63,67],[65,69,72],[65,68,72],[55,59,62],[55,59,62,65]].flatMap((p,i)=>chord(p,i*1.2))}),
    green:()=>({html:stacked([[55,59,62,65],[60,64,67],[55,59,62,65],[60,63,67]],['G7','C','G7','Cm']),notes:[[55,59,62,65],[60,64,67],[55,59,62,65],[60,63,67]].flatMap((p,i)=>chord(p,i*1.2))}),
    dots:()=>({html:score([tone(61,0,.65,{label:'♭2'}),tone(62,1,.65,{label:'2'}),tone(65,2,.65,{label:'4'}),tone(66,3,.65,{label:'♯4'})],{grid:false,duration:4,lines:[]}),notes:[61,62,65,66].map((p,i)=>tone(p,i,.65))}),
    bends:()=>({html:pitchBend(),notes:[tone(62,0,1,{to:63})]}),
    quartertones:()=>({html:score([tone(63,0,.45),tone(63.5,.65,.8,{label:'E half-flat'}),tone(64,1.65,.45),tone(62,2.4,.45),tone(62.5,3.05,.8),tone(63,4.05,.45)],{duration:4.8,lines:[],grid:false}),notes:[63,63.5,64,62,62.5,63].map((p,i)=>tone(p,i*.7,.5))}),
    recoloring:()=>({html:stacked([[55,59,62]],['C tonic'],{tonic:0})+stacked([[55,59,62]],['G tonic'],{tonic:7}),notes:chord([55,59,62],0,.9)}),
    modulation:()=>({html:score([...chord([60,64,67],0,.7),...chord([55,59,62],1.1,.7),...chord([55,59,62],2.2,.7),...chord([62,66,69],3.3,.7),...chord([55,59,62],4.4,.7)],{duration:5.5,lines:[0,2.2],lineLabels:['C','G'],changes:[{time:2.2,tonic:7}]}),notes:[[60,64,67],[55,59,62],[55,59,62],[62,66,69],[55,59,62]].flatMap((p,i)=>chord(p,i*1.1))}),
    tonicization:()=>({html:stacked([[60,64,67],[62,66,69,72],[55,59,62],[60,64,67]],['C','D7','G','C'],{changes:[{time:1.2,tonic:7},{time:3.6,tonic:0}]}),notes:[[60,64,67],[62,66,69,72],[55,59,62],[60,64,67]].flatMap((p,i)=>chord(p,i*1.2))}),
    applied:()=>({html:stacked([[62,66,69,72],[55,59,62],[64,68,71,74],[57,60,64]],['V7/V','V','V7/vi','vi']),notes:[[62,66,69,72],[55,59,62],[64,68,71,74],[57,60,64]].flatMap((p,i)=>chord(p,i*1.2))}),
    readings:()=>({html:stacked([[62,66,69,72],[55,59,62]],['D7','G'],{label:'C tonic'})+stacked([[62,66,69,72],[55,59,62]],['V7','I'],{tonic:7,label:'G tonic'}),notes:[...chord([62,66,69,72],0),...chord([55,59,62],1.2)]}),
    grid:()=>({html:score([tone(48,0,.8),tone(55,1,.8),tone(60,2,.8),tone(67,3,.8),tone(72,4,.8)],{min:46,max:74,duration:5,lines:[],label:'C tonic'}),notes:[48,55,60,67,72].map((p,i)=>tone(p,i*.7,.5))}),
    measures:()=>({html:score(Array.from({length:8},(_,i)=>tone([60,64,67,64][i%4],i*.45,.3)),{duration:3.6,lines:[0,.45,.9,1.35,1.8,2.25,2.7,3.15,3.6],lineLabels:['1','·','·','·','2','·','·','·','3'],measureLines:[0,1.8,3.6],dashed:true}),notes:Array.from({length:8},(_,i)=>tone([60,64,67,64][i%4],i*.45,.3))}),
    grouping:()=>({html:beatGroups([3,2],'3+2')+beatGroups([2,3],'2+3')+beatGroups([3,2,2,3],'3+2+2+3'),notes:Array.from({length:5},(_,i)=>tone(60,i*.4,.2))}),
    phrases:()=>({html:phrases(false)+phrases(true)}),
    sections:()=>({html:sections(false)}),
    anchoring:()=>({html:sections(false),states:[{label:'Before',render:()=>sections(false)},{label:'Start',render:()=>sections(true)},{label:'End',render:()=>sections(true,true)}]}),
    tempo:()=>({html:realTempo(),notes:[0,.9,1.6,2.1,2.4].map(t=>tone(60,t,.15))}),
    enharmonic:()=>({html:score([tone(61,0,1.1,{label:'C♯ / D♭'}),tone(66,1.8,1.1,{label:'F♯ / G♭'})],{duration:3.5,lines:[],grid:false}),notes:[tone(61,0,.8),tone(66,1.2,.8)]}),
    expression:()=>({html:score([tone(60,0,.7,{label:'Soft'}),tone(60,1.2,.7,{label:'Loud'})],{duration:2.4,lines:[],grid:false}),notes:[tone(60,0,.7,{velocity:.3}),tone(60,1.2,.7,{velocity:1})]})
  };
  const chapters = [
    {id:'reading', title:'Reading notes', items:[['time','Time'],['pitch','Pitch'],['shapes','Shapes']]},
    {id:'colors', title:'Colors',items:[['tonic','Tonic'],['palette','Palette'],['pairs','Color pairs'],['flags','Chord flags'],['green','Green and red'],['dots','Inside dots'],['bends','Pitch bends'],['quartertones','Arabic quartertones']]},
    {id:'changing',title:'Changing tonic',items:[['recoloring','Recoloring'],['modulation','Modulation'],['tonicization','Tonicization'],['applied','Applied chords'],['readings','Two readings']]},
    {id:'tonal-grid',title:'Tonal grid',items:[['grid','Tonal grid']]},
    {id:'rhythm',title:'Rhythm and form',items:[['measures','Measures'],['grouping','Beat grouping'],['phrases','Phrases'],['sections','Sections'],['anchoring','Anchoring'],['tempo','Real tempo']]},
    {id:'omitted',title:'Omitted marks',items:[['enharmonic','Enharmonic spelling'],['expression','Volume and expression']]}
  ];
  if (typeof module === 'object' && module.exports) {
    module.exports = {chapters, examples, palette, esc};
    return;
  }
  const chapterRoot = document.getElementById('chapters');
  if (!chapterRoot.children.length) chapters.forEach((chapter,index)=>{
    const section=document.createElement('section');
    section.className='chapter';section.id=chapter.id;section.dataset.chapter=chapter.id;
    section.innerHTML=`<header class="chapter-header"><span class="chapter-number">${String(index+1).padStart(2,'0')}</span><h2>${chapter.title}</h2></header>`;
    chapter.items.forEach(([id,title])=>{
      const article=document.createElement('section');article.id=id;article.dataset.concept=id;article.className='concept';
      article.innerHTML=`<div><h3><a href="#${id}">${title}</a></h3><div class="prose" data-copy="${id}"></div></div><div class="example" data-example="${id}"></div>`;
      section.append(article);
    });
    chapterRoot.append(section);
    document.getElementById('contents').insertAdjacentHTML('beforeend',`<li><a href="#${chapter.id}"><span>${String(index+1).padStart(2,'0')}</span>${chapter.title}</a></li>`);
  });
  const playIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
  const stopIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>';
  let context, playing=[], stopTimer, active, playbackRequest=0;
  const playbackState=(container,value)=>{const state=container.parentElement.querySelector('.play-state');if(state)state.textContent=value};
  function stop(){playbackRequest++;clearTimeout(stopTimer);playing.forEach(node=>{try{node.stop()}catch{}});playing=[];if(active){active.classList.remove('now-playing');playbackState(active,'Stopped');active=null;}}
  async function play(notes,container){
    stop();
    const request=playbackRequest;
    context??=new (window.AudioContext||window.webkitAudioContext)();
    await context.resume();
    if(request!==playbackRequest)return;
    active=container;container.classList.add('now-playing');playbackState(container,'Playing');
    const start=context.currentTime+.04;
    notes.forEach(note=>{
      const osc=context.createOscillator(),gain=context.createGain();
      const begin=start+note.start, end=begin+note.duration;
      osc.type='triangle';osc.frequency.setValueAtTime(440*2**((note.pitch-69)/12),begin);
      if(note.to!==undefined)osc.frequency.exponentialRampToValueAtTime(440*2**((note.to-69)/12),end);
      const level=.045*(note.velocity??.7);
      gain.gain.setValueAtTime(0,begin);gain.gain.linearRampToValueAtTime(level,begin+.015);gain.gain.setValueAtTime(level,Math.max(begin+.016,end-.04));gain.gain.linearRampToValueAtTime(0,end);
      osc.connect(gain);gain.connect(context.destination);osc.start(begin);osc.stop(end+.01);osc.onended=()=>{osc.disconnect();gain.disconnect()};playing.push(osc);
    });
    stopTimer=setTimeout(stop,(Math.max(...notes.map(n=>n.start+n.duration))+.15)*1000);
  }
  document.querySelectorAll('[data-example]').forEach(container=>{
    const example=examples[container.dataset.example]();
    let diagram=container.querySelector('.diagram');
    if(!diagram){diagram=document.createElement('div');diagram.className='diagram';diagram.innerHTML=example.html;container.append(diagram);}
    if(example.notes||example.states){
      const tools=document.createElement('div');tools.className='example-tools';
      example.states?.forEach((state,i)=>{const button=document.createElement('button');button.type='button';button.textContent=state.label;button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{diagram.innerHTML=state.render();tools.querySelectorAll('[aria-pressed]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)))});tools.append(button)});
      if(example.notes){
        const playButton=document.createElement('button');playButton.type='button';playButton.innerHTML=playIcon+'Play';playButton.addEventListener('click',()=>{play(example.notes,diagram).catch(()=>{stop();playButton.disabled=true;playbackState(diagram,'Unavailable')})});
        const stopButton=document.createElement('button');stopButton.type='button';stopButton.innerHTML=stopIcon+'Stop';stopButton.addEventListener('click',stop);
        const state=document.createElement('span');state.className='eyebrow play-state';state.setAttribute('role','status');state.setAttribute('aria-live','polite');
        tools.append(playButton,stopButton,state);
      }
      container.append(tools);
    }
  });
  window.addEventListener('pagehide',stop);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
  const observer=new IntersectionObserver(entries=>{
    const entry=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(entry)document.querySelectorAll('.contents a').forEach(a=>a.setAttribute('aria-current',String(a.hash===`#${entry.target.id}`)));
  },{rootMargin:'-15% 0px -65% 0px'});
  document.querySelectorAll('.chapter').forEach(section=>observer.observe(section));
  document.querySelector('.contents a')?.setAttribute('aria-current','true');
})();
