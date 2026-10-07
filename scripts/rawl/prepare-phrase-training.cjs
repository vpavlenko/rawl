// Export the current curated annotation snapshot and matching local MIDIs.
// No network access and no writes to analyses.json. Output is training input.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  zlib = require("zlib");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const {
  phraseFeatures,
  PHRASE_FEATURE_NAMES,
  PHRASE_FEATURE_VERSION,
  DRUM_FEATURE_INDICES,
} = require("../../src/harmony/phraseFeatures.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const root = path.resolve(__dirname, "../..");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? null : process.argv[i + 1];
};
const source = path.resolve(
  arg("--annotations") || path.join(root, "src/corpus/analyses.json"),
);
const output = path.resolve(
  arg("--output") || "/private/tmp/rawl-phrase-training/data.json.gz",
);
const annotationBytes = fs.readFileSync(source),
  snapshot = JSON.parse(annotationBytes),
  annotations = snapshot.analyses || snapshot;
const index = require("../../src/midis/midis.json").midis,
  bySlug = new Map(
    index.flatMap((e) => [
      [e.slug, e],
      [e.id, e],
    ]),
  );
const catalog = require("../../public/lakh-index.json");
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
// Group arrangement/version suffixes before splitting. Byte duplicates are also
// unioned, even when their titles differ. Manual group overrides are supported.
const normalize = (title) =>
  title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.\d+(?=\.mid$)/g, "")
    .replace(/\.mid$/g, "")
    .replace(
      /(?:arr(?:anged)?\.?\s*for|piano\s*solo|professional|lead\s*sheet|version|ver\.|midi|backup).*$/,
      "",
    )
    .replace(/[^a-z0-9]/g, "")
    .replace(/^the/, "");
const groupsFile = arg("--groups");
const groups = groupsFile ? JSON.parse(fs.readFileSync(groupsFile)) : {};
const pending = [],
  skipped = [];
for (const [key, a] of Object.entries(annotations)) {
  if (!Array.isArray(a.phrasePatch)) {
    skipped.push({ key, reason: "No phrase annotation field" });
    continue;
  }
  let file, title;
  if (key.startsWith("f/")) {
    const entry = bySlug.get(key.slice(2));
    if (entry) {
      file = path.join(root, "src/midis", entry.id + ".json");
      title = entry.title || entry.slug;
    }
  } else if (key.startsWith("c/MIDI/")) {
    const parts = key.slice(7).split("/");
    file = path.join(root, "public/lakh-data", ...parts);
    title = parts.slice(1).join("/");
  }
  if (!file || !fs.existsSync(file)) {
    skipped.push({ key, reason: "No local MIDI backup" });
    continue;
  }
  try {
    const bytes = key.startsWith("f/")
      ? Buffer.from(JSON.parse(fs.readFileSync(file)).blobBase64, "base64")
      : fs.readFileSync(file);
    pending.push({
      key,
      a,
      bytes,
      group: groups[key] || normalize(title) || sha(bytes),
      midiHash: sha(bytes),
    });
  } catch (e) {
    skipped.push({ key, reason: e.message });
  }
}
const parents = new Map();
function find(key) {
  if (!parents.has(key)) parents.set(key, key);
  if (parents.get(key) !== key) parents.set(key, find(parents.get(key)));
  return parents.get(key);
}
function union(a, b) {
  a = find(a);
  b = find(b);
  if (a !== b) parents.set([a, b].sort()[1], [a, b].sort()[0]);
}
const byBytes = new Map();
for (const row of pending) {
  if (byBytes.has(row.midiHash)) union(row.group, byBytes.get(row.midiHash));
  else byBytes.set(row.midiHash, row.group);
}
const songs = [],
  dedup = new Set();
