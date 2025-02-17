import { TICKS_PER_QUARTER } from "../forge/constants";
import { Note } from "../forge/ForgeGenerator";
import {
  BeatPosition,
  Command,
  CommandContext,
  KeySignature,
  LogicalNote,
  MAJOR_SCALE_MAP,
  MeasureSpan,
  MINOR_SCALE_MAP,
  NOTE_LETTER_MAP,
  TimeSignature,
} from "./types";

export const parseKey = (keyString: string): KeySignature | null => {
  // Changed regex to make accidentals optional
  const match = keyString.match(/^([A-G][b#]?)\s+(major|minor)$/i);
  if (!match) return null;

  const [_, root, mode] = match;

  // Map note names to numbers (0 = C, 1 = C#/Db, etc.)
  const noteToNumber: { [key: string]: number } = {
    C: 0,
    "C#": 1,
    Db: 1,
    D: 2,
    "D#": 3,
    Eb: 3,
    E: 4,
    F: 5,
    "F#": 6,
    Gb: 6,
    G: 7,
    "G#": 8,
    Ab: 8,
    A: 9,
    "A#": 10,
    Bb: 10,
    B: 11,
  };

  const tonic = noteToNumber[root];

  if (tonic === undefined) return null;

  return {
    tonic,
    mode: mode.toLowerCase() as "major" | "minor",
  };
};

export const parseCopyCommand = (line: string): Command | null => {
  // Match the command format: coordinate c sourceMeasureSpan sequenceOfShifts
  // Examples:
  // "2b1.5 c 1b1-8b4 0" - explicit beat positions
  // "2 c 1-8 0" - implicit beat positions (1b1-9b0)
  // "2 c 1 0" - single measure (1b1-2b0)
  // "2 c 1 0 x 0" - with rest marker 'x' to skip a copy
  const match = line.match(
    /^(\d+)(?:b(\d+(?:\.\d+)?))?\s+c\s+(\d+)(?:b(\d+(?:\.\d+)?))?(?:-(\d+)(?:b(\d+(?:\.\d+)?))?)?\s+([x\-\d](?:\s+[x\-\d]+)*)?$/,
  );
  if (!match) return null;

  const [
    _,
    measureStr,
    beatStr,
    sourceStartStr,
    sourceStartBeatStr,
    sourceEndStr,
    sourceEndBeatStr,
    shiftsStr,
  ] = match;
  const targetMeasure = parseInt(measureStr);
  const targetBeat = beatStr ? parseFloat(beatStr) : 1;

  // Parse source measure(s)
  const sourceStart = parseInt(sourceStartStr);
  const sourceStartBeat = sourceStartBeatStr
    ? parseFloat(sourceStartBeatStr)
    : 1;

  let sourceEnd: number;
  let sourceEndBeat: number;

  if (sourceEndStr) {
    // If there's an explicit end measure
    sourceEnd = parseInt(sourceEndStr);
    if (sourceEndBeatStr) {
      // If there's an explicit end beat, use it
      sourceEndBeat = parseFloat(sourceEndBeatStr);
    } else {
      // If no explicit end beat, use the convention: end at start of next measure
      sourceEnd = sourceEnd + 1;
      sourceEndBeat = 0;
    }
  } else {
    // Single measure specified - copy until start of next measure
    sourceEnd = sourceStart + 1;
    sourceEndBeat = 0;
  }

  // Extract all shifts by matching numbers or 'x'
  const shifts = (shiftsStr || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => (token === "x" ? "x" : Number(token)));

  return {
    type: "copy",
    targetMeasure,
    targetBeat,
    sourceStart,
    sourceStartBeat,
    sourceEnd,
    sourceEndBeat,
    shifts,
  };
};

export const parseTimeSignatures = (line: string): TimeSignature[] | null => {
  const parts = line.trim().split(/\s+/);
  const signatures: TimeSignature[] = [];
  let currentMeasure = 1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Parse time signature format (numerator/4)
    if (part.includes("/")) {
      const [numerator, denominator] = part.split("/");
      const num = parseInt(numerator);

      // Validate format
      if (isNaN(num) || denominator !== "4" || num <= 0) {
        return null;
      }

      signatures.push({
        numerator: num,
        measureStart: currentMeasure,
      });
    } else {
      // Must be a measure number
      const measure = parseInt(part);
      if (isNaN(measure) || measure <= currentMeasure) {
        return null;
      }

      // Next part must be a time signature
      if (i + 1 >= parts.length || !parts[i + 1].includes("/")) {
        return null;
      }

      currentMeasure = measure;
    }
  }

  return signatures.length > 0 ? signatures : null;
};

export const getTimeSignatureAt = (
  measure: number,
  timeSignatures: TimeSignature[],
): number => {
  // Default to 4/4 if no time signatures defined
  if (!timeSignatures.length) return 4;

  // Find the last time signature that starts before or at this measure
  for (let i = timeSignatures.length - 1; i >= 0; i--) {
    if (timeSignatures[i].measureStart <= measure) {
      return timeSignatures[i].numerator;
    }
  }

  // If no time signature found before this measure, use the first one
  return timeSignatures[0].numerator;
};

export const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
  // Remove comments
  const cleanLine = line.split("#")[0].trim();
  if (!cleanLine) return null;

  // Handle track switch commands with optional octave
  const trackMatch = cleanLine.match(/^(lh|rh)(?:\s+(\d+))?$/i);
  if (trackMatch) {
    const [_, hand, octave] = trackMatch;
    return {
      type: "track",
      track: hand.toLowerCase() === "lh" ? 2 : 1,
      baseOctave: octave ? parseInt(octave) : undefined,
    };
  }

  // Try parsing as time signature command
  if (cleanLine.includes("/4")) {
    const signatures = parseTimeSignatures(cleanLine);
    if (signatures) {
      return { type: "time", signatures };
    }
  }

  // Try parsing as key command
  const key = parseKey(cleanLine);
  if (key) {
    return { type: "key", key };
  }

  // Try parsing as copy command
  const copyCmd = parseCopyCommand(cleanLine);
  if (copyCmd) {
    return copyCmd;
  }

  // Parse as note insert command - new syntax: "{coordinate} i {notes}"
  const match = cleanLine.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
  if (match) {
    const [_, measureStr, beatStr, melodyPart] = match;
    const startMeasure = parseInt(measureStr);
    const startBeat = beatStr ? parseFloat(beatStr) : 1;
    const key = context.currentKey;
    const beatsPerMeasure = context.beatsPerMeasure || 4;

    // Validate measure and beat
    if (
      isNaN(startMeasure) ||
      startMeasure < 1 ||
      isNaN(startBeat) ||
      startBeat < 1
    ) {
      return null;
    }

    // Get time signature for this measure
    if (startBeat > beatsPerMeasure) {
      return null;
    }

    const notes = parseMelodyString(cleanLine, {
      ...context,
      beatsPerMeasure,
    });
    if (notes.length > 0) {
      return { type: "insert", notes };
    }
  }

  return null;
};

// Helper function to calculate MIDI number from scale degree and key
export const calculateMidiNumber = (
  scaleDegree: number | string,
  accidental: number | undefined,
  octaveShift: number,
  key: KeySignature,
  track: number, // 1 for RH, 2 for LH
  context: CommandContext,
): number | null => {
  if (scaleDegree === -Infinity) return null; // Rest

  // Get absolute scale degree
  const absoluteScaleDegree =
    typeof scaleDegree === "string"
      ? NOTE_LETTER_MAP[scaleDegree.toLowerCase()] || 0
      : scaleDegree;

  // Calculate which octave this scale degree belongs to
  const baseDegree = absoluteScaleDegree % 7;
  const octave = Math.floor(absoluteScaleDegree / 7);

  // Get the semitone offset for this scale degree
  const scaleMap = key.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
  const semitoneOffset = scaleMap[baseDegree];

  // Use the appropriate base octave from context
  const baseOctave = track === 1 ? context.baseOctaveRH : context.baseOctaveLH;

  // Calculate final MIDI number
  const midiNumber = key.tonic + semitoneOffset + (baseOctave + octave) * 12;

  // Ensure the note is within MIDI range (0-127)
  if (midiNumber < 0 || midiNumber > 127) return null;

  return midiNumber;
};

// Helper to calculate the global beat position for a measure and beat
export const calculateGlobalBeatPosition = (
  measure: number,
  beatInMeasure: number,
  timeSignatures: TimeSignature[],
): BeatPosition => {
  let totalBeats = 0;
  let currentMeasure = 1;

  // Add up beats for all complete measures before the target measure
  while (currentMeasure < measure) {
    totalBeats += getTimeSignatureAt(currentMeasure, timeSignatures);
    currentMeasure++;
  }

  // Add the beats within the target measure
  return totalBeats + (beatInMeasure - 1);
};

// Helper to convert a global beat position back to measure and beat
export const globalBeatToMeasureAndBeat = (
  globalBeat: BeatPosition,
  timeSignatures: TimeSignature[],
): { measure: number; beatInMeasure: number } => {
  let measure = 1;
  let remainingBeats = globalBeat;

  // Subtract complete measures until we can't anymore
  while (remainingBeats >= getTimeSignatureAt(measure, timeSignatures)) {
    remainingBeats -= getTimeSignatureAt(measure, timeSignatures);
    measure++;
  }

  return {
    measure,
    beatInMeasure: remainingBeats + 1,
  };
};

export const parseMelodyString = (
  melodyString: string,
  context: CommandContext,
): LogicalNote[] => {
  const lines = melodyString.split("\n").filter((line) => line.trim());

  return lines.flatMap((line) => {
    // Updated regex to match new syntax with explicit 'i' command
    const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
    if (!match) return [];

    const [_, measureStr, beatStr, melodyPart] = match;
    const startMeasure = parseInt(measureStr);
    const startBeat = beatStr ? parseFloat(beatStr) : 1;
    const key = context.currentKey;

    // Calculate the global beat position for the start
    let currentPosition = calculateGlobalBeatPosition(
      startMeasure,
      startBeat,
      context.timeSignatures,
    );

    // Process tokens as before...
    const tokens = processTokens(melodyPart);
    const result: LogicalNote[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token.trim()) continue;

      // Check if this token is a duration marker
      const isDurationMarker = /^[+_\-=,]\.?$/.test(token);

      if (isDurationMarker) {
        // Apply this duration to the previous note(s)
        const duration = getDuration(token, context.beatsPerMeasure || 4);

        // Find the last group of notes (could be a single note or chord)
        let lastNoteIndex = result.length - 1;
        while (
          lastNoteIndex >= 0 &&
          result[lastNoteIndex].span.start ===
            result[result.length - 1].span.start
        ) {
          result[lastNoteIndex].duration = duration * TICKS_PER_QUARTER;
          result[lastNoteIndex].span.end =
            result[lastNoteIndex].span.start + duration;
          lastNoteIndex--;
        }

        // Update position for next note
        if (result.length > 0) {
          currentPosition = result[result.length - 1].span.end;
        }
        continue;
      }

      // Handle note or chord
      const noteChars = token.match(/[a-zA-Z1-90x]/g) || [];
      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + 1, // Default to one beat duration
      };

      // Check if this is a rest (x)
      if (noteChars.length === 1 && noteChars[0] === "x") {
        result.push({
          scaleDegree: -Infinity, // Use -Infinity for rests
          duration: TICKS_PER_QUARTER,
          span: { ...span },
          midiNumber: null,
        });
        continue;
      }

      // Process each note in the chord (or single note)
      for (const noteChar of noteChars) {
        const absoluteScaleDegree = NOTE_LETTER_MAP[noteChar.toLowerCase()];
        if (absoluteScaleDegree === undefined) continue;

        const midiNumber = calculateMidiNumber(
          absoluteScaleDegree,
          0, // No accidentals support yet
          0, // No octave shifts needed with new system
          key,
          context.currentTrack,
          context,
        );

        if (midiNumber !== null) {
          result.push({
            scaleDegree: absoluteScaleDegree,
            duration: TICKS_PER_QUARTER,
            span: { ...span },
            midiNumber,
          });
        }
      }

      // If this is the last token and it's not a duration marker,
      // advance the position by one beat
      if (i === tokens.length - 1 && !isDurationMarker) {
        currentPosition += 1;
      }
    }

    return result;
  });
};

