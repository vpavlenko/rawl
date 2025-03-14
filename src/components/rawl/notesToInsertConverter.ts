import { ColoredNotesInVoices, Note } from "./parseMidi";

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
  notesInMeasure: Note[];
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
};
