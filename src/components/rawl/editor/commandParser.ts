import { TICKS_PER_QUARTER } from "../forge/constants";
import {
  BeatPosition,
  Command,
  CommandContext,
  getScaleMapForMode,
  KeySignature,
  LogicalNote,
  MeasureSpan,
  NOTE_LETTER_MAP,
  TimeSignature,
} from "./types";

export interface Note {
  midiNumber: number;
  startTick: number;
  durationTicks: number;
  channel: number;
}

export interface TrackCommand {
  type: "track";
  track: number;
  baseOctave: number;
}

export const parseKey = (keyString: string): KeySignature | null => {
  // Changed regex to make accidentals optional and include new modes
  const match = keyString.match(
    /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian)$/i,
  );
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
    mode: mode.toLowerCase() as KeySignature["mode"],
  };
};

export const parseCopyCommand = (
  line: string,
  timeSignatures: TimeSignature[] = [],
): Command | null => {
  // Match the command format: coordinate c sourceMeasureSpan sequenceOfShifts
  // Examples:
  // "2b1.5 c 1b1-8b4 0" - explicit beat positions
  // "2 c 1-8 0" - implicit beat positions (1b1-9b0)
  // "2 c 1 0" - single measure (1b1-2b0)
  // "2 c 1 0 x 0" - with rest marker 'x' to skip a copy
  // "2 c 1 -3 -2 -5 -4 -7 -4 -3" - with negative shifts for Pachelbel's progression
  const match = line.match(
    /^(\d+)(?:b(\d+(?:\.\d+)?))?\s+c\s+(\d+)(?:b(\d+(?:\.\d+)?))?(?:-(\d+)(?:b(\d+(?:\.\d+)?))?)?\s+((?:x|[+-]?\d+)(?:\s+(?:x|[+-]?\d+))*)$/,
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
      // If no explicit end beat, convention is next measure beat 1 (exclusive)
      sourceEnd = sourceEnd + 1;
      sourceEndBeat = 1;
    }
  } else {
    // Single measure specified - copy until next measure beat 1 (exclusive)
    sourceEnd = sourceStart + 1;
    sourceEndBeat = 1;
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

  // Handle single # comment that comments out everything to end of file
  if (line.trim() === "#") {
    context.commentToEndOfFile = true;
    return null;
  }

  // If we're in comment-to-end-of-file mode, return null
  if (context.commentToEndOfFile) return null;

  // Try parsing as track command first
  const trackCommand = parseTrackCommand(cleanLine, context);
  if (trackCommand) return trackCommand;

  // Try parsing as time signature command
  if (cleanLine.includes("/4")) {
    const signatures = parseTimeSignatures(cleanLine);
    if (signatures) return { type: "time", signatures };
  }

  // Try parsing as key command
  const key = parseKey(cleanLine);
  if (key) return { type: "key", key };

  // Try parsing as copy command
  const copyCmd = parseCopyCommand(cleanLine, context.timeSignatures);
  if (copyCmd) return copyCmd;

  // Parse as note insert command
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
    )
      return null;

    // Get time signature for this measure
    if (startBeat > beatsPerMeasure) return null;

    const notes = parseMelodyString(cleanLine, {
      ...context,
      beatsPerMeasure,
    });
    if (notes.length > 0) return { type: "insert", notes };
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

  // Get the semitone offset for this scale degree based on mode
  const scaleMap = getScaleMapForMode(key.mode);
  const semitoneOffset = scaleMap[baseDegree];

  // Use the appropriate base octave from context
  const baseOctave = getBaseOctaveForTrack(track, context);

  // Calculate final MIDI number
  const midiNumber =
    key.tonic + semitoneOffset + (baseOctave + octave) * 12 + (accidental || 0);

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
    const beatsInMeasure = getTimeSignatureAt(currentMeasure, timeSignatures);
    totalBeats += beatsInMeasure;
    currentMeasure++;
  }

  // Add the beats within the target measure
  // Ensure we don't exceed the measure's time signature
  const measureBeats = getTimeSignatureAt(measure, timeSignatures);
  const clampedBeatInMeasure = Math.min(beatInMeasure, measureBeats);
  return totalBeats + (clampedBeatInMeasure - 1);
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
  console.log("\n=== Melody String Parser Debug ===");
  console.log("Input melody string:", melodyString);

  const lines = melodyString.split("\n").filter((line) => line.trim());
  console.log("Filtered lines:", lines);

  return lines.flatMap((line) => {
    const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
    if (!match) {
      console.log("No match for line:", line);
      return [];
    }

    const [_, measureStr, beatStr, melodyPart] = match;
    console.log("\nParsing melody part:", melodyPart);

    const startMeasure = parseInt(measureStr);
    const startBeat = beatStr ? parseFloat(beatStr) : 1;
    const key = context.currentKey;

    // Calculate the global beat position for the start
    let currentPosition = calculateGlobalBeatPosition(
      startMeasure,
      startBeat,
      context.timeSignatures,
    );

    console.log("Start position:", {
      measure: startMeasure,
      beat: startBeat,
      globalBeat: currentPosition,
    });

    // Process tokens
    const tokens = processTokens(melodyPart);
    const result: LogicalNote[] = [];

    console.log("\nProcessing tokens:", tokens);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token.trim()) continue;

      console.log(`\nToken ${i}: '${token}'`);

      // Check if this token is a duration marker
      const isDurationMarker = /^[+_\-=,][.:]?$/.test(token);
      console.log("Is duration marker:", isDurationMarker);

      if (isDurationMarker) {
        // Apply this duration to the previous note(s)
        const duration = getDuration(token, context.beatsPerMeasure || 4);
        console.log("Duration value:", duration);

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
      console.log("Note characters:", noteChars);

      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + 1, // Default to one beat duration
      };

      // Check if this is a rest (x)
      if (noteChars.length === 1 && noteChars[0] === "x") {
        console.log("Adding rest");
        result.push({
          scaleDegree: -Infinity,
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

        console.log("Processing note:", {
          char: noteChar,
          scaleDegree: absoluteScaleDegree,
          span,
        });

        const midiNumber = calculateMidiNumber(
          absoluteScaleDegree,
          0,
          0,
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

    console.log("\nFinal notes:", result);
    console.log("=== End Melody String Parser Debug ===\n");
    return result;
  });
};

const getDuration = (marker: string, beatsPerMeasure: number = 4): number => {
  console.log("\n=== Duration Parser Debug ===");
  console.log("Input marker:", marker);

  // Split marker into base duration and check for dot and triplet
  const hasDot = marker.includes(".");
  const hasTriplet = marker.includes(":");
  const baseDuration = marker.split(/[.:]/, 1)[0];
  let duration: number;

  console.log("Has dot:", hasDot);
  console.log("Has triplet:", hasTriplet);
  console.log("Base duration:", baseDuration);

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

  console.log("Initial duration:", duration);

  // If there's a dot, increase duration by half of the original duration
  if (hasDot) {
    duration = duration + duration / 2;
    console.log("After dot:", duration);
  }

  // If there's a triplet marker, multiply duration by 2/3
  if (hasTriplet) {
    duration = duration * (2 / 3);
    console.log("After triplet:", duration);
  }

  console.log("Final duration:", duration);
  console.log("=== End Duration Parser Debug ===\n");

  return duration;
};

// Helper to process melody string into tokens
const processTokens = (melodyPart: string): string[] => {
  console.log("\n=== Token Processing Debug ===");
  console.log("Input melody part:", melodyPart);

  // Remove all spaces from melody part before processing
  const cleanMelodyPart = melodyPart.replace(/\s+/g, "");
  console.log("Cleaned melody part:", cleanMelodyPart);

  // Split input into tokens, preserving duration markers and their modifiers
  const tokens: string[] = [];
  let currentToken = "";

  console.log("\nProcessing characters:");
  for (let i = 0; i < cleanMelodyPart.length; i++) {
    const char = cleanMelodyPart[i];
    console.log(`\nChar at ${i}: '${char}'`);

    if (/[+_\-=,]/.test(char)) {
      console.log("- Found duration marker");
      // If we have accumulated a token, push it
      if (currentToken) {
        console.log("- Pushing accumulated token:", currentToken);
        tokens.push(currentToken);
        currentToken = "";
      }

      // Look ahead for modifiers (. or :)
      let durationToken = char;
      if (
        i + 1 < cleanMelodyPart.length &&
        /[.:]/.test(cleanMelodyPart[i + 1])
      ) {
        durationToken += cleanMelodyPart[i + 1];
        console.log("- Adding modifier to duration:", durationToken);
        i++; // Skip the modifier in next iteration
      }
      console.log("- Pushing duration token:", durationToken);
      tokens.push(durationToken);
    } else if (/[.:]/.test(char)) {
      console.log("- Skipping modifier (already handled)");
      continue;
    } else if (/[a-zA-Z1-90x]/.test(char)) {
      console.log("- Adding to current token:", char);
      currentToken += char;
    }
  }

  // Push any remaining token
  if (currentToken) {
    console.log("\nPushing final token:", currentToken);
    tokens.push(currentToken);
  }

  console.log("\nFinal tokens:", tokens);
  console.log("=== End Token Processing Debug ===\n");
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

  // Get the scale map based on mode
  const scaleMap = getScaleMapForMode(key.mode);

  // Use the appropriate base octave from context
  const baseOctave = getBaseOctaveForTrack(track, context);

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
  if (note.midiNumber === null) return null;

  return {
    midiNumber: note.midiNumber,
    startTick: note.span.start * TICKS_PER_QUARTER,
    durationTicks: note.duration,
    channel: track - 1, // Convert 1-based track to 0-based channel
  };
};

function parseTrackCommand(
  cleanLine: string,
  context: CommandContext,
): TrackCommand | null {
  console.log("\n=== Track Command Debug ===");
  console.log("Parsing line:", cleanLine);

  // Try new channel syntax first
  const channelMatch = cleanLine.match(/^ch(\d+)(?:\s+(\d+))?$/i);
  if (channelMatch) {
    const channel = parseInt(channelMatch[1], 10);
    if (channel < 0 || channel > 15) {
      throw new Error("MIDI channel must be between 0 and 15");
    }
    const baseOctave = channelMatch[2]
      ? parseInt(channelMatch[2], 10)
      : channel === 1
      ? 3
      : 5;
    context.channelOctaves[channel] = baseOctave;
    const track = channel + 1; // Convert channel to 1-based track number
    console.log("Channel command parsed:");
    console.log("- Channel:", channel);
    console.log("- Track:", track);
    console.log("- Base octave:", baseOctave);
    return {
      type: "track",
      track,
      baseOctave,
    };
  }

  // Backward compatibility for lh/rh
  const trackMatch = cleanLine.match(/^(lh|rh)(?:\s+(\d+))?$/i);
  if (trackMatch) {
    const [, hand, octave] = trackMatch;
    const track = hand.toLowerCase() === "lh" ? 2 : 1;
    const channel = track - 1;
    const baseOctave = octave ? parseInt(octave, 10) : track === 2 ? 3 : 5;
    context.channelOctaves[channel] = baseOctave;
    console.log("Hand command parsed:");
    console.log("- Hand:", hand);
    console.log("- Channel:", channel);
    console.log("- Track:", track);
    console.log("- Base octave:", baseOctave);
    return {
      type: "track",
      track,
      baseOctave,
    };
  }

  console.log("No track command matched");
  console.log("=== End Track Command Debug ===\n");
  return null;
}

function getBaseOctaveForTrack(track: number, context: CommandContext): number {
  const channel = track - 1;
  return context.channelOctaves[channel] ?? (channel === 1 ? 3 : 5);
}
