import { Chord, rehydrateChords } from "../legends/chords";

// Constants
export const MAJOR_PROGRESSION: Chord[] = ["I", "vi", "IV", "V"];
export const MINOR_PROGRESSION: Chord[] = ["i", "bVI", "iv", "V"];
export const FORGE_MOCK_ID = "forge_mock";

// Types
export interface Note {
  pitch: number; // MIDI note number
  velocity: number;
  startTime: number; // in ticks (128 per quarter note)
  duration: number; // in ticks
}

export interface ForgeConfig {
  mode: "major" | "minor";
  pattern: "classic" | "alternate";
}

// Convert chord to Alberti pattern in IR
export const generateAlbertiPattern = (
  chordProgression: number[][],
  mode: "major" | "minor",
  pattern: "classic" | "alternate",
): Note[] => {
  const C3 = 48; // MIDI note number for C3
  const TICKS_PER_QUARTER = 128; // Standard MIDI ticks per quarter note
  const MEASURE_LENGTH = TICKS_PER_QUARTER * 4; // 4 quarter notes per measure
  const EIGHTH_NOTE = TICKS_PER_QUARTER / 2;

  // Two different patterns: r m u m u m u m u m  or  r m u m r m u m
  const patterns = {
    classic: [0, 1, 2, 1, 2, 1, 2, 1], // r m u m u m u m
    alternate: [0, 1, 2, 1, 0, 1, 2, 1], // r m u m r m u m
  };
  const selectedPattern = patterns[pattern];
  const notes: Note[] = [];

  // Get the progression for octave adjustment check
  const progression = mode === "major" ? MAJOR_PROGRESSION : MINOR_PROGRESSION;

  // Generate eight bars of Alberti pattern (4 bars repeated)
  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordProgression[measure];
      const currentChord = progression[measure];
      // Lower vi and bVI chords by an octave
      const octaveAdjust =
        currentChord === "vi" || currentChord === "bVI" ? -12 : 0;

      for (let i = 0; i < 8; i++) {
        // 8 eighth notes per measure
        const chordIndex = selectedPattern[i] % chord.length;
        notes.push({
          pitch: C3 + chord[chordIndex] + octaveAdjust,
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
  const progression =
    config.mode === "major" ? MAJOR_PROGRESSION : MINOR_PROGRESSION;
  const rehydratedProgression = rehydrateChords(progression);
  const chords = rehydratedProgression.map((chord) => chord.pitches);
  return generateAlbertiPattern(chords, config.mode, config.pattern);
};