for (const row of pending) {
  const { key, a, bytes } = row;
  try {
    const input = harmonyMidi(parseMidi(bytes));
    if (a.measures && input.notes.length)
      input.grid = buildManualMeasuresAndBeats(
        a.measures,
        input.notes.map((n) => ({ span: [n.start, n.end] })),
      );
    const count = input.grid.measures.length - 1;
    if (
      count < 8 ||
      count > 2000 ||
      input.grid.measures.some(
        (t, i) => !Number.isFinite(t) || (i && t <= input.grid.measures[i - 1]),
      )
    )
      throw new Error("Invalid/short/oversized measure grid");
    // Reproduce cumulative phrasePatch semantics, but reject corrupt patches
    // rather than quietly training on a partially applied annotation.
    const starts = [];
    let m;
    for (m = 1; m < count + 1; m += 4) starts.push(m);
    starts.push(m);
    for (const { measure, diff } of a.phrasePatch) {
      const at = starts.indexOf(measure);
      if (at < 0 || !Number.isInteger(diff))
        throw new Error(`Invalid phrasePatch at ${measure}`);
      for (let j = at; j < starts.length; j++) starts[j] += diff;
      while (starts.at(-1) + 4 < count + 1) starts.push(starts.at(-1) + 4);
      if (starts[0] !== 1) starts.unshift(1);
    }
    if (starts.some((s, i) => s < 1 || (i && s <= starts[i - 1])))
      throw new Error("Non-increasing phrase annotation");
    const truth = starts.filter((s) => s > 1 && s <= count);
    const duplicate =
      row.midiHash +
      ":" +
      sha(
        JSON.stringify({
          measures: a.measures,
          phrasePatch: a.phrasePatch,
          excludedVoices: a.excludedVoices,
          drumVoices: a.drumVoices,
        }),
      );
    if (dedup.has(duplicate)) {
      skipped.push({ key, reason: "Duplicate MIDI and annotation" });
      continue;
    }
    dedup.add(duplicate);
    const excluded = new Set(a.excludedVoices || []),
      drums = new Set(a.drumVoices || []);
    input.notes = input.notes
      .filter((n) => !excluded.has(n.voice))
      .map((n) => (drums.has(n.voice) ? { ...n, isDrum: true } : n));
    if (!input.notes.some((n) => !n.isDrum))
      throw new Error("No pitched notes");
    const group = find(row.group),
      bucket = parseInt(sha(group).slice(0, 8), 16) % 10;
    const split = bucket < 2 ? "test" : bucket === 2 ? "validation" : "train";
    let baseline = null;
    if (key.startsWith("c/MIDI/")) {
      const [, , artistName, midiFile] = key.split("/"),
        artist = catalog.artists.find((a) => a.name === artistName);
      const detailPath =
        artist &&
        path.join(root, "public/harmony/details", artist.slug + ".json.gz");
      if (detailPath && fs.existsSync(detailPath)) {
        const detail = JSON.parse(zlib.gunzipSync(fs.readFileSync(detailPath)))[
          midiFile
        ];
        // After migration, the cache is no longer a heuristic baseline.
        if (detail && !detail.phraseModelVersion)
          baseline =
            detail.phrases
              ?.map((p) => p.measure)
              .filter((m) => m > 1 && m <= count) || null;
      }
    }
    const features = phraseFeatures(input.notes, input.grid).map((r) =>
      r.map((x) => +x.toFixed(5)),
    );
    songs.push({
      key,
      group,
      split,
      midiHash: row.midiHash,
      annotationHash: sha(JSON.stringify(a)),
      count,
      truth,
      hasDrums: input.notes.some((n) => n.isDrum),
      features,
      baseline,
    });
    if (songs.length % 250 === 0)
      console.log(`Prepared ${songs.length} annotated MIDI files`);
  } catch (e) {
    skipped.push({ key, reason: e.message });
  }
}
const manifest = {
  featureVersion: PHRASE_FEATURE_VERSION,
  annotationHash: sha(annotationBytes),
  annotations: path.relative(root, source),
  grouping:
    "Normalized title + exact MIDI byte duplicate union; SHA256 group modulo 10: 0/1 test, 2 validation, 3..9 train",
  songs: songs.length,
  groups: new Set(songs.map((s) => s.group)).size,
  boundaries: songs.reduce((n, s) => n + s.count - 1, 0),
  positiveBoundaries: songs.reduce((n, s) => n + s.truth.length, 0),
  drumSongs: songs.filter((s) => s.hasDrums).length,
  splits: Object.fromEntries(
    ["train", "validation", "test"].map((split) => [
      split,
      {
        songs: songs.filter((s) => s.split === split).length,
        groups: new Set(
          songs.filter((s) => s.split === split).map((s) => s.group),
        ).size,
        drums: songs.filter((s) => s.split === split && s.hasDrums).length,
      },
    ]),
  ),
  skipped,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(
  output,
  zlib.gzipSync(
    JSON.stringify({
      manifest,
      featureNames: PHRASE_FEATURE_NAMES,
      drumIndices: DRUM_FEATURE_INDICES,
      songs,
    }),
  ),
);
fs.writeFileSync(
  path.join(root, "reports/phrase-model/dataset.json"),
  JSON.stringify(
    { ...manifest, files: songs.map(({ features, ...s }) => s) },
    null,
    2,
  ),
);
console.log(
  JSON.stringify(
    {
      ...manifest,
      skipped: {
        count: skipped.length,
        reasons: skipped.reduce((o, s) => {
          o[s.reason] = (o[s.reason] || 0) + 1;
          return o;
        }, {}),
      },
    },
    null,
    2,
  ),
);
