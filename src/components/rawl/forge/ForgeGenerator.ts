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
  channel?: number; // MIDI channel (0-15)
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
  melodyRhythm: "eighth" | "quarter" | "sixteenth";
  melodyType: "static" | "chord_based";
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

// Helper to create a note with common parameters
const createNote = (
  basePitch: number,
  pitchOffset: number,
  tonic: number,
  startTime: number,
  duration: number,
  channel: number = 1,
  isAccompaniment: boolean = true,
): Note => ({
  pitch: getAdjustedBasePitch(basePitch + pitchOffset, tonic),
  velocity: isAccompaniment
    ? Math.floor(DEFAULT_VELOCITY * 0.4)
    : DEFAULT_VELOCITY,
  startTime,
  duration: duration - DEFAULT_NOTE_DURATION_PADDING,
  channel,
});

// Find index of a pitch in scale degrees
const findPitchInScale = (pitch: number, scaleDegrees: number[]): number => {
  const normalizedPitch = pitch % 12;
  return scaleDegrees.findIndex((deg) => deg % 12 === normalizedPitch);
};

// Generate melody notes going up the scale from each chord's root
const generateMelody = (
  progression: number[],
  mode: ForgeConfig["mode"],
  melodyRhythm: ForgeConfig["melodyRhythm"],
  melodyType: ForgeConfig["melodyType"],
  tonic: number = 0,
): Note[] => {
  const notes: Note[] = [];
  const chords = progression.map((degree) => getChord(degree, mode));
  const rehydratedChords = rehydrateChords(chords);
  const chordPitches = rehydratedChords.map((chord) => chord.pitches);
  const scaleDegrees = getScaleDegrees(mode);

  const notesPerMeasure =
    melodyRhythm === "sixteenth" ? 16 : melodyRhythm === "eighth" ? 8 : 4;
  const noteDuration = TICKS_PER_QUARTER / (notesPerMeasure / 4);

  for (let repeat = 0; repeat < 2; repeat++) {
    for (let measure = 0; measure < 4; measure++) {
      const chord = chordPitches[measure];
      const currentChord = chords[measure];

      const { baseTime, basePitch } = getBaseNoteParams(
        measure,
        repeat,
        currentChord,
        C3 + 12, // Move melody up one octave
      );

      if (melodyType === "static") {
        // Generate notes going up the scale from tonic, same pattern each measure
        for (let i = 0; i < notesPerMeasure; i++) {
          const octaveOffset = Math.floor(i / 7) * 12;
          const currentDegree = scaleDegrees[i % 7];

          notes.push(
            createNote(
              basePitch,
              currentDegree + octaveOffset,
              tonic,
              baseTime + i * noteDuration,
              noteDuration,
              0,
              false,
            ),
          );
        }
      } else {
        // Generate notes based on chord root
        const rootPitch = chord[0] % 12;
        let scaleIndex = findPitchInScale(rootPitch, scaleDegrees);

        for (let i = 0; i < notesPerMeasure; i++) {
          const octaveOffset = Math.floor((scaleIndex + i) / 7) * 12;
          const currentDegree = scaleDegrees[(scaleIndex + i) % 7];

          notes.push(
            createNote(
              basePitch,
              currentDegree + octaveOffset,
              tonic,
              baseTime + i * noteDuration,
              noteDuration,
              0,
              false,
            ),
          );
        }
      }
    }
  }
  return notes;
};

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
      notes.push(
        createNote(basePitch, chord[0], tonic, baseTime, MEASURE_LENGTH),
      );

      // Add additional notes based on style
      switch (style) {
        case "octave":
          notes.push(
            createNote(
              basePitch,
              chord[0] + 12,
              tonic,
              baseTime,
              MEASURE_LENGTH,
            ),
          );
          break;
        case "power":
          notes.push(
            createNote(
              basePitch,
              chord[0] + 7,
              tonic,
              baseTime,
              MEASURE_LENGTH,
            ),
          );
          break;
        case "triad":
        case "triad_octave":
          notes.push(
            createNote(basePitch, chord[1], tonic, baseTime, MEASURE_LENGTH),
            createNote(basePitch, chord[2], tonic, baseTime, MEASURE_LENGTH),
          );
          if (style === "triad_octave") {
            notes.push(
              createNote(
                basePitch,
                chord[0] + 12,
                tonic,
                baseTime,
                MEASURE_LENGTH,
              ),
            );
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
          notes.push(
            createNote(
              basePitch,
              chord[0],
              tonic,
              baseTime,
              MEASURE_LENGTH / 2,
            ),
          );
          chord.forEach((pitch) => {
            notes.push(
              createNote(
                basePitch,
                pitch,
                tonic,
                baseTime + MEASURE_LENGTH / 2,
                MEASURE_LENGTH / 2,
              ),
            );
          });
          break;
        case "quarter":
          for (let quarter = 0; quarter < 4; quarter++) {
            if (quarter % 2 === 0) {
              notes.push(
                createNote(
                  basePitch,
                  chord[0],
                  tonic,
                  baseTime + quarter * TICKS_PER_QUARTER,
                  TICKS_PER_QUARTER,
                ),
              );
            } else {
              chord.forEach((pitch) => {
                notes.push(
                  createNote(
                    basePitch,
                    pitch,
                    tonic,
                    baseTime + quarter * TICKS_PER_QUARTER,
                    TICKS_PER_QUARTER,
                  ),
                );
              });
            }
          }
          break;
        case "quarter_fifth":
          for (let quarter = 0; quarter < 4; quarter++) {
            if (quarter % 2 === 0) {
              notes.push(
                createNote(
                  basePitch,
                  quarter === 0 ? chord[0] : chord[2] - 12,
                  tonic,
                  baseTime + quarter * TICKS_PER_QUARTER,
                  TICKS_PER_QUARTER,
                ),
              );
            } else {
              chord.forEach((pitch) => {
                notes.push(
                  createNote(
                    basePitch,
                    pitch,
                    tonic,
                    baseTime + quarter * TICKS_PER_QUARTER,
                    TICKS_PER_QUARTER,
                  ),
                );
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
        const octaveOffset =
          Math.floor(Math.abs(patternValue) / 3) * 12 * Math.sign(patternValue);
        const chordIndex = ((patternValue % 3) + 3) % 3;

        notes.push(
          createNote(
            basePitch,
            chord[chordIndex] + octaveOffset,
            tonic,
            baseTime + i * EIGHTH_NOTE,
            EIGHTH_NOTE,
          ),
        );
      }
    }
  }
  return notes;
};

// Get scale degrees based on mode
const getScaleDegrees = (mode: ForgeConfig["mode"]): number[] => {
  switch (mode) {
    case "minor":
      // Harmonic minor: W H W W H WH H
      return [0, 2, 3, 5, 7, 8, 11, 12];
    case "natural_minor":
      // Natural minor: W H W W H W W
      return [0, 2, 3, 5, 7, 8, 10, 12];
    case "major":
    default:
      // Major scale: W W H W W W H
      return [0, 2, 4, 5, 7, 9, 11, 12];
  }
};

export const generateNotes = (
  config: ForgeConfig,
): { melody: Note[]; chords: Note[] } => {
  const progression = PROGRESSIONS[config.progression];
  const chordNotes = (() => {
    let notes: Note[];
    switch (config.playbackStyle) {
      case "whole_notes":
        notes = generateWholeNotes(
          progression,
          config.mode,
          config.wholeNoteStyle,
          config.tonic,
        );
        break;
      case "root_chord_alternation":
        notes = generateRootChordAlternation(
          progression,
          config.mode,
          config.alternationStyle,
          config.tonic,
        );
        break;
      case "arpeggio":
      default:
        notes = generateAlbertiPattern(
          progression,
          config.mode,
          config.pattern,
          config.tonic,
        );
    }
    // Move accompaniment down an octave only for scale degrees 4-7
    return notes.map((note) => ({
      ...note,
      channel: 1,
      pitch:
        note.pitch -
        (progression[Math.floor(note.startTime / MEASURE_LENGTH) % 4] >= 4
          ? 12
          : 0),
    }));
  })();

  const melodyNotes = generateMelody(
    progression,
    config.mode,
    config.melodyRhythm,
    config.melodyType,
    config.tonic,
  );

  return {
    melody: melodyNotes,
    chords: chordNotes,
  };
};
