const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
require("ts-node").register({ transpileOnly: true });
const { parseMidi, writeMidi } = require("midi-file");
const MIDIFile = require("midifile");
require("../../src/players/midi-helpers.js");
const {
  normalizeMidiMeasures,
} = require("../../src/components/rawl/normalizeMidiMeasures");
const { parseNotes } = require("../../src/components/rawl/parseMidi");
const sig = (numerator, denominator, deltaTime = 0) => ({
  type: "timeSignature",
  numerator,
  denominator,
  deltaTime,
  metronome: 24,
  thirtyseconds: 8,
});
const end = (deltaTime = 0) => ({ type: "endOfTrack", deltaTime });
const bytes = (tracks, header = {}) =>
  Uint8Array.from(
    writeMidi({ header: { format: 1, ticksPerBeat: 480, ...header }, tracks }),
  );
const absolute = (b) =>
  parseMidi(b).tracks.map((track) => {
    let tick = 0;
    return track.map(({ deltaTime, ...event }) => ({
      tick: (tick += deltaTime),
      ...event,
    }));
  });
function grid(b) {
  const file = new MIDIFile(
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength),
  );
  const timeEvents = file.getTimeEvents(
    file.tracks.map((_, i) => file.getTrackEvents(i)),
  );
  return parseNotes({
    events: [],
    activeChannels: [],
    timeEvents,
    timebase: 480,
    ticksPerBeat: 480,
  }).measuresAndBeats;
}
test("explicit shortened bar repairs fractional beat carry in the production reader", () => {
  const input = bytes([
    [sig(4, 4), sig(1, 8, 2160), sig(6, 8, 240), end(4320)],
  ]);
  const fixed = normalizeMidiMeasures(input);
  assert.deepEqual(
    absolute(fixed)[0]
      .filter((e) => e.type === "timeSignature")
      .map((e) => [e.tick, e.numerator, e.denominator]),
    [
      [0, 4, 4],
      [1920, 1, 8],
      [2160, 1, 8],
      [2400, 6, 8],
    ],
  );
  assert.deepEqual(
    grid(fixed).ticks.measures.slice(0, 7),
    [0, 1920, 2160, 2400, 3840, 5280, 6720],
  );
  assert.deepEqual(normalizeMidiMeasures(fixed), fixed);
});
test("aligned changes and files without signatures keep their exact bytes", () => {
  for (const input of [
    bytes([[sig(4, 4), sig(6, 8, 1920), end(1440)]]),
    bytes([[end(120)]]),
  ])
    assert.equal(normalizeMidiMeasures(input), input);
});
test("shortened compound bars retain their eighth-note beat unit", () => {
  const fixed = normalizeMidiMeasures(
    bytes([[sig(6, 8), sig(3, 4, 2400), end(1440)]]),
  );
  assert.deepEqual(
    absolute(fixed)[0]
      .filter((e) => e.type === "timeSignature")
      .map((e) => [e.tick, e.numerator, e.denominator]),
    [
      [0, 6, 8],
      [1440, 4, 8],
      [2400, 3, 4],
    ],
  );
});
test("initial shortened bar is replaced, duplicate signatures stay consistent", () => {
  const input = bytes([
    [sig(4, 4), sig(6, 8, 240), end(1440)],
    [sig(4, 4), sig(6, 8, 240), end(1440)],
  ]);
  const fixed = normalizeMidiMeasures(input);
  for (const track of absolute(fixed)) assert.equal(track[0].numerator, 1);
  assert.deepEqual(grid(fixed).ticks.measures.slice(0, 3), [0, 240, 1680]);
});
test("conflicting meters, independent sequences, and inexact boundaries are left untouched", () => {
  for (const input of [
    bytes([[sig(4, 4), sig(6, 8, 2161), end(1440)]]),
    bytes([[sig(4, 4)], [sig(3, 4)]]),
    bytes([[sig(4, 4), sig(6, 8, 240), end(1440)]], { format: 2 }),
  ])
    assert.equal(normalizeMidiMeasures(input), input);
});
test("short conductor track retains its end while new metadata goes on a longer track", () => {
  const input = bytes([
    [sig(4, 4), end()],
    [sig(6, 8, 2160), end(1440)],
  ]);
  const fixed = normalizeMidiMeasures(input);
  assert.deepEqual(absolute(fixed)[0], absolute(input)[0]);
  assert.equal(absolute(fixed)[1].at(-1).tick, 3600);
  assert.deepEqual(normalizeMidiMeasures(fixed), fixed);
});
const fixture = path.resolve(
  __dirname,
  "../../reports/kuhlau-bar-alignment-2026-10-31/original.mid",
);
test("Kuhlau: only three missing short meters are added; every other event and bar boundary is retained", () => {
  const input = fs.readFileSync(fixture),
    fixed = normalizeMidiMeasures(input);
  const before = absolute(input),
    after = absolute(fixed);
  const additions = after
    .flat()
    .filter(
      (e) =>
        e.type === "timeSignature" &&
        !before
          .flat()
          .some((b) => b.tick === e.tick && b.type === "timeSignature"),
    );
  assert.deepEqual(
    additions.map((e) => [e.tick, e.numerator, e.denominator]),
    [
      [213120, 1, 8],
      [247920, 1, 8],
      [259680, 1, 8],
    ],
  );
  assert.deepEqual(
    after.map((track) => track.filter((e) => !additions.includes(e))),
    before,
  );
  assert.deepEqual(normalizeMidiMeasures(fixed), fixed);
  const ticks = grid(fixed).ticks.measures;
  for (const e of after.flat().filter((e) => e.type === "timeSignature"))
    assert.ok(ticks.includes(e.tick), `Missing boundary at ${e.tick}`);
  for (let t = 213600; t <= 223680; t += 1440)
    assert.ok(ticks.includes(t), `Andante bar at ${t}`);
});
