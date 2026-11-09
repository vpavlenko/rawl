const assert=require('node:assert/strict');
const {test}=require('node:test');
const fs=require('node:fs'),vm=require('node:vm');
const root=process.env.RAWL_ROOT||require('node:path').resolve(__dirname,'../..');
const path=require('node:path');
const htmlDir=process.env.RAWL_HTML_DIR||path.join(root,'public');
function inlineScript(html,needle){
 const script=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes(needle))?.[1];
 assert.ok(script, 'Missing routing script');return script;
}
const fallback=fs.readFileSync(path.join(htmlDir,'404.html'),'utf8');
const index=fs.readFileSync(path.join(htmlDir,'index.html'),'utf8');
const redirect=inlineScript(fallback,'window.location');
const restore=inlineScript(index,'history.replaceState');
function navigate(url,now){
 let entry,final;const original=new URL(url);const loc={protocol:original.protocol,hostname:original.hostname,port:original.port,pathname:original.pathname,search:original.search,hash:original.hash,replace:u=>entry=u};
 vm.runInNewContext(redirect,{window:{location:loc},Date:{now:()=>now}});
 const u=new URL(entry);vm.runInNewContext(restore,{window:{location:{pathname:u.pathname,search:u.search,hash:u.hash},history:{replaceState:(_,__,v)=>final=v}}});
 return {entry,final};
}
test('all deep links fetch a fresh shared entry while preserving routes, queries and hashes',()=>{
 for(const route of ['/f/abraham-salman-taksim-bayat-mawzoun','/f/rei-korkus-ibrahim-al-aryan-samai-bayati','/corpus/riyad_al_sunbati']){
  const url='https://rawl.rocks'+route+'?a=1&b=2#section';
  const a=navigate(url,1000),b=navigate(url,2000);
  assert.notEqual(a.entry,b.entry);
  assert.equal(new URL(a.entry).pathname,'/');
  assert.equal(new URL(a.entry).searchParams.get('v'),'1000');
  assert.equal(a.final,route+'?a=1&b=2#section');
  assert.equal(a.final,b.final);
 }
 assert(!/\/static\/js\//.test(redirect));
});

test("built pages use one current app entry", { skip: !process.env.RAWL_HTML_DIR }, () => {
 const manifest=JSON.parse(fs.readFileSync(path.join(htmlDir,"asset-manifest.json"),"utf8"));
 const urls=[...index.matchAll(/<script[^>]+src=["\']([^"\']+)["\']/g)].map(m=>m[1]).filter(u=>u.startsWith("/static/js/"));
 const expected=[manifest["main.js"],...Object.entries(manifest).filter(([k])=>/^static\/js\/\d.*\.js$/.test(k)).map(([,v])=>v)];
 assert.deepEqual(urls.slice().sort(),expected.sort());
 assert.equal(urls.filter(u=>u===manifest["main.js"]).length,1);
 for(const u of urls)assert.ok(fs.existsSync(path.join(htmlDir,u.split("?")[0])));
 assert(!/\/static\/js\//.test(fallback));
});
