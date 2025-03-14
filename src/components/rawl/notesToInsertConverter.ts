import { ColoredNote, ColoredNotesInVoices, Note } from "./parseMidi";

/**
 * Get the measure start and end times in seconds
 */
export const getMeasureSpan = (
  measureIndex: number,
  measures: number[],
): [number, number] => {
  const measureStart = measures[measureIndex];
  const measureEnd =
    measures[measureIndex + 1] ||
    measures[measureIndex] +
      (measures[measureIndex] - measures[measureIndex - 1] || 0);
  return [measureStart, measureEnd];
};

/**
 * Get all beats within a measure
 */
export const getBeatsInMeasure = (
  measureIndex: number,
  measures: number[],
  beats: number[],
): number[] => {
  const [measureStart, measureEnd] = getMeasureSpan(measureIndex, measures);

  return beats.filter((beat) => beat >= measureStart && beat < measureEnd);
};

/**
 * Get the measure index for a note
 */
export const getNoteMeasure = (
  note: Note,
  measures: number[] | null,
): number => {
  if (!measures) {
    return -1;
  }
  const noteTime = (note.span[0] + note.span[1]) / 2;
  const result = measures.findIndex((time) => time > noteTime);
  return (result === -1 ? measures.length - 1 : result) - 1;
};

/**
 * Get all notes in the same measure and voice as the clicked note
 */
export const getNotesInSameMeasureAndVoice = (
  note: Note,
  coloredNotes: ColoredNotesInVoices,
  measuresAndBeats: { measures: number[]; beats: number[] },
): {
  notesInMeasure: ColoredNote[];
  measureSpan: [number, number];
  beatsInMeasure: number[];
  measureIndex: number;
} => {
  const voiceIndex = note.voiceIndex;
  const measureIndex = getNoteMeasure(note, measuresAndBeats.measures);

  // Get all notes in the same voice and measure
  const notesInMeasure = coloredNotes[voiceIndex].filter(
    (otherNote) =>
      getNoteMeasure(otherNote, measuresAndBeats.measures) === measureIndex,
  );

  // Get measure span (start and end time)
  const measureSpan = getMeasureSpan(measureIndex, measuresAndBeats.measures);

  // Get all beats within this measure
  const beatsInMeasure = getBeatsInMeasure(
    measureIndex,
    measuresAndBeats.measures,
    measuresAndBeats.beats,
  );

  return {
    notesInMeasure,
    measureSpan,
    beatsInMeasure,
    measureIndex,
  };
};

/**
 * Log information about notes in the same measure and voice
 */
export const logNotesInformation = (
  note: Note,
  coloredNotes: ColoredNotesInVoices,
  measuresAndBeats: { measures: number[]; beats: number[] },
): void => {
  const { notesInMeasure, measureSpan, beatsInMeasure, measureIndex } =
    getNotesInSameMeasureAndVoice(note, coloredNotes, measuresAndBeats);

  console.log(
    `Notes in voice ${note.voiceIndex}, measure ${measureIndex}:`,
    notesInMeasure,
  );
  console.log(
    `Measure span: [${measureSpan[0].toFixed(2)}s, ${measureSpan[1].toFixed(
      2,
    )}s]`,
  );
  console.log(
    `Beats in measure: ${beatsInMeasure.map((b) => b.toFixed(2)).join(", ")}s`,
  );

  // Also display the linear representation
  const linearRepresentation = convertNotesToLinearFormat(notesInMeasure);
  console.log(`Linear representation: ${linearRepresentation}`);
};

/**
 * Convert notes in a measure to a linear textual format
 *
 * This finds the lowest MIDI number note and uses its pitch class as a reference point.
 * All MIDI numbers are made relative to this base value (lowestMidi - basePitchClass).
 *
 * @param notes - Array of colored notes in a measure
 * @returns A JSON string representation of the notes
 */
export const convertNotesToLinearFormat = (notes: ColoredNote[]): string => {
  if (!notes || notes.length === 0) {
    return "[]";
  }

  // Find the lowest MIDI number note
  const notesWithMidi = notes.filter(
    (note) => !note.isDrum && note.note.midiNumber !== undefined,
  );
  if (notesWithMidi.length === 0) {
    return "[]"; // No valid notes found
  }

  const lowestMidiNote = notesWithMidi.reduce(
    (lowest, current) =>
      current.note.midiNumber < lowest.note.midiNumber ? current : lowest,
    notesWithMidi[0],
  );

  const lowestMidi = lowestMidiNote.note.midiNumber;

  // Get the colorPitchClass of the lowest note
  const basePitchClass =
    typeof lowestMidiNote.colorPitchClass === "number"
      ? lowestMidiNote.colorPitchClass
      : 0;

  // Calculate the base value to subtract from all MIDI numbers
  const baseValue = lowestMidi - basePitchClass;

  console.log(
    `Base reference: lowestMidi=${lowestMidi}, basePitchClass=${basePitchClass}, baseValue=${baseValue}`,
  );

  // Create a serializable representation of each note
  const serializedNotes = notes
    .map((note) => {
      // Skip drum notes or notes without MIDI numbers
      if (note.isDrum || note.note.midiNumber === undefined) {
        return null;
      }

      const relativeMidiNumber = note.note.midiNumber - baseValue;

      return {
        span: [
          parseFloat(note.span[0].toFixed(2)),
          parseFloat(note.span[1].toFixed(2)),
        ],
        colorPitchClass: note.colorPitchClass,
        relativeMidiNumber,
      };
    })
    .filter(Boolean); // Remove null entries

  return JSON.stringify(serializedNotes);
};
