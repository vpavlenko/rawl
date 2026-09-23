// Run manually: node scripts/rawl/check-playback-index.cjs
// Uses the repo's TypeScript compiler to load the pure index, without a build.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync(path.join(__dirname, '../../src/components/rawl/playbackIndex.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2018 },
}).outputText;
const context = { exports: {} };
vm.runInNewContext(compiled, context);
const { createNotePlaybackIndex, createSectionPlaybackClock, findPlaybackMeasure } = context.exports;

// Exact half-open boundaries, polyphony, and no repeated notifications while held.
{
  const index = createNotePlaybackIndex();
  const changes = [];
  index.register(1, 2, (on) => changes.push(['a', on]));
  index.register(1.5, 3, (on) => changes.push(['b', on]));
  changes.length = 0;
  index.advance(1);
  index.advance(1.2);
  index.advance(1.5);
  index.advance(2);
  assert.deepEqual(changes, [['a', true], ['b', true], ['a', false]]);
  index.advance(3);
  assert.deepEqual(changes.at(-1), ['b', false]);
}

// Seeking into long sustained notes, then backwards, must reconcile immediately.
{
  const index = createNotePlaybackIndex();
  const changes = [];
  index.register(0, 36000, (on) => changes.push(on));
  changes.length = 0;
  index.advance(30000);
  index.advance(-1);
  index.advance(36000);
  index.advance(20000);
  assert.deepEqual(changes, [true, false, true]);
}

// A note spanning sections has multiple drawings; only the playhead's copy lights.
{
  const index = createSectionPlaybackClock();
  const changes = [];
  index.register(1, 12, (on) => changes.push(['left', on]), [0, 10]);
  index.register(1, 12, (on) => changes.push(['right', on]), [10, 20]);
  index.register(100, 110, (on) => changes.push(['unrelated', on]), [100, 120]);
  changes.length = 0;
  index.advance(9);
  index.advance(10);
  index.advance(12);
  index.advance(5);
  assert.deepEqual(changes, [
    ['left', true], ['left', false], ['right', true], ['right', false], ['left', true],
  ]);
  index.reset();
  assert.deepEqual(changes.at(-1), ['left', false]);
}

// Mounting/replacing notes while paused initializes them without another tick.
{
  const index = createSectionPlaybackClock();
  index.advance(5);
  const changes = [];
  const remove = index.register(3, 7, (on) => changes.push(on), [0, 10]);
  assert.deepEqual(changes, [true]);
  remove();
  index.advance(6);
  assert.deepEqual(changes, [true]);
  index.register(3, 7, (on) => changes.push(on), [0, 10]);
  assert.deepEqual(changes, [true, true]);
  index.advance(7);
  assert.equal(changes.at(-1), false);
}

assert.equal(findPlaybackMeasure([0, 2, 4], -1), null);
assert.equal(findPlaybackMeasure([0, 2, 4], 0), 1);
assert.equal(findPlaybackMeasure([0, 2, 4], 1.99), 1);
assert.equal(findPlaybackMeasure([0, 2, 4], 2), 2);
console.log('Playback index checks passed.');
