import { Analysis } from "./analysis";
import { MAJOR_SCALE_MAP, MINOR_SCALE_MAP } from "./editor/types";
import { ColoredNote, ColoredNotesInVoices, Note } from "./parseMidi";

/**
 * Mapping from pitch class number to note name
 */
export const PITCH_CLASS_TO_NOTE_NAME: { [key: number]: string } = {
  0: "C",
  1: "C#", // or Db
  2: "D",
  3: "D#", // or Eb
  4: "E",
  5: "F",
  6: "F#", // or Gb
  7: "G",
  8: "G#", // or Ab
  9: "A",
  10: "A#", // or Bb
  11: "B",
};

/**
 * Mapping of flat note names (preferred in certain contexts)
 */
export const FLAT_NOTE_NAMES: { [key: number]: string } = {
  1: "Db",
  3: "Eb",
  6: "Gb",
  8: "Ab",
  10: "Bb",
};

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
  if (measures.length <= measureIndex + 1) {
    return [];
  }

  // Get the time span of the measure
  const measureSpan = getMeasureSpan(measureIndex, measures);

  // Find all beats that fall within this measure
  const beatsInMeasure = beats.filter(
    (beat) => beat >= measureSpan[0] && beat < measureSpan[1],
  );

  return beatsInMeasure;
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

  // Get the note start time
  const noteStart = note.span[0];

  // If we have fewer than 2 measures, assign to the first measure
  if (measures.length < 2) {
    return 0;
  }

  // Define EPSILON in seconds by estimating the duration of a 64th note
  // based on the tempo implied by the measure durations
  // Estimate seconds per beat from the first two measures (assuming 4 beats per measure)
  const firstMeasureDuration = measures[1] - measures[0];
  const secondsPerBeat = firstMeasureDuration / 4; // Assuming 4/4 time signature

  // A 64th note is 0.0625 beats, convert to seconds
  const EPSILON = 0.0625 * secondsPerBeat;

  // Find the leftmost measure for which noteStart < measureEnd - EPSILON
  for (let i = 0; i < measures.length - 1; i++) {
    const measureEnd = measures[i + 1];

    // If the note starts before measureEnd - EPSILON, assign it to this measure
    if (noteStart < measureEnd - EPSILON) {
      return i;
    }
  }

  // If we haven't found a measure yet, assign to the last measure
  return measures.length - 2;
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
 * Get all notes in a specific measure and voice
 */
export const getNotesInMeasureAndVoice = (
  voiceIndex: number,
  measureIndex: number,
  coloredNotes: ColoredNotesInVoices,
  measuresAndBeats: { measures: number[]; beats: number[] },
): {
  notesInMeasure: ColoredNote[];
  measureSpan: [number, number];
  beatsInMeasure: number[];
} => {
  // Make sure voice index is valid
  if (voiceIndex < 0 || voiceIndex >= coloredNotes.length) {
    return { notesInMeasure: [], measureSpan: [0, 0], beatsInMeasure: [] };
  }

  // Make sure measure index is valid
  if (
    measureIndex < 0 ||
    measureIndex >= measuresAndBeats.measures.length - 1
  ) {
    return { notesInMeasure: [], measureSpan: [0, 0], beatsInMeasure: [] };
  }

  // Get all notes in the specified voice and measure
  const notesInMeasure = coloredNotes[voiceIndex].filter(
    (note) => getNoteMeasure(note, measuresAndBeats.measures) === measureIndex,
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
  };
};

/**
 * Log information about notes in a specific measure and voice
 */
export const logMeasureNotesInformation = (
  voiceIndex: number,
  measureIndex: number,
  coloredNotes: ColoredNotesInVoices,
  measuresAndBeats: { measures: number[]; beats: number[] },
  globalKeyInfo?: {
    isMinor: boolean;
    rootPitchClass: number;
    baseMidiNumber?: number; // Added baseMidiNumber parameter
  },
): string | null => {
  const { notesInMeasure, measureSpan, beatsInMeasure } =
    getNotesInMeasureAndVoice(
      voiceIndex,
      measureIndex,
      coloredNotes,
      measuresAndBeats,
    );

  // If no notes found in this measure, return null
  if (notesInMeasure.length === 0) {
    return null;
  }

  // Display the original linear representation (seconds-based)
  const linearRepresentation = convertNotesToLinearFormat(notesInMeasure);

  // Also display the beat-based timing representation
  const beatBasedTiming = convertNotesToBeatTiming(
    notesInMeasure,
    measureSpan,
    beatsInMeasure,
    globalKeyInfo, // Pass global key info to ensure consistent representation
  );

  // Prepare the Rawl syntax with "i " prefix
  const rawlSyntaxWithI = "i " + beatBasedTiming.rawlSyntaxRepresentation;

  // Return the rawl syntax string
  return rawlSyntaxWithI;
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
      ? lowestMidiNote.colorPitchClass % 12
      : lowestMidi % 12;

  // Calculate the base value to subtract from all MIDI numbers
  const baseValue = lowestMidi - basePitchClass;

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
        colorPitchClass:
          typeof note.colorPitchClass === "number"
            ? note.colorPitchClass % 12
            : note.note.midiNumber % 12,
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

  return chords;
};

