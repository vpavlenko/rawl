// Conservative whole-piece search of every locally backed-up MIDI.
// node scripts/rawl/search-simple-major.js [--live] [--write]
// --write appends matches to simple_major without removing curated entries.
// Annotated key changes are checked in their local major keys. Ambiguous endings
// and unannotated modulations remain conservative exclusions.
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

// Resolve annotation measure numbers to MIDI quarter-note beats. Manual measure
// anchors use seconds, so reproduce the app's snapping/length extrapolation.
function readKeyRegions(midi, notes, annotation) {
  const keys = Object.entries(annotation?.modulations || {})
    .filter(([, tonic]) => Number.isInteger(tonic))
    .sort((a, b) => Number(a[0]) - Number(b[0]));
  if (!keys.length) return [];
  const events = midi.tracks
    .flatMap((track) => {
      let tick = 0;
      return track.flatMap((event) => {
        tick += event.deltaTime;
        return ["setTempo", "timeSignature"].includes(event.type)
          ? [{ ...event, beat: tick / midi.header.ticksPerBeat }]
          : [];
      });
    })
    .sort((a, b) => a.beat - b.beat);
  const tempos = [{ beat: 0, seconds: 0, duration: 0.5 }];
  for (const event of events.filter((e) => e.type === "setTempo")) {
    const previous = tempos.at(-1);
    tempos.push({
      beat: event.beat,
      seconds:
        previous.seconds + (event.beat - previous.beat) * previous.duration,
      duration: event.microsecondsPerBeat / 1e6,
    });
  }
  const toSeconds = (beat) => {
    const tempo = tempos.filter((t) => t.beat <= beat).at(-1);
    return tempo.seconds + (beat - tempo.beat) * tempo.duration;
  };
  const toBeat = (seconds) => {
    const tempo =
      tempos.filter((t) => t.seconds <= seconds).at(-1) || tempos[0];
    return tempo.beat + (seconds - tempo.seconds) / tempo.duration;
  };
  const maxMeasure = Math.max(...keys.map(([measure]) => Number(measure)));
  let measures;
  if (annotation.measures) {
    const { measureStarts = {}, beatsPerMeasure = {} } = annotation.measures;
    const starts = notes.map((n) => toSeconds(n.start));
    measures = [measureStarts[1] ?? 0];
    let currentBeats = beatsPerMeasure[1] ?? 4;
    let previousBeats = currentBeats;
    let length = 1;
    for (let measure = 2; measure <= maxMeasure; measure++) {
      const predicted =
        measures.at(-1) + (length * currentBeats) / previousBeats;
      let next =
        measureStarts[measure] ??
        starts.reduce((best, time) =>
          Math.abs(time - predicted) < Math.abs(best - predicted) ? time : best,
        );
      if (next - measures.at(-1) < 0.01) next = measures.at(-1) + 2;
      previousBeats = currentBeats;
      currentBeats = beatsPerMeasure[measure] ?? currentBeats;
      length = next - measures.at(-1);
      measures.push(next);
    }
    measures = measures.map(toBeat);
  } else {
    measures = [0];
    let numerator = 4;
    let denominator = 4;
    const signatures = events.filter((e) => e.type === "timeSignature");
    for (let measure = 2; measure <= maxMeasure; measure++) {
      const start = measures.at(-1);
      for (const signature of signatures.filter((e) => e.beat <= start)) {
        numerator = signature.numerator;
        denominator = signature.denominator;
      }
      measures.push(start + (numerator * 4) / denominator);
    }
  }
  const truckDriverAt = (measure) =>
    (annotation.tags || []).includes("modulation:truck_driver") ||
    (annotation.snippets || []).some(
      (snippet) =>
        snippet.tag === "modulation:truck_driver" &&
        snippet.measuresSpan?.[0] <= measure &&
        snippet.measuresSpan?.[1] >= measure,
    );
  return keys.map(([measure, tonic], index) => ({
    tonic,
    ...(index > 0 &&
    tonic !== keys[index - 1][1] &&
    truckDriverAt(Number(measure))
      ? { pickupStart: measures[Number(measure) - 2] }
      : {}),
    start:
      annotation.modulationOnset?.[measure] != null
        ? toBeat(annotation.modulationOnset[measure])
        : measures[Number(measure) - 1],
  }));
}

function keyAtBeat(regions, beat, fallback) {
  return (
    regions.filter((region) => region.start <= beat + 0.00001).at(-1)?.tonic ??
    fallback
  );
}

// Only the immediately preceding bar of a tagged truck-driver lift is exempt.
// A held chromatic note must belong to the destination key if it crosses the lift.
function isPickupNote(note, regions) {
  return regions.some(
    (region) =>
      region.pickupStart != null &&
      note.start >= region.pickupStart - 0.00001 &&
      note.start < region.start &&
      (note.end <= region.start + 0.00001 ||
        scale.includes((note.pitch - region.tonic + 12) % 12)),
  );
}

