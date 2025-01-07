import { Chord } from "../legends/chords";
import { CHORD_OCTAVE_ADJUSTMENTS, MEASURE_LENGTH } from "./constants";

export interface BaseNoteParams {
  baseTime: number;
  basePitch: number;
}

export const getBaseNoteParams = (
  measure: number,
  repeat: number,
  currentChord: Chord,
  basePitch: number,
): BaseNoteParams => ({
  baseTime: (repeat * 4 + measure) * MEASURE_LENGTH,
  basePitch:
    basePitch +
    (CHORD_OCTAVE_ADJUSTMENTS[
      currentChord as keyof typeof CHORD_OCTAVE_ADJUSTMENTS
    ] || 0),
});
