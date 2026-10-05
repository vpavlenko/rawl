const assert = require("assert");
const {
  estimateKey,
  scan,
  inferTruckDriverRegions,
} = require("./scan-lakh-simple-major");
const { classify, keyAtBeat } = require("./search-simple-major");
const { estimateHarmony } = require("./sort-simple-major");
const makeNotes = (pitches) =>
  Array.from({ length: 12 }, (_, bar) =>
    pitches.map((pitch) => ({
      pitch,
      start: bar * 4,
      end: bar * 4 + 4,
      voice: "bass",
    })),
  ).flat();
assert.equal(estimateKey(makeNotes([48, 52, 55])).mode, "major");
assert.equal(estimateKey(makeNotes([45, 48, 52])).mode, "minor");
const bamba = scan(
  {
    artist: "Valens Ritchie",
    filename: "La Bamba.mid",
    title: "La Bamba",
    slug: "lakh/Valens_Ritchie/La_Bamba",
  },
  {},
);
assert.equal(bamba.status, "match");
assert.equal(bamba.tier, "manually reviewed");
assert.equal(bamba.tonic, 0);
assert.equal(bamba.group, 1);
assert.deepEqual(bamba.estimatedDegrees, [0, 3, 4]);
const progression = (tonic, start, bars = 8) =>
  Array.from({ length: bars }, (_, i) => {
    const root = [48, 53, 55, 48][i % 4] + tonic;
    return [root, root + 4, root + 7].map((pitch) => ({
      pitch,
      start: start + i * 4,
      end: start + (i + 1) * 4,
      voice: "chords",
    }));
  }).flat();
for (const lift of [1, 2]) {
  const notes = [
    ...progression(0, 0),
    ...progression(lift, 32),
    ...progression(lift * 2, 64),
  ];
  assert.equal(classify(notes), null);
  const regions = inferTruckDriverRegions(notes);
  assert.deepEqual(regions, [
    { start: 0, tonic: 0 },
    { start: 32, tonic: lift },
    { start: 64, tonic: lift * 2 },
  ]);
  const annotation = { modulations: { 1: 0, 9: lift, 17: lift * 2 } };
  assert.equal(
    classify(notes, annotation, regions, { requireTonicEnding: false })
      .chromaticNotes,
    0,
  );
  const normalized = notes.map((n) => ({
    ...n,
    pitch: n.pitch - keyAtBeat(regions, n.start, 0),
    key: keyAtBeat(regions, n.start, 0),
  }));
  assert.deepEqual(estimateHarmony(normalized, 0).degrees, [0, 3, 4]);
  // A sustained altered chord within a local region remains disallowed.
  assert.equal(
    classify(
      [...notes, { pitch: 66, start: 8, end: 12, voice: "altered" }],
      annotation,
      regions,
      { requireTonicEnding: false },
    ),
    null,
  );
}
const secondary = [
  ...progression(0, 0, 16),
  ...[50, 54, 57].map((pitch) => ({
    pitch,
    start: 12,
    end: 14,
    voice: "secondary",
  })),
];
assert.deepEqual(inferTruckDriverRegions(secondary), []);
const minorDestination = [
  ...progression(0, 0),
  ...makeNotes([49, 52, 56]).map((n) => ({
    ...n,
    start: n.start + 32,
    end: n.end + 32,
  })),
];
assert.deepEqual(inferTruckDriverRegions(minorDestination), []);
console.log("Lakh key-profile and rich-texture scan checks passed");
