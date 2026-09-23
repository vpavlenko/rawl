// Run manually: node scripts/rawl/check-midi-output.cjs
// Deterministic protocol checks; no browser, server, or build required.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function harness() {
  let Processor;
  const messages = [];
  const requests = [];
  const context = vm.createContext({
    Float32Array, sampleRate: 48000, currentTime: 0,
    AudioWorkletProcessor: class {
      constructor() { this.port = { postMessage: (m) => messages.push(m) }; }
    },
    registerProcessor: (_, implementation) => { Processor = implementation; },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../../public/midi-output-worklet.js'), 'utf8'), context);
  const processor = new Processor();
  const port = { postMessage: (m) => requests.push(m), start() {} };
  processor.port.onmessage({ data: { type: 'connect', port } });
  return {
    processor, messages, requests,
    receive: (data) => port.onmessage({ data }),
    invalidate: (generation) => processor.port.onmessage({ data: { type: 'invalidate', generation, positionMs: 0 } }),
    tick(frames = 128) {
      const output = [new Float32Array(frames), new Float32Array(frames)];
      processor.process([], [output]);
      context.currentTime += frames / 48000;
      return output;
    },
  };
}
function block(generation, index, value = index + 1) {
  return {
    type: 'audio', generation,
    left: new Float32Array(512).fill(value), right: new Float32Array(512).fill(-value),
    startMs: index * 512 / 48, endMs: (index + 1) * 512 / 48,
  };
}
function start(h, generation = 1) {
  h.receive({ type: 'reset', generation, positionMs: 0, playing: true });
}

// Bounded credits and stereo continuity, including a render quantum crossing
// a worker block boundary. This loop makes no main-thread control calls.
{
  const h = harness();
  start(h);
  assert.equal(h.requests.length, 4);
  for (let i = 0; i < 4; i++) h.receive(block(1, i));
  const [left, right] = h.tick(768);
  assert.equal(left[511], 1);
  assert.equal(left[512], 2);
  assert.equal(right[512], -2);
  assert.equal(h.requests.length, 5); // Only the consumed block gets replaced.
}

// A delayed main-thread invalidation must not erase the worker's NEW buffers
// if its matching reset arrived first on the other MessagePort.
{
  const h = harness();
  start(h, 2);
  h.receive(block(2, 0));
  h.receive(block(2, 1));
  h.invalidate(2);
  assert.equal(h.tick()[0][0], 1);
}

// Stop discards queued audio; old reset/audio/EOF messages cannot resurrect it.
{
  const h = harness();
  start(h);
  for (let i = 0; i < 4; i++) h.receive(block(1, i));
  h.invalidate(2);
  start(h, 1);
  h.receive(block(1, 4));
  h.receive({ type: 'end', generation: 1 });
  assert.ok(h.tick()[0].every((sample) => sample === 0));
  assert.equal(h.processor.generation, 2);
  start(h, 2);
  h.receive(block(2, 0, 9));
  h.receive(block(2, 1, 9));
  assert.equal(h.tick()[0][0], 9);
}

// Short songs still play their last block and end only AFTER its samples drain.
{
  const h = harness();
  start(h);
  h.receive(block(1, 0));
  h.receive({ type: 'end', generation: 1 });
  assert.equal(h.tick()[0][0], 1);
  assert.ok(!h.messages.some((m) => m.type === 'ended'));
  h.tick(512);
  assert.equal(h.messages.filter((m) => m.type === 'ended').length, 1);
  assert.ok(h.tick()[0].every((sample) => sample === 0));
}

// Starvation freezes the position and re-buffers; it never repeats old samples.
{
  const h = harness();
  start(h);
  h.receive(block(1, 0));
  h.receive(block(1, 1));
  h.tick(1024);
  assert.ok(h.tick()[0].every((sample) => sample === 0));
  assert.equal(h.processor.underruns, 1);
  assert.equal(h.messages[h.messages.length - 1].speed, 0);
  h.receive(block(1, 2));
  assert.ok(h.tick()[0].every((sample) => sample === 0));
  h.receive(block(1, 3));
  assert.equal(h.tick()[0][0], 3);
}
console.log('MIDI output protocol checks passed.');