/**
 * Convert notes from seconds-based timing to measure-dependent beat-based timing
 *
 * @param notes - Array of colored notes in a measure
 * @param measureSpan - Start and end time of the measure in seconds [start, end]
 * @param beatsInMeasure - Array of beat times in seconds within the measure
 * @param globalKeyInfo - Optional global key information to override per-measure detection
 * @returns An object containing both the array of processed notes and a JSON string representation
 */
export const convertNotesToBeatTiming = (
  notes: ColoredNote[],
  measureSpan: [number, number],
  beatsInMeasure: number[],
  globalKeyInfo?: {
    isMinor: boolean;
    rootPitchClass: number;
    baseMidiNumber?: number; // Added baseMidiNumber parameter
  },
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
  timeSignature?: string; // Add time signature to output
  estimatedBpm?: number; // Add estimated BPM to output
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
    globalKeyInfo?: any;
    baseMidiNumber?: number; // Added for debugging
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
    globalKeyInfo: globalKeyInfo,
    baseMidiNumber: globalKeyInfo?.baseMidiNumber, // Added for debugging
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

  // If a global base MIDI number is provided, use it instead of calculating per-measure
  let baseValue: number;

  if (globalKeyInfo?.baseMidiNumber !== undefined) {
    // Use the voice-specific base MIDI number provided from the global key info
    baseValue = globalKeyInfo.baseMidiNumber;
  } else {
    // Find the lowest MIDI number note for reference (legacy approach)
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

    // Use colorPitchClass when available, calculating modulo 12
    const basePitchClass =
      typeof lowestMidiNote.colorPitchClass === "number"
        ? lowestMidiNote.colorPitchClass % 12
        : lowestMidi % 12;

    baseValue = lowestMidi - basePitchClass;
  }

  debugInfo.baseMidiNumber = baseValue;

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

      // Calculate relative MIDI number using the base value
      const relativeMidiNumber = note.note.midiNumber - baseValue;

      result.push({
        relativeMidiNumber,
        beatPosition: parseFloat(beatPosition.toFixed(3)),
        beatDuration: parseFloat(beatDuration.toFixed(3)),
        distanceFromPrevious: parseFloat(distanceFromPrevious.toFixed(3)),
        colorPitchClass:
          typeof note.colorPitchClass === "number"
            ? note.colorPitchClass % 12
            : note.note.midiNumber % 12,
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
        colorPitchClass:
          typeof chord.notes[0].colorPitchClass === "number"
            ? chord.notes[0].colorPitchClass % 12
            : chord.notes[0].note.midiNumber % 12,
        isChord: true,
        chordNotes: chordNotes,
      });
    }
  }

  // Generate Rawl syntax representation with proper pitch encoding
  // Use global key info if provided, otherwise detect from this measure
  const isMinor = globalKeyInfo
    ? globalKeyInfo.isMinor
    : determineIfMinorKey(notes);
  const rawlSyntaxRepresentation = convertNotesToRawlSyntax(
    result,
    undefined,
    isMinor,
  );

  // If we have measures and beats, calculate time signature and BPM
  if (notes.length > 0 && beatsInMeasure.length > 0) {
    // Calculate time signature using the provided measureSpan and beatsInMeasure
    const timeSignature = emitTimeSignature(
      [measureSpan[0], measureSpan[1]],
      beatsInMeasure,
    );

    // Calculate estimated BPM based on user's formula
    // In this context we use the beatsInMeasure.length + 2 for measures
    // (representing the start and end points of a measure)
    const totalBeats = 2 + beatsInMeasure.length;
    const lastMeasureTime = measureSpan[1];
    const estimatedBpm = Math.round(lastMeasureTime / totalBeats / 60);

    return {
      notesArray: result,
      linearRepresentation: JSON.stringify(result),
      rawlSyntaxRepresentation: rawlSyntaxRepresentation,
      timeSignature: timeSignature,
      estimatedBpm: estimatedBpm,
      debugInfo,
    };
  }

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
 * @param isMinor - Whether to use minor scale mapping (from global analysis)
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
  isMinorOverride?: boolean,
): string => {
  if (!notes || notes.length === 0) {
    return "";
  }

  // For debug logging
  const debugDetails: any[] = [];

  let result = "";
  let previousNoteEnd = 0;

  // Determine if the notes are in a minor key, unless overridden
  let isMinor = isMinorOverride;

  if (isMinor === undefined) {
    // Count occurrences of each pitch class for key determination
    const pitchClassCounts: { [key: number]: number } = {};

    // Count occurrences of each pitch class using colorPitchClass when available
    for (const note of notes) {
      const pitchClass =
        typeof note.colorPitchClass === "number"
          ? note.colorPitchClass % 12
          : note.relativeMidiNumber % 12;

      pitchClassCounts[pitchClass] = (pitchClassCounts[pitchClass] || 0) + 1;
    }

    // Check for minor third vs major third
    const minorThirdCount = pitchClassCounts[3] || 0;
    const majorThirdCount = pitchClassCounts[4] || 0;

    // Check for minor sixth vs major sixth
    const minorSixthCount = pitchClassCounts[8] || 0;
    const majorSixthCount = pitchClassCounts[9] || 0;

    // Calculate total evidence for minor vs major according to user's requirements
    const minorEvidence = minorThirdCount + minorSixthCount;
    const majorEvidence = majorThirdCount + majorSixthCount;

    isMinor = minorEvidence > majorEvidence;
  }

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

  // Get all duration symbols sorted by duration value (longest first)
  const getAllDurationSymbolsSorted = (): {
    symbol: string;
    value: number;
  }[] => {
    const allSymbols = [
      { symbol: "+.", value: 6 }, // Dotted whole note
      { symbol: "+", value: 4 }, // Whole note
      { symbol: "_.", value: 3 }, // Dotted half note
      { symbol: "_", value: 2 }, // Half note
      { symbol: ",.", value: 1.5 }, // Dotted quarter note
      { symbol: ",", value: 1 }, // Quarter note
      { symbol: "-.", value: 0.75 }, // Dotted eighth note
      { symbol: "-", value: 0.5 }, // Eighth note
      { symbol: "=.", value: 0.375 }, // Dotted sixteenth note
      { symbol: "=", value: 0.25 }, // Sixteenth note
      { symbol: "'.", value: 0.1875 }, // Dotted thirty-second note
      { symbol: "'", value: 0.125 }, // Thirty-second note
      { symbol: '"', value: 0.0625 }, // Sixty-fourth note
      { symbol: "+:", value: (4 * 2) / 3 }, // Triplet whole note
      { symbol: "_:", value: (2 * 2) / 3 }, // Triplet half note
      { symbol: ",:", value: (1 * 2) / 3 }, // Triplet quarter note
      { symbol: "-:", value: (0.5 * 2) / 3 }, // Triplet eighth note
      { symbol: "=:", value: (0.25 * 2) / 3 }, // Triplet sixteenth note
      { symbol: "':", value: (0.125 * 2) / 3 }, // Triplet thirty-second note
    ];
    return allSymbols.sort((a, b) => b.value - a.value); // Sort by duration value, longest first
  };

  // Function to emit multiple rests to achieve a more precise gap duration
  const emitRests = (
    gap: number,
  ): { restString: string; actualDuration: number } => {
    // If gap is below threshold, don't emit any rests
    if (gap < restThreshold) {
      return { restString: "", actualDuration: 0 };
    }

    let remainingDuration = gap;
    let restString = "";
    let actualTotalDuration = 0;
    const sortedDurations = getAllDurationSymbolsSorted();

    // First, try to emit the largest available rest (≥1 beat)
    const largeRestDurations = sortedDurations.filter((d) => d.value >= 1);

    // Then follow with smaller rests if needed
    const smallRestDurations = sortedDurations.filter((d) => d.value < 1);

    // Combine them with large durations first
    const allDurations = [...largeRestDurations, ...smallRestDurations];

    // Add rests until we've used up the gap (or got close enough)
    while (remainingDuration >= restThreshold) {
      // Find the largest duration that fits in the remaining gap
      const bestFit = allDurations.find((d) => d.value <= remainingDuration);

      if (!bestFit) {
        // If no duration fits, use the smallest available
        const smallestDuration = allDurations[allDurations.length - 1];
        restString += "x" + smallestDuration.symbol + " ";
        actualTotalDuration += smallestDuration.value;
        break; // Exit, we can't get more precise than this
      } else {
        // Add this rest
        restString += "x" + bestFit.symbol + " ";
        remainingDuration -= bestFit.value;
        actualTotalDuration += bestFit.value;
      }

      // Safety check to prevent infinite loops
      if (remainingDuration < 0.001) break;
    }

    return { restString, actualDuration: actualTotalDuration };
  };

  // Helper to convert relative MIDI number to Rawl pitch notation
  const getPitchNotation = (
    relativeMidiNumber: number,
    isChord: boolean = false,
  ): string => {
    // Get the scale map for major/minor
    const scaleMap = isMinor ? MINOR_SCALE_MAP : MAJOR_SCALE_MAP;

    // Convert relative MIDI number to semitones from the reference pitch
    const semitones = relativeMidiNumber;

    // Get the pitch class (0-11) using modulo 12
    const pitchClass = semitones % 12;

    // Calculate octave based on integer division by 12
    const octave = Math.floor(semitones / 12);

    // Define mapping arrays for each octave
    const octaveNotations = [
      // First octave: 1-7
      ["1", "2", "3", "4", "5", "6", "7"],
      // Second octave: q-u
      ["q", "w", "e", "r", "t", "y", "u"],
      // Third octave: a-k
      ["a", "s", "d", "f", "g", "h", "j"],
    ];

    // Helper function to get notation for a diatonic note
    const getDiatonicNotation = (scaleIndex: number, oct: number): string => {
      if (oct >= 0 && oct < octaveNotations.length) {
        return octaveNotations[oct][scaleIndex];
      } else if (oct >= octaveNotations.length) {
        return scaleIndex + 1 + "(" + oct + ")";
      } else {
        return scaleIndex + 1 + "(" + oct + ")";
      }
    };

    // First check if this is a diatonic note
    for (let i = 0; i < 7; i++) {
      if (pitchClass === scaleMap[i]) {
        return getDiatonicNotation(i, octave);
      }
    }

    // This is a chromatic note
    // Find the next higher diatonic pitch class
    let found = false;
    let nextDiatonicIndex = -1;
    let actualOctave = octave;

    // First look within the same octave
    for (let i = 0; i < 7; i++) {
      if (scaleMap[i] > pitchClass) {
        nextDiatonicIndex = i;
        found = true;
        break;
      }
    }

    // If not found in this octave, it's the first degree of next octave
    if (!found) {
      nextDiatonicIndex = 0;
      actualOctave = octave + 1;
    }

    // Get the notation for the diatonic note and prepend with "b"
    return "b" + getDiatonicNotation(nextDiatonicIndex, actualOctave);
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

    // If there's a significant gap, emit rests using the new function
    if (gap >= restThreshold) {
      const { restString, actualDuration } = emitRests(gap);
      result += restString;

      // Update previousNoteEnd based on the actual emitted rest durations
      previousNoteEnd += actualDuration;

      debugDetails[debugDetails.length - 1].emittedRest = true;
      debugDetails[debugDetails.length - 1].restString = restString;
      debugDetails[debugDetails.length - 1].actualRestDuration = actualDuration;
      debugDetails[debugDetails.length - 1].newPreviousNoteEnd =
        previousNoteEnd;
    }

    // Get the discretized duration for the note
    const durationSymbol = getDurationCharacter(note.beatDuration);
    const actualNoteDuration = getDurationValue(durationSymbol);

    // If this is a chord, output all notes together with encoded pitch notation
    if (note.isChord && note.chordNotes && note.chordNotes.length > 0) {
      // Convert each chord note to its proper pitch notation
      const encodedChordNotes = note.chordNotes
        .map((n) => getPitchNotation(n, true))
        .join("");

      // Add all encoded notes in the chord with no spaces between them
      result += encodedChordNotes + durationSymbol + " ";
    } else {
      // Add a single note with its encoded pitch and duration
      const encodedPitch = getPitchNotation(note.relativeMidiNumber);
      result += encodedPitch + durationSymbol + " ";
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

  return result.trim();
};

/**
 * Determine if a collection of notes is likely in a minor key based on the frequency of scale degrees
 * @param notes - Array of colored notes to analyze
 * @returns True if likely in minor, false if likely in major
 */
export const determineIfMinorKey = (notes: ColoredNote[]): boolean => {
  // Filter out drum notes and notes without MIDI numbers
  const notesWithMidi = notes.filter(
    (note) => !note.isDrum && note.note.midiNumber !== undefined,
  );

  if (notesWithMidi.length === 0) return false;

  // Count the occurrences of each pitch class
  const pitchClassCounts: { [key: number]: number } = {};

  notesWithMidi.forEach((note) => {
    // Use colorPitchClass when available, otherwise fallback to midiNumber % 12
    const pitchClass =
      typeof note.colorPitchClass === "number"
        ? note.colorPitchClass % 12
        : note.note.midiNumber! % 12;

    pitchClassCounts[pitchClass] = (pitchClassCounts[pitchClass] || 0) + 1;
  });

  // In minor keys, the third scale degree (pitch class 3 in a natural minor scale) occurs more frequently
  // than the major third (pitch class 4)
  const minorThirdCount = pitchClassCounts[3] || 0;
  const majorThirdCount = pitchClassCounts[4] || 0;

  // Check for minor sixth vs major sixth
  const minorSixthCount = pitchClassCounts[8] || 0;
  const majorSixthCount = pitchClassCounts[9] || 0;

  // Calculate total evidence for minor vs major according to user's requirements
  const minorEvidence = minorThirdCount + minorSixthCount;
  const majorEvidence = majorThirdCount + majorSixthCount;

  return minorEvidence > majorEvidence;
};

/**
 * Convert a MIDI number to Rawl pitch notation based on scale
 * @param midiNumber - The MIDI number to convert
 * @param baseValue - The base MIDI value (reference pitch)
 * @param isMinor - Whether to use minor scale mapping
 * @returns The Rawl pitch notation string
 */
export const midiNumberToRawlPitch = (
  midiNumber: number,
  baseValue: number,
  isMinor: boolean = false,
): string => {
  // Calculate relative value from the base
  const relativeValue = midiNumber - baseValue;

  // Create octave-based encodings for pitches
  // In Rawl: 1-7 are the first octave, q-u are the second, a-k are the third

  // Define the pitch mappings
  const majorMapping: { [key: number]: string } = {
    // First octave (scale degrees 1-7)
    0: "1",
    1: "2",
    2: "3",
    3: "4",
    4: "5",
    5: "6",
    6: "7",
    // Second octave (q-u)
    7: "q",
    8: "w",
    9: "e",
    10: "r",
    11: "t",
    12: "y",
    13: "u",
    // Third octave (a-k)
    14: "a",
    15: "s",
    16: "d",
    17: "f",
    18: "g",
    19: "h",
    20: "j",
    21: "k",
  };

  const minorMapping: { [key: number]: string } = {
    // Same mapping as major but shifted for the minor scale
    // First octave
    0: "1",
    1: "2",
    2: "b3",
    3: "4",
    4: "5",
    5: "b6",
    6: "b7",
    // Second octave
    7: "q",
    8: "w",
    9: "be",
    10: "r",
    11: "t",
    12: "by",
    13: "bu",
    // Third octave
    14: "a",
    15: "s",
    16: "bd",
    17: "f",
    18: "g",
    19: "bh",
    20: "bj",
    21: "bk",
  };

  // Get the appropriate mapping based on scale type
  const mapping = isMinor ? minorMapping : majorMapping;

  // Handle pitch classes with accidentals
  const octave = Math.floor(relativeValue / 7);
  const scaleDegree = relativeValue % 7;

  // For pitches outside our direct mapping, calculate relative position
  if (relativeValue >= 28) {
    // For very high notes, use numeric notation with octave indication
    return (scaleDegree + 1).toString() + "(" + (octave + 1) + ")";
  } else if (relativeValue < 0) {
    // For notes below the reference pitch, use flats
    const absValue = Math.abs(relativeValue);
    const absOctave = Math.floor(absValue / 7);
    const absScaleDegree = absValue % 7;

    if (absOctave === 0) {
      return "b" + (7 - absScaleDegree);
    } else {
      return "b" + mapping[7 * (absOctave - 1) + (7 - absScaleDegree)];
    }
  }

  // Use direct mapping for normal cases
  return mapping[relativeValue] || relativeValue.toString();
};

/**
 * Convert notes to rawl syntax with proper pitch encoding
 * @param notes - Array of colored notes to convert
 * @returns Rawl syntax string
 */
export const convertNotesToEncodedRawlSyntax = (
  notes: ColoredNote[],
): string => {
  if (!notes || notes.length === 0) {
    return "";
  }

  // Find the lowest MIDI number note for reference
  const notesWithMidi = notes.filter(
    (note) => !note.isDrum && note.note.midiNumber !== undefined,
  );

  if (notesWithMidi.length === 0) {
    return "";
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

  // Determine if the collection is more likely in a minor key
  const isMinor = determineIfMinorKey(notes);

  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.span[0] - b.span[0]);

  // Generate Rawl syntax
  let result = "";
  let previousNoteEnd = 0;

  for (const note of sortedNotes) {
    // Skip drum notes or notes without MIDI numbers
    if (note.isDrum || note.note.midiNumber === undefined) {
      continue;
    }

    // Calculate encoded pitch
    const encodedPitch = midiNumberToRawlPitch(
      note.note.midiNumber,
      baseValue,
      isMinor,
    );

    // Calculate duration between previous note end and this note start
    const gap = note.span[0] - previousNoteEnd;
    if (gap >= 0.125) {
      // Add a rest if there's a significant gap
      const restDuration = getDurationCharacter(gap);
      result += "x" + restDuration + " ";
    }

    // Calculate note duration
    const duration = note.span[1] - note.span[0];
    const durationChar = getDurationCharacter(duration);

    // Add the note with duration
    result += encodedPitch + durationChar + " ";

    // Update previous note end time
    previousNoteEnd = note.span[1];
  }

  return result.trim();
};

/**
 * Analyze notes from all voices together to determine if the key is major or minor
 * Using the tonic from analysis.modulations[1] rather than detecting it
 * @param coloredNotes - All notes in all voices
 * @param rootPitchClass - The root pitch class from analysis.modulations[1]
 * @returns An object with the detected key information
 */
export const determineGlobalKey = (
  coloredNotes: ColoredNotesInVoices,
  rootPitchClass: number = 0, // Default to C if not provided
): {
  isMinor: boolean;
  rootPitchClass: number;
  keyName: string;
  voiceOctaves: { [key: number]: number };
  voiceBaseMidiNumbers: { [key: number]: number }; // Added: Store base MIDI numbers for each voice
} => {
  // Process each voice separately for octave determination
  const voiceOctaves: { [key: number]: number } = {};
  const voiceBaseMidiNumbers: { [key: number]: number } = {}; // Added: Store base MIDI for each voice

  // Collect all notes across all voices for combined key analysis
  const allNotes: ColoredNote[] = [];

  // Process each voice for octave determination and collect all notes
  for (let voiceIndex = 0; voiceIndex < coloredNotes.length; voiceIndex++) {
    const voiceNotes = coloredNotes[voiceIndex];

    // Add all valid notes to the combined pool
    allNotes.push(
      ...voiceNotes.filter(
        (note) => !note.isDrum && note.note.midiNumber !== undefined,
      ),
    );

    // Skip empty voices for octave calculation
    const notesWithMidi = voiceNotes.filter(
      (note) => !note.isDrum && note.note.midiNumber !== undefined,
    );

    if (notesWithMidi.length === 0) {
      continue;
    }

    // MODIFIED: Find the lowest MIDI note in this voice for base MIDI number calculation
    const lowestMidiNote = notesWithMidi.reduce(
      (lowest, current) =>
        current.note.midiNumber < lowest.note.midiNumber ? current : lowest,
      notesWithMidi[0],
    );

    const lowestMidi = lowestMidiNote.note.midiNumber;

    // Get the colorPitchClass of the lowest note
    const basePitchClass =
      typeof lowestMidiNote.colorPitchClass === "number"
        ? lowestMidiNote.colorPitchClass % 12
        : lowestMidi % 12;

    // Calculate the base MIDI number by subtracting colorPitchClass from the lowest MIDI number
    const baseMidiNumber = lowestMidi - basePitchClass;

    // Store this base MIDI number for consistent use across all measures of this voice
    voiceBaseMidiNumbers[voiceIndex] = baseMidiNumber;

    // Calculate octave where "1" will be mapped (derived from base MIDI number)
    const baseOctave = Math.floor(baseMidiNumber / 12);

    // Use the calculated baseOctave for all voices consistently
    voiceOctaves[voiceIndex] = baseOctave;
  }

  // If no valid notes were found across all voices
  if (allNotes.length === 0) {
    return {
      isMinor: false,
      rootPitchClass: rootPitchClass,
      keyName: `${PITCH_CLASS_TO_NOTE_NAME[rootPitchClass]} major`,
      voiceOctaves: { 0: 5, 1: 3 },
      voiceBaseMidiNumbers: {}, // Added empty object for base MIDI numbers
    };
  }

  // Now analyze all notes together for key determination
  // Count occurrences of each pitch class using colorPitchClass
  const pitchClassCounts: { [key: number]: number } = {};

  allNotes.forEach((note) => {
    // Use colorPitchClass when available
    const pitchClass =
      typeof note.colorPitchClass === "number"
        ? note.colorPitchClass % 12
        : note.note.midiNumber! % 12;

    pitchClassCounts[pitchClass] = (pitchClassCounts[pitchClass] || 0) + 1;
  });

  // Estimate if it's minor or major based on counting specific scale degrees
  // - Count pitches where %12==3 and %12==8 (minor third and minor sixth)
  // - Count pitches where %12==4 and %12==9 (major third and major sixth)
  const minorThirdCount = pitchClassCounts[3] || 0;
  const minorSixthCount = pitchClassCounts[8] || 0;
  const majorThirdCount = pitchClassCounts[4] || 0;
  const majorSixthCount = pitchClassCounts[9] || 0;

  // Calculate total evidence for minor vs major
  const minorEvidence = minorThirdCount + minorSixthCount;
  const majorEvidence = majorThirdCount + majorSixthCount;
  const isMinor = minorEvidence > majorEvidence;

  // Get the note name, preferring flats for minor keys
  let noteName =
    isMinor && FLAT_NOTE_NAMES[rootPitchClass]
      ? FLAT_NOTE_NAMES[rootPitchClass]
      : PITCH_CLASS_TO_NOTE_NAME[rootPitchClass];

  const keyName = `${noteName} ${isMinor ? "minor" : "major"}`;

  return {
    isMinor,
    rootPitchClass,
    keyName,
    voiceOctaves,
    voiceBaseMidiNumbers, // Added: Return the base MIDI numbers
  };
};

/**
 * Generate a complete formatted score with all voices and analysis information
 * @param coloredNotes - All notes in all voices
 * @param measuresAndBeats - Measure and beat information
 * @param analysis - Analysis object with sections, phrasePatch, etc.
 * @returns Formatted string with complete score
 */
export const generateFormattedScore = (
  coloredNotes: ColoredNotesInVoices,
  measuresAndBeats: { measures: number[]; beats: number[] },
  analysis: Analysis,
): string => {
  // Get time signature from measures and beats
  const timeSignature = emitTimeSignature(
    measuresAndBeats.measures,
    measuresAndBeats.beats,
  );

  // Initialize output
  let outputLines: string[] = [];
  let result = "";

  // Get the rootPitchClass from analysis.modulations
  const rootPitchClass =
    analysis.modulations && analysis.modulations[1]
      ? analysis.modulations[1]
      : 0;

  // Determine the global key once for the entire score, passing the rootPitchClass from analysis
  const globalKeyInfo = determineGlobalKey(coloredNotes, rootPitchClass);

  // Add key information
  const keyName = getKeyName(rootPitchClass, globalKeyInfo.isMinor);
  outputLines.push(keyName);

  // Add time signature right after key
  outputLines.push(timeSignature);

  // Add sections if available - keep them as phrase indices, exclude 0 and 1
  if (analysis.sections && analysis.sections.length > 0) {
    const filteredSections = analysis.sections
      .filter((section) => section > 0) // Exclude 0 and 1
      .sort((a, b) => a - b)
      .map((section) => section + 1);

    if (filteredSections.length > 0) {
      outputLines.push(`sections ${filteredSections.join(" ")}`);
    }
  }

  // Calculate and add estimated BPM after time signature
  if (
    measuresAndBeats.measures.length > 0 &&
    measuresAndBeats.beats.length > 0
  ) {
    // Detailed logging for BPM calculation
    console.log("BPM Calculation Debug:");
    console.log("- Measures array:", measuresAndBeats.measures);
    console.log("- Beats array:", measuresAndBeats.beats);

    // Total beats = beats.length + measures.length as specified
    const totalBeats =
      measuresAndBeats.measures.length + measuresAndBeats.beats.length;
    console.log("- Total beats:", totalBeats);

    const lastMeasureTime =
      measuresAndBeats.measures[measuresAndBeats.measures.length - 1];
    console.log("- Last measure time (seconds):", lastMeasureTime);

    const timePerBeat = lastMeasureTime / totalBeats;
    console.log("- Time per beat (seconds):", timePerBeat);

    const beatsPerSecond = 1 / timePerBeat;
    console.log("- Beats per second:", beatsPerSecond);

    const beatsPerMinute = beatsPerSecond * 60;
    console.log("- Beats per minute (before rounding):", beatsPerMinute);

    const estimatedBpm = Math.round(beatsPerMinute);
    console.log("- Final estimated BPM (rounded):", estimatedBpm);
    console.log(
      "- Is BPM in reasonable range (50-300)?",
      estimatedBpm >= 50 && estimatedBpm <= 300,
    );

    // Alternative calculation that might be more accurate for debugging
    const altBpm = Math.round(60 / (lastMeasureTime / totalBeats));
    console.log("- Alternative BPM calculation:", altBpm);

    // Only add a reasonable BPM (between 50 and 300)
    if (estimatedBpm >= 50 && estimatedBpm <= 300) {
      outputLines.push(`bpm ${estimatedBpm}`);
    } else {
      console.log(
        "WARNING: Calculated BPM outside reasonable range (50-300), not adding to output",
      );

      // Log raw inputs that might be causing issues
      console.log("- Raw measures.length:", measuresAndBeats.measures.length);
      console.log("- Raw beats.length:", measuresAndBeats.beats.length);
      console.log("- First measure time:", measuresAndBeats.measures[0]);
      console.log("- Last measure time:", lastMeasureTime);
      console.log(
        "- Measure time span:",
        lastMeasureTime - measuresAndBeats.measures[0],
      );
    }
  } else {
    console.log("Cannot calculate BPM: Not enough measures or beats");
  }

  // Add phrases if available
  if (analysis.phrasePatch && analysis.phrasePatch.length > 0) {
    const phrasePairs: string[] = [];

    // Format appropriately and skip zero diffs
    analysis.phrasePatch.forEach((patch) => {
      // Skip if diff is zero
      if (patch.diff === 0) return;

      // Format as measure+diff or measure{diff} depending on sign
      const formatted =
        patch.diff > 0
          ? `${patch.measure}+${patch.diff}`
          : `${patch.measure}${patch.diff}`; // No need to add + for negative numbers

      phrasePairs.push(formatted);
    });

    if (phrasePairs.length > 0) {
      outputLines.push(`phrases ${phrasePairs.join(" ")}`);
    }
  }

  // Add blank line between header and voice definitions
  if (outputLines.length > 0) {
    result = outputLines.join("\n") + "\n\n";
  }

  // Process each voice
  for (let voiceIndex = 0; voiceIndex < coloredNotes.length; voiceIndex++) {
    // Skip empty voices
    if (coloredNotes[voiceIndex].length === 0) continue;

    // Add appropriate voice label with octave
    const octave =
      globalKeyInfo.voiceOctaves[voiceIndex] ||
      (voiceIndex === 0 ? 5 : voiceIndex === 1 ? 3 : 4);

    if (voiceIndex === 0) {
      result += `rh ${octave}\n`;
    } else if (voiceIndex === 1) {
      result += `\n\nlh ${octave}\n`;
    } else if (voiceIndex === 2) {
      result += `\n\nch2 ${octave}\n`;
    } else {
      result += `\n\nch${voiceIndex} ${octave}\n`;
    }

    // First, gather all measure commands for this voice
    const measureCommands: { [measureIndex: number]: string | null } = {};
    const measureCount = measuresAndBeats.measures.length - 1;

    // Use the global key info for all measure conversions to ensure consistency
    // This is crucial - we use the same key for all measures to maintain consistency
    for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
      try {
        const rawlSyntax = logMeasureNotesInformation(
          voiceIndex,
          measureIndex,
          coloredNotes,
          measuresAndBeats,
          {
            isMinor: globalKeyInfo.isMinor,
            rootPitchClass: globalKeyInfo.rootPitchClass,
            // Add the voice base MIDI number for consistent pitch calculation
            baseMidiNumber: globalKeyInfo.voiceBaseMidiNumbers[voiceIndex],
          },
        );

        measureCommands[measureIndex] = rawlSyntax;
      } catch (error) {
        console.error(
          `Error processing voice ${voiceIndex}, measure ${measureIndex + 1}:`,
          error,
        );
        measureCommands[measureIndex] = null;
      }
    }

    // Compress by finding duplicate insert commands and replacing with copy commands
    const insertToMeasureMap: { [insertCommand: string]: number } = {};
    const compressedCommands: { [measureIndex: number]: string } = {};

    for (let measureIndex = 0; measureIndex < measureCount; measureIndex++) {
      const rawlSyntax = measureCommands[measureIndex];

      // Skip measures without notes
      if (rawlSyntax === null) continue;

      // Check if we've seen this exact insert before
      if (rawlSyntax in insertToMeasureMap) {
        // We've seen this exact command before - use a copy instead
        const originalMeasureIndex = insertToMeasureMap[rawlSyntax];
        compressedCommands[measureIndex] = `c ${originalMeasureIndex + 1}`;
      } else {
        // This is the first time we've seen this command - store it
        insertToMeasureMap[rawlSyntax] = measureIndex;
        compressedCommands[measureIndex] = rawlSyntax;
      }
    }

    // Apply a second compression step to find consecutive copy commands
    // that reference consecutive measures, and combine them into ranges
    const rangeCompressedOutput: string[] = [];
    let currentIndex = 0;

    while (currentIndex < measureCount) {
      // Skip measures without commands
      if (!(currentIndex in compressedCommands)) {
        currentIndex++;
        continue;
      }

      const currentCommand = compressedCommands[currentIndex];
      // Check if this is a copy command
      const copyMatch = currentCommand.match(/^c (\d+)$/);

      if (!copyMatch) {
        // Not a copy command, just add it as is
        rangeCompressedOutput.push(`${currentIndex + 1} ${currentCommand}`);
        currentIndex++;
        continue;
      }

      // This is a copy command - check if we can find a consecutive sequence
      const startCopiedMeasure = parseInt(copyMatch[1]);
      let rangeLength = 1;
      let nextIndex = currentIndex + 1;

      while (nextIndex < measureCount && nextIndex in compressedCommands) {
        const nextCommand = compressedCommands[nextIndex];
        const nextCopyMatch = nextCommand.match(/^c (\d+)$/);

        // Break if not a copy command
        if (!nextCopyMatch) break;

        const nextCopiedMeasure = parseInt(nextCopyMatch[1]);

        // Check if this continues the sequence (next measure copies next consecutive source)
        if (nextCopiedMeasure !== startCopiedMeasure + rangeLength) break;

        // This is part of the sequence
        rangeLength++;
        nextIndex++;
      }

      // If we found a sequence of at least 2 copies, use range notation
      if (rangeLength > 1) {
        rangeCompressedOutput.push(
          `${currentIndex + 1} c ${startCopiedMeasure}-${
            startCopiedMeasure + rangeLength - 1
          }`,
        );
        currentIndex = nextIndex;
      } else {
        // Just a single copy, add as is
        rangeCompressedOutput.push(`${currentIndex + 1} ${currentCommand}`);
        currentIndex++;
      }
    }

    // Add the range-compressed output to the result
    result += rangeCompressedOutput.join("\n") + "\n";
  }

  return result;
};

/**
 * Calculates and emits the time signature based on the number of beats in measure 2
 * @param measures Array of measure boundary positions
 * @param beats Array of beat positions
 * @returns Time signature string in the format '{numBeats}/4'
 */
export const emitTimeSignature = (
  measures: number[],
  beats: number[],
): string => {
  // Use measure index 2 (third measure, index starts at 0)
  const measureIndex = 2;

  // Check if we have enough measures
  if (measures.length <= measureIndex + 1) {
    // Default to 4/4 if we don't have enough measures
    return "4/4";
  }

  // Get beats in measure 2
  const beatsInMeasure = getBeatsInMeasure(measureIndex, measures, beats);

  // Number of beats is the length of beatsInMeasure array + 1 (as specified)
  const numBeats = beatsInMeasure.length + 1;

  // Return the time signature in the format 'numBeats/4'
  return `${numBeats}/4`;
};

/**
 * Converts a pitch class to a key name
 * @param pitchClass Pitch class (0-11, where 0 is C)
 * @param isMinor Whether the key is minor
 * @returns Key name in the format like "C major" or "Eb minor"
 */
const getKeyName = (pitchClass: number, isMinor: boolean): string => {
  // Use flat notation for keys that traditionally use flats
  const useFlat = [1, 3, 6, 8, 10].includes(pitchClass);

  // Get the key name
  const keyLetter = useFlat
    ? FLAT_NOTE_NAMES[pitchClass]
    : PITCH_CLASS_TO_NOTE_NAME[pitchClass];

  // Return formatted key name
  return `${keyLetter} ${isMinor ? "minor" : "major"}`;
};
