// Shared local MIDI/grid reconstruction for section training and evaluation.
const fs = require("fs"),
  path = require("path"),
  crypto = require("crypto");
const { parseMidi } = require("midi-file");
const { harmonyMidi } = require("../../src/harmony/midi.ts");
const {
  buildManualMeasuresAndBeats,
} = require("../../src/components/rawl/measures.ts");
const root = path.resolve(__dirname, "../..");
const bySlug = new Map(
  require("../../src/midis/midis.json").midis.flatMap((e) => [
    [e.slug, e],
    [e.id, e],
  ]),
);
function loadInput(key, a) {
  if (!key.startsWith("f/"))
    throw new Error("Section training is restricted to /f/");
  const entry = bySlug.get(key.slice(2));
  if (!entry) throw new Error("No indexed MIDI");
  const bytes = Buffer.from(
    JSON.parse(
      fs.readFileSync(path.join(root, "src/midis", entry.id + ".json")),
    ).blobBase64,
    "base64",
  );
  const input = harmonyMidi(parseMidi(bytes));
  input.midiHash = crypto.createHash("sha256").update(bytes).digest("hex");
  if (a.measures && input.notes.length)
    input.grid = buildManualMeasuresAndBeats(
      a.measures,
      input.notes.map((n) => ({ span: [n.start, n.end] })),
    );
  const excluded = new Set(a.excludedVoices || []),
    drums = new Set(a.drumVoices || []);
  input.notes = input.notes
    .filter((n) => !excluded.has(n.voice))
    .map((n) => (drums.has(n.voice) ? { ...n, isDrum: true } : n));
  return input;
}
module.exports = { loadInput, root };
