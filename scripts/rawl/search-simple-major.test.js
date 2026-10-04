const assert = require("assert");
const { classify, readNotes } = require("./search-simple-major");
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
const minor = base.map((n) => ({ ...n, pitch: n.pitch === 64 ? 63 : n.pitch }));
assert.equal(classify(minor, cMajor), null);
assert.equal(classify(base, { modulations: { 1: 0, 9: 7 } }), null);
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
  "Passed: major, chromatic passing/neighbor, chromatic harmony, minor, modulation, percussion and velocity-zero note-off.",
);
