// Refresh structural proposals without recomputing or changing chord searches.
// node scripts/rawl/refresh-lakh-phrases.cjs [--workers 4] [--limit N]
const fs = require("fs"),
  path = require("path"),
  zlib = require("zlib");
const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const {
  inferLearnedPhrases,
  PHRASE_MODEL_VERSION,
} = require("../../src/harmony/phraseBoundaries.ts");
const { analysisProposal } = require("../../src/harmony/proposals.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const { harmonyAnnotationConfig } = require("../../src/harmony/settings.ts");
const root = path.resolve(__dirname, "../.."),
  annotations = require("../../src/corpus/analyses.json");
const catalog = require("../../public/lakh-index.json");
function refresh(artist) {
  const file = path.join(
    root,
    "public/harmony/details",
    artist.slug + ".json.gz",
  );
  if (!fs.existsSync(file)) return { updated: 0, skipped: [] };
  const details = JSON.parse(zlib.gunzipSync(fs.readFileSync(file))),
    skipped = [];
  let updated = 0;
  for (const [midiFile, detail] of Object.entries(details)) {
    if (detail.phraseModelVersion === PHRASE_MODEL_VERSION) continue;
    const key = `c/MIDI/${artist.name}/${midiFile}`,
      a = annotations[key];
    try {
      if (detail.annotationConfig !== harmonyAnnotationConfig(a))
        throw new Error(
          "Annotation settings changed: run the full harmony indexer",
        );
      const input = harmonyMidi(
        parseMidi(
          fs.readFileSync(
            path.join(root, "public/lakh-data", artist.name, midiFile),
          ),
        ),
      );
      if (a?.measures && input.notes.length)
        input.grid = buildManualMeasuresAndBeats(
          a.measures,
          input.notes.map((n) => ({ span: [n.start, n.end] })),
        );
      const excluded = new Set(a?.excludedVoices || []),
        drums = new Set(a?.drumVoices || []);
      input.notes = input.notes
        .filter((n) => !excluded.has(n.voice))
        .map((n) => (drums.has(n.voice) ? { ...n, isDrum: true } : n));
      detail.phrases = inferLearnedPhrases(input.notes, input.grid);
      detail.phraseModelVersion = PHRASE_MODEL_VERSION;
      detail.proposal = analysisProposal(detail, input.grid.measures);
      updated++;
    } catch (e) {
      skipped.push({ key, reason: e.message });
    }
  }
  if (updated) {
    const json = JSON.stringify(details);
    fs.writeFileSync(file, zlib.gzipSync(json, { level: 9 }));
    fs.writeFileSync(file.slice(0, -3), json);
  }
  return { updated, skipped };
}
if (!isMainThread) {
  for (const artist of workerData.artists)
    parentPort.postMessage(refresh(artist));
} else {
  const number = (flag, fallback) => {
    const i = process.argv.indexOf(flag);
    return i < 0 ? fallback : Number(process.argv[i + 1]);
  };
  const count = Math.max(1, Math.min(8, number("--workers", 4))),
    artists = catalog.artists.slice(0, number("--limit", Infinity));
  const batches = Array.from({ length: count }, () => []);
  artists.forEach((a, i) => batches[i % count].push(a));
  const report = {
    modelVersion: PHRASE_MODEL_VERSION,
    updated: 0,
    skipped: [],
  };
  let done = 0;
  Promise.all(
    batches.map(
      (artists) =>
        new Promise((resolve, reject) => {
          const w = new Worker(__filename, { workerData: { artists } });
          w.on("message", (r) => {
            report.updated += r.updated;
            report.skipped.push(...r.skipped);
            done++;
            if (done % 250 === 0)
              console.log(
                `Refreshed ${report.updated} files in ${done} artists`,
              );
          });
          w.on("error", reject);
          w.on("exit", (code) =>
            code ? reject(new Error(`Worker exited ${code}`)) : resolve(),
          );
        }),
    ),
  )
    .then(() => {
      fs.writeFileSync(
        path.join(root, "reports/phrase-model/lakh-refresh.json"),
        JSON.stringify(report, null, 2) + "\n",
      );
      console.log(JSON.stringify(report, null, 2));
    })
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    });
}
