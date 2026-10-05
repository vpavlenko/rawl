// Run: node scripts/rawl/check-section-modulations.cjs
require('ts-node/register/transpile-only');
const assert = require('node:assert/strict');
const { repeatSectionModulations } = require('../../src/components/rawl/repeatSectionModulations');

// Inner Urge: a one-bar intro, 24-bar sections, an eight-bar section,
// then more 24-bar sections and a nine-bar ending.
const analysis = {
  modulations: { 1: 6, 10: 9, 14: 1, 18: 11, 22: 7, 26: 6, 578: 11, 582: 7 },
  phrasePatch: [{ measure: 1, diff: 1 }],
  sections: [0, 1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73,
    79, 85, 91, 97, 103, 109, 115, 117, 123, 129, 135, 141, 147],
};
const measures = Array.from({ length: 596 }, (_, i) => i * 2);
const result = repeatSectionModulations(analysis, measures, 2);
assert.equal(result.modulations[34], 9);
assert.equal(result.modulations[50], 6);
assert.equal(result.modulations[458], 6);
assert.equal(result.modulations[466], 6); // Restart after the short section.
assert.equal(result.modulations[474], 9);
assert.equal(result.modulations[478], 1);
assert.equal(result.modulations[482], 11);
assert.equal(result.modulations[486], 7);
assert.equal(result.modulations[490], 6); // Later sections retain their alignment.
assert.equal(result.modulations[498], 9);
assert.equal(result.modulations[586], 6);
assert.equal(result.modulations[594], 9);
assert.equal(result.modulations[598], undefined);
assert.equal(analysis.modulations[34], undefined);
assert.equal(repeatSectionModulations(analysis, measures, 3), null);
assert.equal(repeatSectionModulations(analysis, measures, 586), null);

const withOnsets = { ...analysis, modulationOnset: { 10: 17, 14: 26.5, 466: 123 } };
const copiedOnsets = repeatSectionModulations(withOnsets, measures, 2);
assert.equal(copiedOnsets.modulationOnset[474], 945);
assert.equal(copiedOnsets.modulationOnset[478], 954.5);
assert.equal(copiedOnsets.modulationOnset[466], undefined);
assert.equal(copiedOnsets.modulationOnset[10], 17);
console.log('Section modulation checks passed, including restart after incomplete sections.');
