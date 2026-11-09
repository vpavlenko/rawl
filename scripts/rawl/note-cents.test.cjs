const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const { getNoteCentsFromTonic } = require("../../src/components/rawl/noteCents");

const note = (midiNumber, pitchBend) => ({
  note: { midiNumber }, span: [0, 2], pitchBend, isDrum: false,
});
const cents = (n, tonic = 0, time = 0) =>
  getNoteCentsFromTonic(n, time, { modulations: { 1: tonic } }, [0, 4]);

test("whole cents wrap above and below the tonic into -50 through 1149", () => {
  assert.equal(cents(note(60)), 0);
  assert.equal(cents(note(72)), 0);
  assert.equal(cents(note(59)), 1100);
  assert.equal(cents(note(60), 7), 500);
  assert.equal(cents(note(59.99)), -1);
  assert.equal(cents(note(59.999)), 0);
  assert.equal(cents(note(60.001)), 0);
  assert.equal(cents(note(59.5)), -50);
  assert.equal(cents(note(59.49)), 1149);
  assert.equal(cents(note(71.49)), 1149);
  assert.equal(cents(note(71.5)), -50);
  assert.equal(cents(note(62.43)), 243);
  for (let distance = -3000; distance <= 3000; distance++) {
    const actual = cents(note(60 + distance / 100));
    assert.ok(actual >= -50 && actual <= 1149);
    assert.equal((actual - distance) % 1200 === 0, true);
  }
});

test("cents track the exact bend at the pointer including duplicate onset bends", () => {
  const n = note(60, [
    { time: 0, value: 8192 }, { time: 0, value: 7168 },
    { time: 1, value: 9216 },
  ]);
  assert.equal(cents(n), -25);
  assert.equal(cents(n, 0, 0.5), 0);
  assert.equal(cents(n, 0, 1), 25);
});

test("the note's tonic region follows saved modulation onsets; unknown tonics and drums have no value", () => {
  const analysis = { modulations: { 1: 0, 2: 7 }, modulationOnset: { 2: 1.5 } };
  assert.equal(getNoteCentsFromTonic(note(60), 0, analysis, [0, 4, 8]), 0);
  assert.equal(getNoteCentsFromTonic({ ...note(60), span: [2, 3] }, 2, analysis, [0, 4, 8]), 500);
  assert.equal(getNoteCentsFromTonic(note(60), 0, { modulations: {} }, [0, 4]), null);
  assert.equal(cents({ ...note(60), isDrum: true }), null);
});

test("tooltip renders two decimal semitones without a suffix", () => {
  const React = require("react");
  const ReactDOM = require("react-dom");
  const { renderToStaticMarkup } = require("react-dom/server");
  const originalPortal = ReactDOM.createPortal;
  const originalWindow = global.window, originalDocument = global.document;
  ReactDOM.createPortal = node => node;
  global.window = { innerWidth: 1024, innerHeight: 768 };
  global.document = { body: {} };
  try {
    const Tooltip = require("../../src/components/rawl/NoteCentsTooltip").default;
    for (const [value, label] of [[243, "2.43"], [-50, "-0.50"], [1149, "11.49"], [0, "0.00"]]) {
      const html = renderToStaticMarkup(React.createElement(Tooltip, { cents: value, x: 20, y: 20 }));
      assert.equal(html.slice(html.indexOf(">") + 1, html.lastIndexOf("<")), label);
    }
  } finally {
    ReactDOM.createPortal = originalPortal;
    global.window = originalWindow; global.document = originalDocument;
  }
});
