import { Chord, rehydrateChords } from "../legends/chords";
import {
  C3,
  DEFAULT_NOTE_DURATION_PADDING,
  DEFAULT_VELOCITY,
  MEASURE_LENGTH,
  TICKS_PER_QUARTER,
} from "./constants";
import { getBaseNoteParams } from "./noteUtils";

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

export type PlaybackStyle =
  | "arpeggio"
  | "whole_notes"
  | "root_chord_alternation";

export interface ForgeConfig {
  mode: "major" | "minor" | "natural_minor";
  pattern: number;
  progression: ProgressionType;
  playbackStyle: PlaybackStyle;
  wholeNoteStyle?: "root" | "octave" | "power" | "triad" | "triad_octave";
  alternationStyle?: "half" | "quarter" | "quarter_fifth";
  tonic: number;
}

// Convert scale degree to chord
const getChord = (scaleDegree: number, mode: ForgeConfig["mode"]): Chord => {
  return SCALE_CHORDS[mode][
    scaleDegree as keyof (typeof SCALE_CHORDS)[typeof mode]
  ] as Chord;
};

// Adjust base pitch based on tonic
const getAdjustedBasePitch = (basePitch: number, tonic: number): number => {
  return basePitch + tonic;
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

// Generate whole notes with different voicings
const generateWholeNotes = (
  progression: number[],
  mode: ForgeConfig["mode"],
  style: ForgeConfig["wholeNoteStyle"] = "triad",
  tonic: number = 0,
): Note[] => {
  const notes: Note[] = [];

  const chords = progression.map((degree) => getChord(degree, mode));
  const rehydratedChords = rehydrateChords(chords);
  const chordPitches = rehydratedChords.map((chord) => chord.pitches);

  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordPitches[measure];
      const currentChord = chords[measure];

      const { baseTime, basePitch } = getBaseNoteParams(
        measure,
        repeat,
        currentChord,
        C3,
      );

      // Base note is always the root
      notes.push({
        pitch: getAdjustedBasePitch(basePitch + chord[0], tonic),
        velocity: DEFAULT_VELOCITY,
        startTime: baseTime,
        duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
      });

      // Add additional notes based on style
      switch (style) {
        case "octave":
          notes.push({
            pitch: getAdjustedBasePitch(basePitch + chord[0] + 12, tonic),
            velocity: DEFAULT_VELOCITY,
            startTime: baseTime,
            duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
          });
          break;
        case "power":
          notes.push({
            pitch: getAdjustedBasePitch(basePitch + chord[0] + 7, tonic),
            velocity: DEFAULT_VELOCITY,
            startTime: baseTime,
            duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
          });
          break;
        case "triad":
        case "triad_octave":
          // Add third and fifth
          notes.push(
            {
              pitch: getAdjustedBasePitch(basePitch + chord[1], tonic),
              velocity: DEFAULT_VELOCITY,
              startTime: baseTime,
              duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
            },
            {
              pitch: getAdjustedBasePitch(basePitch + chord[2], tonic),
              velocity: DEFAULT_VELOCITY,
              startTime: baseTime,
              duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
            },
          );
          if (style === "triad_octave") {
            notes.push({
              pitch: getAdjustedBasePitch(basePitch + chord[0] + 12, tonic),
              velocity: DEFAULT_VELOCITY,
              startTime: baseTime,
              duration: MEASURE_LENGTH - DEFAULT_NOTE_DURATION_PADDING,
            });
          }
          break;
      }
    }
  }
  return notes;
};

