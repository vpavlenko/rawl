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
  const jsdom = require("jsdom");
  const html = "<!doctype html><html><body></body></html>";
  global.document = jsdom.JSDOM
    ? new jsdom.JSDOM(html, { pretendToBeVisual: true }).window.document
    : jsdom.jsdom(html);
  global.window = document.defaultView;
  global.navigator = window.navigator;
  // jsdom 9 does not implement the DOM traversal used to release measure focus.
  if (!window.Element.prototype.closest) {
    window.Element.prototype.closest = function closest(selector) {
      let element = this;
      while (element && !element.matches(selector)) element = element.parentElement;
      return element;
    };
  }
  global.requestAnimationFrame = window.requestAnimationFrame = (callback) =>
    setTimeout(callback, 0);
  global.cancelAnimationFrame = window.cancelAnimationFrame = clearTimeout;
  const originalMessageChannel = global.MessageChannel;
  // Keep the jsdom scheduler from opening a persistent Node MessagePort.
  global.MessageChannel = undefined;
  const React = require("react");
  const { createRoot } = require("react-dom/client");
  const { flushSync } = require("react-dom");
  const { AnalysisGrid } = require("../../src/components/rawl/AnalysisGrid");
  const { AppContext } = require("../../src/components/AppContext");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const saves = [];
  const meters = [];
  let splits = 0, merges = 0;
  let root = null;
  const render = (groups = [], timing = grid, gridProps = {}, selectedMeasure = 1, measureOptions = {}) => {
    if (!root) root = createRoot(container);
    flushSync(() => root.render(
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
            selectedMeasure,
            selectMeasure() {},
            splitAtMeasure() { splits++; },
            mergeAtMeasure() { merges++; },
            setBeatsPerMeasure(value) { meters.push(value); },
            rhythmGrouping: groups,
            setRhythmGrouping: (value) => saves.push(value),
            ...measureOptions,
          },
          ...gridProps,
        }),
      ),
    ));
  };
  const unmount = () => {
    if (root) flushSync(() => root.unmount());
    root = null;
  };
  const change = (input, value) => flushSync(() => {
    // Use the native setter so React's value tracker sees a real browser edit.
    Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
      .set.call(input, value);
    input.dispatchEvent(new window.Event("input", { bubbles: true }));
  });
  const keyDown = (input, key, shiftKey = false) => flushSync(() =>
    input.dispatchEvent(new window.KeyboardEvent("keydown", {
      key, shiftKey, bubbles: true, cancelable: true,
    })),
  );
  const click = (element) => flushSync(() =>
    element.dispatchEvent(new window.MouseEvent("click", { bubbles: true })),
  );
  const button = (text) =>
    [...container.querySelectorAll("button")].find((element) =>
      element.textContent.startsWith(text),
    );
  const measureAction = (name) =>
    container.querySelector(`button.rawln-section-command[aria-label="${name}"]`);
  try {
    render([], grid, { phraseStarts: [1, 2] }, 2);
    const splitInput = container.querySelector('[aria-label="Rhythm"]');
    assert.equal(measureAction("Merge"), null);
    assert.ok(container.textContent.includes("/8"));
    keyDown(splitInput, "Enter", true);
    assert.equal(merges, 0);
    keyDown(splitInput, "Enter");
    assert.equal(splits, 1);
    click(measureAction("Split"));
    assert.equal(splits, 2);

    render([], grid, {
      analysis: { modulations: { 1: 0 }, sections: [0, 1] },
      phraseStarts: [1, 2],
      sectionSpan: [1, 3],
    }, 2);
    const mergeInput = container.querySelector('[aria-label="Rhythm"]');
    assert.equal(measureAction("Split"), null);
    assert.equal(container.textContent.includes("/8"), false);
    keyDown(mergeInput, "Enter");
    assert.equal(splits, 2);
    keyDown(mergeInput, "Enter", true);
    assert.equal(merges, 1);
    click(measureAction("Merge"));
    assert.equal(merges, 2);

    render();
    const input = container.querySelector('[aria-label="Rhythm"]');
    assert.ok(input);
    assert.equal(container.querySelectorAll('input[type="text"]').length, 1);
    assert.equal(button("Rhythm grouping"), undefined);
    keyDown(input, "Enter");
    keyDown(input, "Enter", true);
    assert.equal(splits, 2);
    assert.equal(merges, 2);
    assert.equal(measureAction("Split"), null);
    assert.equal(measureAction("Merge"), null);
    for (const value of ["3+0+2+3", "3+", "0", "2.5", "9007199254740992"]) {
      change(input, value);
      assert.equal(input.getAttribute("aria-invalid"), "true");
      keyDown(input, "Enter");
    }
    assert.deepEqual(saves, []);
    assert.deepEqual(meters, []);
    change(input, "3");
    keyDown(input, "Enter");
    assert.deepEqual(meters, [3]);
    assert.deepEqual(saves, []);
    keyDown(input, "+");
    assert.equal(document.activeElement, input);
    change(input, "3+2");
    keyDown(input, "Enter");
    assert.deepEqual(saves, [[3, 2]]);
    change(input, "3+2+2+3");
    assert.equal(input.getAttribute("aria-invalid"), "false");
    keyDown(input, "Enter");
    assert.deepEqual(saves, [[3, 2], [3, 2, 2, 3]]);
    assert.deepEqual(meters, [3]);
    unmount();
    render([3, 2, 2, 3]);
    const renderedBeats = [...container.querySelectorAll(".rawln-beat-bar")]
      .map((element) => Number.parseFloat(element.style.left));
    assert.deepEqual(
      renderedBeats,
      [300, 500, 700, 1300, 1500, 1700, 2300, 2500, 2700],
    );
    assert.equal(
      container.querySelector('[aria-label="Rhythm"]').placeholder,
      "3 or 3+2",
    );
    click(button("Reset"));
    assert.deepEqual(saves, [[3, 2], [3, 2, 2, 3], []]);

    // Regression: RAWL_DISPLAY beatsPerMeasure: 1 yields no beat timestamps.
    unmount();
    const hiddenGrid = { measures: grid.measures, beats: [] };
    render([], hiddenGrid);
    const hiddenInput = container.querySelector('[aria-label="Rhythm"]');
    change(hiddenInput, "3+2+2+3");
    keyDown(hiddenInput, "Enter");
    assert.deepEqual(saves.at(-1), [3, 2, 2, 3]);
    unmount();
    render([3, 2, 2, 3], hiddenGrid);
    const hiddenBeatPositions = [...container.querySelectorAll(".rawln-beat-bar")]
      .map((element) => Number.parseFloat(element.style.left));
    assert.deepEqual(
      hiddenBeatPositions,
      [300, 500, 700, 1300, 1500, 1700, 2300, 2500, 2700],
    );
    unmount();
    const formNames = [];
    const setFormPartName = (name) => formNames.push(name);
    render([], grid, {}, 1, { setFormPartName });
    const formInput = () => container.querySelector('[aria-label="Form part name"]');
    const rhythmInput = () => container.querySelector('[aria-label="Rhythm"]');
    const formButton = button("Form");
    assert.equal(rhythmInput().nextElementSibling, formButton);
    assert.ok(formButton.matches("[data-measure-toolbar] button"));
    assert.doesNotMatch(container.textContent, /Hover a note for tonic|Type beats/);
    const escapedKeys = [];
    const recordEscapedKey = (event) => escapedKeys.push(event.key);
    document.addEventListener("keydown", recordEscapedKey);
    try {
      keyDown(formButton, "Enter");
      keyDown(formButton, " ");
      assert.deepEqual(escapedKeys, []);
    } finally {
      document.removeEventListener("keydown", recordEscapedKey);
    }
    click(formButton);
    assert.doesNotMatch(container.textContent, /Enter to save|Clear to remove/);
    assert.equal(document.activeElement, formInput());
    assert.equal(formInput().value, "");
    change(formInput(), "Verse");
    click(button("Save"));
    assert.deepEqual(formNames, ["Verse"]);
    assert.equal(document.activeElement, rhythmInput());

    render([], grid, {}, 1, { setFormPartName, formPartName: "Verse" });
    keyDown(rhythmInput(), "f");
    assert.equal(formInput().value, "Verse");
    change(formInput(), "Refrain");
    click(button("Cancel"));
    assert.deepEqual(formNames, ["Verse"]);

    click(button("Form"));
    assert.equal(formInput().value, "Verse");
    change(formInput(), "");
    keyDown(formInput(), "Enter");
    assert.deepEqual(formNames, ["Verse", ""]);

    // A section can start at a nonzero x. Keep the measure position in that
    // coordinate system and carry only the tonic context into the new row.
    unmount();
    const section = {
      analysis: { modulations: { 1: 0, 2: 7 }, modulationOnset: { 2: 9.5 } },
      secondsToX: (time) => (time - 10) * 100 + 5,
      midiNumberToY: (pitch) => (72 - pitch) * 10,
      showTonalGrid: true,
      sectionSpan: [1, 2],
      playbackMeasure: 2,
    };
    render([], grid, section);
    const marker = container.querySelector('.rawln-modulation[data-continued="true"]');
    assert.ok(marker);
    assert.equal(marker.querySelector(".rawln-modulation-label").textContent, "G");
    assert.equal(marker.style.left, "4px");
    assert.ok(container.querySelector('[data-score-measure="2"]'));
    assert.equal(container.querySelector(".rawln-tonic-line").style.left, "5px");

    unmount();
    render([], grid, { ...section, showHeader: false, showPlaybackMeasureBottomBorder: true });
    assert.equal(container.querySelector("[data-score-measure]"), null);
    assert.equal(container.querySelector(".rawln-modulation"), null);
    assert.equal(container.querySelector(".rawln-bar").style.left, "4px");
    const playbackBorder = container.querySelector(".rawln-playback-measure").style;
    assert.equal(playbackBorder.borderBottomWidth, "1px");
    assert.equal(playbackBorder.borderTopWidth, "");
  } finally {
    unmount();
    container.remove();
    global.MessageChannel = originalMessageChannel;
    window.close();
  }
});
