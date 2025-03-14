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

  // Display the original linear representation (seconds-based)
  const linearRepresentation = convertNotesToLinearFormat(notesInMeasure);
  console.log(`Linear representation (seconds-based): ${linearRepresentation}`);

  // Also display the beat-based timing representation
  const beatBasedTiming = convertNotesToBeatTiming(
    notesInMeasure,
    measureSpan,
    beatsInMeasure,
  );
  console.log(
    `Beat-based timing representation: ${beatBasedTiming.linearRepresentation}`,
  );
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

/**
 * Convert notes from seconds-based timing to measure-dependent beat-based timing
 *
 * @param notes - Array of colored notes in a measure
 * @param measureSpan - Start and end time of the measure in seconds [start, end]
 * @param beatsInMeasure - Array of beat times in seconds within the measure
 * @returns An object containing both the array of processed notes and a JSON string representation
 */
export const convertNotesToBeatTiming = (
  notes: ColoredNote[],
  measureSpan: [number, number],
  beatsInMeasure: number[],
): {
  notesArray: Array<{
    relativeMidiNumber: number;
    beatPosition: number;
    beatDuration: number;
    distanceFromPrevious: number;
    colorPitchClass: number | string;
  }>;
  linearRepresentation: string;
} => {
  if (!notes || notes.length === 0) {
    return { notesArray: [], linearRepresentation: "[]" };
  }

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.span[0] - b.span[0]);

  // Get measure start time and duration in seconds
  const [measureStart, measureEnd] = measureSpan;
  const measureDuration = measureEnd - measureStart;

  // Compute total number of beats in the measure
  const totalBeats = beatsInMeasure.length + 1;

  // Helper function to convert seconds to beat position
  const secondsToBeatPosition = (timeInSeconds: number): number => {
    // Find the surrounding beat markers
    let beforeBeatIndex = -1;
    let beforeBeatTime = measureStart;
    let afterBeatTime = measureEnd;

    for (let i = 0; i < beatsInMeasure.length; i++) {
      if (beatsInMeasure[i] <= timeInSeconds) {
        beforeBeatIndex = i;
        beforeBeatTime = beatsInMeasure[i];
      } else {
        afterBeatTime = beatsInMeasure[i];
        break;
      }
    }

    // If time is after all beat markers, use measure end as the after beat
    if (beforeBeatIndex === beatsInMeasure.length - 1) {
      afterBeatTime = measureEnd;
    }

    // Calculate beat position using linear interpolation
    const beatsBefore = beforeBeatIndex + 1; // +1 because the first beat is at index 0
    const totalSegmentTime = afterBeatTime - beforeBeatTime;
    const relativePosition =
      (timeInSeconds - beforeBeatTime) / totalSegmentTime;

    return beatsBefore + relativePosition;
  };

  // Find the lowest MIDI number note for reference
  const notesWithMidi = sortedNotes.filter(
    (note) => !note.isDrum && note.note.midiNumber !== undefined,
  );

  if (notesWithMidi.length === 0) {
    return { notesArray: [], linearRepresentation: "[]" };
  }

  const lowestMidiNote = notesWithMidi.reduce(
    (lowest, current) =>
      current.note.midiNumber < lowest.note.midiNumber ? current : lowest,
    notesWithMidi[0],
  );

  const lowestMidi = lowestMidiNote.note.midiNumber;
  const basePitchClass =
    typeof lowestMidiNote.colorPitchClass === "number"
      ? lowestMidiNote.colorPitchClass
      : 0;
  const baseValue = lowestMidi - basePitchClass;

  // Process each note
  const result = [];
  let previousNoteEnd = measureStart; // The sentinel note ends at measure start

  for (const note of sortedNotes) {
    // Skip drum notes or notes without MIDI numbers
    if (note.isDrum || note.note.midiNumber === undefined) {
      continue;
    }

    const startTime = note.span[0];
    const endTime = note.span[1];

    // Calculate beat position and duration
    const beatPosition = secondsToBeatPosition(startTime);
    const beatEnd = secondsToBeatPosition(endTime);
    const beatDuration = beatEnd - beatPosition;

    // Calculate distance from previous note in beats
    const distanceFromPrevious =
      secondsToBeatPosition(startTime) - secondsToBeatPosition(previousNoteEnd);

    // Update the previous note end for the next iteration
    previousNoteEnd = endTime;

    // Calculate relative MIDI number
    const relativeMidiNumber = note.note.midiNumber - baseValue;

    result.push({
      relativeMidiNumber,
      beatPosition: parseFloat(beatPosition.toFixed(3)),
      beatDuration: parseFloat(beatDuration.toFixed(3)),
      distanceFromPrevious: parseFloat(distanceFromPrevious.toFixed(3)),
      colorPitchClass: note.colorPitchClass,
    });
  }

  return {
    notesArray: result,
    linearRepresentation: JSON.stringify(result),
  };
};
