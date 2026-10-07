// Pairwise logistic ranking with train-only normalization and song-equal loss.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  zlib = require("zlib");
const ROOT = path.resolve(__dirname, "../..");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const source = arg("--data") || "/private/tmp/rawl-lakh-versions/data.json.gz";
const bytes = fs.readFileSync(source),
  data = JSON.parse(zlib.gunzipSync(bytes));
const names = data.manifest.featureNames,
  dimension = names.length;
const labeled = data.groups.filter((g) => g.accepted.length);
const uniqueRows = (g) => [
  ...new Map(g.rows.map((r) => [r.midiHash, r])).values(),
];
const splits = Object.fromEntries(
  ["train", "validation", "test"].map((s) => [
    s,
    labeled.filter((g) => g.split === s),
  ]),
);
for (const s of Object.keys(splits))
  if (splits[s].length < 5)
    throw new Error(`Only ${splits[s].length} ${s} groups`);
for (const a of Object.keys(splits))
  for (const b of Object.keys(splits))
    if (a !== b) {
      const groups = new Set(splits[a].map((g) => g.splitGroup));
      if (splits[b].some((g) => groups.has(g.splitGroup)))
        throw new Error("Split leakage");
    }
const means = Array(dimension).fill(0),
  scales = Array(dimension).fill(0);
for (const g of splits.train) {
  const rows = uniqueRows(g);
  for (const r of rows)
    r.features.forEach((x, i) => {
      means[i] += x / rows.length / splits.train.length;
    });
}
for (const g of splits.train) {
  const rows = uniqueRows(g);
  for (const r of rows)
    r.features.forEach((x, i) => {
      scales[i] += (x - means[i]) ** 2 / rows.length / splits.train.length;
    });
}
scales.forEach((v, i) => {
  scales[i] = Math.max(1e-6, Math.sqrt(v));
});
const normalized = new Map(
  data.groups.flatMap((g) =>
    g.rows.map((r) => [
      r.key,
      r.features.map((x, i) =>
        Math.max(-6, Math.min(6, (x - means[i]) / scales[i])),
      ),
    ]),
  ),
);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const constraints = Object.fromEntries([
  ...[
    "vocal.namedPart",
    "vocal.namedNoteShare",
    "vocal.lyricsLogCount",
    "vocal.lyricsOnsetAgreement",
    "vocal.melodyCandidate",
    "arrangement.logNotes",
    "arrangement.logPitchedNotes",
    "arrangement.voices",
    "arrangement.pitchedVoices",
    "arrangement.programs",
    "arrangement.families",
    "grid.quantizedShare",
  ].map((name) => [name, 1]),
  ...[
    "grid.subdivisionError",
    "grid.sixteenthError",
    "grid.tempoVariation",
    "integrity.unmatchedOffShare",
    "integrity.unclosedNoteShare",
    "arrangement.exactDuplicateNotes",
  ].map((name) => [name, -1]),
]);
const comparisons = (groups) =>
  groups.flatMap((g) => {
    const rows = uniqueRows(g),
      positive = rows.find((r) => g.accepted.includes(r.key));
    const negative = rows.filter((r) => !g.accepted.includes(r.key));
    return negative.map((r) => ({
      delta: normalized
        .get(positive.key)
        .map((x, i) => x - normalized.get(r.key)[i]),
      weight: 1 / negative.length,
    }));
  });