const getDuration = (marker: string, beatsPerMeasure: number = 4): number => {
  // Split marker into base duration and check for dot
  const hasDot = marker.includes(".");
  const baseDuration = marker.split(".")[0];
  let duration: number;

  switch (baseDuration) {
    case "+":
      duration = beatsPerMeasure; // length of time signature at insertion
      break;
    case "_":
      duration = 2; // half note
      break;
    case ",":
      duration = 1; // quarter note (comma)
      break;
    case "-":
      duration = 0.5; // eighth note
      break;
    case "=":
      duration = 0.25; // sixteenth note
      break;
    default:
      duration = 1; // default to quarter note
  }

  // If there's a dot, increase duration by half of the original duration
  if (hasDot) {
    duration = duration + duration / 2;
  }

  return duration;
};

// Helper to process melody string into tokens
const processTokens = (melodyPart: string): string[] => {
  // Remove all spaces from melody part before processing
  const cleanMelodyPart = melodyPart.replace(/\s+/g, "");

  // Split input into tokens, preserving duration markers and their dots
  const rawTokens = cleanMelodyPart.split(/([+_\-=,]\.?)/);

  // Split the melody part into tokens, handling both single notes and chords
  const tokens: string[] = [];
  let currentChord: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (!token) continue;

    // Check if this is a duration marker (including comma and optional dot)
    if (/^[+_\-=,]\.?$/.test(token)) {
      // Duration marker
      if (currentChord.length > 0) {
        tokens.push(currentChord.join(""));
        tokens.push(token);
        currentChord = [];
      } else if (
        tokens.length > 0 &&
        !/^[+_\-=,]\.?$/.test(tokens[tokens.length - 1])
      ) {
        // If we have a previous note/chord but no duration marker, add this one
        tokens.push(token);
      }
    } else {
      // Handle both numbers and letters - could be part of a chord or single note
      const noteChars = token.match(/[a-zA-Z1-90]/g); // Changed regex to put letters first
      if (!noteChars) continue;

      if (noteChars.length > 1) {
        // This is a chord
        if (currentChord.length > 0) {
          tokens.push(currentChord.join(""));
        }
        currentChord = noteChars;
      } else {
        // Single note
        if (currentChord.length > 0) {
          tokens.push(currentChord.join(""));
        }
        currentChord = noteChars;
      }
    }
  }

  // Handle any remaining chord
  if (currentChord.length > 0) {
    tokens.push(currentChord.join(""));
  }

  return tokens;
};

