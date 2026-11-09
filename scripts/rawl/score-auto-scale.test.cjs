const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const { getFittedSecondWidth } = require("../../src/components/rawl/scoreAutoScale.ts");
const { getSectionOffsets } = require("../../src/components/rawl/sectionAnchors.ts");

const section = (measureCount, offsetMeasures = 0, secondsPerMeasure = 2) => ({
  measureCount,
  offsetMeasures,
  durationSeconds: measureCount * secondsPerMeasure,
  offsetSeconds: offsetMeasures * secondsPerMeasure,
});

test("fits the anchored right edge even when its own section is shorter", () => {
  assert.equal(getFittedSecondWidth([section(16), section(8, 12)], 1200), 30);
});

test("34-bar threshold includes anchor padding and remains inclusive", () => {
  assert.equal(getFittedSecondWidth([section(16), section(8, 26)], 1360), 20);
  assert.equal(getFittedSecondWidth([section(16), section(8, 27)], 1360), 42.5);
  assert.equal(getFittedSecondWidth([section(35)], 1360), undefined);
});

test("preserves unanchored fitting, 300px per bar cap, and empty fallback", () => {
  assert.equal(getFittedSecondWidth([section(8), section(16)], 1600), 50);
  assert.equal(getFittedSecondWidth([section(1)], 1600), 150);
  assert.equal(getFittedSecondWidth([], 1600), undefined);
  assert.equal(getFittedSecondWidth([section(0)], 1600), undefined);
});

function anchoredSections(analysis, phrases, measures) {
  const offsets = getSectionOffsets(analysis, phrases, measures);
  const barOffsets = getSectionOffsets(analysis, phrases, measures.map((_, i) => i));
  return analysis.sections.map((phrase, index) => {
    const start = phrases[phrase] - 1;
    const end = (phrases[analysis.sections[index + 1]] ?? measures.length) - 1;
    return {
      measureCount: end - start,
      durationSeconds: measures[end] - measures[start],
      offsetSeconds: offsets[phrase],
      offsetMeasures: barOffsets[phrase],
    };
  });
}

test("anchor chains contribute their cumulative horizontal extent", () => {
  const sections = anchoredSections({
    sections: [0, 2, 4],
    sectionAnchors: {
      2: { section: 0, phrase: 1 },
      4: { section: 2, phrase: 3 },
    },
  }, [1, 9, 17, 25, 33, 41], Array.from({ length: 49 }, (_, i) => i * 2));
  assert.deepEqual(sections.map(s => s.offsetMeasures), [0, 8, 16]);
  assert.equal(getFittedSecondWidth(sections, 1280), 20);
});

test("end anchors use the right edge, including negative source offsets", () => {
  const sections = anchoredSections({
    sections: [0, 2],
    sectionAnchors: { 2: { section: 0, phrase: 0, edge: "end" } },
  }, [1, 9, 17, 25, 33], Array.from({ length: 41 }, (_, i) => i * 2));
  assert.equal(sections[1].offsetMeasures, -16);
  assert.equal(getFittedSecondWidth(sections, 1280), 40);
});

test("bar threshold uses bar positions independently of varying durations", () => {
  const measures = Array.from({ length: 35 }, (_, i) => i <= 26 ? i * 0.1 : 2.6 + (i - 26) * 10);
  const sections = anchoredSections({
    sections: [0, 2],
    sectionAnchors: { 2: { section: 0, phrase: 1 } },
  }, [1, 27, 28], measures);
  assert.equal(sections[1].offsetMeasures + sections[1].measureCount, 33);
  const width = getFittedSecondWidth(sections, 1280);
  assert.equal(width, 1280 / (2.6 + 70));
});
