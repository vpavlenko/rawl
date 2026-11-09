const assert = require("node:assert/strict");
const fs = require("node:fs");
const crypto = require("node:crypto");
require("ts-node").register({ transpileOnly: true });
const admin = require("firebase-admin");
const { parseMidi, writeMidi } = require("midi-file");
const {
  normalizeMidiMeasures,
} = require("../../src/components/rawl/normalizeMidiMeasures");
const hash = (b) => crypto.createHash("sha256").update(b).digest("hex");
const backup = JSON.parse(fs.readFileSync(__dirname + "/before.json"));
const original = Buffer.from(backup.blobBase64, "base64");
assert.deepEqual(Buffer.from(writeMidi(parseMidi(original))), original);
const fixed = Buffer.from(normalizeMidiMeasures(original));
assert.notDeepEqual(fixed, original);
assert.deepEqual(Buffer.from(normalizeMidiMeasures(fixed)), fixed);
fs.writeFileSync(__dirname + "/fixed.mid", fixed);
admin.initializeApp({
  credential: admin.credential.cert(
    require("../../src/config/firebaseConfigPrivate.json"),
  ),
});
const db = admin.firestore();
db.settings({ preferRest: true });
(async () => {
  const ref = db.doc("midis/" + backup.id);
  const publish = process.argv.includes("--publish");
  await db.runTransaction(async (tx) => {
    const live = (await tx.get(ref)).data();
    assert.equal(live.slug, backup.slug);
    const blob = Buffer.from(live.blob);
    assert.ok(
      blob.equals(original) || blob.equals(fixed),
      "Live MIDI changed since backup",
    );
    if (publish && !blob.equals(fixed)) tx.update(ref, { blob: fixed });
  });
  const live = (await ref.get()).data();
  const { blob, ...metadata } = live;
  const { id, blobBase64, ...originalMetadata } = backup;
  assert.deepEqual(
    metadata,
    originalMetadata,
    "All other document fields must remain unchanged",
  );
  if (publish) assert.deepEqual(Buffer.from(blob), fixed);
  const report = {
    id: backup.id,
    slug: backup.slug,
    originalSha256: hash(original),
    fixedSha256: hash(fixed),
    originalBytes: original.length,
    fixedBytes: fixed.length,
    addedMeters: [
      { tick: 213120, numerator: 1, denominator: 8 },
      { tick: 247920, numerator: 1, denominator: 8 },
      { tick: 259680, numerator: 1, denominator: 8 },
    ],
    published: publish,
    remoteBytesVerified: publish,
    checkedAt: new Date().toISOString(),
  };
  fs.writeFileSync(
    __dirname + "/validation.json",
    JSON.stringify(report, null, 2) + "\n",
  );
  console.log(JSON.stringify(report, null, 2));
})()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.terminate());
