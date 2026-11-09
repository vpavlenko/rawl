const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { parseMidi, writeMidi } = require('midi-file');

const directory = __dirname;
const hash = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');
const source = fs.readFileSync(process.argv[2]);
const midi = parseMidi(source);
assert.deepEqual(Buffer.from(writeMidi(midi)), source, 'Source round trip must be byte-exact');

function inspect(track) {
  let tick = 0;
  const pending = new Map();
  const notes = [];
  const events = track.map((event, index) => {
    tick += event.deltaTime;
    const key = `${event.channel}:${event.noteNumber}`;
    if (event.type === 'noteOn' && event.velocity > 0) {
      if (!pending.has(key)) pending.set(key, []);
      pending.get(key).push({ index, tick, event });
    } else if (event.type === 'noteOff' || event.type === 'noteOn') {
      const start = pending.get(key)?.shift();
      assert(start, `Unmatched note-off at ${tick} for ${key}`);
      notes.push({
        onIndex: start.index, offIndex: index,
        channel: event.channel, pitch: event.noteNumber,
        start: start.tick, end: tick, duration: tick - start.tick,
        velocity: start.event.velocity, releaseVelocity: event.velocity,
      });
    }
    const { deltaTime, running, ...content } = event;
    return { tick, ...content };
  });
  assert([...pending.values()].every((queue) => queue.length === 0), 'Unterminated notes');
  return { notes, events, endTick: tick };
}

const removed = [];
const stats = [];
midi.tracks = midi.tracks.map((track, trackIndex) => {
  const before = inspect(track);
  const zero = before.notes.filter((note) => note.duration === 0);
  const indices = new Set(zero.flatMap((note) => [note.onIndex, note.offIndex]));
  let tick = 0;
  let previous = 0;
  const filtered = [];
  track.forEach((event, index) => {
    tick += event.deltaTime;
    if (!indices.has(index)) {
      filtered.push({ ...event, deltaTime: tick - previous });
      previous = tick;
    }
  });
  const after = inspect(filtered);
  assert.equal(after.endTick, before.endTick);
  assert.deepEqual(after.events, before.events.filter((_, index) => !indices.has(index)));
  const noteIdentity = ({ onIndex, offIndex, ...note }) => note;
  assert.deepEqual(after.notes.map(noteIdentity), before.notes.filter((note) => note.duration > 0).map(noteIdentity));
  assert.equal(after.notes.filter((note) => note.duration === 0).length, 0);
  removed.push(...zero.map((note) => ({ track: trackIndex, ...note })));
  stats.push({ track: trackIndex, beforeNotes: before.notes.length, removedNotes: zero.length, afterNotes: after.notes.length, endTick: after.endTick });
  return filtered;
});

const cleaned = Buffer.from(writeMidi(midi));
const reparsed = parseMidi(cleaned);
reparsed.tracks.forEach((track, index) => assert.deepEqual(inspect(track), inspect(midi.tracks[index])));
fs.writeFileSync(path.join(directory, 'original.mid'), source);
fs.writeFileSync(path.join(directory, 'cleaned.mid'), cleaned);
const report = {
  slug: 'medtner---2-skazki-op.20-no.2',
  originalSha256: hash(source), cleanedSha256: hash(cleaned),
  originalBytes: source.length, cleanedBytes: cleaned.length,
  header: midi.header, removedNotes: removed.length, tracks: stats,
  validation: 'All retained events, note velocities, absolute onsets and endings, metadata, controllers and track end times are identical; no zero-duration notes remain.',
  removed,
};
fs.writeFileSync(path.join(directory, 'report.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, removed: undefined }, null, 2));
