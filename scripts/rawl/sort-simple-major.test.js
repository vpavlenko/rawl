const assert = require("assert");
const { parseMidi } = require("midi-file");
const { readNotes } = require("./search-simple-major");
const {
  estimateHarmony,
  harmonicWindows,
  estimateHarmonicRhythm,
  estimateTexture,
  applyReviewedHarmony,
  groupForDegrees,
  primaryGroup,
} = require("./sort-simple-major");
const note = (pitch, start, duration = 0.45, voice = "bass") => ({
  pitch,
  start,
  end: start + duration,
  voice,
});
const pattern = (root, repeats, intervals = [0, 7, 12, 7]) =>
  Array.from({ length: repeats }, (_, i) =>
    intervals.map((interval, j) => note(root + interval, i * 4 + j * 0.5)),
  ).flat();

// IV introduces the second stage; reviewed I/V tags beat noisy MIDI evidence.
assert.equal(groupForDegrees([0, 4]), 0);
assert.equal(groupForDegrees([0, 3, 4]), 1);
assert.equal(
  primaryGroup({ tags: ["pure_major:I_V"], degrees: [0, 3] }, true),
  0,
);
assert.equal(primaryGroup({ tags: ["pure_major:I_IV_V"], degrees: [0] }), 1);
assert.equal(estimateHarmony(pattern(41, 3), 0).group, 1);
const ivBass = [note(41, 0, 2), note(72, 0, 2, "melody")];
assert.equal(estimateHarmony(ivBass, 0).group, 1);
assert.equal(estimateHarmony(ivBass, 0).ivBassEvidence.length, 1);

// Omitted-third vi in C, with an unrelated melody above the accompaniment.
const vi = pattern(45, 3);
const withMelody = [...vi, note(77, 0, 10, "melody")].sort(
  (a, b) => a.start - b.start || a.pitch - b.pitch,
);
assert.equal(estimateHarmony(withMelody, 0).group, 2);
assert.deepEqual(estimateHarmony(withMelody, 0).powerChordDegrees, [5]);
// One isolated dyad is insufficient. Repeated root-fifth patterns count even
// without octave doubling.
// Insufficient evidence is unknown, rather than an automatic primary category.
assert.equal(estimateHarmony(pattern(45, 1), 0).group, null);
assert.equal(estimateHarmony(pattern(45, 3, [0, 7, 0, 7]), 0).group, 2);
// Reject scale fragments and inverted fifths as root-position power chords.
assert.equal(estimateHarmony(pattern(45, 3, [0, 2, 7, 12]), 0).group, null);
assert.equal(estimateHarmony(pattern(45, 3, [0, 5, 12, 5]), 0).group, null);
assert.equal(estimateHarmony(pattern(48, 3), 0).group, 0);
assert.equal(estimateHarmony(pattern(38, 3), 0).group, 3);
assert.equal(estimateHarmony(pattern(40, 3), 0).group, 4);

// A slow vi arpeggio needs three beats to reach its octave. The next bass
// reset, rather than a two-beat cutoff, ends the window.
const slow = pattern(45, 3).map((n) => ({
  ...n,
  start: n.start * 2,
  end: n.end * 2,
}));
assert.equal(estimateHarmony(slow, 0).group, 2);
assert.equal(estimateHarmony(slow, 0).powerChordCounts[5], 3);
assert.equal(harmonicWindows(slow, new Set(["bass"]))[0].end, 8);

// Rapid adjacent C and Am block chords must not combine into Am7.
const rapid = Array.from({ length: 6 }, (_, i) =>
  (i % 2 ? [45, 48, 52] : [48, 52, 55]).map((p) => note(p, i, 0.9)),
).flat();
assert.equal(estimateHarmony(rapid, 0).group, 2);
assert.deepEqual(estimateHarmony(rapid, 0).seventhDegrees, []);
assert.equal(harmonicWindows(rapid, new Set(["bass"]))[0].end, 1);
const roots = [48, 50, 52].map((pitch, i) => note(pitch, i * 4, 3.9));
assert.deepEqual(harmonicWindows(roots, new Set(["bass"])), [
  { start: 0, end: 4 },
  { start: 4, end: 8 },
  { start: 8, end: 11.9 },
]);
// A genuine sustained dominant seventh still ranks in the seventh category.
const dominantSeventh = [43, 47, 50, 53].map((pitch) => note(pitch, 0, 4));
assert.equal(estimateHarmony(dominantSeventh, 0).group, 5);
assert.equal(estimateHarmonicRhythm(rapid, new Set(["bass"])).beats, 1);
assert.equal(estimateHarmonicRhythm(slow, new Set(["bass"])).beats, 8);
assert.equal(
  estimateTexture(rapid, 0, 1, new Set(["bass"])).kind,
  "block-chord",
);
const strum = [48, 52, 55].map((pitch, i) => note(pitch, i * 0.1, 1));
const strummedProgression = Array.from({ length: 3 }, (_, i) =>
  strum.map((n) => ({ ...n, start: n.start + i * 4, end: n.end + i * 4 })),
).flat();
assert.equal(estimateHarmony(strummedProgression, 0).group, 0);
assert.equal(
  estimateTexture(strum, 0, 2, new Set(["bass"])).kind,
  "strummed-chord",
);
const arpeggio = [48, 52, 55, 60].map((pitch, i) => note(pitch, i * 0.5));
assert.equal(
  estimateTexture(arpeggio, 0, 2, new Set(["bass"])).kind,
  "arpeggiated-chord",
);
// A vi bass can count once; a third in a voiced I6 must not become iii.
assert.equal(
  estimateHarmony([note(45, 0, 2), note(77, 0, 2, "melody")], 0).group,
  2,
);
assert.equal(
  estimateHarmony(
    [52, 60, 67].map((pitch) => note(pitch, 0, 4)),
    0,
  ).group,
  0,
);
assert.equal(estimateHarmony([note(69, 0, 2, "melody")], 0).group, null);

