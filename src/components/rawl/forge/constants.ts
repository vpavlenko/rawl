// MIDI note numbers
export const C3 = 48;

// Timing constants
export const TICKS_PER_QUARTER = 128;
export const MEASURE_LENGTH = TICKS_PER_QUARTER * 4;

// Default values
export const DEFAULT_VELOCITY = 100;
export const DEFAULT_NOTE_DURATION_PADDING = 10; // How much shorter than the full duration notes should be

// Octave adjustments
export const CHORD_OCTAVE_ADJUSTMENTS = {
  vi: -12,
  bVI: -12,
} as const;
