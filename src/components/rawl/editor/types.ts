// Scale maps for major and minor scales
export const MINOR_SCALE_MAP = [0, 2, 3, 5, 7, 8, 10];
export const MAJOR_SCALE_MAP = [0, 2, 4, 5, 7, 9, 11];

// Note letter to number mapping
export const NOTE_LETTER_MAP: { [key: string]: number } = {
  // First octave (numeric)
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  "0": 9,

  // Second octave (letters)
  q: 7,
  w: 8,
  e: 9,
  r: 10,
  t: 11,
  y: 12,
  u: 13,

  // Third octave
  i: 14,
  o: 15,
  p: 16,
  a: 14,
  s: 15,
  d: 16, // Alternative fingering
  f: 17,
  g: 18,
  h: 19,
  j: 20,
  k: 21,
  l: 22,
};

// Type definitions
export type TimeSignature = {
  numerator: number; // Only numerator is stored since denominator is always 4
  measureStart: number; // Which measure this time signature starts at
};

export type KeySignature = {
  tonic: number; // 0 = C, 1 = C#/Db, etc.
  mode: "major" | "minor";
};

export type BeatPosition = number; // Integer part is beat number, fraction is position within beat

export type MeasureSpan = {
  start: BeatPosition;
  end: BeatPosition;
};

export type LogicalNote = {
  scaleDegree: number; // 1-7 with optional accidentals (for copying)
  duration: number; // in MIDI ticks
  span: MeasureSpan; // When this note occurs
  accidental?: -1 | 0 | 1; // -1 for flat, 1 for sharp (for copying)
  midiNumber: number | null; // Calculated MIDI number at creation time (null for rests)
};

export type Command =
  | { type: "key"; key: KeySignature }
  | { type: "insert"; notes: LogicalNote[] }
  | {
      type: "copy";
      targetMeasure: number;
      targetBeat: number;
      sourceStart: number;
      sourceStartBeat: number;
      sourceEnd: number;
      sourceEndBeat: number;
      shifts: (number | "x")[]; // Allow 'x' in shifts array
    }
  | { type: "track"; track: 1 | 2; baseOctave?: number }
  | { type: "time"; signatures: TimeSignature[] };

export type CommandContext = {
  currentKey: KeySignature;
  existingNotes?: LogicalNote[];
  lastNoteIndex?: number; // Index of last note before current command
  currentTrack: 1 | 2; // Track 1 for right hand, 2 for left hand
  timeSignatures: TimeSignature[]; // List of time signatures in effect
  beatsPerMeasure?: number; // Optional because only needed during note parsing
  baseOctaveRH: number; // Base octave for right hand
  baseOctaveLH: number; // Base octave for left hand
  commentToEndOfFile?: boolean; // Whether a single # has been encountered, commenting out rest of file
};
