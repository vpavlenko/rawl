const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { isQuarterTonePitch } = require("../../src/components/rawl/pitchBend");
const { contrastingPitchColor } = require("../../src/components/rawl/colors");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");

const note = (pitch, extras = {}) => ({
  id: "quartertone", span: [0, 2], note: { midiNumber: pitch },
  voiceIndex: 0, isDrum: false, isActive: true,
  color: "noteColor_0_colors", colorPitchClass: 0, ...extras,
});
const render = (n) => renderToStaticMarkup(React.createElement(React.Fragment, null,
  getNoteRectangles([n], (pitch) => 600 - pitch * 10, 5,
    () => {}, () => {}, () => {}, (seconds) => seconds * 100, false, null)));

test("quartertone window includes 25–75 cents and excludes tuning drift", () => {
  for (const pitch of [60.25, 60.5, 60.75, 59.5, -0.5])
    assert.equal(isQuarterTonePitch(pitch), true, `${pitch}`);
  for (const pitch of [60, 60.249, 60.751, 59.99, NaN, Infinity])
    assert.equal(isQuarterTonePitch(pitch), false, `${pitch}`);
});

test("markers follow sounding pitch independently of tonic recoloring", () => {
  assert.match(render(note(63.5)), /data-quartertone="true"/);
  assert.match(render(note(63.5, { color: "fractional", colorPitchClass: 8.5 })), /color:white/);
  assert.doesNotMatch(render(note(64, { color: "fractional", colorPitchClass: 1.5 })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { isDrum: true })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { isActive: false })), /data-quartertone/);
});

test("bent markers sample midpoint pitch and follow its ribbon offset", () => {
  const bent = (value) => note(64, { pitchBend: [{ time: 0, value }] });
  const markup = render(bent(6144)); // E half-flat, -0.5 semitone.
  assert.match(markup, /data-quartertone="true"/);
  assert.match(markup, /top:calc\(50% \+ 5px\)/);
  assert.doesNotMatch(render(bent(8000)), /data-quartertone/);
  assert.match(render(note(64, { pitchBend: [
    { time: 0, value: 8192 }, { time: 1, value: 6144 },
  ] })), /data-quartertone="true"/);
});

test("marker contrast uses the interpolated fill, including wrapped pitches", () => {
  for (const pitch of [0, 4, 11, 10.5, 12]) assert.equal(contrastingPitchColor(pitch), "black");
  for (const pitch of [1, 5, 8, 8.5, -3.5]) assert.equal(contrastingPitchColor(pitch), "white");
});
