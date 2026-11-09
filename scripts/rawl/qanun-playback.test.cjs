const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");

test("the recorded bank covers every book figure with at most one semitone of resampling", () => {
  const { existsSync } = require("node:fs");
  const path = require("node:path");
  const {
    MAQAM_SCALES,
  } = require("../../src/components/rawl/legends/maqamScales");
  const {
    QANUN_SAMPLES,
    nearestQanunSample,
  } = require("../../src/sampler/qanun");
  assert.equal(QANUN_SAMPLES.length, 18);
  for (const sample of QANUN_SAMPLES) {
    assert.ok(
      existsSync(path.join(__dirname, "../../public", sample.url)),
      sample.url,
    );
  }
  for (const maqam of MAQAM_SCALES) {
    for (const interval of [...maqam.lower, ...maqam.jins, ...maqam.scale]) {
      const midi = 60 + maqam.tonic + interval;
      assert.ok(
        Math.abs(nearestQanunSample(midi).midi - midi) <= 1,
        `${maqam.name}: ${midi}`,
      );
    }
  }
});

test("recorded qanun plucks preserve quarter tones without repeated attacks and cancel pending audio", async () => {
  const originals = {
    AudioContext: global.AudioContext,
    fetch: global.fetch,
    setTimeout: global.setTimeout,
    clearTimeout: global.clearTimeout,
  };
  const sources = [],
    events = new Map();
  const gainRamps = [];
  let nextId = 0,
    resolvePending,
    audioInstance;
  class AudioContext {
    constructor() {
      audioInstance = this;
    }
    currentTime = 10;
    destination = {};
    async resume() {}
    async decodeAudioData(data) {
      return { duration: 2, data, getChannelData: () => new Float32Array([0.2, -0.2]) };
    }
    createBufferSource() {
      const node = {
        playbackRate: {},
        starts: [],
        stops: [],
        connect() {},
        disconnect() {},
        start(time) {
          this.starts.push(time);
        },
        stop(time) {
          this.stops.push(time);
        },
      };
      sources.push(node);
      return node;
    }
    createGain() {
      return {
        gain: {
          setValueAtTime() {},
          linearRampToValueAtTime(value) { gainRamps.push(value); },
          exponentialRampToValueAtTime() {},
        },
        connect() {},
        disconnect() {},
      };
    }
  }
  global.AudioContext = AudioContext;
  global.setTimeout = (callback, time) => {
    events.set(++nextId, { callback, time });
    return nextId;
  };
  global.clearTimeout = (id) => events.delete(id);
  global.fetch = async (url) => {
    if (url.endsWith("qanun-F3.flac"))
      await new Promise((resolve) => {
        resolvePending = resolve;
      });
    return { ok: true, arrayBuffer: async () => new ArrayBuffer(4) };
  };
  const highlighted = [];
  let getPositionSeconds;
  try {
    const { playQanun } = require("../../src/sampler/qanun");
    const stop = playQanun(
      [69, 61.5],
      (index) => highlighted.push(index),
      () => assert.fail("audio error"),
      (getPosition) => {
        getPositionSeconds = getPosition;
      },
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(sources.length, 2);
    const levels = require("../../src/sampler/qanunLevels.json");
    assert.ok(Math.abs(gainRamps[0] * 0.2 - levels.samplePeak * levels.previewGain) < 1e-6,
      "quiet recordings are calibrated to the shared audible peak target");
    assert.equal(sources[0].playbackRate.value, 1);
    assert.equal(sources[1].playbackRate.value, 2 ** (0.5 / 12));
    assert.ok(
      Math.abs(sources[1].starts[0] - sources[0].starts[0] - 0.85) < 1e-9,
    );
    assert.ok(Math.abs(getPositionSeconds() + 0.04) < 1e-9);
    audioInstance.currentTime = sources[1].starts[0] + 0.2;
    assert.ok(
      Math.abs(getPositionSeconds() - 1.05) < 1e-9,
      "Rawl receives the audio clock position rather than a UI timer",
    );
    const fireAt = (milliseconds) =>
      [...events.values()]
        .find((event) => Math.abs(event.time - milliseconds) < 1)
        .callback();
    fireAt(40);
    fireAt(820);
    fireAt(890);
    assert.deepEqual(highlighted, [0, null, 1]);
    stop();
    assert.equal(events.size, 0);
    assert.ok(sources.every((source) => source.stops.length === 2));
    assert.equal(highlighted.at(-1), null);
    const blockHighlights = [];
    let blockClock;
    const stopBlocks = playQanun(
      [
        { midi: 69, start: 0, duration: 0.2 },
        { midi: 61.5, start: 1.02, duration: 0.2 },
      ],
      (index) => blockHighlights.push(index),
      () => assert.fail("audio error"),
      (getPosition) => {
        blockClock = getPosition;
      },
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(sources.length, 4);
    assert.ok(
      Math.abs(sources[3].starts[0] - sources[2].starts[0] - 1.02) < 1e-9,
    );
    assert.ok(
      Math.abs(sources[2].stops[0] - sources[2].starts[0] - 2) < 1e-9,
      "sustain lets the complete recording ring past its short attack window",
    );
    fireAt(40);
    fireAt(240);
    assert.deepEqual(blockHighlights, [0, null]);
    assert.equal(
      typeof blockClock,
      "function",
      "a silent block pause keeps the transport running",
    );
    stopBlocks();
    assert.equal(blockClock, null);
    assert.equal(events.size, 0);
    const pendingStop = playQanun(
      [53],
      () => {},
      () => assert.fail("audio error"),
    );
    await new Promise((resolve) => setImmediate(resolve));
    pendingStop();
    resolvePending();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      sources.length,
      4,
      "a cancelled download must not later start audio",
    );
    assert.equal(events.size, 0);
  } finally {
    Object.assign(global, originals);
  }
});
