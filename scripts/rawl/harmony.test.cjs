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
const {
  analysisProposal,
  provisionalHarmony,
  provisionalScoreAnalysis,
} = require("../../src/harmony/proposals.ts");
const { harmonyAnnotationConfig } = require("../../src/harmony/settings.ts");
const {
  getPhraseStarts,
  getModulations,
  getTonicAtTime,
} = require("../../src/components/rawl/analysis.ts");
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
test("provisional score uses inferred structure and tonic onsets without changing saved annotations", () => {
  const saved = {
    modulations: { 1: 7 },
    modulationOnset: { 1: 0 },
    phrasePatch: [{ measure: 1, diff: 2 }],
    sections: [0, 1],
    sectionAnchors: { 1: { section: 0, phrase: 0 } },
    form: { 3: "verse" },
    comment: "curated",
    tags: [],
    excludedVoices: [2],
    voiceOctaveShifts: { 0: 1 },
  };
  const before = JSON.stringify(saved);
  const result = {
    version: "test",
    warnings: [],
    keys: [{ start: 0, end: 64, tonic: 7, confidence: 1, source: "reference" }],
    inferredKeys: [
      {
        measure: 1,
        start: 0,
        end: 14,
        tonic: 2,
        mode: "major",
        confidence: 0.4,
        source: "inferred",
      },
      {
        measure: 4,
        start: 14,
        end: 64,
        tonic: 4,
        mode: "major",
        confidence: 0.9,
        source: "inferred",
      },
    ],
    chords: [
      {
        start: 12,
        end: 16,
        root: 0,
        quality: "maj",
        tonic: 7,
        keyConfidence: 1,
        roman: "IV",
      },
    ],
    phrases: [1, 4, 8, 10, 14].map((measure) => ({ measure })),
    sections: [1, 10].map((measure) => ({ measure })),
  };
  const measures = grid(16).measures;
  const harmony = provisionalHarmony(result, measures);
  assert.deepEqual(
    harmony.chords.map((chord) => [chord.start, chord.end, chord.roman]),
    [
      [12, 14, "♭VII"],
      [14, 16, "♭VI"],
    ],
  );
  assert.equal(harmony.chords[0].keyConfidence, 0.4);
  assert.equal(result.chords[0].roman, "IV");
  const preview = provisionalScoreAnalysis(saved, harmony, measures);
  assert.deepEqual(
    getPhraseStarts(preview, 17).filter((measure) => measure < 17),
    [1, 4, 8, 10, 14],
  );
  assert.deepEqual(preview.sections, [0, 3]);
  const modulations = getModulations(preview, measures);
  assert.equal(getTonicAtTime(13, modulations, true), 2);
  assert.equal(getTonicAtTime(14, modulations, true), 4);
  assert.equal(preview.sectionAnchors, undefined);
  assert.deepEqual(preview.form, {});
  assert.equal(preview.excludedVoices, saved.excludedVoices);
  assert.equal(preview.voiceOctaveShifts, saved.voiceOctaveShifts);
  assert.equal(JSON.stringify(saved), before);
  assert.equal(analysisProposal(result, measures).modulations[1], null);
  assert.equal(
    provisionalScoreAnalysis(saved, { ...result, inferredKeys: [] }, measures),
    saved,
  );
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

const {
  phraseFeatures,
  PHRASE_FEATURE_NAMES,
  DRUM_FEATURE_INDICES,
  withoutDrumFeatures,
} = require("../../src/harmony/phraseFeatures.ts");
const {
  inferLearnedPhrases,
  PHRASE_MODEL_VERSION,
  refreshPhraseAnalysis,
  treeProbability,
  decodePhraseBoundaries,
} = require("../../src/harmony/phraseBoundaries.ts");
const {
  phraseTrainingSnapshot,
} = require("../../src/harmony/phraseFeedback.ts");
test("phrase features detect late drum fills and remain invariant to tempo, transposition and voice IDs", () => {
  const notes = Array.from({ length: 8 }, (_, bar) => [
    ...triad(0, bar * 4, bar * 4 + 2, 3),
    ...[0, 1, 2, 3].map((offset) => ({
      start: bar * 4 + offset,
      end: bar * 4 + offset + 0.1,
      pitch: 36,
      voice: 8,
      isDrum: true,
      velocity: 80,
    })),
    ...(bar === 3
      ? [3, 3.25, 3.5, 3.75].map((offset) => ({
          start: bar * 4 + offset,
          end: bar * 4 + offset + 0.1,
          pitch: 45,
          voice: 8,
          isDrum: true,
          velocity: 110,
        }))
      : []),
  ]).flat();
  const rows = phraseFeatures(notes, grid(8));
  assert.equal(rows[0].length, PHRASE_FEATURE_NAMES.length);
  assert(
    rows[4][PHRASE_FEATURE_NAMES.indexOf("drum.lateAcceleration")] >
      rows[3][PHRASE_FEATURE_NAMES.indexOf("drum.lateAcceleration")],
  );
  assert(rows[4][PHRASE_FEATURE_NAMES.indexOf("drum.lateGroup2")] > 0);
  const changed = notes.map((n) => ({
    ...n,
    start: n.start * 3 + 10,
    end: n.end * 3 + 10,
    pitch: n.pitch + (n.isDrum ? 0 : 2),
    voice: n.voice + 20,
  }));
  const shiftedGrid = {
    measures: grid(8).measures.map((t) => t * 3 + 10),
    beats: grid(8).beats.map((t) => t * 3 + 10),
  };
  const shifted = phraseFeatures(changed, shiftedGrid);
  rows.forEach((row, m) =>
    row.forEach((value, i) =>
      assert(Math.abs(value - shifted[m][i]) < 1e-9, PHRASE_FEATURE_NAMES[i]),
    ),
  );
  const pitched = phraseFeatures(
    notes.filter((n) => !n.isDrum),
    grid(8),
  );
  pitched.forEach((row) =>
    DRUM_FEATURE_INDICES.forEach((i) => assert.equal(row[i], 0)),
  );
  assert.deepEqual(
    withoutDrumFeatures(rows[4]).filter(
      (_, i) => !DRUM_FEATURE_INDICES.includes(i),
    ),
    rows[4].filter((_, i) => !DRUM_FEATURE_INDICES.includes(i)),
  );
});
test("exported tree inference and phrase decoder handle short pickups and exact boundary indexing", () => {
  const tree = {
    bias: 0,
    trees: [
      [
        [0, 0.5, 1, 2, 0, 0],
        [0, 0, 0, 0, -2, 1],
        [0, 0, 0, 0, 2, 1],
      ],
    ],
  };
  assert(Math.abs(treeProbability([0], tree) - 1 / (1 + Math.exp(2))) < 1e-12);
  assert(Math.abs(treeProbability([1], tree) - 1 / (1 + Math.exp(-2))) < 1e-12);
  const probabilities = [
    1, 0.999, 0.001, 0.001, 0.001, 0.999, 0.001, 0.001, 0.001,
  ];
  assert.deepEqual(
    decodePhraseBoundaries(
      probabilities,
      9,
      { lengthWeight: 0.1, boundaryBias: 0 },
      { 1: 1, 4: 100 },
    ),
    [1, 2, 6],
  );
});
test("cached heuristic phrases are upgraded by the trained model without modifying chords or annotations", () => {
  const notes = Array.from({ length: 8 }, (_, i) =>
    triad(0, i * 4, i * 4 + 2),
  ).flat();
  const legacy = {
    version: "segmental-2",
    chords: [],
    keys: [],
    inferredKeys: [],
    phrases: [],
    sections: [],
    warnings: [],
  };
  const upgraded = refreshPhraseAnalysis(legacy, notes, grid(8));
  assert.equal(upgraded.phraseModelVersion, PHRASE_MODEL_VERSION);
  assert.deepEqual(upgraded.phrases, inferLearnedPhrases(notes, grid(8)));
  assert.equal(upgraded.chords, legacy.chords);
  assert.equal(legacy.phraseModelVersion, undefined);
  assert.equal(legacy.phrases.length, 0);
  assert.equal(refreshPhraseAnalysis(upgraded, notes, grid(8)), upgraded);
  const live = analyzeHarmony(notes, grid(8));
  assert.equal(live.phraseModelVersion, PHRASE_MODEL_VERSION);
  assert.deepEqual(live.phrases, upgraded.phrases);
});
test("phrase feedback exports curated labels and own saved corrections without importing another annotator", () => {
  const original = {
    phrasePatch: [{ measure: 5, diff: 1 }],
    modulations: { 1: 0 },
  };
  const own = { ...original, phrasePatch: [{ measure: 5, diff: 2 }] };
  const other = { ...original, phrasePatch: [{ measure: 5, diff: 3 }] };
  const curated = { "f/example": original };
  const versions = {
    "f/example": { self: { analysis: own }, other: { analysis: other } },
  };
  assert.equal(
    phraseTrainingSnapshot(curated, versions, "self").analyses["f/example"],
    own,
  );
  assert.equal(
    phraseTrainingSnapshot(curated, versions).analyses["f/example"],
    original,
  );
  assert.equal(curated["f/example"], original);
});
