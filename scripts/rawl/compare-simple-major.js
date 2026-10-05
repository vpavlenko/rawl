// Compare a retained baseline with a candidate report without changing the corpus.
// node scripts/rawl/compare-simple-major.js [baseline.json] [candidate.json]
const fs = require("fs");
const path = require("path");
const baselinePath =
  process.argv[2] || path.join(__dirname, "simple-major-complexity.json");
const candidatePath =
  process.argv[3] ||
  path.join(__dirname, "simple-major-adaptive-complexity.json");
const baseline = JSON.parse(fs.readFileSync(baselinePath));
const candidate = JSON.parse(fs.readFileSync(candidatePath));
const index = require("../../src/midis/midis.json").midis;
const titleFor = (slug) =>
  index.find((entry) => entry.slug === slug || entry.id === slug)?.title ||
  slug;
const changes = candidate.tracks.flatMap((row) => {
  const previous = baseline.tracks.find((entry) => entry.slug === row.slug);
  if (!previous || previous.group === row.group) return [];
  return [
    {
      slug: row.slug,
      title: titleFor(row.slug),
      url: "https://rawl.rocks/f/" + row.slug,
      from: baseline.groups[previous.group].label,
      to: candidate.groups[row.group].label,
      degreesBefore: previous.degrees,
      degreesAfter: row.degrees,
      seventhsBefore: previous.seventhDegrees,
      seventhsAfter: row.seventhDegrees,
      harmonicRhythm: row.harmonicRhythm,
      textures: row.textures,
      chordEvidence: row.chordEvidence,
    },
  ];
});
const inconclusive = candidate.tracks
  .filter((row) => row.basis.includes("insufficient"))
  .map((row) => ({ slug: row.slug, title: titleFor(row.slug) }));
const report = {
  comparison:
    "Current corpus categories, including manual corrections, versus rhythm-then-texture-then-harmony estimates. Proposed categories only. Degree indices are zero-based (0 = I, 5 = vi); evidence start/end values are MIDI quarter-note beats.",
  changes,
  inconclusive,
  reviewed: candidate.tracks
    .filter((row) => row.reviewedHarmony)
    .map((row) => ({
      slug: row.slug,
      title: titleFor(row.slug),
      category: candidate.groups[row.group].label,
      review: row.reviewedHarmony,
    })),
};
fs.writeFileSync(
  path.join(__dirname, "simple-major-window-review.json"),
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `${changes.length} proposed category flips; ${inconclusive.length} inconclusive results retained in their previous categories.`,
);
for (const row of changes)
  console.log(`${row.title}: ${row.from} -> ${row.to}`);
