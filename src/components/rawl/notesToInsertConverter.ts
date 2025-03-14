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
  console.log(
    `Rawl syntax representation: ${beatBasedTiming.rawlSyntaxRepresentation}`,
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
 * Interface for a chord - a group of notes that should be played simultaneously
 */
interface Chord {
  notes: ColoredNote[];
  span: [number, number]; // Combined span [start, end]
}

/**
 * Group notes into chords based on their timing
 *
 * @param notes - Array of colored notes sorted by start time
 * @param secondsPerBeat - Duration of one beat in seconds
 * @returns Array of chords (groups of notes)
 */
const groupNotesIntoChords = (
  notes: ColoredNote[],
  secondsPerBeat: number,
): Chord[] => {
  if (!notes || notes.length === 0) {
    return [];
  }

  // Calculate the chord threshold as 0.125 * 2/3 * beat length in seconds
  // This is about a triplet 32nd note duration - allows for slight variation in chord note timings
  const chordThreshold = 0.125 * (2 / 3) * secondsPerBeat;

  const chords: Chord[] = [];
  let currentChord: Chord | null = null;

  // Debug information
  console.log(`Chord detection threshold: ${chordThreshold.toFixed(4)}s`);

  // Process each note in order (they're already sorted by start time)
  for (const note of notes) {
    // Skip drum notes or notes without MIDI numbers
    if (note.isDrum || note.note.midiNumber === undefined) {
      continue;
    }

    const noteStart = note.span[0];
    const noteEnd = note.span[1];

    if (!currentChord) {
      // Start a new chord with this note
      currentChord = {
        notes: [note],
        span: [noteStart, noteEnd],
      };
    } else {
      // Get the current chord's end time
      const currentChordEnd = currentChord.span[1];

      // If this note starts after the current chord has ended (accounting for a small threshold),
      // start a new chord. Otherwise, add it to the current chord.
      if (noteStart >= currentChordEnd - chordThreshold) {
        // Finalize the current chord
        chords.push(currentChord);

        // Start a new chord with this note
        currentChord = {
          notes: [note],
          span: [noteStart, noteEnd],
        };
      } else {
        // Add this note to the current chord
        currentChord.notes.push(note);

        // Update the end time of the chord if this note ends later
        if (noteEnd > currentChord.span[1]) {
          currentChord.span[1] = noteEnd;
        }
      }
    }
  }

  // Add the last chord if it exists
  if (currentChord) {
    chords.push(currentChord);
  }

  // Log the detected chords
  console.log(`Detected ${chords.length} chords from ${notes.length} notes`);
  chords.forEach((chord, i) => {
    console.log(
      `Chord ${i + 1}: ${
        chord.notes.length
      } notes, span: [${chord.span[0].toFixed(3)}, ${chord.span[1].toFixed(
        3,
      )}]`,
    );
    // Log the actual notes in each chord for better debugging
    console.log(
      `  Notes: ${chord.notes.map((n) => n.note.midiNumber).join(", ")}`,
    );
  });

  return chords;
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
    isChord?: boolean;
    chordNotes?: number[];
  }>;
  linearRepresentation: string;
  rawlSyntaxRepresentation: string;
  debugInfo?: any;
} => {
  if (!notes || notes.length === 0) {
    return {
      notesArray: [],
      linearRepresentation: "[]",
      rawlSyntaxRepresentation: "",
    };
  }

  // Debug info collection
  const debugInfo: {
    measureSpan: [number, number];
    beatsInMeasure: number[];
    totalBeats: number;
    inputNotes: string;
    calculations: any[];
    secondsPerBeat?: number;
    measureDuration?: number;
    chords?: any[];
  } = {
    measureSpan,
    beatsInMeasure,
    totalBeats: beatsInMeasure.length + 1,
    inputNotes: JSON.stringify(
      notes.map((n) => ({
        midiNum: n.note.midiNumber,
        span: n.span,
        colorPitchClass: n.colorPitchClass,
      })),
    ),
    calculations: [],
  };

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.span[0] - b.span[0]);

  // Get measure start time and duration in seconds
  const [measureStart, measureEnd] = measureSpan;
  const measureDuration = measureEnd - measureStart;

  // Compute total number of beats in the measure
  const totalBeats = beatsInMeasure.length + 1;

  // Calculate seconds per beat based on the total measure duration
  const secondsPerBeat = measureDuration / totalBeats;

  debugInfo.secondsPerBeat = secondsPerBeat;
  debugInfo.measureDuration = measureDuration;

  // Group notes into chords
  const chords = groupNotesIntoChords(sortedNotes, secondsPerBeat);
  debugInfo.chords = chords.map((chord) => ({
    notes: chord.notes.map((n) => n.note.midiNumber),
    span: chord.span,
  }));

  // Simplified helper function for direct proportional conversion - ZERO-BASED
  const secondsToBeatPosition = (timeInSeconds: number): number => {
    // Ensure the time is within the measure bounds
    const clampedTime = Math.max(
      measureStart,
      Math.min(timeInSeconds, measureEnd),
    );

    // Calculate the beat number directly based on the proportion of the measure
    // Now ZERO-BASED (removed the +1)
    const proportionComplete = (clampedTime - measureStart) / measureDuration;
    const beatPosition = proportionComplete * totalBeats;

    // Log information for debugging
    debugInfo.calculations.push({
      timeInSeconds,
      clampedTime,
      proportionComplete,
      beatPosition,
      secondsPerBeat,
      totalBeats,
      notes: `Zero-based: ${
        clampedTime - measureStart
      }s / ${measureDuration}s * ${totalBeats} beats`,
    });

    return beatPosition;
  };

  // Find the lowest MIDI number note for reference
  const notesWithMidi = sortedNotes.filter(
    (note) => !note.isDrum && note.note.midiNumber !== undefined,
  );

  if (notesWithMidi.length === 0) {
    return {
      notesArray: [],
      linearRepresentation: "[]",
      rawlSyntaxRepresentation: "",
    };
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

  // Process each chord
  const result = [];
  let previousChordEnd = measureStart; // The sentinel chord ends at measure start

  for (const chord of chords) {
    const startTime = chord.span[0];
    const endTime = chord.span[1];

    // Calculate beat position and duration with detailed logging
    const beatPosition = secondsToBeatPosition(startTime);
    const beatEnd = secondsToBeatPosition(endTime);
    const beatDuration = beatEnd - beatPosition;

    // Debug the duration calculation
    debugInfo.calculations.push({
      chord: chord.notes.map((n) => n.note.midiNumber),
      startTime,
      endTime,
      durationSeconds: endTime - startTime,
      beatPosition,
      beatEnd,
      beatDuration,
      expectedBeatDuration: (endTime - startTime) / secondsPerBeat,
      span: chord.span,
    });

    // Calculate distance from previous chord in beats
    const distanceFromPrevious =
      (startTime - previousChordEnd) / secondsPerBeat;

    // Update the previous chord end for the next iteration
    previousChordEnd = endTime;

    // If this is a single-note chord, process it normally
    if (chord.notes.length === 1) {
      const note = chord.notes[0];
      // Skip drum notes or notes without MIDI numbers (safety check)
      if (note.isDrum || note.note.midiNumber === undefined) {
        continue;
      }

      // Calculate relative MIDI number
      const relativeMidiNumber = note.note.midiNumber - baseValue;

      result.push({
        relativeMidiNumber,
        beatPosition: parseFloat(beatPosition.toFixed(3)),
        beatDuration: parseFloat(beatDuration.toFixed(3)),
        distanceFromPrevious: parseFloat(distanceFromPrevious.toFixed(3)),
        colorPitchClass: note.colorPitchClass,
        isChord: false,
      });
    } else {
      // For multi-note chords, collect the relative MIDI numbers of all notes
      const chordNotes = chord.notes
        .filter((note) => !note.isDrum && note.note.midiNumber !== undefined)
        .map((note) => note.note.midiNumber - baseValue)
        .sort((a, b) => a - b); // Sort from lowest to highest

      // Use the lowest note's MIDI number as the primary value
      const relativeMidiNumber = chordNotes[0];

      result.push({
        relativeMidiNumber,
        beatPosition: parseFloat(beatPosition.toFixed(3)),
        beatDuration: parseFloat(beatDuration.toFixed(3)),
        distanceFromPrevious: parseFloat(distanceFromPrevious.toFixed(3)),
        colorPitchClass: chord.notes[0].colorPitchClass, // Use the first note's pitch class
        isChord: true,
        chordNotes: chordNotes,
      });
    }
  }

  // Generate Rawl syntax representation
  const rawlSyntaxRepresentation = convertNotesToRawlSyntax(result);

  console.log("DEBUG INFO: ", JSON.stringify(debugInfo, null, 2));

  return {
    notesArray: result,
    linearRepresentation: JSON.stringify(result),
    rawlSyntaxRepresentation: rawlSyntaxRepresentation,
    debugInfo,
  };
};

