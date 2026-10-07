const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const {
  sectionFeatureContext,
  SECTION_FEATURE_NAMES,
} = require("../../src/harmony/sectionFeatures.ts");
const {
  candidateSections,
  decodeSectionBoundaries,
} = require("../../src/harmony/sectionDecoder.ts");
const grid = (count) => ({
  measures: Array.from({ length: count + 1 }, (_, i) => i * 4),
  beats: [],
});
const value = (row, name) => row[SECTION_FEATURE_NAMES.indexOf(name)];
const motif = (start, pitch = 60) =>
  Array.from({ length: 4 }, (_, i) => ({
    pitch: pitch + [0, 4, 7, 4][i],
    start: start + i,
    end: start + i + 0.5,
    voice: 1,
  }));
test("common-note features compare aligned MIDI pitches, onsets and durations", () => {
  const notes = [...motif(0), ...motif(4), ...motif(8), ...motif(12)];
  const exact = sectionFeatureContext(notes, grid(4)).features(2, 4);
  assert.equal(value(exact, "visual.previous.pitchOnset.dice"), 1);
  assert.equal(value(exact, "visual.previous.pitchDuration.dice"), 1);
  const differentPitch = sectionFeatureContext(
    notes.map((n) => (n.start >= 8 ? { ...n, pitch: n.pitch + 1 } : n)),
    grid(4),
  ).features(2, 4);
  assert.equal(value(differentPitch, "visual.previous.pitchOnset.dice"), 0);
  assert.equal(value(differentPitch, "visual.previous.rhythm.dice"), 1);
  const differentDuration = sectionFeatureContext(
    notes.map((n) => (n.start >= 8 ? { ...n, end: n.end + 0.5 } : n)),
    grid(4),
  ).features(2, 4);
  assert.equal(value(differentDuration, "visual.previous.pitchOnset.dice"), 1);
  assert.equal(
    value(differentDuration, "visual.previous.pitchDuration.dice"),
    0,
  );
});
test("candidate endpoints expose last-bar note counts and first/last drum events independently", () => {
  const notes = [
    ...motif(0),
    ...motif(4),
    ...motif(8),
    ...motif(12),
    { pitch: 49, start: 0, end: 0.1, voice: 9, isDrum: true },
    ...[14.5, 15, 15.25, 15.5, 15.75].map((start) => ({
      pitch: 47,
      start,
      end: start + 0.05,
      voice: 9,
      isDrum: true,
    })),
  ];
  const row = sectionFeatureContext(notes, grid(4)).features(0, 4);
  assert.equal(row.length, SECTION_FEATURE_NAMES.length);
  assert.equal(value(row, "cadence.drumsAvailable"), 1);
  assert.equal(value(row, "firstDrum.onsets"), Math.log(2));
  assert.equal(value(row, "ending.drum.onsets"), Math.log(6));
  assert.equal(value(row, "events.last.quarter3Notes"), Math.log(2));
  const without = sectionFeatureContext(
    notes.filter((n) => !n.isDrum),
    grid(4),
  ).features(0, 4);
  assert.equal(value(without, "cadence.drumsAvailable"), 0);
  assert.equal(
    value(without, "events.last.noteCount"),
    value(row, "events.last.noteCount"),
  );
});
test("whole-file decoding rewards coherent spans rather than every local high score", () => {
  const scores = candidateSections(12).map(([start, end]) => ({
    start,
    end,
    score: (start === 0 && end === 5) || (start === 5 && end === 12) ? 3 : -2,
  }));
  assert.deepEqual(
    decodeSectionBoundaries(
      scores,
      12,
      { sectionBias: 0, lengthWeight: 0 },
      {},
    ),
    [1, 6],
  );
  assert.ok(
    candidateSections(200).some(([start, end]) => start === 0 && end === 200),
  );
});
test("common-note comparison and endpoint features survive global tempo scaling", () => {
  const notes = [...motif(0), ...motif(4), ...motif(8), ...motif(12)];
  const a = sectionFeatureContext(notes, grid(4)).features(2, 4);
  const b = sectionFeatureContext(
    notes.map((n) => ({ ...n, start: n.start * 2, end: n.end * 2 })),
    { measures: grid(4).measures.map((t) => t * 2), beats: [] },
  ).features(2, 4);
  a.forEach((x, i) =>
    assert.ok(Math.abs(x - b[i]) < 1e-10, SECTION_FEATURE_NAMES[i]),
  );
});

test("stale section caches upgrade once without changing harmonic data or source annotations", () => {
  const {
    refreshStructuralAnalysis,
    SECTION_MODEL_VERSION,
  } = require("../../src/harmony/sectionBoundaries.ts");
  const {
    PHRASE_MODEL_VERSION,
  } = require("../../src/harmony/phraseBoundaries.ts");
  const g = grid(16),
    notes = Array.from({ length: 16 }, (_, bar) => motif(bar * 4)).flat();
  const old = {
    version: "segmental-2",
    chords: [{ roman: "I" }],
    keys: [{ tonic: 0 }],
    inferredKeys: [],
    phrases: [{ measure: 1 }],
    phraseModelVersion: PHRASE_MODEL_VERSION,
    sections: [{ measure: 1, evidence: "old heuristic" }],
    warnings: [],
  };
  const snapshot = JSON.stringify(old);
  const updated = refreshStructuralAnalysis(old, notes, g);
  assert.equal(updated.sectionModelVersion, SECTION_MODEL_VERSION);
  assert.equal(updated.chords, old.chords);
  assert.equal(updated.keys, old.keys);
  assert.equal(updated.phrases, old.phrases);
  assert.equal(JSON.stringify(old), snapshot);
  assert.equal(refreshStructuralAnalysis(updated, notes, g), updated);
});
