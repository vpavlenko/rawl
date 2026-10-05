const assert = require("assert");
const {
  classify,
  readNotes,
  readKeyRegions,
} = require("./search-simple-major");
const note = (pitch, start, duration = 1, voice = "melody") => ({
  pitch,
  start,
  end: start + duration,
  voice,
});
const base = [];
for (let bar = 0; bar < 8; bar++) {
  const pitches = bar % 2 ? [43, 59, 62] : [48, 60, 64];
  pitches.forEach((p) => base.push(note(p, bar * 4, 4, "accompaniment")));
}
base.push(...[48, 64, 67].map((p) => note(p, 32, 4, "accompaniment")));
const cMajor = { modulations: { 1: 0 } };
assert.equal(classify(base, cMajor).tonic, 0);
const passing = [note(72, 1, 0.25), note(73, 1.25, 0.25), note(74, 1.5, 0.25)];
assert.equal(classify([...base, ...passing], cMajor).chromaticNotes, 1);
const neighbor = [note(74, 1, 0.25), note(73, 1.25, 0.25), note(74, 1.5, 0.25)];
assert.equal(classify([...base, ...neighbor], cMajor).chromaticNotes, 1);
assert.equal(classify([...base, note(66, 1, 2)], cMajor), null);
// Even a short stepwise F# is harmonic when it completes D major.
const secondary = [
  note(65, 2, 0.25),
  note(66, 2.25, 0.25),
  note(67, 2.5, 0.25),
  note(50, 2.25, 0.25, "other"),
  note(57, 2.25, 0.25, "other"),
];
assert.equal(classify([...base, ...secondary], cMajor), null);
// The relaxed Lakh tier changes only the ending requirement, not chromatic
// harmony rejection. Ending on V stays out of the default strict search.
const dominantEnding = base.filter((n) => n.start < 32);
assert.equal(classify(dominantEnding, cMajor), null);
assert.equal(
  classify(dominantEnding, cMajor, [], { requireTonicEnding: false }).tonic,
  0,
);
assert.equal(
  classify([...dominantEnding, ...secondary], cMajor, [], {
    requireTonicEnding: false,
  }),
  null,
);
// Major tonic extensions must not exclude an otherwise diatonic piece.
const extended = [
  ...base,
  note(69, 32, 4, "extension"),
  note(74, 32, 4, "extension"),
];
assert.equal(classify(extended, cMajor).tonic, 0);
assert.equal(
  classify([...extended, note(70, 32, 4, "extension")], cMajor),
  null,
);
// A brief C# approach to D may follow a leap, rather than a preceding step.
const approach = [note(73, 2, 0.1), note(74, 2.1, 0.5)];
assert.equal(classify([...extended, ...approach], cMajor).chromaticNotes, 1);
// Reproduce the dying A/E overlap before the bass C# -> D approach.
const bassApproach = [
  note(57, 2, 0.679, "bass"),
  note(40, 2, 0.85, "bass"),
  note(49, 2.653, 0.106, "bass"),
  note(50, 2.756, 1, "bass"),
];
assert.equal(
  classify([...extended, ...bassApproach], cMajor).chromaticNotes,
  1,
);
assert.equal(classify([...base, note(73, 2, 1), note(74, 3, 1)], cMajor), null);
const chromaticApproachChord = [
  note(57, 2, 0.25, "chord"),
  note(64, 2, 0.25, "chord"),
  note(73, 2, 0.25),
  note(74, 2.25, 0.5),
];
assert.equal(classify([...base, ...chromaticApproachChord], cMajor), null);
const minor = base.map((n) => ({ ...n, pitch: n.pitch === 64 ? 63 : n.pitch }));
assert.equal(classify(minor, cMajor), null);
assert.equal(classify(base, { modulations: { 1: 0, 9: 7 } }), null);
// C major followed by a whole-tone truck-driver lift to D major.
const lifted = [
  ...base,
  ...base.map((n) => ({
    ...n,
    pitch: n.pitch + 2,
    start: n.start + 36,
    end: n.end + 36,
  })),
];
const liftAnnotation = { modulations: { 1: 0, 10: 2 } };
const regions = [
  { start: 0, tonic: 0 },
  { start: 36, tonic: 2 },
];
assert.equal(classify(lifted, liftAnnotation, regions).tonic, 0);
const openEnding = lifted.filter((n) => !(n.start === 68 && n.pitch === 66));
assert.equal(classify(openEnding, liftAnnotation, regions).tonic, 0);
// The old tonic is no longer used to reject the new key's F# and C#.
assert.equal(classify(lifted, liftAnnotation, regions).chromaticNotes, 0);
assert.equal(
  classify([...lifted, note(68, 40, 2)], liftAnnotation, regions),
  null,
);
const minorLift = lifted.map((n) =>
  n.start >= 36 && n.pitch === 66 ? { ...n, pitch: 65 } : n,
);
assert.equal(classify(minorLift, liftAnnotation, regions), null);
assert.deepEqual(
  readKeyRegions(
    { header: { ticksPerBeat: 100 }, tracks: [[]] },
    lifted,
    liftAnnotation,
  ),
  regions,
);
assert.deepEqual(
  readKeyRegions(
    {
      header: { ticksPerBeat: 100 },
      tracks: [
        [{ deltaTime: 0, type: "timeSignature", numerator: 3, denominator: 4 }],
      ],
    },
    lifted,
    { modulations: { 1: 0, 3: 2 } },
  ),
  [
    { start: 0, tonic: 0 },
    { start: 6, tonic: 2 },
  ],
);
assert.deepEqual(
  readKeyRegions(
    {
      header: { ticksPerBeat: 100 },
      tracks: [
        [{ deltaTime: 0, type: "setTempo", microsecondsPerBeat: 1000000 }],
      ],
    },
    lifted,
    { modulations: { 1: 0, 3: 2 }, modulationOnset: { 3: 7.5 } },
  ),
  [
    { start: 0, tonic: 0 },
    { start: 7.5, tonic: 2 },
  ],
);
const pickupAnnotation = {
  ...liftAnnotation,
  snippets: [{ tag: "modulation:truck_driver", measuresSpan: [9, 10] }],
};
const pickupRegions = readKeyRegions(
  { header: { ticksPerBeat: 100 }, tracks: [[]] },
  lifted,
  pickupAnnotation,
);
assert.equal(pickupRegions[1].pickupStart, 32);
const pickupChord = [56, 60, 63].map((pitch) => note(pitch, 32, 4, "pickup"));
assert.equal(
  classify([...lifted, ...pickupChord], pickupAnnotation, pickupRegions)
    .pickupChromaticNotes,
  2,
);
// The same chord a bar earlier or after the modulation is still disallowed.
assert.equal(
  classify(
    [...lifted, ...pickupChord.map((n) => ({ ...n, start: 28, end: 32 }))],
    pickupAnnotation,
    pickupRegions,
  ),
  null,
);
assert.equal(
  classify(
    [...lifted, ...pickupChord.map((n) => ({ ...n, start: 36, end: 40 }))],
    pickupAnnotation,
    pickupRegions,
  ),
  null,
);
assert.equal(
  classify([...lifted, ...pickupChord], liftAnnotation, regions),
  null,
);
// No exemption for a chromatic note held into the new key.
assert.equal(
  classify([...lifted, note(68, 35, 2)], pickupAnnotation, pickupRegions),
  null,
);
const tripleRegions = readKeyRegions(
  {
    header: { ticksPerBeat: 100 },
    tracks: [
      [{ deltaTime: 0, type: "timeSignature", numerator: 3, denominator: 4 }],
    ],
  },
  lifted,
  {
    modulations: { 1: 0, 3: 2 },
    snippets: [{ tag: "modulation:truck_driver", measuresSpan: [2, 3] }],
  },
);
assert.equal(tripleRegions[1].pickupStart, 3);
const midi = {
  header: { ticksPerBeat: 100 },
  tracks: [
    [
      {
        deltaTime: 0,
        type: "noteOn",
        channel: 9,
        noteNumber: 66,
        velocity: 100,
      },
      {
        deltaTime: 0,
        type: "noteOn",
        channel: 0,
        noteNumber: 60,
        velocity: 100,
      },
      {
        deltaTime: 100,
        type: "noteOn",
        channel: 0,
        noteNumber: 60,
        velocity: 0,
      },
    ],
  ],
};
assert.deepEqual(
  readNotes(midi).map((n) => [n.pitch, n.start, n.end]),
  [[60, 0, 1]],
);
console.log(
  "Passed: major, chromatic passing/neighbor, chromatic harmony, minor, truck-driver lifts and pickup-bar bounds, local-key chromatic rejection, open-fifth endings, key-boundary timing, percussion and velocity-zero note-off.",
);