/**
 * Map a duration value to the appropriate syntax character in Rawl
 * Always selects the closest matching duration from the available options
 * @param duration - Duration in beats
 * @returns The corresponding syntax character
 */
const getDurationCharacter = (duration: number): string => {
  // Define all possible durations and their symbols
  const allDurations = [
    { value: 0, symbol: "" }, // Zero duration (used as reference point)
    { value: 0.0625, symbol: '"' }, // Sixty-fourth note
    { value: 0.125, symbol: "'" }, // Thirty-second note
    { value: 0.25, symbol: "=" }, // Sixteenth note
    { value: 0.5, symbol: "-" }, // Eighth note
    { value: 1, symbol: "," }, // Quarter note
    { value: 2, symbol: "_" }, // Half note
    { value: 4, symbol: "+" }, // Whole note
    { value: 0.1875, symbol: "'." }, // Dotted thirty-second note
    { value: 0.375, symbol: "=." }, // Dotted sixteenth note
    { value: 0.75, symbol: "-." }, // Dotted eighth note
    { value: 1.5, symbol: ",." }, // Dotted quarter note
    { value: 3, symbol: "_." }, // Dotted half note
    { value: 6, symbol: "+." }, // Dotted whole note
    { value: (0.125 * 2) / 3, symbol: "':" }, // Triplet thirty-second note
    { value: (0.25 * 2) / 3, symbol: "=:" }, // Triplet sixteenth note
    { value: (0.5 * 2) / 3, symbol: "-:" }, // Triplet eighth note
    { value: (1 * 2) / 3, symbol: ",:" }, // Triplet quarter note
    { value: (2 * 2) / 3, symbol: "_:" }, // Triplet half note
    { value: (4 * 2) / 3, symbol: "+:" }, // Triplet whole note
  ];

  // Special case for zero duration
  if (duration === 0) return "";

  // Find the duration with the minimum absolute difference
  let closest = allDurations[1]; // Start with the first non-zero duration
  let minDiff = Math.abs(duration - closest.value);

  for (let i = 1; i < allDurations.length; i++) {
    const diff = Math.abs(duration - allDurations[i].value);
    if (diff < minDiff) {
      minDiff = diff;
      closest = allDurations[i];
    }
  }

  return closest.symbol;
};

