// Reproduce: node scripts/rawl/analyze-lakh-strum.cjs [seed]
require("ts-node").register({
  transpileOnly: true,
  compilerOptions: { module: "commonjs" },
});
const fs = require("fs");
const path = require("path");
const { parseMidi } = require("midi-file");
const { performance } = require("perf_hooks");
const {
  measureChordOccupancy,
} = require("../../src/components/rawl/strumDetection");
// Historical whole-file baseline for docs/lakh-strum-sample.json.
function findStrumVoices(voices) {
  const result = new Set();
  if (voices.filter((voice) => voice.length > 0).length < 3) return result;
  let start = Infinity;
  let end = -Infinity;
  for (const voice of voices)
    for (const note of voice) {
      if (
        !Number.isFinite(note.span[0]) ||
        !Number.isFinite(note.span[1]) ||
        note.span[1] <= note.span[0]
      )
        continue;
      start = Math.min(start, note.span[0]);
      end = Math.max(end, note.span[1]);
    }
  voices.forEach((voice, index) => {
    const metrics = measureChordOccupancy(voice, end - start);
    if (
      // A majority of sounding time can be chordal even when a rhythmic part
      // alternates thick chords with single notes or dyads.
      metrics.chordFraction >= 0.5 &&
      metrics.averagePolyphony >= 2.5 &&
      metrics.coverage >= 0.15
    )
      result.add(index);
  });
  return result;
}

const root = path.resolve(__dirname, "../../public/lakh-data");
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory()
      ? walk(file)
      : /\.midi?$/i.test(file)
      ? [file]
      : [];
  });
}
const seed = Number(process.argv[2] || 20260925);
let state = seed >>> 0;
function random() {
  state += 0x6d2b79f5;
  let n = Math.imul(state ^ (state >>> 15), 1 | state);
  n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
  return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
}
const files = walk(root).sort();
for (let i = files.length - 1; i > 0; i--) {
  const j = Math.floor(random() * (i + 1));
  [files[i], files[j]] = [files[j], files[i]];
}
const results = [];
const skipped = [];
for (const file of files) {
  if (results.length === 100) break;
  try {
    const bytes = fs.readFileSync(file);
    const midi = parseMidi(bytes);
    const timeline = midi.tracks
      .flatMap((track) => {
        let tick = 0;
        return track.map((event) => ({
          ...event,
          tick: (tick += event.deltaTime),
        }));
      })
      .sort((a, b) => a.tick - b.tick);
    let lastTick = 0,
      seconds = 0,
      tempo = 500000;
    const events = timeline.map((event) => {
      seconds += midi.header.ticksPerBeat
        ? ((event.tick - lastTick) * tempo) / midi.header.ticksPerBeat / 1e6
        : (event.tick - lastTick) /
          (midi.header.framesPerSecond * midi.header.ticksPerFrame);
      lastTick = event.tick;
      if (event.type === "setTempo") tempo = event.microsecondsPerBeat;
      return {
        ...event,
        playTime: seconds * 1000,
        subtype: { noteOn: 9, noteOff: 8, programChange: 12 }[event.type],
        param1: event.noteNumber ?? event.programNumber,
        param2: event.velocity,
      };
    });
    const channels = new Map();
    const held = new Map();
    const programs = new Map();
    for (const event of events) {
      if (event.subtype === 12) programs.set(event.channel, event.param1);
      if (event.subtype !== 8 && event.subtype !== 9) continue;
      const key = `${event.channel}:${event.param1}`;
      const start = held.get(key);
      if (start !== undefined) {
        if (!channels.has(event.channel)) channels.set(event.channel, []);
        channels.get(event.channel).push({
          span: [start, event.playTime / 1000],
          note: { midiNumber: event.param1 },
          isDrum: event.channel === 9,
        });
        held.delete(key);
      }
      if (event.subtype === 9 && event.param2 > 0)
        held.set(key, event.playTime / 1000);
    }
    const channelNumbers = [...channels.keys()].sort((a, b) => a - b);
    const voices = channelNumbers.map((channel) => channels.get(channel));
    const spans = voices.flat().filter((n) => n.span[1] > n.span[0]);
    const duration =
      spans.reduce((end, n) => Math.max(end, n.span[1]), 0) -
      spans.reduce((start, n) => Math.min(start, n.span[0]), Infinity);
    const began = performance.now();
    const detected = findStrumVoices(voices);
    const elapsedMs = performance.now() - began;
    results.push({
      file: path.relative(root, file),
      voiceCount: voices.length,
      duration,
      elapsedMs,
      voices:
        voices.length < 3
          ? []
          : voices.map((notes, index) => ({
              channel: channelNumbers[index],
              program: programs.get(channelNumbers[index]) ?? 0,
              noteCount: notes.length,
              detected: detected.has(index),
              ...measureChordOccupancy(notes, duration),
            })),
    });
  } catch (error) {
    skipped.push({ file: path.relative(root, file), error: String(error) });
  }
}
const report = {
  seed,
  population: files.length,
  sampleCount: results.length,
  skipped,
  results,
};
fs.writeFileSync(
  path.resolve(__dirname, "../../docs/lakh-strum-sample.json"),
  JSON.stringify(report, null, 2) + "\n",
);
const eligible = results.filter((r) => r.voiceCount >= 3);
const all = eligible.flatMap((r) => r.voices).filter((v) => v.channel !== 9);
const times = eligible.map((r) => r.elapsedMs).sort((a, b) => a - b);
console.log(
  JSON.stringify(
    {
      population: files.length,
      sampled: results.length,
      eligible: eligible.length,
      pitchedVoices: all.length,
      detected: all.filter((v) => v.detected).length,
      filesWithDetection: eligible.filter((r) =>
        r.voices.some((v) => v.detected),
      ).length,
      medianMs: times[Math.floor(times.length / 2)],
      maxMs: times.at(-1),
    },
    null,
    2,
  ),
);
console.log(
  "Examples:",
  JSON.stringify(
    eligible.filter((r) => r.voices.some((v) => v.detected)).slice(0, 12),
    null,
    2,
  ),
);
