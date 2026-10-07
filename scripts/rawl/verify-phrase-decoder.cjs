// Cross-language verification, including fixed-start and end-sentinel indexing.
const fs = require("fs");
const assert = require("node:assert/strict");
require("ts-node/register/transpile-only");
const { decodePhraseBoundaries } = require("../../src/harmony/phraseBoundaries.ts");
const fixtures = JSON.parse(fs.readFileSync(process.argv[2]));
for (const row of fixtures) {
  assert.deepEqual(
    decodePhraseBoundaries(row.probabilities, row.count, row.decoder, row.phraseLengths),
    row.expected,
    row.key,
  );
}
console.log(JSON.stringify({ crossLanguageDecoderFixtures: fixtures.length, matched: true }));
