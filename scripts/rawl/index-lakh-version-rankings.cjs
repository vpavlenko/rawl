const fs = require("fs"),
  path = require("path"),
  zlib = require("zlib"),
  crypto = require("crypto");
require("ts-node/register/transpile-only");
const {
  scoreVersionFeatures,
  suggestedVersion,
} = require("../../src/lakh/versionRanking.ts");
const {
  VERSION_FEATURE_NAMES,
  VERSION_FEATURE_VERSION,
  VERSION_RANKING_FEATURE_NAMES,
  VERSION_RANKING_FEATURE_VERSION,
  versionGroupFeatures,
} = require("../../src/lakh/versionFeatures.ts");
const ROOT = path.resolve(__dirname, "../..");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const deploy = process.argv.includes("--deploy");
const source = arg("--data") || "/private/tmp/rawl-lakh-versions/data.json.gz";
const data = JSON.parse(zlib.gunzipSync(fs.readFileSync(source)));
const model = JSON.parse(
  fs.readFileSync(
    arg("--model") || path.join(ROOT, "src/lakh/versionModel.json"),
  ),
);
const relative = model.featureVersion === VERSION_RANKING_FEATURE_VERSION;
if (
  (!relative && model.featureVersion !== VERSION_FEATURE_VERSION) ||
  JSON.stringify(model.featureNames) !==
    JSON.stringify(
      relative ? VERSION_RANKING_FEATURE_NAMES : VERSION_FEATURE_NAMES,
    ) ||
  JSON.stringify(data.manifest.featureNames) !==
    JSON.stringify(VERSION_FEATURE_NAMES)
)
  throw new Error("Version feature schema mismatch");
const catalogHash = crypto
  .createHash("sha256")
  .update(fs.readFileSync(path.join(ROOT, "public/lakh-index.json")))
  .digest("hex");
if (data.manifest.catalogHash !== catalogHash)
  throw new Error("Catalog changed; re-extract MIDI features");
// Deployment consumes cached features only after read-back checking the exact
// MIDI bytes. A changed transcription must be re-extracted before serving it.
if (deploy) {
  for (const g of data.groups)
    for (const r of g.rows) {
      const bytes = fs.readFileSync(path.join(ROOT, "public/lakh-data", r.key.slice("c/MIDI/".length)));
      const currentHash = crypto.createHash("sha256").update(bytes).digest("hex");
      if (currentHash !== r.midiHash) throw new Error(`MIDI changed; re-extract features: ${r.key}`);
    }
}
const byKey = Object.fromEntries(
  data.groups.flatMap((g) => {
    const vectors = relative
      ? versionGroupFeatures(g.rows.map((r) => r.features))
      : g.rows.map((r) => r.features);
    return g.rows.map((r, i) => [
      r.key,
      {
        score: scoreVersionFeatures(vectors[i], model),
        midiHash: r.midiHash,
        summary: r.summary,
      },
    ]);
  }),
);
const result = {
  modelVersion: model.version,
  featureVersion: model.featureVersion,
  catalogHash,
  byKey,
};
const output = path.resolve(arg("--output") || path.join(ROOT, deploy ? "public/lakh-version-rankings.json.gz" : "reports/lakh-version-model/experimental-rankings.json.gz"));
fs.writeFileSync(output, zlib.gzipSync(JSON.stringify(result)));
const suggested = data.groups.filter((g) =>
  suggestedVersion(
    g.rows.map((r) => r.key),
    result,
  ),
);
const report = {
  modelVersion: model.version,
  scoredFiles: Object.keys(byKey).length,
  multiVersionSongs: data.groups.length,
  suggestedSongs: suggested.length,
  bytes: fs.statSync(output).size,
  output: path.relative(ROOT, output),
  catalogHash,
  command: [process.execPath, ...process.argv.slice(1)],
  midiHashesVerified: deploy,
  dataHash: crypto.createHash("sha256").update(fs.readFileSync(source)).digest("hex"),
  outputHash: crypto.createHash("sha256").update(fs.readFileSync(output)).digest("hex"),
  note: deploy
    ? "Preliminary learned ranking deployed by user request. Manual annotations lead; unannotated files use descending scores, ties retain catalog order and files without scores come last. This indexes unchanged fitted trees; no retraining or new accuracy claim."
    : "Experimental scores. Missing or tied rankings do not produce a unique suggestion.",
};
fs.writeFileSync(
  path.join(ROOT, deploy ? "reports/lakh-version-model/deployment-index.json" : "reports/lakh-version-model/index.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report));
