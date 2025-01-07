import { Chord, rehydrateChords } from "../legends/chords";

// Constants
export const SCALE_CHORDS = {
  major: {
    1: "I",
    2: "ii",
    3: "iii",
    4: "IV",
    5: "V",
    6: "vi",
    7: "viio",
  },
  minor: {
    1: "i",
    2: "iio",
    3: "bIII",
    4: "iv",
    5: "V",
    6: "bVI",
    7: "viio",
  },
  natural_minor: {
    1: "i",
    2: "iio",
    3: "bIII",
    4: "iv",
    5: "v",
    6: "bVI",
    7: "bVII",
  },
} as const;

export const PROGRESSIONS = {
  CLASSIC: [1, 6, 4, 5] as number[],
  ALTERNATE_1: [1, 5, 6, 4] as number[],
  ALTERNATE_2: [1, 3, 4, 5] as number[],
  DESCENDING: [4, 3, 2, 1] as number[],
  MINOR_RISE: [6, 5, 1, 3] as number[],
};

export type ProgressionType = keyof typeof PROGRESSIONS;

// Types
export interface Note {
  pitch: number; // MIDI note number
  velocity: number;
  startTime: number; // in ticks (128 per quarter note)
  duration: number; // in ticks
}

export interface ForgeConfig {
  mode: "major" | "minor" | "natural_minor";
  pattern: number;
  progression: ProgressionType;
}

// Convert scale degree to chord
const getChord = (scaleDegree: number, mode: ForgeConfig["mode"]): Chord => {
  return SCALE_CHORDS[mode][
    scaleDegree as keyof (typeof SCALE_CHORDS)[typeof mode]
  ] as Chord;
};

// Patterns defined as sequences where:
// 0 is root, 1 is next chord tone up, 2 is next up, etc.
// Negative numbers go down from root (-1 is fifth below root)
// Numbers > 2 access next octave (3 is root octave up)
export const PATTERNS = [
  [0, 1, 2, 1, 2, 1, 2, 1], // Classic r m u m u m u m
  [0, 1, 2, 1, 0, 1, 2, 1], // Alternate r m u m r m u m
  [0, 2, 3, 2, 3, 2, 3, 2], // New pattern 1
  [0, 2, 3, 2, 4, 2, 3, 2], // New pattern 2
  [0, 2, 4, 2, 4, 2, 4, 2], // New pattern 3
  [0, 2, 3, 2, 0, 2, 3, 2], // New pattern 4
  [0, 3, 5, 4, 6, 4, 5, 4], // New pattern 5
] as const;

// Convert chord to pattern in IR
export const generateAlbertiPattern = (
  progression: number[],
  mode: ForgeConfig["mode"],
  patternIndex: number,
): Note[] => {
  const C3 = 48; // MIDI note number for C3
  const TICKS_PER_QUARTER = 128; // Standard MIDI ticks per quarter note
  const MEASURE_LENGTH = TICKS_PER_QUARTER * 4; // 4 quarter notes per measure
  const EIGHTH_NOTE = TICKS_PER_QUARTER / 2;

  const selectedPattern = PATTERNS[patternIndex] || PATTERNS[0];
  const notes: Note[] = [];

  // Convert progression to chords and get their pitches
  const chords = progression.map((degree) => getChord(degree, mode));
  const rehydratedChords = rehydrateChords(chords);
  const chordPitches = rehydratedChords.map((chord) => chord.pitches);

  // Generate eight bars of pattern (4 bars repeated)
  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordPitches[measure];
      // Lower vi and bVI chords by an octave
      const currentChord = chords[measure];
      const octaveAdjust =
        currentChord === "vi" || currentChord === "bVI" ? -12 : 0;

      for (let i = 0; i < 8; i++) {
        const patternValue = selectedPattern[i];
        // Calculate octave offset and chord index
        const octaveOffset =
          Math.floor(Math.abs(patternValue) / 3) * 12 * Math.sign(patternValue);
        const chordIndex = ((patternValue % 3) + 3) % 3;

        notes.push({
          pitch: C3 + chord[chordIndex] + octaveOffset + octaveAdjust,
          velocity: 80,
          startTime: (repeat * 4 + measure) * MEASURE_LENGTH + i * EIGHTH_NOTE,
          duration: EIGHTH_NOTE - 10, // Slightly shorter for articulation
        });
      }
    }
  }

  return notes;
};

export const generateNotes = (config: ForgeConfig): Note[] => {
  const progression = PROGRESSIONS[config.progression];
  return generateAlbertiPattern(progression, config.mode, config.pattern);
};
