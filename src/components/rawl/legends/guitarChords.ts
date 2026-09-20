import { PitchClass } from "../analysis";

const CHORD_TYPES: { [key: string]: string } = {
  "4 3": "",
  "3 4": "m",
  "3 3": "dim",
  "3 4 3": "m7",
  "4 3 3": "7",
  "4 3 4": "maj7",
  "3 3 4": "ø7",
};

const MAJOR_TONICS = ["C", "D♭", "D", "E♭", "E", "F", "F♯", "G", "A♭", "A", "B♭", "B"];
const MINOR_TONICS = ["C", "C♯", "D", "E♭", "E", "F", "F♯", "G", "G♯", "A", "B♭", "B"];
const LETTERS = ["C", "D", "E", "F", "G", "A", "B"];
const NATURAL_PITCHES = [0, 2, 4, 5, 7, 9, 11];
const ROMAN_DEGREES = ["I", "II", "III", "IV", "V", "VI", "VII"];
const pitchClass = (pitch: number) => ((pitch % 12) + 12) % 12;

type ChordSpellingContext = {
  tonic: number;
  romanNumeral: string;
  minor: boolean;
};

const spellRoot = (root: number, context?: ChordSpellingContext): string => {
  if (!context) return MAJOR_TONICS[pitchClass(root)];

  const tonicName = (context.minor ? MINOR_TONICS : MAJOR_TONICS)[pitchClass(context.tonic)];
  let letterIndex = LETTERS.indexOf(tonicName[0]);
  let expectedPitch = context.tonic;

  // Applied chords add their scale degrees from the target back to the root.
  for (const part of context.romanNumeral.split("/").reverse()) {
    const match = /^([b#]*)([ivIV]+)/.exec(part);
    if (!match) return MAJOR_TONICS[pitchClass(root)];
    const degree = ROMAN_DEGREES.indexOf(match[2].toUpperCase());
    if (degree < 0) return MAJOR_TONICS[pitchClass(root)];
    letterIndex = (letterIndex + degree) % 7;
    expectedPitch += NATURAL_PITCHES[degree];
    for (const accidental of match[1]) expectedPitch += accidental === "b" ? -1 : 1;
  }

  // Interval-based chord recognition may identify an inversion's bass as its root.
  if (pitchClass(expectedPitch) !== pitchClass(root)) return MAJOR_TONICS[pitchClass(root)];
  const accidental = pitchClass(root - NATURAL_PITCHES[letterIndex] + 6) - 6;
  return LETTERS[letterIndex] + (accidental < 0 ? "♭".repeat(-accidental) : "♯".repeat(accidental));
};

export const convertChordToGuitarChord = (
  absoluteRoot: PitchClass,
  chordType: string,
  context?: ChordSpellingContext,
): string | null => {
  if (chordType in CHORD_TYPES) {
    return `${spellRoot(absoluteRoot, context)}${CHORD_TYPES[chordType]}`;
  }
  return null;
};
