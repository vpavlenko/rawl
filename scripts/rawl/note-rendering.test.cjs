const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");
const { instrumentVoiceShapeIndex, groupInstrumentRows, toggleInstrumentMask, soloInstrumentMask } = require("../../src/components/rawl/instrumentVoiceGroups");

const note = (id, span, extras = {}) => ({
  id, span, note: { midiNumber: 60 }, voiceIndex: 0,
  isDrum: false, isActive: true,
  color: "noteColor_1_colors", colorPitchClass: 1,
  ...extras,
});
const renderOptions = [
  (pitch) => 100 - pitch, 3,
  () => {}, () => {}, () => {}, (seconds) => seconds * 100,
  false, null, false, () => 20,
];
const render = (notes) => getNoteRectangles(notes, ...renderOptions);

test("grouped instrument notes share a shape while keeping source identities", () => {
  const names = ["Qanun", "Violin", " Qanun "];
  const notes = names.map((_, voiceIndex) => note(`source-${voiceIndex}`, [0, 2], {
    voiceIndex,
    displayVoiceIndex: instrumentVoiceShapeIndex(names, voiceIndex, "samai-bayati-qadim", true),
  }));
  const markup = renderToStaticMarkup(React.createElement(React.Fragment, null, render(notes)));
  assert.equal((markup.match(/voiceShape-0/g) || []).length, 2);
  assert.equal((markup.match(/voiceShape-1/g) || []).length, 1);
  assert.doesNotMatch(markup, /voiceShape-2/);
  assert.deepEqual(notes.map(n => [n.id, n.voiceIndex]), [
    ["source-0", 0], ["source-1", 1], ["source-2", 2],
  ]);
  assert.equal(instrumentVoiceShapeIndex(names, 2, "other-piece"), 2);
  assert.equal(instrumentVoiceShapeIndex(names, 2, "fazil-say-istanbul-symphony-01-allegro"), 0);
  assert.match(renderToStaticMarkup(React.createElement(React.Fragment, null,
    render([note("ungrouped", [0, 2], { voiceIndex: 2 })]))), /voiceShape-2/);
});

test("Arabic tuning channels share note shapes, dots and one instrument control for any piece", () => {
  const names = ["Qanun", "Qanun", "Violin"];
  for (const slug of ["samai-bayati-qadim", "rawhi-al-khammash-samai-nahawand", "another-arabic-piece"]) {
    const notes = names.map((_, voiceIndex) => note(`arabic-${voiceIndex}`, [0, 2], {
      voiceIndex,
      pitchBend: [{ time: 0, value: 6144 }],
      displayVoiceIndex: instrumentVoiceShapeIndex(names, voiceIndex, slug, true),
    }));
    const markup = renderToStaticMarkup(React.createElement(React.Fragment, null, render(notes)));
    assert.equal((markup.match(/voiceShape-0/g) || []).length, 2);
    assert.doesNotMatch(markup, /voiceShape-1/);
    assert.match(markup, /voiceShape-2/);
    assert.equal((markup.match(/data-quartertone="true"/g) || []).length, 3);
    assert.deepEqual(notes.map(n => n.voiceIndex), [0, 1, 2]);
    assert.ok(notes.every(n => n.pitchBend[0].value === 6144));
    const rows = groupInstrumentRows(notes, names, slug, [], true);
    assert.deepEqual(rows.map(row => row.voiceMembers), [[0, 1], [2]]);
    assert.deepEqual(toggleInstrumentMask([true, true, true], rows[0].voiceMembers, [true, true, true]), [false, false, true]);
    assert.deepEqual(soloInstrumentMask([true, true, true], rows[0].voiceMembers, [true, true, true]), [true, true, false]);
  }
});

test("zero-duration pitched and drum notes produce no elements, including extended display spans", () => {
  const notes = [
    note("pitched", [1, 1]),
    note("drum", [1, 1], { isDrum: true }),
    note("extended", [1, 1], { displaySpan: [1, 2] }),
    note("reversed", [2, 1]),
  ];
  assert.equal(renderToStaticMarkup(React.createElement(React.Fragment, null, render(notes))), "");
  assert.equal(notes.length, 4);
});

test("a same-onset zero-duration duplicate is skipped while arbitrarily short positive notes remain", () => {
  const short = note("short", [1, 1.000001]);
  const drum = note("drum", [1, 1.000001], { isDrum: true });
  const mixed = render([note("duplicate", [1, 1]), short, drum]);
  assert.deepEqual(mixed.map((element) => element.props.note), [short, drum]);
  assert.deepEqual(mixed, render([short, drum]));
});
