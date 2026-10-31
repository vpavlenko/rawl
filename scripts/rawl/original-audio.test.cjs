const assert = require("node:assert/strict");
const { test } = require("node:test");
require("ts-node/register/transpile-only");
const OriginalAudio = require("../../src/audio/OriginalAudio").default;
class Audio extends EventTarget {
  paused = true;
  currentTime = 0;
  readyState = 0;
  playbackRate = 1;
  getAttribute(name) {
    return this[name] || null;
  }
  removeAttribute(name) {
    delete this[name];
  }
  play() {
    this.paused = false;
    return this.nextPlay || Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  load() {
    this.currentTime = 0;
    this.readyState = 0;
  }
  remove() {}
}
function fixture() {
  const audio = new Audio(),
    states = [],
    failures = [];
  const controller = new OriginalAudio(
    audio,
    { createMediaElementSource: () => ({ connect() {}, disconnect() {} }) },
    {},
    (s) => states.push(s),
    (...args) => failures.push(args),
  );
  return { audio, controller, states, failures };
}
test("switching paused preserves the seek and does not start audio; tempo preserves pitch", () => {
  const { audio, controller } = fixture();
  controller.activate("recording", 42345, false, 0.75);
  assert.equal(audio.paused, true);
  assert.equal(controller.getPositionMs(), 42345);
  audio.readyState = 1;
  audio.dispatchEvent(new Event("loadedmetadata"));
  assert.equal(audio.currentTime, 42.345);
  assert.equal(audio.playbackRate, 0.75);
  assert.equal(audio.preservesPitch, true);
});
test("the recording is the only clock and seeking works while playing and paused", () => {
  const { audio, controller } = fixture();
  audio.readyState = 4;
  controller.activate("recording", 10000, true, 1);
  audio.currentTime = 12.25;
  assert.equal(controller.getPositionMs(), 12250);
  controller.seekMs(30000);
  assert.equal(audio.currentTime, 30);
  controller.setPaused(true);
  controller.seekMs(50000);
  assert.equal(controller.getPositionMs(), 50000);
  assert.equal(controller.isPlaying(), false);
});
test("a stale play rejection after switching or pausing cannot restart/fail playback", async () => {
  const { audio, controller, failures } = fixture();
  let reject;
  audio.nextPlay = new Promise((_, r) => (reject = r));
  controller.activate("recording", 0, true, 1);
  controller.deactivate();
  reject(new Error("aborted"));
  await Promise.resolve();
  assert.deepEqual(failures, []);
  assert.equal(audio.paused, true);
});
test("play failures preserve position/intent for MIDI fallback and remain retryable", async () => {
  const { audio, controller, states, failures } = fixture();
  audio.nextPlay = Promise.reject(new Error("network"));
  controller.activate("recording", 12500, true, 1);
  await Promise.resolve();
  assert.deepEqual(failures, [[12500, true]]);
  assert.equal(controller.isActive(), false);
  assert.equal(states.at(-1).error, true);
  audio.nextPlay = Promise.resolve();
  controller.activate("recording", 12500, false, 1);
  assert.equal(states.at(-1).error, false);
  assert.equal(audio.paused, true);
});
test("end and reset stop transport; dispose detaches late media events", () => {
  const { audio, controller, states, failures } = fixture();
  controller.activate("recording", 0, true, 1);
  audio.dispatchEvent(new Event("ended"));
  assert.equal(controller.isPlaying(), false);
  controller.reset();
  assert.equal(controller.isActive(), false);
  assert.equal(audio.getAttribute("src"), null);
  controller.dispose();
  const count = states.length;
  audio.dispatchEvent(new Event("error"));
  assert.equal(states.length, count);
  assert.deepEqual(failures, []);
});

test("blocked autoplay keeps the original selected and paused until Play", async () => {
  const { audio, controller, states, failures } = fixture();
  audio.nextPlay = Promise.reject(Object.assign(new Error("gesture required"), { name: "NotAllowedError" }));
  controller.activate("recording", 0, true, 1);
  await Promise.resolve();
  assert.equal(controller.isActive(), true);
  assert.equal(controller.isPlaying(), false);
  assert.equal(audio.paused, true);
  assert.equal(states.at(-1).error, false);
  assert.deepEqual(failures, []);
  audio.nextPlay = Promise.resolve();
  controller.setPaused(false);
  assert.equal(controller.isActive(), true);
  assert.equal(controller.isPlaying(), true);
});
