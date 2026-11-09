const fs = require('fs');
const crypto = require('crypto');
const admin = require('../../node_modules/firebase-admin');
const { parseMidi } = require('../../node_modules/midi-file');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const bytes = fs.readFileSync(__dirname + '/haydn-hob-xv-27-iii.mid');
const midi = parseMidi(bytes);
const entry = {
  slug: 'haydn-piano-trio-hob-xv-27-iii-finale-presto',
  title: 'Piano Trio in C major, Hob.XV:27',
  url: 'https://www.el-atril.com/midis/Haydn.htm',
  sourceMidiUrl: 'https://www.el-atril.com/midis/Haydn/Haydn_Trios/fjht273.mid',
};
const publish = process.argv.includes('--publish');
if (bytes.length !== 46927 || midi.header.numTracks !== 5) throw Error('Unexpected MIDI');
admin.initializeApp({ credential: admin.credential.cert(require('../../src/config/firebaseConfigPrivate.json')) });
const db = admin.firestore();
db.settings({ preferRest: true });
(async () => {
  const indexRef = db.doc('indexes/midis');
  const ref = db.collection('midis').doc();
  const record = await db.runTransaction(async tx => {
    const index = await tx.get(indexRef);
    const found = await tx.get(db.collection('midis').where('slug', '==', entry.slug));
    if (!index.exists) throw Error('Missing index');
    const indexed = index.data().midis.filter(row => row.slug === entry.slug);
    if (!found.empty) {
      if (found.size !== 1 || indexed.length !== 1 || indexed[0].id !== found.docs[0].id) throw Error('Ambiguous existing slug');
      const current = found.docs[0].data();
      if (sha(Buffer.from(current.blob)) !== sha(bytes) || current.title !== entry.title || current.url !== entry.url) throw Error('Existing entry differs');
      return { id: found.docs[0].id, ...entry, existing: true };
    }
    if (indexed.length) throw Error('Index collision');
    if (publish) {
      tx.create(ref, { ...entry, blob: bytes });
      tx.update(indexRef, { midis: admin.firestore.FieldValue.arrayUnion({ id: ref.id, title: entry.title, slug: entry.slug }) });
    }
    return { id: ref.id, ...entry, existing: false };
  });
  const result = { ...record, sha256: sha(bytes), bytes: bytes.length, published: publish, checkedAt: new Date().toISOString() };
  if (publish) {
    const live = (await db.collection('midis').doc(record.id).get()).data();
    const index = (await indexRef.get()).data().midis;
    if (sha(Buffer.from(live.blob)) !== result.sha256) throw Error('Remote byte mismatch');
    if (!index.some(row => row.id === record.id && row.slug === entry.slug)) throw Error('Missing index entry');
    fs.writeFileSync(__dirname + '/published.json', JSON.stringify(result, null, 2) + '\n');
    fs.writeFileSync(__dirname + '/local-dump.json', JSON.stringify({ ...entry, blobBase64: bytes.toString('base64') }, null, 2) + '\n');
  }
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => db.terminate());
