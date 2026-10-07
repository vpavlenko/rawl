// Extract every multi-version song once; human labels stay out of MIDI features.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto"),
  zlib = require("zlib");
require("ts-node/register/transpile-only");
const { parseMidi } = require("midi-file");
const {
  versionFeatures,
  VERSION_FEATURE_VERSION,
  VERSION_FEATURE_NAMES,
} = require("../../src/lakh/versionFeatures.ts");
const { versionGroups } = require("../../src/lakh/versionGroups.ts");
const ROOT = path.resolve(__dirname, "../..");
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i < 0 ? undefined : process.argv[i + 1];
};
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const annotationsPath = path.resolve(
  arg("--annotations") || path.join(ROOT, "src/corpus/analyses.json"),
);
const annotationBytes = fs.readFileSync(annotationsPath),
  snapshot = JSON.parse(annotationBytes),
  annotations = snapshot.analyses || snapshot;
const preferencesPath = arg("--preferences");
const preferences = preferencesPath
  ? JSON.parse(fs.readFileSync(preferencesPath))
  : {};
const catalogBytes = fs.readFileSync(path.join(ROOT, "public/lakh-index.json")),
  catalog = JSON.parse(catalogBytes);
const output = path.resolve(
  arg("--output") || "/private/tmp/rawl-lakh-versions/data.json.gz",
);
const groups = [],
  skipped = [],
  errors = [];
const parents = new Map();
const find = (key) => {
  if (!parents.has(key)) parents.set(key, key);
  if (parents.get(key) !== key) parents.set(key, find(parents.get(key)));
  return parents.get(key);
};
const union = (a, b) => {
  a = find(a);
  b = find(b);
  if (a !== b) parents.set([a, b].sort()[1], [a, b].sort()[0]);
};
const byteGroups = new Map(),
  titleGroups = new Map();
let extracted = 0;
for (const [id, files] of versionGroups(catalog)) {
  if (files.length < 2) continue;
  const rows = [];
  for (const { artist, file, key } of files) {
    try {
      const bytes = fs.readFileSync(
          path.join(ROOT, "public/lakh-data", artist.name, file),
        ),
        midiHash = sha(bytes);
      const { features, summary } = versionFeatures(parseMidi(bytes));
      rows.push({ key, file, midiHash, features, summary });
      extracted++;
      if (byteGroups.has(midiHash)) union(id, byteGroups.get(midiHash));
      else byteGroups.set(midiHash, id);
    } catch (e) {
      errors.push({ key, reason: String(e.message || e) });
    }
  }
  const title = id.slice(id.indexOf("/") + 1);
  if (titleGroups.has(title)) union(id, titleGroups.get(title));
  else titleGroups.set(title, id);
  const manual = files
    .filter(({ key }) => !!annotations[key])
    .map(({ key }) => key);
  const explicit = preferences[id];
  const winner = explicit || (manual.length === 1 ? manual[0] : null);
  if (explicit && !files.some(({ key }) => key === explicit))
    throw new Error(`Invalid explicit winner for ${id}`);
  let accepted = [];
  if (winner && rows.length === files.length) {
    const hash = rows.find((r) => r.key === winner)?.midiHash;
    accepted = rows.filter((r) => r.midiHash === hash).map((r) => r.key);
    if (accepted.length === rows.length) {
      accepted = [];
      skipped.push({ id, reason: "All versions are byte-identical" });
    }
  } else if (winner)
    skipped.push({ id, reason: "A version failed extraction" });
  else if (manual.length > 1)
    skipped.push({
      id,
      reason: "Multiple annotated versions; no explicit winner",
      keys: manual,
    });
  groups.push({
    id,
    rows,
    accepted,
    winner,
    labelSource: winner
      ? explicit
        ? "explicit-preference"
        : "single-owner-annotation"
      : null,
    sourceCount: files.length,
  });
  if (groups.length % 250 === 0)
    console.log(`Extracted ${extracted} files / ${groups.length} song groups`);
}
for (const group of groups) {
  group.splitGroup = find(group.id);
  const bucket = parseInt(sha(group.splitGroup).slice(0, 8), 16) % 5;
  group.split = bucket === 0 ? "test" : bucket === 1 ? "validation" : "train";
}
const manifest = {
  featureVersion: VERSION_FEATURE_VERSION,
  featureNames: VERSION_FEATURE_NAMES,
  annotations: path.relative(ROOT, annotationsPath),
  annotationHash: sha(annotationBytes),
  catalogHash: sha(catalogBytes),
  preferences: preferencesPath
    ? {
        path: path.resolve(preferencesPath),
        sha256: sha(fs.readFileSync(preferencesPath)),
        values: preferences,
      }
    : null,
  labelAssumption:
    "Within a reviewed song, the single owner-annotated version is preferred to all other versions; annotation absence globally is not a negative label.",
  splitRule:
    "Canonical artist/title groups; same normalized titles across artists and byte duplicates are unioned. SHA256 representative modulo 5: 0 test, 1 validation, otherwise train.",
  counts: Object.fromEntries(
    ["train", "validation", "test"].map((split) => [
      split,
      groups.filter((g) => g.accepted.length && g.split === split).length,
    ]),
  ),
  groups: groups.map(({ rows, ...group }) => ({
    ...group,
    rows: rows.map(({ features, ...r }) => r),
  })),
  skipped,
  errors,
};
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, zlib.gzipSync(JSON.stringify({ manifest, groups })));
const reportDir = path.join(ROOT, "reports/lakh-version-model");
fs.mkdirSync(reportDir, { recursive: true });
fs.writeFileSync(
  path.join(reportDir, "dataset.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    groups: groups.length,
    extracted,
    errors: errors.length,
    labels: manifest.counts,
    skipped: skipped.length,
    features: VERSION_FEATURE_NAMES.length,
    output,
  }),
);
