const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { getPitchBendSamples, getNotePitchAtTime } = require("../../src/components/rawl/pitchBend");
const { getHoverTonicPreview, getHoverColorPitchClass } = require("../../src/components/rawl/hoverTonic");
const { interpolatedPitchColor } = require("../../src/components/rawl/colors");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");

const note = (midiNumber, span = [0, 2], pitchBend) => ({
  id: "test", note: { midiNumber }, span, pitchBend, isDrum: false, voiceIndex: 0,
});
const analysis = (modulations, modulationOnset) => ({ modulations, modulationOnset });
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10,
  `${actual} != ${expected}`);

test("the last onset bend wins over inherited state, without mutating source points", () => {
  const points = [{ time: 1, value: 7437 }, { time: 1, value: 6510 },
    { time: NaN, value: 8192 }, { time: 2, value: 8192 }];
  const original = structuredClone(points);
  const n = note(47, [1, 2], points);
  assert.deepEqual(getPitchBendSamples(points, n.span), [
    { time: 1, bend: -1682 / 4096 }, { time: 2, bend: -1682 / 4096 },
  ]);
  near(getNotePitchAtTime(n, 1.8), 46.58935546875);
  assert.deepEqual(points, original);
});

test("moving hover matches the ribbon interpolation and clamps at note endpoints", () => {
  const n = note(60, [1, 3], [{ time: 1, value: 8192 }, { time: 2, value: 12288 }]);
  near(getNotePitchAtTime(n, 0), 60);
  near(getNotePitchAtTime(n, 1.25), 60.25);
  near(getNotePitchAtTime(n, 1.75), 60.75);
  near(getNotePitchAtTime(n, 4), 61);
  assert.equal(getNotePitchAtTime({ ...n, isDrum: true }, 2), 60);
  assert.equal(getNotePitchAtTime(note(64), 1), 64);
});

test("bent tonic and octave are white, its exact fifth is gray, and unbent notes interpolate", () => {
  const tonic = note(60, [0, 2], [{ time: 0, value: 9216 }]); // C +25 cents
  const preview = getHoverTonicPreview(tonic, getNotePitchAtTime(tonic), 1,
    analysis({ 1: 0 }), [0, 4]);
  for (const midi of [60, 72, 67]) {
    const n = note(midi, [0, 2], tonic.pitchBend);
    const relative = getHoverColorPitchClass(n, preview) + (getNotePitchAtTime(n) - midi);
    near(relative % 12, midi === 67 ? 7 : 0);
  }
  near(getHoverColorPitchClass(note(67), preview), 6.75);
  near(getHoverColorPitchClass(note(60), preview), 11.75);
  assert.equal(interpolatedPitchColor(0), "var(--pitch-color-0)");
  assert.equal(interpolatedPitchColor(6.75),
    "color-mix(in srgb, var(--pitch-color-6) 25%, var(--pitch-color-7))");
  assert.equal(getHoverColorPitchClass({ ...tonic, isDrum: true }, preview), null);
  assert.equal(getHoverTonicPreview(note(60), 60, 1, analysis({ 1: 0 }), [0, 4]), null);
});

test("preview respects onset boundaries and stops at the next saved tonic even when its base matches", () => {
  const source = analysis({ 1: 0, 3: 7, 5: 0 }, { 3: 7.5, 5: 15.5 });
  const original = structuredClone(source);
  const preview = getHoverTonicPreview(note(60), 60.25, 3, source, [0, 4, 8, 12, 16, 20]);
  assert.deepEqual(preview, { pitch: 60.25, start: 7.5, end: 15.5 });
  assert.equal(getHoverColorPitchClass(note(60, [7, 8]), preview), null);
  near(getHoverColorPitchClass(note(60, [7.5, 8]), preview), 11.75);
  near(getHoverColorPitchClass(note(60, [15, 16]), preview), 11.75);
  assert.equal(getHoverColorPitchClass(note(60, [15.5, 16.5]), preview), null);
  assert.deepEqual(source, original);
});

const render = (n) => renderToStaticMarkup(React.createElement(React.Fragment, null,
  getNoteRectangles([{ ...n, color: `noteColor_${n.colorPitchClass}_colors`, isActive: true }],
    (pitch) => 100 - pitch, 3, () => {}, () => {}, () => {}, (seconds) => seconds * 100,
    false, null)));

test("rendered bent tonic uses white and a regular note receives an interpolated background", () => {
  const tonic = note(60, [0, 2], [{ time: 0, value: 8192 }, { time: 0, value: 9216 }]);
  const preview = getHoverTonicPreview(tonic, 60.25, 1, analysis({ 1: 0 }), [0, 4]);
  const bent = render({ ...tonic, colorPitchClass: getHoverColorPitchClass(tonic, preview) });
  assert.match(bent, /noteColor_0_colors/);
  assert.doesNotMatch(bent, /<svg/);
  assert.doesNotMatch(bent, /color-mix/);
  const regular = render({ ...note(67), colorPitchClass: getHoverColorPitchClass(note(67), preview) });
  assert.match(regular, /fractional-pitch-note/);
  assert.match(regular, /background-color:color-mix\(in srgb, var\(--pitch-color-6\) 25%, var\(--pitch-color-7\)\)/);
  assert.doesNotMatch(regular, /noteColor_6.75_colors/);
});