// Helper to calculate scale degree shift and resulting MIDI number adjustment
export const calculateShiftedNote = (
  originalDegree: number,
  shift: number,
  key: KeySignature,
  accidental: number = 0,
  track: number,
  context: CommandContext,
): { newDegree: number; newMidi: number } => {
  const newDegree = originalDegree + shift;

  // Implement proper modulo that always gives positive result
  const properModulo = (n: number, m: number): number => {
    return ((n % m) + m) % m;
  };

  // Get positive base degree (0-6) and adjust octave accordingly
  const baseDegree = properModulo(newDegree, 7);
  const octave = Math.floor(newDegree / 7);

  const scaleMap = key.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;

  // Use the appropriate base octave from context
  const baseOctave = track === 1 ? context.baseOctaveRH : context.baseOctaveLH;

  // Include baseOctave in calculation
  const newMidi =
    key.tonic + scaleMap[baseDegree] + (baseOctave + octave) * 12 + accidental;

  return { newDegree, newMidi };
};

// Modify logicalNoteToMidi to use global beat positions
export const logicalNoteToMidi = (
  note: LogicalNote,
  track: number,
  timeSignatures: TimeSignature[],
): Note | null => {
  if (note.midiNumber === null) return null; // Rest

  // Convert beat position directly to ticks
  const startTicks = Math.floor(note.span.start * TICKS_PER_QUARTER);

  return {
    pitch: note.midiNumber,
    velocity: 100,
    startTime: startTicks,
    duration: note.duration - 1,
    channel: track - 1, // Track 1 (rh) uses channel 1, Track 2 (lh) uses channel 0
  };
};