// Normalized tonic changes and the uncertainty ceiling also split spans.
const keyBoundary = [note(45, 0, 3), note(52, 1), note(57, 2)].map((n, i) => ({
  ...n,
  key: i ? 7 : 0,
}));
assert.equal(harmonicWindows(keyBoundary, new Set(["bass"]))[0].end, 1);
assert.deepEqual(harmonicWindows([note(48, 0, 20)], new Set(["bass"])), [
  { start: 0, end: 8 },
  { start: 8, end: 16 },
  { start: 16, end: 20 },
]);

// Actual Shepherd Moons backup: F major, four independent D-A-D arpeggios.
const data = require("../../src/midis/IV7nYZCO2WwMuerVtAr7.json");
const shepherd = estimateHarmony(
  readNotes(parseMidi(Buffer.from(data.blobBase64, "base64"))),
  5,
);
assert.equal(shepherd.group, 2);
assert.equal(shepherd.powerChordCounts[5], 4);
assert.deepEqual(shepherd.degrees, [0, 3, 4, 5]);
// Reviewed bass examples must also work without their manual constraints.
for (const [id, tonic] of [
  ["QohX9jasdMM8imkquhUb", 10],
  ["FU9ZIthxkhB3Qj45ggyC", 7],
]) {
  const midi = require(`../../src/midis/${id}.json`);
  const detected = estimateHarmony(
    readNotes(parseMidi(Buffer.from(midi.blobBase64, "base64"))),
    tonic,
  );
  assert.equal(detected.group, 2);
  assert(detected.bassDegrees.includes(5));
}
for (const slug of ["by-this-river---brian-eno", "heathcliff-theme-song"])
  assert.equal(
    applyReviewedHarmony({
      slug,
      group: 0,
      degrees: [0, 3],
      basis: "MIDI estimate",
    }).group,
    2,
  );
const ptichka = applyReviewedHarmony({
  slug: "raymond-pauls-ptichka-na-vetke",
  group: 0,
  degrees: [0],
  basis: "MIDI estimate",
});
assert.equal(ptichka.group, 4);
assert.deepEqual(ptichka.degrees, [0, 2, 5]);
assert.equal(
  applyReviewedHarmony({
    slug: ptichka.slug,
    group: 5,
    degrees: [0],
    basis: "saved seventh annotation",
  }).group,
  5,
);
// The Office: held/repeated G-B-E-C bass roots change once per 4/4 bar.
const officeMidi = require("../../src/midis/EL17bIVP2pDUEGiuiXn1.json");
const office = estimateHarmony(
  readNotes(parseMidi(Buffer.from(officeMidi.blobBase64, "base64"))),
  7,
);
assert.equal(office.harmonicRhythm.beats, 4);
assert.equal(office.group, 4);
assert.deepEqual(office.bassDegrees, [0, 2, 3, 5]);
assert.deepEqual(
  office.chordEvidence
    .filter((e) => e.texture === "bass" && e.seventh == null)
    .slice(0, 4)
    .map((e) => [e.start, e.end, e.degree]),
  [
    [0, 4, 0],
    [4, 8, 2],
    [8, 12, 5],
    [12, 16, 3],
  ],
);
// Rich Lakh arrangement: doubling, melody and passing tones add no harmonies.
const laBamba = estimateHarmony(
  readNotes(
    parseMidi(
      require("fs").readFileSync(
        require("path").join(
          __dirname,
          "../../public/lakh-data/Valens Ritchie/La Bamba.mid",
        ),
      ),
    ),
  ),
  0,
);
assert.equal(laBamba.group, 1);
assert.deepEqual(laBamba.degrees, [0, 3, 4]);
assert.deepEqual(laBamba.seventhDegrees, []);
const reviewedLaBamba = applyReviewedHarmony({
  slug: "lakh/Valens_Ritchie/La_Bamba",
  basis: "MIDI estimate",
  group: 5,
  degrees: [0, 2, 3, 4, 5],
  seventhDegrees: [4],
});
assert.equal(reviewedLaBamba.group, 1);
assert.deepEqual(reviewedLaBamba.degrees, [0, 3, 4]);
assert.deepEqual(reviewedLaBamba.estimatedDegrees, [0, 2, 3, 4, 5]);
assert.deepEqual(reviewedLaBamba.seventhDegrees, []);
console.log("Simple-major sorting regression checks passed");
