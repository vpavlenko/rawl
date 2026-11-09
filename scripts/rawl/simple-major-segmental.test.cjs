const assert = require("node:assert/strict"),
  { test } = require("node:test");
const {
  summarizeChords,
  estimateSegmentalStages,
  tempoMap,
} = require("./simple-major-segmental.cjs");
const { analyzeHarmony } = require("../../src/harmony/harmony.ts");
const { parseMidi } = require("midi-file");
const note = (pitch, start, end, voice = 0) => ({ pitch, start, end, voice });
const chord = (root, quality, start, end, confidence = 0.9) => ({
  root,
  quality,
  start,
  end,
  confidence,
});
test("stage vocabulary follows local tonic changes and supported chord qualities", () => {
  const chords = [
    chord(0, "maj", 0, 4),
    chord(7, "maj", 4, 8),
    chord(5, "maj", 8, 12),
  ];
  assert.equal(
    summarizeChords(chords, { tonic: 0, soundingBeats: 12 }).group,
    1,
  );
  assert.equal(
    summarizeChords(
      chords.map((c) => ({ ...c, root: (c.root + 2) % 12 })),
      { tonic: 0, regions: [{ start: 0, tonic: 2 }], soundingBeats: 12 },
    ).group,
    1,
  );
  assert.equal(
    summarizeChords([chord(9, "5", 0, 8)], { tonic: 0, soundingBeats: 8 })
      .group,
    2,
  );
  assert.equal(
    summarizeChords([chord(2, "maj", 0, 8)], { tonic: 0, soundingBeats: 8 })
      .group,
    null,
  );
});
test("a passing seventh is not counted for the template's whole span; a sustained inverted V7 is", () => {
  const chords = [chord(0, "maj", 0, 4), chord(7, "7", 4, 8)];
  const backing = [
    ...[48, 52, 55].map((p) => note(p, 0, 4)),
    ...[43, 47, 50].map((p) => note(p, 4, 8)),
  ];
  const short = summarizeChords(chords, {
    tonic: 0,
    soundingBeats: 8,
    notes: [...backing, note(53, 4, 4.25)],
  });
  assert.equal(short.group, 0);
  assert.deepEqual(short.seventhDegrees, []);
  const inverted = [
    ...[48, 52, 55].map((p) => note(p, 0, 4)),
    ...[47, 53, 55].map((p) => note(p, 4, 8)),
  ];
  const v7 = summarizeChords(chords, {
    tonic: 0,
    soundingBeats: 8,
    notes: inverted,
  });
  assert.equal(v7.group, 0);
  assert.deepEqual(v7.seventhDegrees, [4]);
  assert.equal(
    summarizeChords([...chords, chord(5, "maj", 8, 12)], {
      tonic: 0,
      soundingBeats: 12,
    }).group,
    1,
  );
  assert.equal(
    summarizeChords([...chords, chord(9, "min", 8, 12)], {
      tonic: 0,
      soundingBeats: 12,
    }).group,
    2,
  );
  assert.equal(
    summarizeChords([chord(0, "maj7", 0, 4), ...chords], {
      tonic: 0,
      soundingBeats: 12,
    }).group,
    5,
  );
});
test("insufficient coverage abstains instead of assigning I and V only", () => {
  assert.equal(
    summarizeChords([chord(0, "maj", 0, 2)], { tonic: 0, soundingBeats: 20 })
      .group,
    null,
  );
  assert.equal(
    summarizeChords([chord(0, "maj", 0, 20, 0.4)], {
      tonic: 0,
      soundingBeats: 20,
    }).group,
    null,
  );
});
test("chord-only inference preserves chord/key output and leaves default structure enabled", () => {
  const notes = Array.from({ length: 4 }, (_, bar) =>
    [48, 52, 55].map((p) => note(p, bar * 4, bar * 4 + 4)),
  ).flat();
  const grid = {
    measures: [0, 4, 8, 12, 16],
    beats: Array.from({ length: 16 }, (_, i) => i),
  };
  const full = analyzeHarmony(notes, grid),
    fast = analyzeHarmony(notes, grid, { includeStructure: false });
  assert.deepEqual(fast.chords, full.chords);
  assert.deepEqual(fast.keys, full.keys);
  assert.ok(full.phrases.length && full.sections.length);
  assert.deepEqual(fast.phrases, []);
  assert.deepEqual(fast.sections, []);
});
test("real Mary Had a Little Lamb inversion supplies dominant-seventh accompaniment", () => {
  const entry = require("../../src/midis/midis.json").midis.find(
    (e) => e.slug === "marry-had-a-little-lamb",
  );
  const data = require(`../../src/midis/${entry.id}.json`),
    bytes = Buffer.from(data.blobBase64, "base64");
  const result = estimateSegmentalStages({
    midi: parseMidi(bytes),
    bytes,
    tonic: 0,
  });
  assert.equal(result.group, 0);
  assert.deepEqual(result.seventhDegrees, [4]);
  assert.ok(
    result.chordEvidence.some((e) => e.degree === 4 && e.seventhBeats > 3),
  );
});
test("tempo changes preserve duration support in quarter-note beats", () => {
  const midi = {
    header: { ticksPerBeat: 480 },
    tracks: [
      [
        { deltaTime: 0, type: "setTempo", microsecondsPerBeat: 500000 },
        { deltaTime: 1920, type: "setTempo", microsecondsPerBeat: 1000000 },
      ],
    ],
  };
  const tempo = tempoMap(midi);
  assert.equal(tempo.toTime(8), 6);
  assert.equal(tempo.toBeat(6), 8);
});
test("curated popularity markers survive moving a piece to a different stage", () => {
  const {
    getSimpleMajorPopularPicks,
  } = require("../../src/components/rawl/corpora/simpleMajorPopularPieces.ts");
  assert.ok(
    getSimpleMajorPopularPicks("mixed-sevenths", [
      "marry-had-a-little-lamb",
    ]).has("marry-had-a-little-lamb"),
  );
  assert.equal(
    getSimpleMajorPopularPicks("primary-triads", ["a-non-curated-piece"]).size,
    0,
  );
});
