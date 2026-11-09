import { getModulations } from "./analysis";
import type { Analysis, PitchClass } from "./analysis";
import type { Note } from "./parseMidi";

export type HoverTonicPreview = { pitch: number; start: number; end: number };

export function getHoverTonicPreview(
  note: Note, pitch: number, measure: number, analysis: Analysis, measures: number[],
): HoverTonicPreview | null {
  if (note.isDrum || !Number.isFinite(pitch) || pitch === note.note.midiNumber) return null;
  // Preserve the next saved boundary even if its integer tonic equals this one.
  const modulations = getModulations({
    ...analysis,
    modulations: { ...analysis.modulations, [measure]: (note.note.midiNumber % 12) as PitchClass },
  }, measures);
  const index = modulations.findIndex((mod) => mod.measure === measure - 1);
  if (index < 0) return null;
  return {
    pitch,
    start: index === 0 ? -Infinity : modulations[index].time,
    end: modulations[index + 1]?.time ?? Infinity,
  };
}

export function getHoverColorPitchClass(note: Note, preview: HoverTonicPreview | null) {
  const midpoint = (note.span[0] + note.span[1]) / 2;
  if (!preview || note.isDrum || midpoint <= preview.start || midpoint > preview.end)
    return null;
  return ((note.note.midiNumber - preview.pitch) % 12 + 12) % 12;
}
