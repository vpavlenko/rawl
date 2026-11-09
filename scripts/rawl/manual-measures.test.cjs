const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const { buildManualMeasuresAndBeats } = require("../../src/components/rawl/measures");

const notes = (...starts) => starts.map((start) => ({ span: [start, start + 0.2] }));

test("the final bar repeats the preceding duration beyond the last onset", () => {
  const grid = buildManualMeasuresAndBeats(
    { measureStarts: { 1: 0, 2: 3 }, beatsPerMeasure: {} },
    notes(0, 3, 6, 9),
  );
  assert.deepEqual(grid.measures, [0, 3, 6, 9, 12]);
  assert.deepEqual(grid.beats.slice(-3), [9.75, 10.5, 11.25]);
});

test("final duration uses the immediately preceding bar after a tempo change", () => {
  const grid = buildManualMeasuresAndBeats(
    { measureStarts: { 1: 0, 2: 3, 3: 5 }, beatsPerMeasure: {} },
    notes(0, 3, 5, 6.5),
  );
  assert.deepEqual(grid.measures, [0, 3, 5, 6.5, 8]);
  assert.deepEqual(grid.beats.slice(-3), [6.875, 7.25, 7.625]);
});

test("the final bar keeps its meter while matching the preceding duration", () => {
  const grid = buildManualMeasuresAndBeats(
    { measureStarts: { 1: 0, 2: 3 }, beatsPerMeasure: { 2: 3 } },
    notes(0, 3, 4),
  );
  assert.deepEqual(grid.measures, [0, 3, 4, 5]);
  assert.equal(grid.beats.length, 7);
  assert.ok(Math.abs(grid.beats.at(-2) - (4 + 1 / 3)) < 1e-12);
  assert.ok(Math.abs(grid.beats.at(-1) - (4 + 2 / 3)) < 1e-12);
});

test("a single bar retains its existing fallback without a preceding bar", () => {
  const grid = buildManualMeasuresAndBeats(
    { measureStarts: {}, beatsPerMeasure: {} }, notes(0),
  );
  assert.deepEqual(grid, { measures: [0, 2], beats: [0.5, 1, 1.5] });
});