/**
 * Convert a MIDI number to a note letter (scale degree) based on C major
 * This is a simple conversion without considering the actual key
 */
const midiNumberToNoteLetter = (midiNumber: number): string => {
  const noteLetters = ["c", "d", "e", "f", "g", "a", "b"];
  return noteLetters[(midiNumber % 12) % 7];
};

/**
 * Convert notes from beat-based timing to Rawl editor syntax
 *
 * @param notes - Array of processed notes with beat timing
 * @param restThreshold - Minimum duration (in beats) to output a rest
 * @returns A string in Rawl syntax format
 */
export const convertNotesToRawlSyntax = (
  notes: Array<{
    relativeMidiNumber: number;
    beatPosition: number;
    beatDuration: number;
    distanceFromPrevious: number;
    colorPitchClass: number | string;
    isChord?: boolean;
    chordNotes?: number[];
  }>,
  restThreshold: number = 0.125,
): string => {
  if (!notes || notes.length === 0) {
    return "";
  }

  // For debug logging
  const debugDetails: any[] = [];

  let result = "";
  let previousNoteEnd = 0;

  // Helper to find actual duration value from symbol
  const getDurationValue = (symbol: string): number => {
    const durationMap: { [key: string]: number } = {
      '"': 0.0625, // Sixty-fourth note
      "'": 0.125, // Thirty-second note
      "=": 0.25, // Sixteenth note
      "-": 0.5, // Eighth note
      ",": 1, // Quarter note
      _: 2, // Half note
      "+": 4, // Whole note
      "'.": 0.1875, // Dotted thirty-second note
      "=.": 0.375, // Dotted sixteenth note
      "-.": 0.75, // Dotted eighth note
      ",.": 1.5, // Dotted quarter note
      "_.": 3, // Dotted half note
      "+.": 6, // Dotted whole note
      "':": (0.125 * 2) / 3, // Triplet thirty-second note
      "=:": (0.25 * 2) / 3, // Triplet sixteenth note
      "-:": (0.5 * 2) / 3, // Triplet eighth note
      ",:": (1 * 2) / 3, // Triplet quarter note
      "_:": (2 * 2) / 3, // Triplet half note
      "+:": (4 * 2) / 3, // Triplet whole note
    };
    return durationMap[symbol] || 0;
  };

  for (const note of notes) {
    // Calculate gap between previous note end and current note start
    const gap = note.beatPosition - previousNoteEnd;

    debugDetails.push({
      noteValue: note.relativeMidiNumber,
      isChord: note.isChord,
      chordNotes: note.chordNotes,
      beatPosition: note.beatPosition,
      previousNoteEnd,
      gap,
      beatDuration: note.beatDuration,
    });

    // If there's a significant gap, emit a rest
    if (gap >= restThreshold) {
      // Discretize the gap duration
      const restDuration = getDurationCharacter(gap);
      const actualRestDuration = getDurationValue(restDuration);
      result += "x" + restDuration + " ";

      // Update previousNoteEnd based on the discretized rest duration
      previousNoteEnd += actualRestDuration;

      debugDetails[debugDetails.length - 1].emittedRest = true;
      debugDetails[debugDetails.length - 1].restDuration = restDuration;
      debugDetails[debugDetails.length - 1].actualRestDuration =
        actualRestDuration;
      debugDetails[debugDetails.length - 1].newPreviousNoteEnd =
        previousNoteEnd;
    }

    // Get the discretized duration for the note
    const durationSymbol = getDurationCharacter(note.beatDuration);
    const actualNoteDuration = getDurationValue(durationSymbol);

    // If this is a chord, output all notes together
    if (note.isChord && note.chordNotes && note.chordNotes.length > 0) {
      // Add all notes in the chord with no spaces between them
      result += note.chordNotes.join("") + durationSymbol + " ";
    } else {
      // Add a single note with its duration
      const noteValue = note.relativeMidiNumber.toString();
      result += noteValue + durationSymbol + " ";
    }

    // Update the previous note end position with the DISCRETIZED duration
    // This is the key change - we use the actual emitted duration, not the original
    previousNoteEnd = note.beatPosition + actualNoteDuration;

    debugDetails[debugDetails.length - 1].emittedNote = true;
    debugDetails[debugDetails.length - 1].durationSymbol = durationSymbol;
    debugDetails[debugDetails.length - 1].actualNoteDuration =
      actualNoteDuration;
    debugDetails[debugDetails.length - 1].newPreviousNoteEnd = previousNoteEnd;
  }

  console.log("RAWL SYNTAX DEBUG: ", JSON.stringify(debugDetails, null, 2));

  return result.trim();
};

/**
 * Log notes information with Rawl syntax conversion
 */
export const logNotesWithRawlSyntax = (
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

  // Get the beat-based timing representation
  const beatBasedTiming = convertNotesToBeatTiming(
    notesInMeasure,
    measureSpan,
    beatsInMeasure,
  );

  console.log(
    `Beat-based timing representation: ${beatBasedTiming.linearRepresentation}`,
  );
  console.log(
    `Rawl syntax representation: ${beatBasedTiming.rawlSyntaxRepresentation}`,
  );
};
