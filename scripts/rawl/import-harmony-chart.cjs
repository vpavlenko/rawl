// Import a permitted ChordPro excerpt without retaining its lyrics.
// node scripts/rawl/import-harmony-chart.cjs chart.cho --artist "Artist"
//   --title "Song" --section "Verse" --source https://... --tonic 0
//   [--transpose -1] [--mode major] [--output references.json]
const fs = require("fs"),
  path = require("path");
const args = process.argv.slice(2),
  value = (name, fallback) => {
    const i = args.indexOf(name);
    return i < 0 ? fallback : args[i + 1];
  };
const input = args[0],
  artist = value("--artist"),
  title = value("--title"),
  section = value("--section"),
  source = value("--source"),
  tonic = Number(value("--tonic")),
  transpose = Number(value("--transpose", 0));
if (
  !input ||
  !artist ||
  !title ||
  !section ||
  !/^https:\/\//.test(source || "") ||
  !Number.isInteger(tonic) ||
  tonic < 0 ||
  tonic > 11 ||
  !Number.isInteger(transpose)
)
  throw new Error(
    "Supply an excerpt, artist, title, section, HTTPS source, tonic pitch class and optional semitone transposition.",
  );
const pitches = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const contents = fs.readFileSync(input, "utf8");
const unsupported = [...contents.matchAll(/\[([^\]]+)\]/g)]
  .map((match) => match[1])
  .filter((symbol) =>
    /^[A-G][#b]?(?:m|min|maj|dim|sus|add|aug|\+|\d|\/|$)/.test(symbol),
  )
  .filter(
    (symbol) =>
      !/^[A-G][#b]?(maj7|m7b5|m7|min7|m|min|dim7|dim|sus2|sus4|7|5|\+)?(?:\/[A-G][#b]?)?$/.test(
        symbol,
      ),
  );
if (unsupported.length)
  throw new Error(
    `Unsupported chord symbols: ${unsupported.join(
      ", ",
    )}. Preserve them for manual normalization.`,
  );
const chords = [
  ...contents.matchAll(
    /\[([A-G])([#b]?)(maj7|m7b5|m7|min7|m|min|dim7|dim|sus2|sus4|7|5|\+)?(?:\/[A-G][#b]?)?\]/g,
  ),
].map(([, note, accidental, suffix]) => ({
  root:
    (((pitches[note] +
      (accidental === "#" ? 1 : accidental === "b" ? -1 : 0) +
      transpose) %
      12) +
      12) %
    12,
  quality:
    {
      maj7: "maj7",
      m7b5: "hdim7",
      m7: "min7",
      min7: "min7",
      m: "min",
      min: "min",
      dim7: "dim7",
      dim: "dim",
      sus2: "sus2",
      sus4: "sus4",
      7: "7",
      5: "5",
      "+": "aug",
    }[suffix] || "maj",
}));
if (chords.length < 2)
  throw new Error(
    "The excerpt needs at least two supported chord symbols in brackets.",
  );
const output = path.resolve(
  value("--output", "scripts/rawl/harmony-references.imported.json"),
);
const references = fs.existsSync(output)
  ? JSON.parse(fs.readFileSync(output))
  : [];
references.push({
  id: `${artist}-${title}-${section}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  artist,
  title,
  section,
  tonic: (((tonic + transpose) % 12) + 12) % 12,
  mode: value("--mode", "unspecified"),
  chords,
  sources: [{ url: source, role: "imported ChordPro excerpt" }],
  notes: `Untimed chord shapes; transposed ${transpose} semitone(s) into sounding pitch. Requires alignment review.`,
});
fs.writeFileSync(output, JSON.stringify(references, null, 2));
console.log(`Imported ${chords.length} chord symbols into ${output}.`);