// Generate root-chord alternation patterns
const generateRootChordAlternation = (
  progression: number[],
  mode: ForgeConfig["mode"],
  style: ForgeConfig["alternationStyle"] = "half",
  tonic: number = 0,
): Note[] => {
  const notes: Note[] = [];

  const chords = progression.map((degree) => getChord(degree, mode));
  const rehydratedChords = rehydrateChords(chords);
  const chordPitches = rehydratedChords.map((chord) => chord.pitches);

  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordPitches[measure];
      const currentChord = chords[measure];

      const { baseTime, basePitch } = getBaseNoteParams(
        measure,
        repeat,
        currentChord,
        C3,
      );

      switch (style) {
        case "half":
          // Root for first half note
          notes.push({
            pitch: getAdjustedBasePitch(basePitch + chord[0], tonic),
            velocity: DEFAULT_VELOCITY,
            startTime: baseTime,
            duration: MEASURE_LENGTH / 2 - DEFAULT_NOTE_DURATION_PADDING,
          });
          // Full chord for second half note
          chord.forEach((pitch) => {
            notes.push({
              pitch: getAdjustedBasePitch(basePitch + pitch, tonic),
              velocity: DEFAULT_VELOCITY,
              startTime: baseTime + MEASURE_LENGTH / 2,
              duration: MEASURE_LENGTH / 2 - DEFAULT_NOTE_DURATION_PADDING,
            });
          });
          break;
        case "quarter":
          // Root-chord-root-chord pattern
          for (let quarter = 0; quarter < 4; quarter++) {
            if (quarter % 2 === 0) {
              notes.push({
                pitch: getAdjustedBasePitch(basePitch + chord[0], tonic),
                velocity: DEFAULT_VELOCITY,
                startTime: baseTime + quarter * TICKS_PER_QUARTER,
                duration: TICKS_PER_QUARTER - DEFAULT_NOTE_DURATION_PADDING,
              });
            } else {
              chord.forEach((pitch) => {
                notes.push({
                  pitch: getAdjustedBasePitch(basePitch + pitch, tonic),
                  velocity: DEFAULT_VELOCITY,
                  startTime: baseTime + quarter * TICKS_PER_QUARTER,
                  duration: TICKS_PER_QUARTER - DEFAULT_NOTE_DURATION_PADDING,
                });
              });
            }
          }
          break;
        case "quarter_fifth":
          // Root-chord-fifth below-chord pattern
          for (let quarter = 0; quarter < 4; quarter++) {
            if (quarter % 2 === 0) {
              notes.push({
                pitch:
                  quarter === 0
                    ? getAdjustedBasePitch(basePitch + chord[0], tonic)
                    : getAdjustedBasePitch(basePitch + chord[0] - 5, tonic),
                velocity: DEFAULT_VELOCITY,
                startTime: baseTime + quarter * TICKS_PER_QUARTER,
                duration: TICKS_PER_QUARTER - DEFAULT_NOTE_DURATION_PADDING,
              });
            } else {
              chord.forEach((pitch) => {
                notes.push({
                  pitch: getAdjustedBasePitch(basePitch + pitch, tonic),
                  velocity: DEFAULT_VELOCITY,
                  startTime: baseTime + quarter * TICKS_PER_QUARTER,
                  duration: TICKS_PER_QUARTER - DEFAULT_NOTE_DURATION_PADDING,
                });
              });
            }
          }
          break;
      }
    }
  }
  return notes;
};

// Convert chord to pattern in IR
export const generateAlbertiPattern = (
  progression: number[],
  mode: ForgeConfig["mode"],
  patternIndex: number,
  tonic: number = 0,
): Note[] => {
  const EIGHTH_NOTE = TICKS_PER_QUARTER / 2;
  const selectedPattern = PATTERNS[patternIndex] || PATTERNS[0];
  const notes: Note[] = [];

  const chords = progression.map((degree) => getChord(degree, mode));
  const rehydratedChords = rehydrateChords(chords);
  const chordPitches = rehydratedChords.map((chord) => chord.pitches);

  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordPitches[measure];
      const currentChord = chords[measure];

      const { baseTime, basePitch } = getBaseNoteParams(
        measure,
        repeat,
        currentChord,
        C3,
      );

      for (let i = 0; i < 8; i++) {
        const patternValue = selectedPattern[i];
        // Calculate octave offset and chord index
        const octaveOffset =
          Math.floor(Math.abs(patternValue) / 3) * 12 * Math.sign(patternValue);
        const chordIndex = ((patternValue % 3) + 3) % 3;

        notes.push({
          pitch: getAdjustedBasePitch(
            basePitch + chord[chordIndex] + octaveOffset,
            tonic,
          ),
          velocity: DEFAULT_VELOCITY,
          startTime: baseTime + i * EIGHTH_NOTE,
          duration: EIGHTH_NOTE - DEFAULT_NOTE_DURATION_PADDING,
        });
      }
    }
  }
  return notes;
};

export const generateNotes = (config: ForgeConfig): Note[] => {
  const progression = PROGRESSIONS[config.progression];

  switch (config.playbackStyle) {
    case "whole_notes":
      return generateWholeNotes(
        progression,
        config.mode,
        config.wholeNoteStyle,
        config.tonic,
      );
    case "root_chord_alternation":
      return generateRootChordAlternation(
        progression,
        config.mode,
        config.alternationStyle,
        config.tonic,
      );
    case "arpeggio":
    default:
      return generateAlbertiPattern(
        progression,
        config.mode,
        config.pattern,
        config.tonic,
      );
  }
};
