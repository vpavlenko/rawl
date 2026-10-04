import { rehydrateNotes, Snippet } from "../analysis";

export const CHROMATIC_MINOR_TAGS = [
  "bass:chromatic_minor_1_7_b7",
  "bass:chromatic_minor_1_b7",
];
export const LEGACY_CHROMATIC_MINOR_TAG = "bass:chromatic_line_down_from_minor_i";

// Read the opening descent in the frozen excerpt, retaining weak-beat passing
// bass notes that a whole-measure summary can hide. Ignore higher arpeggio tones.
export function classifyChromaticMinorBass(snippet: Snippet): string | null {
  const tonic = snippet.frozenNotes.analysis.modulations[1];
  if (tonic == null) return null;
  const notes = rehydrateNotes(snippet).flat().sort((a, b) =>
    a.span[0] - b.span[0] || a.note.midiNumber - b.note.midiNumber);
  const roots = notes.filter((note) => note.note.midiNumber % 12 === tonic)
    .sort((a, b) => a.note.midiNumber - b.note.midiNumber || a.span[0] - b.span[0]);
  for (const octaveOffset of [0, 12]) {
    for (const root of roots) {
      const pitch = root.note.midiNumber + octaveOffset;
      const next = notes.find((note) => note.span[0] > root.span[0] &&
        (note.note.midiNumber === pitch - 1 || note.note.midiNumber === pitch - 2));
      if (next) return CHROMATIC_MINOR_TAGS[next.note.midiNumber === pitch - 1 ? 0 : 1];
    }
  }
  return null;
}
