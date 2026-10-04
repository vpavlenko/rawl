// Conservative whole-piece search of every locally backed-up MIDI.
// node scripts/rawl/search-simple-major.js [--live] [--write]
// --write appends matches to simple_major without removing curated entries.
// This deliberately misses modulating pieces and ambiguous/modal endings.
const fs = require("fs");
const path = require("path");
const { parseMidi } = require("midi-file");
const ts = require("typescript");
const root = path.resolve(__dirname, "../..");
const corpusPath = path.join(root, "src/components/rawl/corpora/corpora.tsx");
const scale = [0, 2, 4, 5, 7, 9, 11];

function readNotes(midi) {
  const beat = midi.header.ticksPerBeat;
  if (!beat) throw new Error("SMPTE time division");
  const notes = [];
  for (const [track, events] of midi.tracks.entries()) {
    let tick = 0;
    const active = new Map();
    for (const event of events) {
      tick += event.deltaTime;
      if (event.channel == null || event.channel === 9) continue;
      const key = `${event.channel}:${event.noteNumber}`;
      const on = event.type === "noteOn" && event.velocity > 0;
      if (on || event.type === "noteOff" || event.type === "noteOn") {
        const previous = active.get(key);
        if (previous != null && tick > previous)
          notes.push({
            start: previous / beat,
            end: tick / beat,
            pitch: event.noteNumber,
            voice: `${track}:${event.channel}`,
          });
        active.delete(key);
        if (on) active.set(key, tick);
      }
    }
    if (active.size) throw new Error("Unterminated pitched notes");
  }
  return notes.sort((a, b) => a.start - b.start || a.pitch - b.pitch);
}

function classify(notes, annotation) {
  if (notes.length < 24) return null;
  const end = Math.max(...notes.map((n) => n.end));
  if (end - notes[0].start < 8) return null;
  const annotatedKeys = [
    ...new Set(Object.values(annotation?.modulations || {})),
  ];
  if (annotatedKeys.length > 1) return null;
  const voices = new Map();
  for (const note of notes) {
    if (!voices.has(note.voice)) voices.set(note.voice, []);
    voices.get(note.voice).push(note);
  }
  const totalDuration = notes.reduce((sum, n) => sum + n.end - n.start, 0);
  const matches = [];
  for (let tonic = 0; tonic < 12; tonic++) {
    if (annotatedKeys.length && annotatedKeys[0] !== tonic) continue;
    const diatonic = (n) => scale.includes((n.pitch - tonic + 12) % 12);
    const chromatic = notes.filter((n) => !diatonic(n));
    const chromaticDuration = chromatic.reduce(
      (sum, n) => sum + n.end - n.start,
      0,
    );
    if (chromaticDuration / totalDuration > 0.02) continue;
    const isOrnament = (n) => {
      if (n.end - n.start > 0.5) return false;
      const voice = voices.get(n.voice);
      // Resolve in the same register/voice by step; do not excuse chromatic
      // chord tones just because the piece has a high overall scale fit.
      const before = voice
        .filter(
          (p) =>
            p.start < n.start &&
            n.start - p.end <= 0.125 &&
            Math.abs(p.pitch - n.pitch) <= 2 &&
            diatonic(p),
        )
        .at(-1);
      const after = voice.find(
        (p) =>
          p.start >= n.end - 0.02 &&
          p.start - n.end <= 0.125 &&
          Math.abs(p.pitch - n.pitch) <= 2 &&
          diatonic(p),
      );
      if (!before || !after) return false;
      const passing = (n.pitch - before.pitch) * (after.pitch - n.pitch) > 0;
      const neighbor = before.pitch === after.pitch;
      if (!passing && !neighbor) return false;
      // Reject complete non-diatonic triads, including a secondary dominant
      // with just one altered pitch, even when that pitch resolves by step.
      const sounding = new Set(
        notes
          .filter((p) => p.start <= n.start + 0.02 && p.end > n.start)
          .map((p) => p.pitch % 12),
      );
      for (const root of sounding) {
        for (const third of [3, 4]) {
          const chord = [root, (root + third) % 12, (root + 7) % 12];
          if (
            chord.includes(n.pitch % 12) &&
            chord.every((pc) => sounding.has(pc))
          )
            return false;
        }
      }
      // A simultaneous chromatic third/fifth is evidence of a chromatic chord.
      return !notes.some(
        (p) =>
          p !== n &&
          !diatonic(p) &&
          p.start < n.end &&
          p.end > n.start &&
          [3, 4, 7, 8, 9].includes(Math.abs(p.pitch - n.pitch) % 12),
      );
    };
    if (!chromatic.every(isOrnament)) continue;
    // Require a genuine terminal major tonic triad (including root in bass),
    // rather than mistaking relative minor or a mode for major scale membership.
    const tail = notes.filter((n) => n.end > end - 1);
    if (!tail.length || Math.min(...tail.map((n) => n.pitch)) % 12 !== tonic)
      continue;
    const tailPCs = new Set(tail.map((n) => (n.pitch - tonic + 12) % 12));
    if (
      ![0, 4, 7].every((pc) => tailPCs.has(pc)) ||
      [...tailPCs].some((pc) => ![0, 4, 7].includes(pc))
    )
      continue;
    matches.push({
      tonic,
      chromaticNotes: chromatic.length,
      chromaticDurationShare: chromaticDuration / totalDuration,
      noteCount: notes.length,
      beats: end,
    });
  }
  return matches.length === 1 ? matches[0] : null;
}

