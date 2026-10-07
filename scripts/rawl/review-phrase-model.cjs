// Training-only disagreements for the annotation feedback loop.
const fs = require("fs"),
  path = require("path"),
  zlib = require("zlib");
require("ts-node/register/transpile-only");
const {
  treeProbability,
  decodePhraseBoundaries,
} = require("../../src/harmony/phraseBoundaries.ts");
const { withoutDrumFeatures } = require("../../src/harmony/phraseFeatures.ts");
const model = require("../../src/harmony/phraseModel.json"),
  catalog = require("../../public/lakh-index.json");
const root = path.resolve(__dirname, "../.."),
  arg = process.argv.indexOf("--data");
const data = JSON.parse(
  zlib.gunzipSync(
    fs.readFileSync(
      arg >= 0
        ? process.argv[arg + 1]
        : "/private/tmp/rawl-phrase-training/data.json.gz",
    ),
  ),
);
const candidates = [];
for (const song of data.songs.filter((s) => s.split === "train")) {
  const branch = song.hasDrums ? "teacher" : "student";
  const probabilities = song.features.map((row) =>
    treeProbability(
      song.hasDrums ? row : withoutDrumFeatures(row),
      model[branch],
    ),
  );
  const predicted = decodePhraseBoundaries(
    probabilities,
    song.count,
    model.decoder[branch],
    model.phraseLengths,
  ).filter((m) => m > 1);
  const missing = song.truth.filter((m) => !predicted.includes(m)),
    extra = predicted.filter((m) => !song.truth.includes(m));
  if (!missing.length && !extra.length) continue;
  let url = "/" + song.key;
  if (song.key.startsWith("c/MIDI/")) {
    const [, , name, file] = song.key.split("/"),
      artist = catalog.artists.find((a) => a.name === name);
    url = artist ? `/lakh/${artist.slug}/${artist.trackSlugs[file]}` : url;
  }
  candidates.push({
    key: song.key,
    split: song.split,
    hasDrums: song.hasDrums,
    missing,
    extra,
    url: url + "?harmony=1&measure=" + Math.min(...missing, ...extra),
  });
}
candidates.sort(
  (a, b) =>
    b.missing.length + b.extra.length - (a.missing.length + a.extra.length),
);
const report = {
  modelVersion: model.version,
  note: "Training-only disagreements from the fitted runtime model. In-sample review candidates, not a validation score or automatic annotation corrections. Validation/test songs are excluded.",
  songs: candidates.slice(0, 100),
};
fs.writeFileSync(
  path.join(root, "reports/phrase-model/review.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(`Wrote ${report.songs.length} training-only feedback candidates`);
