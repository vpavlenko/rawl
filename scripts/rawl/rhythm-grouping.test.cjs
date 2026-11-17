const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const {
  getRhythmGrouping,
  getGroupedBeatLines,
  parseRhythmGrouping,
  sliceRhythmGrouping,
} = require("../../src/components/rawl/rhythmGrouping");
const { rehydrateAnalysis } = require("../../src/components/rawl/analysis");

const grid = {
  measures: [0, 10, 20, 30],
  beats: Array.from({ length: 29 }, (_, i) => i + 1).filter(
    (beat) => beat % 10,
  ),
};

test("only positive integer groups are accepted", () => {
  assert.deepEqual(parseRhythmGrouping(" 3 + 2+ 2 +3 "), [3, 2, 2, 3]);
  assert.deepEqual(parseRhythmGrouping("10"), [10]);
  for (const invalid of [
    "",
    "3++7",
    "3+",
    "0+10",
    "-2+12",
    "2.5+7.5",
    "3x7",
    "3e0+7",
    "9007199254740992",
  ]) {
    assert.equal(parseRhythmGrouping(invalid), null, invalid);
  }
});

test("3+2+2+3 draws only the internal grouping boundaries, without altering timing", () => {
  const before = JSON.stringify(grid);
  const changes = { 1: [3, 2, 2, 3] };
  const persisted = JSON.parse(JSON.stringify(changes));
  assert.deepEqual(
    getGroupedBeatLines(grid, persisted),
    [3, 5, 7, 13, 15, 17, 23, 25, 27],
  );
  assert.equal(JSON.stringify(grid), before);
  assert.equal(getGroupedBeatLines(grid, undefined), grid.beats);
});

test("change points inherit forward and Reset restores ordinary beats", () => {
  const changes = { 2: [3, 2, 2, 3], 3: [] };
  assert.deepEqual(getRhythmGrouping(changes, 1), []);
  assert.deepEqual(getRhythmGrouping(changes, 2), [3, 2, 2, 3]);
  assert.deepEqual(getRhythmGrouping(changes, 4), []);
  assert.deepEqual(getGroupedBeatLines(grid, changes), [
    ...grid.beats.filter((beat) => beat < 10),
    13,
    15,
    17,
    ...grid.beats.filter((beat) => beat > 20),
  ]);
});

test("group boundaries use existing expressive beat times", () => {
  const expressive = {
    measures: [0, 6],
    beats: [0.2, 0.7, 1.1, 1.9, 2.5, 3.6, 4.4, 5.1, 5.6],
  };
  assert.deepEqual(
    getGroupedBeatLines(expressive, { 1: [3, 2, 2, 3] }),
    [1.1, 2.5, 4.4],
  );
});

test("grouping can subdivide measures with a different or hidden beat grid", () => {
  const mixed = {
    measures: [0, 2, 12],
    beats: [
      1,
      ...grid.beats.filter((beat) => beat < 10).map((beat) => beat + 2),
    ],
  };
  assert.deepEqual(
    getGroupedBeatLines(mixed, { 1: [3, 2, 2, 3] }),
    [0.6, 1, 1.4, 5, 7, 9],
  );
  assert.deepEqual(
    getGroupedBeatLines(
      { measures: grid.measures, beats: [] },
      { 1: [3, 2, 2, 3] },
    ),
    [3, 5, 7, 13, 15, 17, 23, 25, 27],
  );
  assert.deepEqual(getGroupedBeatLines(grid, { 1: [2, 2] }), [5, 15, 25]);
});

test("malformed saved groups retain the normal grid", () => {
  for (const invalid of [
    [0, 10],
    [-1, 11],
    [2.5, 7.5],
    [Number.MAX_SAFE_INTEGER, 1],
  ]) {
    assert.deepEqual(getGroupedBeatLines(grid, { 1: invalid }), grid.beats);
  }
  assert.deepEqual(getGroupedBeatLines(grid, { 1: [10] }), []);
});

test("frozen excerpts retain the inherited grouping and later resets", () => {
  const sliced = sliceRhythmGrouping(
    { 1: [3, 2, 2, 3], 5: [], 8: [5, 5] },
    3,
    6,
  );
  assert.deepEqual(sliced, { 1: [3, 2, 2, 3], 3: [] });
  const { analysis } = rehydrateAnalysis(
    JSON.parse(
      JSON.stringify({
        modulations: { 1: 0 },
        rhythmGrouping: sliced,
        measuresAndBeats: {
          measures: [0, 1000, 1000, 1000],
          beats: [100, 100],
        },
      }),
    ),
    3,
  );
  assert.deepEqual(analysis.rhythmGrouping, { 3: [3, 2, 2, 3], 5: [] });
  assert.equal(sliceRhythmGrouping(undefined, 3, 6), undefined);
});

