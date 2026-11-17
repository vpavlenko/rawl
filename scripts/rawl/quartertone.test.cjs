const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { isQuarterTonePitch, getStaticPitchBend, getQuarterToneMarkerPosition } = require("../../src/components/rawl/pitchBend");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");
const { getMaqamNotationLayout } = require("../../src/components/rawl/legends/maqamNotationLayout");
const { notePitchDotClass } = require("../../src/components/rawl/colors");

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

test("shade-pair quartertones have one dot below; other intervals have one dot above", () => {
  for (let lower = -12; lower < 24; lower++) {
    const pitch = lower + 0.5;
    const sameShadePair = [1, 3, 5, 8, 10].includes(((lower % 12) + 12) % 12);
    const position = sameShadePair ? "below" : "above";
    assert.equal(getQuarterToneMarkerPosition(pitch), position);
    const markup = render(note(63.5, { colorPitchClass: pitch }));
    assert.equal((markup.match(/data-quartertone="true"/g) || []).length, 1);
    assert.equal((markup.match(/width:1px;height:1px;background:white/g) || []).length, 1);
    assert.ok(markup.includes(`data-quartertone-position="${position}"`));
    assert.ok(markup.includes(sameShadePair ? "top:calc(100% + 2px)" : "top:-2px"));
    assert.match(markup, /border-radius:50%/);
    assert.doesNotMatch(markup, /<svg/);
  }
  for (const pitch of [0, 1, 3.2, 8.8, NaN, Infinity])
    assert.equal(getQuarterToneMarkerPosition(pitch), null);
});

test("b2 and #4 tolerance windows use the standard inside dot, including their boundaries", () => {
  for (const octave of [-24, -12, 0, 12, 60]) {
    for (const center of [1, 6]) {
      for (const offset of [-0.25, -0.125, 0, 0.125, 0.25]) {
        const pitch = octave + center + offset;
        assert.equal(notePitchDotClass(pitch), `pitchDot_${center}`);
        const markup = render(note(60 + center, { colorPitchClass: pitch }));
        assert.match(markup, new RegExp(`pitchDot_${center}`));
        assert.doesNotMatch(markup, /data-quartertone/);
      }
      for (const offset of [-0.25001, 0.25001])
        assert.equal(notePitchDotClass(octave + center + offset), "");
    }
  }
  for (const pitch of [0, 2, 3, 4, 5, 7, 8, 9, 10, 11, NaN, Infinity])
    assert.equal(notePitchDotClass(pitch), "");
});

test("inside dots follow the colored sounding interval and preserve real bends", () => {
  assert.doesNotMatch(render(note(61)), /pitchDot_/);
  assert.doesNotMatch(render(note(61, { colorPitchClass: "default" })), /pitchDot_/);
  assert.doesNotMatch(render(note(61, { colorPitchClass: 1, isDrum: true })), /pitchDot_/);
  const bent = note(66, { colorPitchClass: 6.5, pitchBend: [{ time: 0, value: 6144 }] });
  const before = JSON.stringify(bent);
  for (const isPlayingNow of [false, true]) {
    const markup = render({ ...bent, isPlayingNow });
    assert.match(markup, /pitchDot_6/);
    assert.doesNotMatch(markup, /data-quartertone/);
  }
  assert.equal(JSON.stringify(bent), before);
  const moving = render(note(60, { pitchBend: [
    { time: 0, value: 8192 }, { time: 1, value: 12288 },
  ] }));
  assert.match(moving, /pitch-bend-note/);
  assert.match(moving, /pitchDot_1/);
  assert.match(moving, /--pitch-dot-offset:-10px/);
  assert.doesNotMatch(moving, /data-quartertone/);
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
  assert.match(moving, /data-quartertone-position="above"/);
  assert.match(moving, /top:3px/);
});

test("quartertone dots follow their corresponding edge when playback doubles note height", () => {
  for (const [n, position] of [
    [note(63.5, { colorPitchClass: 3.5 }), "below"],
    [note(64, { pitchBend: [{ time: 0, value: 6144 }] }), "above"],
  ]) {
    const idle = render(n), playing = render({ ...n, isPlayingNow: true });
    assert.match(idle, /height:10px[^>]*top:-40px/);
    assert.match(playing, /height:20px[^>]*top:-50px/);
    for (const markup of [idle, playing]) {
      assert.ok(markup.includes(`data-quartertone-position="${position}"`));
      assert.match(markup, position === "below"
        ? /data-quartertone="true"[^>]*top:calc\(100% \+ 2px\)/
        : /data-quartertone="true"[^>]*top:-2px/);
    }
  }
});

test("notation reserves space for a dot above and below its outer notes", () => {
  for (const noteHeight of [0.5, 3.5, 5, 10]) {
    const pitches = [-3.5, -1.5, 0, 1.5, 3, 5];
    const layout = getMaqamNotationLayout(pitches, [], noteHeight);
    const lowestNoteBottom = (5 + 3.5 + 1) * noteHeight + layout.topPadding;
    assert.ok(layout.height - lowestNoteBottom >= 2.5);
    assert.ok(layout.topPadding - noteHeight - 2.5 >= 0);
  }
});
