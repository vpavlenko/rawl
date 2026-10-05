const fs=require('fs'),path=require('path'),crypto=require('crypto');
const admin=require('/Users/chipfocus/repos/rawl/node_modules/firebase-admin');
admin.initializeApp({credential:admin.credential.cert(require('/Users/chipfocus/repos/rawl/src/config/firebaseConfigPrivate.json'))});
const repo='/Users/chipfocus/repos/rawl', root=repo+'/reports/gibran-alcocer-harmony-audit-2026-10-04';
const originals=repo+'/backup_midis/2026-10-04T19-57-11-515Z-gibran-harmony-fix';
const uid='RK31rsh4tDdUGlNYQvakXW4AYbB3', sha=b=>crypto.createHash('sha256').update(b).digest('hex'),md5=s=>crypto.createHash('md5').update(s).digest('hex');
(async()=>{
const db=admin.firestore(), defaults=JSON.parse(fs.readFileSync(repo+'/src/corpus/analyses.json'));
const corrections=JSON.parse(fs.readFileSync(root+'/corrections.json')),manifest=JSON.parse(fs.readFileSync(originals+'/manifest.json'));
const adminRef=db.collection('users').doc(uid),indexRef=db.doc('indexes/midis');
const jobs=corrections.map(c=>{
 const e=manifest.entries.find(e=>e.slug===c.slug), saved=JSON.parse(fs.readFileSync(originals+'/firebase/'+e.id+'.json'));
 const bytes=Buffer.from(saved.blobBase64,'base64');if(sha(bytes)!==c.originalSha256)throw Error('Original hash mismatch');
 const slug=c.slug+'_backup',key='f/'+c.slug,newKey='f/'+slug;
 return {c,e,saved,bytes,slug,key,newKey,ref:db.collection('midis').doc()};
});
const result=await db.runTransaction(async tx=>{
 const a=await tx.get(adminRef),idx=await tx.get(indexRef);
 const reads=await Promise.all(jobs.map(async j=>({j,slug:await tx.get(db.collection('midis').where('slug','==',j.slug)),annotations:await tx.get(db.collection('annotations').where('analysisKey','==',j.key))})));
 const records=[];
 for(const {j,slug,annotations} of reads){
  if(!slug.empty||idx.data().midis.some(m=>m.slug===j.slug))throw Error('Backup slug already exists: '+j.slug);
  if(a.data()?.analyses?.[j.newKey]||defaults[j.newKey])throw Error('Backup annotation already exists: '+j.newKey);
  j.analysis=a.data()?.analyses?.[j.key]??defaults[j.key];
  if(!j.analysis)throw Error('No source annotation: '+j.key);
  j.community=annotations.docs.filter(d=>d.data().ownerId!==uid).map(d=>d.data());
  records.push({slug:j.slug,id:j.ref.id,title:j.saved.title+' (backup)',analysis:j.analysis,communityCount:j.community.length,sha256:sha(j.bytes)});
 }
 // Validate destination community annotation IDs before creating anything.
 const communityRefs=reads.flatMap(({j})=>j.community.map(d=>({ref:db.collection('annotations').doc(d.ownerId+'_'+md5(j.newKey)),j,d})));
 for(const item of communityRefs)if((await tx.get(item.ref)).exists)throw Error('Destination contributor annotation exists');
 const stage={createdAt:new Date().toISOString(),records,sourceAnnotations:jobs.map(j=>({key:j.key,analysis:j.analysis}))};
 fs.writeFileSync(root+'/backup-versions-staged.json',JSON.stringify(stage,null,2));
 if(!process.argv.includes('--publish'))return stage;
 for(const j of jobs){
  const {blobBase64,...metadata}=j.saved;
  tx.create(j.ref,{...metadata,slug:j.slug,title:j.saved.title+' (backup)',blob:j.bytes});
  tx.update(adminRef,new admin.firestore.FieldPath('analyses',j.newKey),j.analysis);
 }
 for(const {ref,j,d} of communityRefs)tx.create(ref,{...d,analysisKey:j.newKey});
 tx.update(indexRef,{midis:admin.firestore.FieldValue.arrayUnion(...records.map(({slug,id,title})=>({slug,id,title})))});
 return stage;
});
if(process.argv.includes('--publish')){
 const localIndexPath=repo+'/src/midis/midis.json',localIndex=JSON.parse(fs.readFileSync(localIndexPath));
 const analysisPath=repo+'/src/corpus/analyses.json',text=fs.readFileSync(analysisPath,'utf8'),parsed=JSON.parse(text);
 const additions={};
 for(const r of result.records){
  const j=jobs.find(j=>j.slug===r.slug);
  const live=(await db.collection('midis').doc(r.id).get()).data();
  if(sha(Buffer.from(live.blob))!==j.c.originalSha256)throw Error('Uploaded hash mismatch');
  const ann=(await adminRef.get()).data().analyses[j.newKey];
  if(!require('util').isDeepStrictEqual(ann,j.analysis))throw Error('Annotation verification mismatch');
  const {blob,...metadata}=live;
  fs.writeFileSync(repo+'/src/midis/'+r.id+'.json',JSON.stringify({...metadata,blobBase64:Buffer.from(blob).toString('base64')},null,2));
  if(!localIndex.midis.some(m=>m.slug===r.slug))localIndex.midis.push({slug:r.slug,id:r.id,title:r.title});
  if(parsed[j.newKey])throw Error('Local annotation collision');
  additions[j.newKey]=j.analysis;
 }
 const appended=JSON.stringify(additions,null,2).slice(1,-1).trim();
 fs.writeFileSync(analysisPath,text.replace(/\s*}\s*$/,',\n  '+appended+'\n}\n'));
 fs.writeFileSync(localIndexPath,JSON.stringify(localIndex,null,2));
 fs.writeFileSync(root+'/backup-versions-published.json',JSON.stringify(result,null,2));
}
console.log(JSON.stringify(result.records.map(({slug,id,sha256,communityCount})=>({slug,id,sha256,communityCount})),null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1});
