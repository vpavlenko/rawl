// Append-only records: latest reports may change, archived runs never do.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  zlib = require("zlib");
const ROOT = path.resolve(__dirname, "../..");
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const SOURCES = {
  versionRanking: [
    "scripts/rawl/prepare-lakh-version-training.cjs",
    "scripts/rawl/train-lakh-version-ranker.cjs",
    "scripts/rawl/train-lakh-version-model.py",
    "scripts/rawl/index-lakh-version-rankings.cjs",
    "src/lakh/versionFeatures.ts",
    "src/lakh/versionGroups.ts",
    "src/lakh/versionRanking.ts",
    "src/components/lakh/artistShelves.ts",
  ],
  phrases: [
    "scripts/rawl/train-phrase-model.py",
    "scripts/rawl/calibrate-phrase-length.py",
    "scripts/rawl/phrase_decoder.py",
    "scripts/rawl/verify-phrase-decoder.cjs",
    "scripts/rawl/prepare-phrase-training.cjs",
    "src/harmony/phraseFeatures.ts",
    "src/harmony/phraseBoundaries.ts",
    "src/harmony/midi.ts",
    "src/components/rawl/measures.ts",
  ],
  sections: [
    "scripts/rawl/train-section-model.py",
    "scripts/rawl/prepare-section-training.cjs",
    "scripts/rawl/score-section-model.cjs",
    "scripts/rawl/section-training-data.cjs",
    "src/harmony/sectionFeatures.ts",
    "src/harmony/sectionDecoder.ts",
    "src/harmony/sectionBoundaries.ts",
    "src/harmony/phraseFeatures.ts",
    "src/harmony/midi.ts",
    "src/components/rawl/measures.ts",
  ],
  tonic: [
    "scripts/rawl/train-harmony-key.cjs",
    "src/harmony/keyRanker.ts",
    "src/harmony/midi.ts",
    "src/components/rawl/measures.ts",
    "src/components/rawl/analysis.ts",
  ],
  chromaticBass: [
    "scripts/rawl/search-chromatic-minor-bass.js",
    "scripts/rawl/chromatic-minor-bass-ranker.js",
  ],
};
function recordTrainingRun({
  model,
  status,
  command,
  artifact,
  evaluation,
  dataset,
  metadata = {},
  extraArtifacts,
  inputFiles = [],
  outputRoot = path.join(ROOT, "reports/model-training"),
}) {
  if (!SOURCES[model]) throw new Error(`Unknown training model ${model}`);
  if (
    !["candidate", "promoted", "historical-snapshot", "failed"].includes(status)
  )
    throw new Error(`Invalid training status ${status}`);
  const sources = Object.fromEntries(
    [
      ...SOURCES[model],
      "scripts/rawl/record-model-training.cjs",
      "scripts/rawl/phrase-training-requirements.txt",
      "package.json",
    ].map((p) => [p, fs.readFileSync(path.join(ROOT, p), "utf8")]),
  );
  const artifacts = { artifact, evaluation, dataset, extraArtifacts, sources };
  const inputs = inputFiles.map((p, i) => {
    const bytes = fs.readFileSync(path.resolve(ROOT, p));
    artifacts[`input-${i}`] = JSON.parse(bytes);
    return { path: p, sha256: sha(bytes), snapshot: `input-${i}.json.gz` };
  });
  const payloads = Object.entries(artifacts)
    .filter(([, value]) => value !== undefined)
    .map(([name, value]) => ({
      name: `${name}.json.gz`,
      bytes: Buffer.from(JSON.stringify(value)),
    }));
  const createdAt = new Date().toISOString(),
    artifactHash = sha(Buffer.from(JSON.stringify(artifact ?? null)));
  const runId = `${createdAt.replace(
    /[:.]/g,
    "-",
  )}-${model}-${artifactHash.slice(0, 12)}-${crypto
    .randomBytes(3)
    .toString("hex")}`;
  const record = {
    format: "rawl-model-training-1",
    runId,
    createdAt,
    model,
    status,
    command: command ?? null,
    artifactHash,
    modelVersion: artifact?.version ?? null,
    featureVersion: artifact?.featureVersion ?? null,
    annotationHash: artifact?.annotationHash ?? dataset?.annotationHash ?? null,
    runtime: {
      node: process.version,
      platform: process.platform,
      arch: process.arch,
      midiFile: require("midi-file/package.json").version,
    },
    metadata,
    inputs,
    sourceHashes: Object.fromEntries(
      Object.entries(sources).map(([p, text]) => [p, sha(text)]),
    ),
    files: payloads.map(({ name, bytes }) => ({ name, sha256: sha(bytes) })),
  };
  fs.mkdirSync(outputRoot, { recursive: true });
  const directory = path.join(outputRoot, runId);
  fs.mkdirSync(directory);
  payloads.forEach(({ name, bytes }) =>
    fs.writeFileSync(path.join(directory, name), zlib.gzipSync(bytes), {
      flag: "wx",
    }),
  );
  fs.writeFileSync(
    path.join(directory, "record.json"),
    JSON.stringify(record, null, 2) + "\n",
    { flag: "wx" },
  );
  fs.appendFileSync(
    path.join(outputRoot, "index.jsonl"),
    JSON.stringify({
      runId,
      createdAt,
      model,
      status,
      modelVersion: record.modelVersion,
      artifactHash,
      record: `${runId}/record.json`,
    }) + "\n",
  );
  return { runId, directory };
}
module.exports = { recordTrainingRun };
if (require.main === module) {
  const arg = (name) => {
    const i = process.argv.indexOf(name);
    return i < 0 ? undefined : process.argv[i + 1];
  };
  const read = (name) =>
    arg(name) ? JSON.parse(fs.readFileSync(arg(name))) : undefined;
  const dataset = read("--dataset");
  const result = recordTrainingRun({
    model: arg("--model"),
    status: arg("--status") || "candidate",
    command: read("--command"),
    artifact: read("--artifact"),
    evaluation: read("--evaluation"),
    dataset,
    metadata: read("--metadata") || {},
    extraArtifacts: read("--extra-artifacts"),
    inputFiles: dataset?.annotations ? [dataset.annotations] : [],
  });
  console.log(`Recorded ${result.runId}`);
}
