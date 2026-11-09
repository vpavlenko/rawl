// Run: node scripts/rawl/check-first-measure-seek.cjs
require('ts-node').register({ transpileOnly: true });
const assert = require('node:assert/strict');
const { snapFirstMeasureSeek } = require('../../src/components/rawl/firstMeasureSeek');
const piece = (onsets, measures) => ({
  notes: onsets.map(times => times.map(start => ({ span: [start, start + 0.2] }))),
  measuresAndBeats: { measures, beats: [] },
});

// Leading empty measures and unsorted/polyphonic voices: use earliest onset.
const delayed = piece([[5.8, 5.2], [5.5]], [0, 2, 4, 6, 8]);
for (const time of [4000, 4500, 5200, 5999])
  assert.equal(snapFirstMeasureSeek(time, delayed), 5200);
for (const time of [0, 3999, 6000, 7000])
  assert.equal(snapFirstMeasureSeek(time, delayed), time);

// First note exactly on the boundary belongs to the following measure.
const boundary = piece([[2]], [0, 2, 4]);
assert.equal(snapFirstMeasureSeek(1999, boundary), 1999);
assert.equal(snapFirstMeasureSeek(3999, boundary), 2000);
assert.equal(snapFirstMeasureSeek(4000, boundary), 4000);

// Pickups before the first grid boundary and a piece beginning at time zero.
assert.equal(snapFirstMeasureSeek(900, piece([[0.5]], [1, 3])), 500);
assert.equal(snapFirstMeasureSeek(1500, piece([[0]], [0, 2])), 0);

// Manual annotation edits must invalidate the cached range.
const manualPiece = piece([[1, 2, 3]], [0, 2, 4]);
assert.equal(snapFirstMeasureSeek(1500, manualPiece), 1000);
assert.equal(snapFirstMeasureSeek(1500, manualPiece, {
  measureStarts: { 1: 0, 2: 1.25, 3: 2.5 }, beatsPerMeasure: { 1: 4 },
}), 1500);
assert.equal(snapFirstMeasureSeek(1500, manualPiece), 1000);
assert.equal(snapFirstMeasureSeek(500, piece([[]], [0, 2])), 500);
assert.equal(snapFirstMeasureSeek(500, null), 500);
console.log('First-measure seeking checks passed');
