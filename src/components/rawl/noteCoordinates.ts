export const createMidiNumberToY = (
  pitchedHeight: number,
  midiRange: [number, number],
  noteHeight: number,
) => (midiNumber: number) =>
  pitchedHeight - (midiNumber - midiRange[0] + 1) * noteHeight;