function fit(l2, iterations = 1800) {
  const pairs = comparisons(splits.train),
    weights = Array(dimension).fill(0);
  for (let epoch = 0; epoch < iterations; epoch++) {
    const gradient = weights.map((w) => l2 * w);
    for (const pair of pairs) {
      const factor =
        pair.weight /
        splits.train.length /
        (1 + Math.exp(Math.max(-30, Math.min(30, dot(pair.delta, weights)))));
      for (let i = 0; i < dimension; i++) gradient[i] -= factor * pair.delta[i];
    }
    const step = 0.1 / (1 + epoch / 600);
    for (let i = 0; i < dimension; i++) {
      weights[i] -= step * gradient[i];
      if (constraints[names[i]] === 1) weights[i] = Math.max(0, weights[i]);
      if (constraints[names[i]] === -1) weights[i] = Math.min(0, weights[i]);
    }
  }
  return weights;
}
function evaluate(groups, score) {
  let top1 = 0,
    top2 = 0,
    mrr = 0,
    pairs = 0,
    pairCorrect = 0;
  const predictions = [];
  for (const g of groups) {
    const rows = uniqueRows(g).map((r) => ({ key: r.key, value: score(r) }));
    const gold = rows.find((r) => g.accepted.includes(r.key));
    const above = rows.filter((r) => r.value > gold.value + 1e-9).length;
    const tied = rows.filter(
      (r) => Math.abs(r.value - gold.value) <= 1e-9,
    ).length;
    top1 += above === 0 ? 1 / tied : 0;
    top2 += Math.max(0, Math.min(tied, 2 - above)) / tied;
    for (let i = 1; i <= tied; i++) mrr += 1 / (above + i) / tied;
    for (const r of rows)
      if (r !== gold) {
        pairs++;
        pairCorrect +=
          gold.value > r.value + 1e-9
            ? 1
            : Math.abs(gold.value - r.value) <= 1e-9
            ? 0.5
            : 0;
      }
    const ranked = rows.sort(
      (a, b) => b.value - a.value || a.key.localeCompare(b.key),
    );
    predictions.push({
      id: g.id,
      winner: g.winner,
      accepted: g.accepted,
      top1Credit: above === 0 ? 1 / tied : 0,
      ranked,
    });
  }
  const n = groups.length;
  return {
    groups: n,
    top1: top1 / n,
    top2: top2 / n,
    mrr: mrr / n,
    pairAccuracy: pairCorrect / Math.max(1, pairs),
    pairs,
    predictions,
  };
}
const compact = ({ predictions, ...metrics }) => metrics;
const candidates = [0.003, 0.01, 0.03, 0.1, 0.3, 1].map((l2) => {
  const weights = fit(l2),
    validation = compact(
      evaluate(splits.validation, (r) => dot(normalized.get(r.key), weights)),
    );
  return { l2, weights, validation };
});
candidates.sort(
  (a, b) =>
    b.validation.top1 - a.validation.top1 ||
    b.validation.mrr - a.validation.mrr ||
    b.l2 - a.l2,
);
const selected = candidates[0];
const baselines = {
  mostVoices: (r) => r.summary.voices,
  mostNotes: (r) => r.summary.notes,
  baseFilename: (r) => (/\.\d+\.mid$/i.test(r.file) ? 0 : 1),
  random: () => 0,
};
const metrics = {};
for (const [split, groups] of Object.entries(splits)) {
  const result = evaluate(groups, (r) =>
    dot(normalized.get(r.key), selected.weights),
  );
  metrics[split] = {
    model: compact(result),
    baselines: Object.fromEntries(
      Object.entries(baselines).map(([name, score]) => [
        name,
        compact(evaluate(groups, score)),
      ]),
    ),
  };
  if (split === "test") metrics.test.predictions = result.predictions;
}
const artifact = {
  version: "lakh-version-linear-1",
  featureVersion: data.manifest.featureVersion,
  featureNames: names,
  means,
  scales,
  weights: selected.weights,
  clip: 6,
  annotationHash: data.manifest.annotationHash,
  training: {
    task: "group-weighted pairwise logistic preference ranking",
    labels: data.manifest.labelAssumption,
    counts: data.manifest.counts,
    l2: selected.l2,
    iterations: 1800,
    learningRate: "0.1 / (1 + epoch / 600)",
    constraints,
    seed: "deterministic zero initialization",
    selection:
      "Validation top-1, then MRR; ties prefer stronger regularization. No test refit.",
  },
};
artifact.version = `lakh-version-linear-${crypto
  .createHash("sha256")
  .update(JSON.stringify(artifact))
  .digest("hex")
  .slice(0, 12)}`;
const report = {
  modelVersion: artifact.version,
  featureVersion: artifact.featureVersion,
  selection: artifact.training.selection,
  candidates: candidates.map(({ weights, ...c }) => c),
  metrics,
  note: "One preferred version per reviewed composition. Byte-identical alternatives accepted; score ties receive fractional credit. MIDI vocal/melody and timbre descriptors are proxies, not verified vocal transcription or audio quality.",
};
const dir = path.join(ROOT, "reports/lakh-version-model");
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(
  path.join(dir, "linear-evaluation.json"),
  JSON.stringify(report, null, 2) + "\n",
);
const candidatePath = path.join(path.dirname(source), "candidate-model.json");
fs.writeFileSync(candidatePath, JSON.stringify(artifact, null, 2) + "\n");
const promotionAllowed =
  metrics.validation.model.top1 >
  Math.max(
    ...["mostVoices", "mostNotes", "random"].map(
      (name) => metrics.validation.baselines[name].top1,
    ),
  );
if (process.argv.includes("--promote") && promotionAllowed)
  fs.writeFileSync(
    path.join(ROOT, "src/lakh/versionModel.json"),
    JSON.stringify(artifact, null, 2) + "\n",
  );
const { runId } = require("./record-model-training.cjs").recordTrainingRun({
  model: "versionRanking",
  status: !promotionAllowed
    ? "failed"
    : process.argv.includes("--promote")
    ? "promoted"
    : "candidate",
  command: [process.execPath, ...process.argv.slice(1)],
  artifact,
  evaluation: report,
  dataset: data.manifest,
  inputFiles: [data.manifest.annotations],
  extraArtifacts: { candidates, trainingGroups: labeled, constraints },
  metadata: {
    trainingDataHash: crypto.createHash("sha256").update(bytes).digest("hex"),
    warning:
      "Small preference dataset; suggestions remain provisional. Voice presence and listening quality are not independently validated.",
  },
});
console.log(
  JSON.stringify(
    {
      version: artifact.version,
      selectedL2: selected.l2,
      validation: metrics.validation,
      test: { ...metrics.test, predictions: undefined },
      runId,
    },
    null,
    2,
  ),
);
if (process.argv.includes("--promote") && !promotionAllowed)
  throw new Error(
    "Promotion rejected: no validation improvement over content baselines",
  );