test("one measure input sets beats or grouping with Enter and retains split, merge and Reset", () => {
  global.document = require("jsdom").jsdom(
    "<!doctype html><html><body></body></html>",
  );
  global.window = document.defaultView;
  global.navigator = window.navigator;
  global.requestAnimationFrame = window.requestAnimationFrame = (callback) =>
    setTimeout(callback, 0);
  global.cancelAnimationFrame = window.cancelAnimationFrame = clearTimeout;
  const originalMessageChannel = global.MessageChannel;
  // React 16's browser scheduler otherwise opens a persistent Node MessagePort.
  global.MessageChannel = undefined;
  // AnalysisGrid needs only this runtime export from the full player.
  const rawlPath = require.resolve("../../src/components/rawl/Rawl");
  const originalRawl = require.cache[rawlPath];
  require.cache[rawlPath] = {
    exports: {
      getModulations: require("../../src/components/rawl/analysis")
        .getModulations,
    },
  };
  const React = require("react");
  const ReactDOM = require("react-dom");
  const { Simulate } = require("react-dom/test-utils");
  const { AnalysisGrid } = require("../../src/components/rawl/AnalysisGrid");
  const { AppContext } = require("../../src/components/AppContext");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const saves = [];
  const meters = [];
  let splits = 0, merges = 0;
  const render = (groups = [], timing = grid) =>
    ReactDOM.render(
      React.createElement(
        AppContext.Provider,
        { value: { hoveredMeasuresSpan: null } },
        React.createElement(AnalysisGrid, {
          analysis: {
            modulations: { 1: 0 },
            rhythmGrouping: groups.length ? { 1: groups } : undefined,
          },
          measuresAndBeats: timing,
          phraseStarts: [1],
          midiRange: [60, 72],
          midiNumberToY: () => 0,
          noteHeight: 10,
          secondsToX: (s) => s * 100,
          showTonalGrid: false,
          measureSelection: {
            selectedMeasure: 1,
            selectMeasure() {},
            splitAtMeasure() { splits++; },
            mergeAtMeasure() { merges++; },
            setBeatsPerMeasure(value) { meters.push(value); },
            rhythmGrouping: groups,
            setRhythmGrouping: (value) => saves.push(value),
          },
        }),
      ),
      container,
    );
  const button = (text) =>
    [...container.querySelectorAll("button")].find((element) =>
      element.textContent.startsWith(text),
    );
  try {
    render();
    const input = container.querySelector('[aria-label="Rhythm"]');
    assert.ok(input);
    assert.equal(container.querySelectorAll('input[type="text"]').length, 1);
    assert.equal(button("Rhythm grouping"), undefined);
    Simulate.keyDown(input, { key: "Enter", nativeEvent: {} });
    Simulate.keyDown(input, { key: "Enter", shiftKey: true, nativeEvent: {} });
    assert.equal(splits, 1);
    assert.equal(merges, 1);
    for (const value of ["3+0+2+3", "3+", "0", "2.5", "9007199254740992"]) {
      Simulate.change(input, { target: { value } });
      assert.equal(input.getAttribute("aria-invalid"), "true");
      Simulate.keyDown(input, { key: "Enter", nativeEvent: {} });
    }
    assert.deepEqual(saves, []);
    assert.deepEqual(meters, []);
    Simulate.change(input, { target: { value: "3" } });
    Simulate.keyDown(input, { key: "Enter", nativeEvent: {} });
    assert.deepEqual(meters, [3]);
    assert.deepEqual(saves, []);
    Simulate.keyDown(input, { key: "+", nativeEvent: {} });
    assert.equal(document.activeElement, input);
    Simulate.change(input, { target: { value: "3+2" } });
    Simulate.keyDown(input, { key: "Enter", nativeEvent: {} });
    assert.deepEqual(saves, [[3, 2]]);
    Simulate.change(input, { target: { value: "3+2+2+3" } });
    assert.equal(input.getAttribute("aria-invalid"), "false");
    Simulate.keyDown(input, { key: "Enter", nativeEvent: {} });
    assert.deepEqual(saves, [[3, 2], [3, 2, 2, 3]]);
    assert.deepEqual(meters, [3]);
    ReactDOM.unmountComponentAtNode(container);
    render([3, 2, 2, 3]);
    const renderedBeats = [...container.querySelectorAll("div")]
      .filter(
        (element) =>
          element.style.zIndex === "2" &&
          element.style.pointerEvents === "none",
      )
      .map((element) => Number.parseFloat(element.style.left));
    assert.deepEqual(
      renderedBeats,
      [300, 500, 700, 1300, 1500, 1700, 2300, 2500, 2700],
    );
    assert.equal(
      container.querySelector('[aria-label="Rhythm"]').placeholder,
      "3 or 3+2",
    );
    Simulate.click(button("Reset"));
    assert.deepEqual(saves, [[3, 2], [3, 2, 2, 3], []]);

    // Regression: RAWL_DISPLAY beatsPerMeasure: 1 yields no beat timestamps.
    ReactDOM.unmountComponentAtNode(container);
    const hiddenGrid = { measures: grid.measures, beats: [] };
    render([], hiddenGrid);
    const hiddenInput = container.querySelector('[aria-label="Rhythm"]');
    Simulate.change(hiddenInput, { target: { value: "3+2+2+3" } });
    Simulate.keyDown(hiddenInput, { key: "Enter", nativeEvent: {} });
    assert.deepEqual(saves.at(-1), [3, 2, 2, 3]);
    ReactDOM.unmountComponentAtNode(container);
    render([3, 2, 2, 3], hiddenGrid);
    const hiddenBeatPositions = [...container.querySelectorAll("div")]
      .filter(
        (element) =>
          element.style.zIndex === "2" &&
          element.style.pointerEvents === "none",
      )
      .map((element) => Number.parseFloat(element.style.left));
    assert.deepEqual(
      hiddenBeatPositions,
      [300, 500, 700, 1300, 1500, 1700, 2300, 2500, 2700],
    );
  } finally {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    if (originalRawl) require.cache[rawlPath] = originalRawl;
    else delete require.cache[rawlPath];
    global.MessageChannel = originalMessageChannel;
    window.close();
  }
});
