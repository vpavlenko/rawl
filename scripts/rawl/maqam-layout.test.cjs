const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const { MAQAM_REFERENCE_SCALES } = require("../../src/components/rawl/legends/maqamScales");
const { maqamPitches } = require("../../src/components/rawl/legends/maqamPlayback");
const { splitMaqamColumns, fitMaqamNoteHeight, getMaqamNotationLayout,
  MAQAM_ROW_GAP } = require("../../src/components/rawl/legends/maqamNotationLayout");

test("Nikriz sits immediately above Nahawand in both single and double columns", () => {
  for (const count of [1, 2]) {
    const columns = splitMaqamColumns(MAQAM_REFERENCE_SCALES, count);
    assert.deepEqual(columns.flat(), MAQAM_REFERENCE_SCALES);
    const column = columns.find(c => c.some(m => m.name === "Nikriz"));
    const index = column.findIndex(m => m.name === "Nikriz");
    assert.equal(column[index + 1].name, "Nahawand");
    assert.equal(columns.length, count);
  }
  const nikriz = MAQAM_REFERENCE_SCALES.find(m => m.name === "Nikriz");
  assert.deepEqual(nikriz.scale.slice(0, 8), [0, 2, 3, 6, 7, 9, 10, 12]);
  assert.deepEqual(nikriz.lower, [-2, -1]);
  assert.deepEqual(nikriz.pages, [211, 399, 400]);
});

test("fitting uses the taller column and includes decoration and bracket clearance", () => {
  const rows = MAQAM_REFERENCE_SCALES.map(m => ({
    pitches: maqamPitches(m), groups: m.scaleGroups,
  }));
  for (const availableHeight of [600, 900]) {
    for (const count of [1, 2]) {
      const height = fitMaqamNoteHeight(rows, availableHeight, count);
      assert.ok(height > 0);
      for (const column of splitMaqamColumns(rows, count)) {
        const used = column.reduce((sum, row) =>
          sum + getMaqamNotationLayout(row.pitches, row.groups, height).height,
          (column.length - 1) * MAQAM_ROW_GAP);
        assert.ok(used <= availableHeight + 1e-6);
      }
    }
    assert.ok(fitMaqamNoteHeight(rows, availableHeight, 2) >
      fitMaqamNoteHeight(rows, availableHeight, 1));
  }
});
