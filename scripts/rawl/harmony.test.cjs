const assert = require("node:assert/strict"),
  { test } = require("node:test");
require("ts-node/register/transpile-only");
const {
  analyzeHarmony,
  chordToken,
  encodeHarmony,
  findProgression,
  parseProgression,
  romanNumeral,
  chordName,
  measureAt,
} = require("../../src/harmony/harmony.ts");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const { alignChart } = require("../../src/harmony/alignment.ts");
const { analysisProposal } = require("../../src/harmony/proposals.ts");
const { harmonyAnnotationConfig } = require("../../src/harmony/settings.ts");
const { getPhraseStarts } = require("../../src/components/rawl/analysis.ts");
const grid = (bars = 4) => ({
  measures: Array.from({ length: bars + 1 }, (_, i) => i * 4),
  beats: Array.from({ length: bars * 4 }, (_, i) => i),
});
const triad = (root, start, end, voice = 0) =>
  [root + 48, root + 60, root + 64, root + 67].map((pitch) => ({
    pitch,
    start,
    end,
    voice,
  }));
test("transposed borrowed chords remain IV bVII I", () => {
  for (const tonic of [0, 1, 5, 9]) {
    const notes = [
      ...triad((tonic + 5) % 12, 0, 4),
      ...triad((tonic + 10) % 12, 4, 8),
      ...triad(tonic, 8, 12),
    ];
    const result = analyzeHarmony(notes, grid(3), {
      referenceKeys: [{ start: 0, tonic }],
    });
    const encoded = encodeHarmony(result),
      hits = findProgression(
        encoded.sequence,
        encoded.certainty,
        parseProgression("IV ♭VII I"),
      );
    assert.equal(hits.length, 1);
    assert.equal(encoded.starts[hits[0].index], 0);
  }
});
test("absolute chord spelling follows the displayed tonic and Roman degree", () => {
  assert.equal(chordName(1, "min", 9), "C♯m");
  assert.equal(chordName(6, "maj", 5), "G♭");
  assert.equal(chordName(10, "maj", 0), "B♭");
  assert.equal(chordName(5, "maj", 6), "E♯");
});
test("packed onsets on a bar line retain their measure after rounding", () => {
  assert.equal(measureAt([0, 1.26312, 2.52624], 1.2631), 2);
  assert.equal(measureAt([0, 1.26312, 2.52624], 1.24), 1);
});
test("passing tones, inversion and drums do not turn a C triad into another root", () => {
  const notes = [
    { pitch: 52, start: 0, end: 4, voice: 0 },
    ...triad(0, 0, 4, 1).filter((n) => n.pitch >= 60),
    { pitch: 61, start: 1.9, end: 2, voice: 2 },
    ...triad(6, 0, 4, 3).map((n) => ({ ...n, isDrum: true })),
  ];
  const result = analyzeHarmony(notes, grid(1));
  assert.equal(result.chords[0].root, 0);
  assert.equal(result.chords[0].quality, "maj");
  assert.equal(result.chords[0].bass, 4);
});
test("a broken chord is integrated across its note attacks", () => {
  const notes = [48, 60, 64, 67].map((pitch, i) => ({
    pitch,
    start: i,
    end: i + 1,
    voice: 0,
  }));
  const result = analyzeHarmony(notes, grid(1));
  assert.ok(
    result.chords.some(
      (c) => c.root === 0 && c.quality === "maj" && c.end - c.start >= 2,
    ),
  );
});
test("silence and changes of tonic terminate progression matches", () => {
  const chord = (root, start, end, tonic) => ({
    root,
    start,
    end,
    tonic,
    quality: "maj",
    confidence: 1,
    keyConfidence: 1,
  });
  const result = {
    chords: [
      chord(5, 0, 4, 0),
      { ...chord(0, 4, 8, 0), root: null },
      chord(10, 8, 12, 0),
      chord(0, 12, 16, 0),
    ],
  };
  let encoded = encodeHarmony(result);
  assert.equal(
    findProgression(
      encoded.sequence,
      encoded.certainty,
      parseProgression("IV bVII I"),
    ).length,
    0,
  );
  result.chords = [chord(5, 0, 4, 0), chord(10, 4, 8, 0), chord(2, 8, 12, 2)];
  encoded = encodeHarmony(result);
  assert.equal(
    findProgression(
      encoded.sequence,
      encoded.certainty,
      parseProgression("IV bVII I"),
    ).length,
    0,
  );
});
test("family search collapses repeated triad/seventh variants but explicit sevenths are exact", () => {
  const sequence = [
    chordToken(5, "maj"),
    chordToken(5, "7"),
    chordToken(10, "maj"),
    chordToken(0, "maj"),
  ].join("");
  const certainty = "{{{{";
  const matches = findProgression(
    sequence,
    certainty,
    parseProgression("IV bVII I"),
  );
  assert.equal(matches.length, 1);
  assert.equal(matches[0].index, 0);
  assert.equal(matches[0].endIndex, 3);
  assert.equal(
    findProgression(
      chordToken(7, "maj") + chordToken(0, "maj"),
      "{{",
      parseProgression("V7 I"),
    ).length,
    0,
  );
  assert.equal(
    findProgression(
      chordToken(7, "7") + chordToken(0, "maj"),
      "{{",
      parseProgression("V7 I"),
    ).length,
    1,
  );
  assert.equal(
    findProgression(chordToken(0, "5"), "{", parseProgression("I")).length,
    0,
  );
  assert.equal(romanNumeral(10, "maj", 0), "♭VII");
  assert.throws(() => parseProgression("IV potato I"));
});
test("phrase and section proposals round trip through the real Rawl layout", () => {
  const result = {
    inferredKeys: [
      { measure: 1, start: 0, tonic: 0, confidence: 0.9 },
      { measure: 10, start: 36, tonic: 2, confidence: 0.4 },
    ],
    phrases: [1, 4, 8, 10, 14].map((measure) => ({ measure })),
    sections: [1, 10].map((measure) => ({ measure })),
  };
  const proposal = analysisProposal(result, grid(16).measures);
  assert.deepEqual(
    getPhraseStarts(proposal, 17).filter((m) => m < 17),
    [1, 4, 8, 10, 14],
  );
  assert.deepEqual(proposal.sections, [0, 3]);
  assert.deepEqual(proposal.modulations, { 1: 0 });
});
test("MIDI time signatures, tempo, sustain and drum exclusion", () => {
  const midi = {
    header: { ticksPerBeat: 100 },
    tracks: [
      [
        { deltaTime: 0, type: "timeSignature", numerator: 3, denominator: 4 },
        {
          deltaTime: 0,
          type: "noteOn",
          channel: 0,
          noteNumber: 60,
          velocity: 100,
        },
        {
          deltaTime: 50,
          type: "controller",
          channel: 0,
          controllerType: 64,
          value: 127,
        },
        { deltaTime: 50, type: "setTempo", microsecondsPerBeat: 1000000 },
        { deltaTime: 0, type: "noteOff", channel: 0, noteNumber: 60 },
        {
          deltaTime: 100,
          type: "controller",
          channel: 0,
          controllerType: 64,
          value: 0,
        },
        {
          deltaTime: 0,
          type: "noteOn",
          channel: 9,
          noteNumber: 36,
          velocity: 100,
        },
        { deltaTime: 10, type: "noteOff", channel: 9, noteNumber: 36 },
        { deltaTime: 90, type: "timeSignature", numerator: 2, denominator: 4 },
        { deltaTime: 200, type: "endOfTrack" },
      ],
    ],
  };
  const result = harmonyMidi(midi);
  assert.deepEqual(result.grid.measures, [0, 2.5, 4.5]);
  assert.equal(result.notes[0].end, 1.5);
  assert.equal(result.notes[1].isDrum, true);
  assert.throws(() =>
    harmonyMidi({ header: { framesPerSecond: 24 }, tracks: [] }),
  );
});
test("chart alignment identifies transposition and leaves incomplete evidence for review", () => {
  const reference = {
    chords: [
      { root: 0, quality: "maj" },
      { root: 7, quality: "maj" },
      { root: 9, quality: "min" },
      { root: 5, quality: "maj" },
    ],
  };
  const chords = reference.chords.map((c, i) => ({
    ...c,
    root: (c.root + 2) % 12,
    start: i * 4,
    end: (i + 1) * 4,
  }));
  const result = alignChart(chords, reference);
  assert.equal(result.transpose, 2);
  assert.equal(result.coverage, 1);
  assert.equal(result.status, "candidate alignment");
  assert.equal(
    alignChart(chords.slice(0, 2), reference).status,
    "needs review",
  );
});
test("empty or invalid scores produce diagnostics", () => {
  assert.deepEqual(analyzeHarmony([], grid()).chords, []);
  assert.ok(
    analyzeHarmony(triad(0, 0, 4), { measures: [0, 0, 4], beats: [] }).warnings
      .length,
  );
});
test("cache settings detect tonic, timing and voice edits without treating array order as a change", () => {
  const annotation = {
    modulations: { 1: 0 },
    measures: { bpm: 120, start: 0 },
    excludedVoices: [2, 1],
  };
  const config = harmonyAnnotationConfig(annotation);
  assert.equal(
    config,
    harmonyAnnotationConfig({ ...annotation, excludedVoices: [1, 2, 1] }),
  );
  assert.notEqual(
    config,
    harmonyAnnotationConfig({ ...annotation, modulations: { 1: 2 } }),
  );
  assert.notEqual(
    config,
    harmonyAnnotationConfig({
      ...annotation,
      measures: { bpm: 100, start: 0 },
    }),
  );
  assert.notEqual(
    config,
    harmonyAnnotationConfig({ ...annotation, drumVoices: [3] }),
  );
  assert.equal(
    harmonyAnnotationConfig(undefined),
    harmonyAnnotationConfig({ modulations: { 1: 0 } }, false),
  );
});
