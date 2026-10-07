// Train on title-grouped Lakh annotations; reserve test titles before fitting.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const {
  tonalFeatures,
  rotatedFeatures,
  profileScores,
} = require("../../src/harmony/keyRanker.ts");
const { getModulations } = require("../../src/components/rawl/analysis.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const root = path.resolve(__dirname, "../.."),
  annotations = require("../../src/corpus/analyses.json"),
  catalog = require("../../public/lakh-index.json");
const normalize = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\.\d+(?=\.mid$)/i, "")
    .replace(/\.mid$/i, "")
    .replace(/[^a-z0-9]/g, "")
    .replace(/^the/, "");
const seen = new Set(),
  training = [],
  calibration = [];
let trainSongs = 0,
  calibrationSongs = 0;
for (const [key, annotation] of Object.entries(annotations)) {
  if (!key.startsWith("c/MIDI/")) continue;
  const [, , name, file] = key.split("/");
  if (!name || !file) continue;
  const song = `${normalize(name)}/${normalize(file)}`;
  const hash = parseInt(
    crypto.createHash("sha256").update(song).digest("hex").slice(0, 8),
    16,
  );
  if (hash % 5 === 0 || seen.has(song)) continue;
  seen.add(song);
  const artist = catalog.artists.find((a) => a.name === name);
  if (!artist) continue;
  try {
    const detail = JSON.parse(
      fs.readFileSync(
        path.join(root, "public/harmony/details", `${artist.slug}.json`),
      ),
    )[file];
    if (!detail) continue;
    const input = harmonyMidi(
      parseMidi(
        fs.readFileSync(path.join(root, "public/lakh-data", name, file)),
      ),
    );
    if (annotation.measures)
      input.grid = buildManualMeasuresAndBeats(
        annotation.measures,
        input.notes.map((n) => ({ span: [n.start, n.end] })),
      );
    input.notes = input.notes.filter(
      (n) =>
        !(annotation.excludedVoices || []).includes(n.voice) &&
        !(annotation.drumVoices || []).includes(n.voice),
    );
    const keys = getModulations(annotation, input.grid.measures).filter((k) =>
      Number.isInteger(k.tonic),
    );
    const chords = detail.chords.map(
      ([start, end, root, quality, bass, confidence]) => ({
        start,
        end,
        root,
        quality,
        bass,
        confidence,
      }),
    );
    const rows = [];
    for (
      let i = 0;
      i < input.grid.measures.length - 1;
      i += Math.max(4, Math.floor(input.grid.measures.length / 12))
    ) {
      const start = input.grid.measures[Math.max(0, i - 2)],
        end =
          input.grid.measures[Math.min(input.grid.measures.length - 1, i + 3)],
        time = input.grid.measures[i];
      const target = keys.filter((k) => k.time <= time).at(-1);
      if (!target || keys.some((k) => k.time > start && k.time < end)) continue;
      const groups = tonalFeatures(input.notes, chords, start, end);
      rows.push({
        features: Array.from({ length: 12 }, (_, tonic) =>
          rotatedFeatures(groups, tonic),
        ),
        target: target.tonic,
        base: profileScores(groups),
      });
    }
    if (hash % 7 === 0) {
      calibration.push(...rows);
      calibrationSongs++;
    } else {
      training.push(...rows);
      trainSongs++;
    }
  } catch (error) {
    console.log(
      `Skipped training example ${key}: ${error.message || String(error)}`,
    );
  }
}
if (training.length < 100 || calibration.length < 50)
  throw new Error("Insufficient separated training/calibration data.");
let weights = Array(60).fill(0);
for (let epoch = 0; epoch < 400; epoch++) {
  const gradient = weights.map((w) => -0.001 * w);
  for (const row of training) {
    const scores = row.features.map((f) =>
        f.reduce((s, x, i) => s + x * weights[i], 0),
      ),
      peak = Math.max(...scores),
      probabilities = scores.map((s) => Math.exp(s - peak)),
      sum = probabilities.reduce((a, b) => a + b, 0);
    for (let tonic = 0; tonic < 12; tonic++) {
      const error = (tonic === row.target ? 1 : 0) - probabilities[tonic] / sum;
      for (let i = 0; i < 60; i++)
        gradient[i] += (error * row.features[tonic][i]) / training.length;
    }
  }
  weights = weights.map((w, i) => w + 0.9 * gradient[i]);
}
const raw = (row) =>
  row.features.map((f) => f.reduce((s, x, i) => s + x * weights[i], 0));
let blend = 0,
  bestAccuracy = -1;
for (const alpha of [0, 0.025, 0.05, 0.1, 0.15, 0.2, 0.3, 0.5, 1]) {
  const accuracy =
    calibration.filter((row) => {
      const scores = raw(row).map(
        (s, t) => Math.max(row.base[t], row.base[t + 12]) + alpha * s,
      );
      return scores.indexOf(Math.max(...scores)) === row.target;
    }).length / calibration.length;
  if (accuracy > bestAccuracy) {
    bestAccuracy = accuracy;
    blend = alpha;
  }
}
let temperature = 1,
  bestLoss = Infinity;
for (const t of [0.05, 0.08, 0.12, 0.16, 0.2, 0.3, 0.4, 0.6, 0.8, 1]) {
  let loss = 0;
  for (const row of calibration) {
    const scores = raw(row).map(
        (s, k) => (Math.max(row.base[k], row.base[k + 12]) + blend * s) / t,
      ),
      peak = Math.max(...scores),
      sum = scores.reduce((s, x) => s + Math.exp(x - peak), 0);
    loss += Math.log(sum) + peak - scores[row.target];
  }
  if (loss < bestLoss) {
    bestLoss = loss;
    temperature = t;
  }
}
const accuracy = (rows) =>
  rows.filter((row) => {
    const scores = row.features.map((f) =>
      f.reduce((s, x, i) => s + x * weights[i], 0),
    );
    return scores.indexOf(Math.max(...scores)) === row.target;
  }).length / rows.length;
const report = {
  weights: weights.map((w) => +w.toFixed(6)),
  temperature,
  blend,
  combinedCalibrationAccuracy: bestAccuracy,
  trainingSongs: trainSongs,
  calibrationSongs,
  trainingWindows: training.length,
  calibrationWindows: calibration.length,
  trainingAccuracy: accuracy(training),
  calibrationAccuracy: accuracy(calibration),
  note: "Title groups with SHA256 modulo 5 = 0 remain held out. Calibration titles use modulo 7 = 0 among remaining titles. No mode labels are trained.",
};
fs.writeFileSync(
  path.join(root, "src/harmony/keyModel.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ ...report, weights: undefined }, null, 2));