function findCollection(sourceText) {
  const source = ts.createSourceFile(
    corpusPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let collection;
  const slugs = new Set();
  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const property = (name) =>
        node.properties.find(
          (p) => ts.isPropertyAssignment(p) && p.name.getText(source) === name,
        );
      const slug = property("slug")?.initializer;
      const midis = property("midis")?.initializer;
      if (
        slug &&
        ts.isStringLiteral(slug) &&
        midis &&
        ts.isArrayLiteralExpression(midis)
      ) {
        for (const item of midis.elements)
          if (ts.isStringLiteral(item)) slugs.add(item.text);
        if (slug.text === "simple_major") collection = midis;
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!collection) throw new Error("simple_major array not found");
  return {
    collection,
    slugs,
    existing: new Set(collection.elements.map((n) => n.text)),
  };
}

async function main() {
  let firebaseApp;
  let db;
  let index = require("../../src/midis/midis.json").midis;
  if (process.argv.includes("--live")) {
    const admin = require("firebase-admin");
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(
        require("../../src/config/firebaseConfigPrivate.json"),
      ),
    });
    db = firebaseApp.firestore();
    index = (await db.collection("indexes").doc("midis").get()).data().midis;
  }
  const analyses = require("../../src/corpus/analyses.json");
  const sourceText = fs.readFileSync(corpusPath, "utf8");
  const { collection, slugs, existing } = findCollection(sourceText);
  const indexedCount = index.length;
  const corpusWithoutIndexedMidi = [...slugs].filter(
    (slug) => !index.some((entry) => entry.slug === slug || entry.id === slug),
  );
  if (db)
    index = [...index, ...corpusWithoutIndexedMidi.map((slug) => ({ slug }))];
  const matches = [];
  const failures = [];
  let scanned = 0;
  for (const entry of index) {
    try {
      const backup = path.join(root, "src/midis", `${entry.id}.json`);
      let data;
      if (entry.id && fs.existsSync(backup)) {
        data = JSON.parse(fs.readFileSync(backup));
      } else if (db) {
        const document = entry.id
          ? await db.collection("midis").doc(entry.id).get()
          : (
              await db
                .collection("midis")
                .where("slug", "==", entry.slug)
                .limit(1)
                .get()
            ).docs[0];
        if (!document?.exists) throw new Error("MIDI document not found");
        data = document.data();
        if (data.blob)
          data.blobBase64 = Buffer.from(data.blob).toString("base64");
      } else {
        throw new Error("No local backup (use --live)");
      }
      if (!data.blobBase64) throw new Error("Missing MIDI blob");
      const notes = readNotes(
        parseMidi(Buffer.from(data.blobBase64, "base64")),
      );
      scanned++;
      const match = classify(notes, analyses[`f/${entry.slug}`]);
      if (match)
        matches.push({
          slug: entry.slug,
          ...match,
          existing: existing.has(entry.slug),
          inCorpus: slugs.has(entry.slug),
        });
    } catch (error) {
      failures.push({ slug: entry.slug, error: error.message });
    }
  }
  matches.sort((a, b) => a.slug.localeCompare(b.slug));
  const additions = matches.filter((m) => !m.existing);
  const report = {
    source: db
      ? "live Firebase index with local MIDI backups"
      : "local MIDI backup index",
    indexed: indexedCount,
    attempted: index.length,
    scanned,
    failures,
    corpusWithoutIndexedMidi,
    existingCount: existing.size,
    additions: additions.length,
    matches,
  };
  const reportPath = path.join(
    root,
    "scripts/rawl/simple-major-search-results.json",
  );
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");
  if (process.argv.includes("--write")) {
    const insertion = collection.end - 1;
    const lines = additions
      .map((m) => `      ${JSON.stringify(m.slug)},`)
      .join("\n");
    if (lines)
      fs.writeFileSync(
        corpusPath,
        sourceText.slice(0, insertion).trimEnd() +
          "\n      // Whole-piece MIDI scan: diatonic major, allowing stepwise chromatic ornaments.\n" +
          lines +
          "\n    " +
          sourceText.slice(insertion),
      );
  }
  console.log(
    JSON.stringify({
      indexed: indexedCount,
      attempted: index.length,
      scanned,
      failures: failures.length,
      matched: matches.length,
      additions: additions.length,
      recoveredCurated: matches.filter((m) => m.existing).length,
    }),
  );
  if (firebaseApp) await firebaseApp.delete();
  for (const match of additions)
    console.log(
      `${match.slug} (tonic ${match.tonic}, chromatic notes ${match.chromaticNotes})`,
    );
}

if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = { readNotes, classify };
