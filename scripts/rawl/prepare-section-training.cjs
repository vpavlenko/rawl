// Reuses the audited song groups/splits of the phrase dataset, restricted to /f/.
const fs = require("fs"),
  path = require("path"),
  zlib = require("zlib"),
  crypto = require("crypto"),
  { once } = require("events");
require("ts-node/register/transpile-only");
const { loadInput, root } = require("./section-training-data.cjs");
const {
  sectionFeatureContext,
  SECTION_FEATURE_NAMES,
  SECTION_FEATURE_VERSION,
  SECTION_LENGTHS,
} = require("../../src/harmony/sectionFeatures.ts");
const { heuristicSectionBoundaries } = require("../../src/harmony/harmony.ts");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? null : process.argv[i + 1];
};
const source =
  arg("--annotations") || path.join(root, "src/corpus/analyses.json");
const bytes = fs.readFileSync(source),
  snapshot = JSON.parse(bytes),
  annotations = snapshot.analyses || snapshot;
const phrase = JSON.parse(
  fs.readFileSync(path.join(root, "reports/phrase-model/dataset.json")),
);
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const lengths = new Set(SECTION_LENGTHS);
const files = [],
  skipped = [],
  distribution = {},
  stats = { positive: 0, negative: 0, unsupportedInternalSpans: 0 };
const output =
  arg("--output") || "/private/tmp/rawl-section-training/data.jsonl.gz";
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.mkdirSync(path.join(root, "reports/section-model"), { recursive: true });
const gzip = zlib.createGzip(),
  stream = fs.createWriteStream(output);
gzip.pipe(stream);
async function write(row) {
  if (!gzip.write(JSON.stringify(row) + "\n")) await once(gzip, "drain");
}
(async () => {
  await write({
    featureNames: SECTION_FEATURE_NAMES,
    featureVersion: SECTION_FEATURE_VERSION,
  });
  for (const s of phrase.files.filter((s) => s.key.startsWith("f/"))) {
    try {
      const a = annotations[s.key];
      if (!a || sha(JSON.stringify(a)) !== s.annotationHash)
        throw new Error(
          "Annotation changed: regenerate phrase grouping manifest first",
        );
      if (!Array.isArray(a.sections) || !a.sections.length)
        throw new Error("Missing section annotation");
      const phraseStarts = [1, ...s.truth];
      const starts = a.sections.map((i) =>
        Number.isInteger(i) && i >= 0 ? phraseStarts[i] - 1 : NaN,
      );
      if (
        starts[0] !== 0 ||
        starts.some(
          (m, i) =>
            !Number.isInteger(m) ||
            m < 0 ||
            m >= s.count ||
            (i && m <= starts[i - 1]),
        )
      )
        throw new Error("Invalid/out-of-range/non-increasing section index");
      const input = loadInput(s.key, a);
      if (input.midiHash !== s.midiHash)
        throw new Error(
          "MIDI changed: regenerate phrase grouping manifest first",
        );
      if (input.grid.measures.length - 1 !== s.count)
        throw new Error("MIDI/grid disagrees with phrase manifest");
      const pairs = starts.map((start, i) => [start, starts[i + 1] ?? s.count]);
      const truth = starts.slice(1).map((m) => m + 1);
      const baseline =
        s.split === "train"
          ? null
          : heuristicSectionBoundaries(input.notes, input.grid)
              .map((b) => b.measure)
              .filter((m) => m > 1);
      const row = {
        key: s.key,
        group: s.group,
        split: s.split,
        midiHash: s.midiHash,
        annotationHash: s.annotationHash,
        count: s.count,
        truth,
        hasDrums: input.notes.some((n) => n.isDrum),
        baseline,
      };
      files.push(row);
      const spans = new Map(pairs.map(([a, b]) => [`${a}:${b}`, [a, b, 1]]));
      const add = (a, b) => {
        if (
          a >= 0 &&
          a < b &&
          b <= s.count &&
          (lengths.has(b - a) || b === s.count) &&
          !spans.has(`${a}:${b}`)
        )
          spans.set(`${a}:${b}`, [a, b, 0]);
      };
      for (let i = 0; i < pairs.length; i++) {
        const [start, end] = pairs[i],
          length = end - start;
        if (end < s.count && !lengths.has(length))
          stats.unsupportedInternalSpans++;
        if (s.split === "train")
          distribution[length] = (distribution[length] || 0) + 1;
        for (const shift of [-8, -4, -2, -1, 1, 2, 4, 8]) {
          add(start, end + shift);
          add(start + shift, end);
          add(start + shift, end + shift);
        }
        const mid = Math.floor((start + end) / 2);
        add(start, mid);
        add(mid, end);
        if (i + 1 < pairs.length) add(start, pairs[i + 1][1]);
      }
      // Include unrelated start/end positions, deterministically, rather than
      // teaching the scorer that every candidate begins at a true boundary.
      let state = parseInt(sha(s.key).slice(0, 8), 16) >>> 0;
      const random = () => {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state;
      };
      for (let i = 0; i < pairs.length * 8; i++) {
        const start = random() % s.count,
          length = SECTION_LENGTHS[random() % SECTION_LENGTHS.length];
        add(start, Math.min(s.count, start + length));
      }
      if (s.split === "train") {
        const context = sectionFeatureContext(input.notes, input.grid);
        const examples = [...spans.values()].map(([a, b, y]) => [
          y,
          context.features(a, b).map((x) => +x.toFixed(6)),
        ]);
        stats.positive += examples.filter(([y]) => y).length;
        stats.negative += examples.filter(([y]) => !y).length;
        await write({ ...row, examples });
      }
      if (files.length % 200 === 0)
        console.log(`Prepared ${files.length} /f/ section annotations`);
    } catch (e) {
      skipped.push({ key: s.key, reason: e.message });
    }
  }
  const manifest = {
    featureVersion: SECTION_FEATURE_VERSION,
    annotationHash: sha(bytes),
    annotations: path.relative(root, source),
    sourcePhraseManifestHash: sha(
      fs.readFileSync(path.join(root, "reports/phrase-model/dataset.json")),
    ),
    grouping: phrase.grouping,
    songs: files.length,
    groups: new Set(files.map((s) => s.group)).size,
    drumSongs: files.filter((s) => s.hasDrums).length,
    ...stats,
    trainLengthCounts: distribution,
    splits: Object.fromEntries(
      ["train", "validation", "test"].map((split) => [
        split,
        {
          songs: files.filter((s) => s.split === split).length,
          groups: new Set(
            files.filter((s) => s.split === split).map((s) => s.group),
          ).size,
          drums: files.filter((s) => s.split === split && s.hasDrums).length,
        },
      ]),
    ),
    skipped,
    files,
  };
  await write({ manifest });
  gzip.end();
  await once(stream, "finish");
  fs.writeFileSync(
    path.join(root, "reports/section-model/dataset.json"),
    JSON.stringify(manifest, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        ...manifest,
        files: undefined,
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
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
  gzip.destroy();
});