function classify(notes, annotation, keyRegions = [], options = {}) {
  if (notes.length < 24) return null;
  const end = Math.max(...notes.map((n) => n.end));
  if (end - notes[0].start < 8) return null;
  const annotatedKeys = [
    ...new Set(Object.values(annotation?.modulations || {})),
  ];
  if (annotatedKeys.length > 1 && !keyRegions.length) return null;
  const voices = new Map();
  for (const note of notes) {
    if (!voices.has(note.voice)) voices.set(note.voice, []);
    voices.get(note.voice).push(note);
  }
  const totalDuration = notes.reduce((sum, n) => sum + n.end - n.start, 0);
  const matches = [];
  for (let tonic = 0; tonic < 12; tonic++) {
    if (annotatedKeys.length && annotatedKeys[0] !== tonic) continue;
    const diatonic = (n) =>
      scale.includes(
        (n.pitch - keyAtBeat(keyRegions, n.start, tonic) + 12) % 12,
      );
    const pickupChromatic = notes.filter(
      (n) => !diatonic(n) && isPickupNote(n, keyRegions),
    );
    const chromatic = notes.filter(
      (n) => !diatonic(n) && !isPickupNote(n, keyRegions),
    );
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
      if (!after) return false;
      const passing =
        before && (n.pitch - before.pitch) * (after.pitch - n.pitch) > 0;
      const neighbor = before && before.pitch === after.pitch;
      const approach =
        n.end - n.start <= 0.25 && Math.abs(after.pitch - n.pitch) === 1;
      if (!passing && !neighbor && !approach) return false;
      // Reject complete non-diatonic triads, including a secondary dominant
      // with just one altered pitch, even when that pitch resolves by step.
      const sounding = new Set(
        notes
          // For a short approach, a dying tone from the previous chord must
          // not turn the fleeting overlap into a complete chromatic triad.
          .filter(
            (p) =>
              p.start <= n.start + 0.02 &&
              p.end > (approach ? n.end - 0.02 : n.start),
          )
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
    // Require a terminal tonic with root in bass and evidence of its major third,
    // rather than mistaking relative minor or a mode for major scale membership.
    const tail = notes.filter((n) => n.end > end - 1);
    const finalTonic = keyAtBeat(keyRegions, end, tonic);
    if (
      options.requireTonicEnding !== false &&
      (!tail.length ||
        Math.min(...tail.map((n) => n.pitch)) % 12 !== finalTonic)
    )
      continue;
    const tailPCs = new Set(tail.map((n) => (n.pitch - finalTonic + 12) % 12));
    const finalRegionStart = keyRegions.at(-1)?.start ?? 0;
    const finalRegionPCs = new Set(
      notes
        .filter((n) => n.start >= finalRegionStart)
        .map((n) => (n.pitch - finalTonic + 12) % 12),
    );
    // Annotated major sections may end on a bare root or open fifth. Require
    // the major third elsewhere in that section instead of discarding them.
    const majorEnding = annotatedKeys.length
      ? finalRegionPCs.has(4) && tailPCs.has(0)
      : [0, 4, 7].every((pc) => tailPCs.has(pc));
    // Diatonic tonic sevenths, sixths, ninths and other scale extensions are
    // valid major endings; only altered ending tones are disallowed.
    if (
      options.requireTonicEnding !== false &&
      (!majorEnding || [...tailPCs].some((pc) => !scale.includes(pc)))
    )
      continue;
    matches.push({
      tonic,
      ...(keyRegions.length > 1 ? { keyRegions } : {}),
      chromaticNotes: chromatic.length,
      ...(pickupChromatic.length
        ? { pickupChromaticNotes: pickupChromatic.length }
        : {}),
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
      const midi = parseMidi(Buffer.from(data.blobBase64, "base64"));
      const notes = readNotes(midi);
      scanned++;
      const annotation = analyses[`f/${entry.slug}`];
      const match = classify(
        notes,
        annotation,
        readKeyRegions(midi, notes, annotation),
      );
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
    if (lines) {
      // New search results have not been ranked yet. Do not silently place
      // them in the final (most complex) harmony section.
      const sectionsPath = path.join(
        root,
        "src/components/rawl/corpora/simpleMajorSections.json",
      );
      const sections = JSON.parse(fs.readFileSync(sectionsPath, "utf8"));
      if (!sections.some((section) => section.id === "unclassified")) {
        sections.push({
          id: "unclassified",
          title: "Not yet categorized",
          description: "New additions awaiting a harmonic complexity ranking.",
          startsAtMidi: additions[0].slug,
        });
      }
      fs.writeFileSync(sectionsPath, JSON.stringify(sections, null, 2) + "\n");
      fs.writeFileSync(
        corpusPath,
        sourceText.slice(0, insertion).trimEnd() +
          "\n      // Whole-piece MIDI scan: diatonic major, allowing stepwise chromatic ornaments.\n" +
          lines +
          "\n    " +
          sourceText.slice(insertion),
      );
    }
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
module.exports = {
  readNotes,
  classify,
  readKeyRegions,
  keyAtBeat,
  isPickupNote,
};
