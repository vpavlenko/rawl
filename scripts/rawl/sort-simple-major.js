// node scripts/rawl/sort-simple-major.js [--live] [--write]
// Broad pedagogical ordering, using saved harmonic tags before MIDI estimates.
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const { parseMidi } = require("midi-file");
const { readNotes } = require("./search-simple-major");
const root = path.resolve(__dirname, "../..");
const corpusPath = path.join(root, "src/components/rawl/corpora/corpora.tsx");
const scale = [0, 2, 4, 5, 7, 9, 11];
const groups = [
  "Primary triads: I, IV and V",
  "Triads with vi",
  "Triads with ii",
  "Triads with iii or vii diminished",
  "Dominant seventh chords",
  "Other / mixed seventh chords",
];
function estimateHarmony(notes, tonic) {
  const duration = Math.max(...notes.map((n) => n.end));
  const voices = [...new Set(notes.map((n) => n.voice))].map((voice) => {
    const ns = notes.filter((n) => n.voice === voice);
    return { voice, mean: ns.reduce((sum, n) => sum + n.pitch, 0) / ns.length };
  });
  const lowestMean = Math.min(...voices.map((v) => v.mean));
  const accompaniment = new Set(
    voices.filter((v) => v.mean <= lowestMean + 8).map((v) => v.voice),
  );
  const counts = Array(7).fill(0);
  const sevenths = Array(7).fill(0);
  let recognized = 0;
  // Half-beat probes use a two-beat window to include arpeggiated harmony.
  // Bass and lower-register chord tones carry more weight than the melody.
  for (let start = 0; start < duration; start += 0.5) {
    const sounding = notes.filter((n) => n.start < start + 2 && n.end > start);
    if (!sounding.length) continue;
    const bass = Math.min(...sounding.map((n) => n.pitch));
    const weights = Array(12).fill(0);
    for (const n of sounding) {
      const overlap = Math.min(n.end, start + 2) - Math.max(n.start, start);
      const weight =
        overlap *
        (accompaniment.has(n.voice) ? 1 : 0.15) *
        (n.pitch <= bass + 24 ? 1 : 0.5);
      const pc = (n.pitch - tonic + 12) % 12;
      weights[pc] = Math.max(weights[pc], weight);
    }
    const total = weights.reduce((a, b) => a + b, 0);
    let best;
    for (let degree = 0; degree < 7; degree++) {
      const triad = [
        scale[degree],
        scale[(degree + 2) % 7],
        scale[(degree + 4) % 7],
      ];
      if (triad.some((pc) => weights[pc] < 0.15)) continue;
      const bassIsRoot = (bass - tonic + 12) % 12 === triad[0];
      const seventh = scale[(degree + 6) % 7];
      // A fleeting melody tone must not turn every triad into a seventh chord.
      const bassAtStart = sounding.filter(
        (n) => n.start <= start + 0.125 && n.end > start,
      );
      const startsOnRoot =
        bassAtStart.length &&
        (Math.min(...bassAtStart.map((n) => n.pitch)) - tonic + 12) % 12 ===
          triad[0];
      const hasSeventh =
        bassIsRoot &&
        startsOnRoot &&
        weights[seventh] >= 0.6 &&
        weights[seventh] >= Math.min(...triad.map((pc) => weights[pc])) * 0.6;
      const chord = hasSeventh ? [...triad, seventh] : triad;
      const coverage = chord.reduce((sum, pc) => sum + weights[pc], 0) / total;
      const score =
        coverage + (bassIsRoot ? 0.18 : 0) - (hasSeventh ? 0.08 : 0);
      if (coverage >= 0.75 && (!best || score > best.score))
        best = { degree, hasSeventh, score };
    }
    if (best) {
      recognized++;
      counts[best.degree]++;
      if (best.hasSeventh) sevenths[best.degree]++;
    }
  }
  const threshold = Math.max(3, recognized * 0.035);
  const degrees = counts
    .map((count, i) => (count >= threshold ? i : -1))
    .filter((i) => i >= 0);
  const seventhDegrees = sevenths
    .map((count, i) => (count >= threshold ? i : -1))
    .filter((i) => i >= 0);
  let group =
    degrees.includes(2) || degrees.includes(6)
      ? 3
      : degrees.includes(1)
      ? 2
      : degrees.includes(5)
      ? 1
      : 0;
  if (seventhDegrees.length)
    group = seventhDegrees.some((i) => i !== 4) ? 5 : 4;
  return { group, degrees, seventhDegrees, recognized };
}
async function main() {
  const text = fs.readFileSync(corpusPath, "utf8");
  const source = ts.createSourceFile(
    corpusPath,
    text,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  let array;
  function visit(n) {
    if (
      ts.isObjectLiteralExpression(n) &&
      n.properties.some(
        (p) =>
          p.name?.getText(source) === "slug" &&
          p.initializer?.text === "simple_major",
      )
    )
      array = n.properties.find(
        (p) => p.name?.getText(source) === "midis",
      ).initializer;
    ts.forEachChild(n, visit);
  }
  visit(source);
  const slugs = array.elements.map((n) => n.text);
  const annotations = require("../../src/corpus/analyses.json");
  let index = require("../../src/midis/midis.json").midis;
  let app;
  let db;
  if (process.argv.includes("--live")) {
    const admin = require("firebase-admin");
    app = admin.initializeApp({
      credential: admin.credential.cert(
        require("../../src/config/firebaseConfigPrivate.json"),
      ),
    });
    db = app.firestore();
    index = (await db.collection("indexes").doc("midis").get()).data().midis;
  }
  const rows = [];
  try {
    for (const [position, slug] of slugs.entries()) {
      const annotation = annotations["f/" + slug];
      const tags = [
        ...(annotation?.tags || []),
        ...(annotation?.snippets || []).map((s) => s.tag),
      ];
      const entry = index.find((e) => e.slug === slug || e.id === slug);
      const backup =
        entry?.id && path.join(root, "src/midis", entry.id + ".json");
      let data;
      let error;
      let evidence;
      let tonic = Object.values(annotation?.modulations || {})[0];
      try {
        if (backup && fs.existsSync(backup))
          data = JSON.parse(fs.readFileSync(backup));
        else if (db && entry?.id) {
          data = (await db.collection("midis").doc(entry.id).get()).data();
          if (data?.blob)
            data.blobBase64 = Buffer.from(data.blob).toString("base64");
        }
        if (!data?.blobBase64) throw new Error("No available MIDI backup");
        const notes = readNotes(
          parseMidi(Buffer.from(data.blobBase64, "base64")),
        );
        if (tonic == null) {
          const weights = Array(12).fill(0);
          notes.forEach((n) => (weights[n.pitch % 12] += n.end - n.start));
          tonic = Array.from({ length: 12 }, (_, key) => key).sort(
            (a, b) =>
              scale.reduce((sum, pc) => sum + weights[(b + pc) % 12], 0) -
              scale.reduce((sum, pc) => sum + weights[(a + pc) % 12], 0),
          )[0];
        }
        evidence = estimateHarmony(notes, tonic);
      } catch (e) {
        error = e.message;
      }
      let group = evidence?.group;
      let basis = "MIDI estimate";
      if (tags.some((t) => /^seventh_chords:|^extensions:|^V:9$/.test(t))) {
        group = 5;
        basis = "saved seventh/extended-chord annotation";
      } else if (
        tags.some((t) =>
          /^pure_major:iii|^chord_scale:iii$|^progression:pachelbels_canon$/.test(
            t,
          ),
        )
      ) {
        group = 3;
        basis = "saved iii annotation";
      } else if (
        tags.some((t) => /^pure_major:I_(?:IV_)?V$|^shuttle:I_V$/.test(t))
      ) {
        group = 0;
        basis = "saved I/V annotation";
      }
      if (tags.includes("progression:I_vi_IV_V") && group < 4) {
        group = 1;
        basis = "saved I-vi-IV-V progression annotation";
      }
      if (slug === "stand-by-me") {
        group = 1;
        basis = "known I-vi-IV-V progression; sparse MIDI voicing";
      }
      if (slug === "ii-v-i-warmup") {
        group = 5;
        basis = "MIDI review: opening ii9 arpeggio";
      }
      if (group == null)
        throw new Error(
          `${slug}: no evidence for harmonic ordering (${error})`,
        );
      rows.push({
        slug,
        basis,
        tonic,
        ...(evidence || {}),
        group,
        position,
        tags,
        ...(error ? { error } : {}),
      });
    }
  } finally {
    if (app) await app.delete();
  }
  rows.sort(
    (a, b) =>
      a.group - b.group ||
      Number(b.basis === "saved I/V annotation") -
        Number(a.basis === "saved I/V annotation") ||
      Number(!a.recognized) - Number(!b.recognized) ||
      (a.degrees?.length ?? 7) - (b.degrees?.length ?? 7) ||
      a.position - b.position,
  );
  fs.writeFileSync(
    path.join(root, "scripts/rawl/simple-major-complexity.json"),
    JSON.stringify(
      {
        method:
          "Broad automatic ordering; saved harmony annotations take precedence. MIDI estimates downweight melody and require repeated chord evidence. Not a definitive harmonic transcription.",
        groups: groups.map((label, group) => ({
          label,
          count: rows.filter((r) => r.group === group).length,
        })),
        tracks: rows,
      },
      null,
      2,
    ) + "\n",
  );
  if (process.argv.includes("--write")) {
    const lines = [];
    for (let group = 0; group < groups.length; group++) {
      const selected = rows.filter((r) => r.group === group);
      if (!selected.length) continue;
      lines.push(`      // ${groups[group]}.`);
      lines.push(...selected.map((r) => `      ${JSON.stringify(r.slug)},`));
    }
    fs.writeFileSync(
      corpusPath,
      text.slice(0, array.getStart(source)) +
        "[\n" +
        lines.join("\n") +
        "\n    ]" +
        text.slice(array.end),
    );
  }
  console.log(
    groups
      .map(
        (label, group) =>
          `${label}: ${rows.filter((r) => r.group === group).length}`,
      )
      .join("\n"),
  );
}
if (require.main === module)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
module.exports = { estimateHarmony };
