import { PitchClass } from "../analysis";

const CHORD_TYPES: { [key: string]: string } = {
  "4 3": "",
  "3 4": "m",
  "3 4 3": "m7",
  "4 3 3": "7",
  "4 3 4": "maj7",
  "3 3 4": "ø7",
};

const PITCH_CLASS_TO_GUITAR_LETTER = {
  0: "C",
  1: "C#",
  2: "D",
  3: "D#",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "G#",
  9: "A",
  10: "A#",
  11: "B",
};

export const convertChordToGuitarChord = (
  absoluteRoot: PitchClass,
  chordType: string,
): string | null => {
  if (chordType in CHORD_TYPES) {
    return `${PITCH_CLASS_TO_GUITAR_LETTER[absoluteRoot]}${CHORD_TYPES[chordType]}`;
  }
  return null;
};
