const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { isQuarterTonePitch, getStaticPitchBend } = require("../../src/components/rawl/pitchBend");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");
const { getMaqamNotationLayout } = require("../../src/components/rawl/legends/maqamNotationLayout");

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

test("markers follow the currently colored interval rather than absolute MIDI tuning", () => {
  assert.match(render(note(63.5, { colorPitchClass: 3.5 })), /data-quartertone="true"/);
  assert.match(render(note(63.5, { color: "fractional", colorPitchClass: 8.5 })), /background:white/);
  assert.match(render(note(64, { color: "fractional", colorPitchClass: 1.5 })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { colorPitchClass: 0 })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { colorPitchClass: "default" })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { colorPitchClass: 3.5, isDrum: true })), /data-quartertone/);
  assert.doesNotMatch(render(note(63.5, { colorPitchClass: 3.5, isActive: false })), /data-quartertone/);
  const bend = [{ time: 0, value: 6144 }];
  assert.match(render(note(64, { colorPitchClass: 0, pitchBend: bend })), /data-quartertone/);
  assert.doesNotMatch(render(note(64, { colorPitchClass: 0.5, pitchBend: bend })), /data-quartertone/);
});

test("static bent notes use standard rectangles at the sounding pitch", () => {
  const bent = (value) => note(64, { pitchBend: [{ time: 0, value }] });
  const markup = render(bent(6144)); // E half-flat, -0.5 semitone.
  assert.match(markup, /data-quartertone="true"/);
  assert.match(markup, /top:-40px/);
  assert.match(markup, /voiceShape-0/);
  assert.doesNotMatch(markup, /<svg|pitch-bend-note/);
  assert.match(markup, /var\(--pitch-color-11\) 50%, var\(--pitch-color-0\)/);
  assert.doesNotMatch(render(bent(8000)), /data-quartertone/);
  assert.match(render(note(64, { pitchBend: [
    { time: 0, value: 8192 }, { time: 1, value: 6144 },
  ] })), /data-quartertone="true"/);
});

test("white dots sit at the former tick center below every fill", () => {
  for (const colorPitchClass of [0.5, 1.5, 4.5, 8.5, 11.5]) {
    const markup = render(note(63.5, { colorPitchClass }));
    assert.match(markup, /data-quartertone="true"[^>]*top:calc\(100% \+ 2px\)[^>]*width:2px[^>]*height:2px[^>]*background:white/);
    assert.match(markup, /border-radius:50%/);
    assert.match(markup, /translate\(-50%, -50%\)/);
    assert.doesNotMatch(markup, /<svg/);
  }
});

test("static detection coalesces onset state and repeated bends but preserves every real change", () => {
  assert.equal(getStaticPitchBend(note(64, { pitchBend: [
    { time: 0, value: 8192 }, { time: 0, value: 6144 },
    { time: 1, value: 6144 }, { time: 2, value: 8192 },
  ] })), -0.5);
  assert.equal(getStaticPitchBend(note(64, { pitchBend: [
    { time: 0, value: 6144 }, { time: 1, value: 6145 },
  ] })), null);
  assert.equal(getStaticPitchBend(note(64)), 0);
  const moving = render(note(64, { pitchBend: [
    { time: 0, value: 8192 }, { time: 1, value: 6144 },
  ] }));
  assert.match(moving, /pitch-bend-note/);
  assert.match(moving, /<svg/);
  assert.match(moving, /top:calc\(100% \+ 7px\)/);
});

test("quartertone dots stay fixed when direct playback doubles note height", () => {
  for (const n of [note(63.5, { colorPitchClass: 3.5 }), note(64, { pitchBend: [{ time: 0, value: 6144 }] })]) {
    const idle = render(n), playing = render({ ...n, isPlayingNow: true });
    assert.match(idle, /height:10px[^>]*top:-40px/);
    assert.match(playing, /height:20px[^>]*top:-50px/);
    for (const markup of [idle, playing])
      assert.match(markup, /data-quartertone="true"[^>]*top:calc\(100% \+ 2px\)/);
  }
});

test("notation reserves space for the full dot below its lowest note", () => {
  for (const noteHeight of [3.5, 5, 10]) {
    const pitches = [-3.5, -1.5, 0, 1.5, 3, 5];
    const layout = getMaqamNotationLayout(pitches, [], noteHeight);
    const lowestNoteBottom = (5 + 3.5 + 1) * noteHeight + layout.topPadding;
    assert.ok(layout.height - lowestNoteBottom >= 3);
  }
});
