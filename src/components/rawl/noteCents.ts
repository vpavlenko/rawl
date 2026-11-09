import { getTonic } from "./analysis";
import type { Analysis } from "./analysis";
import type { Note } from "./parseMidi";
import { getNotePitchAtTime } from "./pitchBend";

export function getNoteCentsFromTonic(
  note: Note, time: number, analysis: Analysis, measures: number[],
): number | null {
  if (note.isDrum) return null;
  const tonic = getTonic((note.span[0] + note.span[1]) / 2, analysis, measures);
  if (tonic == null) return null;
  const cents = Math.round((getNotePitchAtTime(note, time) - tonic) * 100);
  return Number.isFinite(cents) ? (((cents + 50) % 1200) + 1200) % 1200 - 50 : null;
}
