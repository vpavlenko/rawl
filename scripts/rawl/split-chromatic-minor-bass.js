// Preview with node scripts/rawl/split-chromatic-minor-bass.js; add --write to migrate.
const fs = require("fs");
const path = require("path");
require("ts-node/register/transpile-only");
const { classifyChromaticMinorBass, LEGACY_CHROMATIC_MINOR_TAG } =
  require("../../src/components/rawl/corpora/chromaticMinorBassTags.ts");
const file = path.join(__dirname, "../../src/corpus/analyses.json");
const analyses = JSON.parse(fs.readFileSync(file, "utf8"));
const counts = {};
for (const [key, analysis] of Object.entries(analyses)) {
  for (const snippet of analysis.snippets || []) {
    if (snippet.tag !== LEGACY_CHROMATIC_MINOR_TAG) continue;
    const tag = classifyChromaticMinorBass(snippet);
    if (!tag) throw new Error(`Cannot classify ${key}: ${snippet.measuresSpan}`);
    snippet.tag = tag;
    counts[tag] = (counts[tag] || 0) + 1;
    console.log(`${tag}\t${key}\t${snippet.measuresSpan.join("-")}`);
  }
}
if (process.argv.includes("--write")) fs.writeFileSync(file, JSON.stringify(analyses, null, 2) + "\n");
console.log(JSON.stringify(counts));
