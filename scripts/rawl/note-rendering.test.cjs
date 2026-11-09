const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const { getNoteRectangles } = require("../../src/components/rawl/getNoteRectangles");

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
