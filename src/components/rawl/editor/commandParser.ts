import { Analysis, ANALYSIS_STUB, PitchClass } from "../analysis";
import { TICKS_PER_QUARTER } from "../forge/constants";
import {
  BeatPosition,
  Command,
  CommandContext,
  getScaleMapForMode,
  KeySignature,
  LogicalNote,
  MeasureSpan,
  MODE_SHORTHAND_MAP,
  ModeName,
  ModeShorthand,
  normalizeModeName,
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
  // Match key signature pattern e.g. "C major", "Ab minor", or "F# phrygian"
  const match = keyString.match(
    /^([A-G][b#]?)\s+(major|minor|lydian|mixolydian|dorian|phrygian|harmonic\s+minor|melodic\s+minor)$/i,
  );
  if (!match) return null;

  const [_, rootNote, modeString] = match;
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

  // Get the tonic number from the root note
  const tonic = noteToNumber[rootNote];

  // Get the mode
  const mode = normalizeModeName(modeString);

  return { tonic, mode };
};

export const parseCopyCommand = (
  line: string,
  timeSignatures: TimeSignature[] = [],
): Command | null => {
  // Match the command format: coordinate c sourceMeasureSpan [sequenceOfShifts]
  // Examples:
  // "2b1.5 c 1b1-8b4 0" - explicit beat positions
  // "2 c 1-8 0" - implicit beat positions (1b1-9b1)
  // "2 c 1 0" - single measure (1b1-2b1)
  // "2 c 1" - single measure with default shift of 0
  // "2 c 1 0 x 0" - with rest marker 'x' to skip a copy
  // "2 c 1 -3 -2 -5 -4 -7 -4 -3" - with negative shifts for Pachelbel's progression
  // "2 c 1 2&5" - with & syntax to layer multiple shifts at same position
  // "2 c 1 2h" - with modifier 'h' for harmonic minor
  // "2 c 1 2h 3e 4M 5m" - with multiple modifiers for different modes
  const match = line.match(
    /^(\d+)(?:b(\d+(?:\.\d+)?))?\s+(?:c|ac)\s+(\d+)(?:b(\d+(?:\.\d+)?))?(?:-(\d+)(?:b(\d+(?:\.\d+)?))?)?\s*((?:x|[+-]?\d+(?:[heMm])?(?:&[+-]?\d+(?:[heMm])?)*(?:\s+(?:x|[+-]?\d+(?:[heMm])?(?:&[+-]?\d+(?:[heMm])?)*))*)*)$/,
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
  // If no beat specified for start, default to beat 1 of same measure
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
      // If no explicit end beat, default to beat 1 of next measure
      sourceEnd = sourceEnd + 1;
      sourceEndBeat = 1;
    }
  } else {
    // Single measure specified - default to beat 1 of next measure
    sourceEnd = sourceStart + 1;
    sourceEndBeat = 1;
  }

  // Validate all measures and beats
  if (
    targetMeasure < 1 ||
    sourceStart < 1 ||
    sourceEnd < sourceStart ||
    targetBeat < 1 ||
    sourceStartBeat < 1 ||
    sourceEndBeat < 1
  ) {
    return null;
  }

  // Extract all shifts by matching numbers or 'x', supporting & syntax for layered shifts
  // and mode modifiers (h, e, M, m)
  // If no shifts provided, default to ["0"]
  const shifts = (shiftsStr || "0")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token): { shift: number | "x"; mode?: ModeName }[] => {
      if (token === "x") return [{ shift: "x" }];

      // If token contains &, it represents layered shifts at the same position
      if (token.includes("&")) {
        return token.split("&").map((shiftToken) => {
          // Parse shift and mode modifier
          const match = shiftToken.match(/^([+-]?\d+)([heMm])?$/);
          if (!match) return { shift: Number(shiftToken) };

          const [_, shiftValue, modeModifier] = match;
          const shift = Number(shiftValue);

          let mode: ModeName | undefined;
          if (modeModifier) {
            mode = MODE_SHORTHAND_MAP[modeModifier as ModeShorthand];
          }

          return { shift, mode };
        });
      }

      // Parse single shift with possible mode modifier
      const match = token.match(/^([+-]?\d+)([heMm])?$/);
      if (!match) return [{ shift: Number(token) }];

      const [_, shiftValue, modeModifier] = match;
      const shift = Number(shiftValue);

      let mode: ModeName | undefined;
      if (modeModifier) {
        mode = MODE_SHORTHAND_MAP[modeModifier as ModeShorthand];
      }

      return [{ shift, mode }];
    });

  // Determine if this is a regular copy or an all-channels copy
  const isAllChannels = line.trim().split(/\s+/)[1] === "ac";

  return {
    type: isAllChannels ? "ac" : "copy",
    targetMeasure,
    targetBeat,
    sourceStart,
    sourceStartBeat,
    sourceEnd,
    sourceEndBeat,
    shifts: shifts.map((shiftGroup) => ({
      type: "group",
      shifts: shiftGroup.map((s) => s.shift),
      modes: shiftGroup.map((s) => s.mode),
    })),
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

      // Validate format - only check that numerator is positive and denominator is 4
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

// Extend CommandContext to include analysis
export interface ExtendedCommandContext extends CommandContext {
  analysis: Analysis;
}

// Add a new function to parse phrase patch information
// Note: All analysis-related commands (like 'phrases') should be
// styled with white italic text in the editor to distinguish them
// from playback commands.
// For phrases command arguments (e.g., "1+1", "18+2"), the measure numbers
// are kept as normal text color while the +/- diff parts are styled as white bold.
function parsePhrasesCommand(
  cleanLine: string,
  context: ExtendedCommandContext,
): boolean {
  const phrasesMatch = cleanLine.match(/^phrases\s+(.+)$/i);
  if (!phrasesMatch) return false;

  // Parse the phrases data part
  const phrasesData = phrasesMatch[1].trim();
  const phrasePairs = phrasesData.split(/\s+/);

  // Create a new phrasePatch array
  const phrasePatch: { measure: number; diff: number }[] = [];

  // Process each phrase pair (e.g., "1+1", "18+2", "10-1")
  for (const pair of phrasePairs) {
    // Match for either +N or -N format
    const pairMatch = pair.match(/^(\d+)([+-])(\d+)$/);
    if (pairMatch) {
      const measure = parseInt(pairMatch[1], 10);
      const sign = pairMatch[2] === "+" ? 1 : -1;
      const diff = parseInt(pairMatch[3], 10) * sign;

      phrasePatch.push({ measure, diff });
    }
  }

  // Update the analysis in the context
  if (phrasePatch.length > 0) {
    context.analysis.phrasePatch = phrasePatch;
    return true;
  }

  return false;
}

// Add a new function to parse sections information
function parseSectionsCommand(
  cleanLine: string,
  context: ExtendedCommandContext,
): boolean {
  const sectionsMatch = cleanLine.match(/^sections\s+(.+)$/i);
  if (!sectionsMatch) return false;

  // Parse the sections data part
  const sectionsData = sectionsMatch[1].trim();
  const sectionNumbers = sectionsData.split(/\s+/);

  // Create a new sections array
  const sections: number[] = [];

  // Process each section number
  for (const sectionStr of sectionNumbers) {
    const section = parseInt(sectionStr, 10);
    if (!isNaN(section)) {
      sections.push(section);
    }
  }

  // Update the analysis in the context
  if (sections.length > 0) {
    context.analysis.sections = [0, ...sections.map((section) => section - 1)];
    return true;
  }

  return false;
}

// Find where ANALYSIS_STUB is imported and add more code to see its value
const ANALYSIS_STUB_WITH_SECTIONS: Analysis = {
  ...ANALYSIS_STUB,
  sections: [],
};

export const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
  // Make sure context has an analysis object
  const extendedContext = context as ExtendedCommandContext;
  if (!extendedContext.analysis) {
    extendedContext.analysis = { ...ANALYSIS_STUB_WITH_SECTIONS };
  }

  // If we're in comment-to-end-of-file mode, return null immediately
  if (context.commentToEndOfFile) return null;

  // Handle single % comment that comments out everything to end of file
  if (line.trim() === "%") {
    context.commentToEndOfFile = true;
    return null;
  }

  // Remove comments
  const cleanLine = line.split("%")[0].trim();
  if (!cleanLine) return null;

  // Try parsing as phrases command first
  if (parsePhrasesCommand(cleanLine, extendedContext)) {
    return null; // Return null because it's an analysis command, not a playback command
  }

  // Try parsing as sections command
  if (parseSectionsCommand(cleanLine, extendedContext)) {
    return null; // Return null because it's an analysis command, not a playback command
  }

  // Try parsing as track command first
  const trackCommand = parseTrackCommand(cleanLine, context);
  if (trackCommand) return trackCommand;

  // Try parsing as time signature command
  if (cleanLine.includes("/4")) {
    const signatures = parseTimeSignatures(cleanLine);
    if (signatures) {
      // Update the analysis with the time signature
      if (extendedContext.analysis && signatures.length > 0) {
        // For now, we don't store time signatures in the analysis
        // but we could in the future
      }
      return { type: "time", signatures };
    }
  }

  // Try parsing as key command
  const key = parseKey(cleanLine);
  if (key) {
    // Update the analysis with the key information
    if (extendedContext.analysis) {
      extendedContext.analysis.modulations = {
        1: key.tonic as PitchClass,
      };
    }
    return { type: "key", key };
  }

  // Try parsing as BPM command
  const bpmMatch = cleanLine.match(/^bpm\s+(\d+)$/i);
  if (bpmMatch) {
    const tempo = parseInt(bpmMatch[1], 10);
    if (tempo > 0) {
      return { type: "bpm", tempo };
    }
    return null;
  }

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

    // Validate measure and beat
    if (
      isNaN(startMeasure) ||
      startMeasure < 1 ||
      isNaN(startBeat) ||
      startBeat < 1
    )
      return null;

    // Get time signature for this measure and validate beat
    const beatsInMeasure = getTimeSignatureAt(
      startMeasure,
      context.timeSignatures,
    );
    const beatsPerMeasure = beatsInMeasure || 4; // Fallback to 4/4 if no time signature

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
  const lines = melodyString.split("\n").filter((line) => line.trim());

  return lines.flatMap((line) => {
    const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
    if (!match) {
      return [];
    }

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

    // Process tokens
    const tokens = processTokens(melodyPart);
    const result: LogicalNote[] = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (!token.trim()) continue;

      // Check if this token is a duration marker
      const isDurationMarker = /^[+_\-=,'"][.:]?$/.test(token);

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
      // First split into tokens by commas and whitespace
      const rawNoteTokens = token.split(/[,\s]+/);
      const noteTokens = rawNoteTokens.filter(Boolean);

      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + 1, // Default to one beat duration
      };

      // Process each token
      for (const noteToken of noteTokens) {
        // Skip duration markers
        if (/^[+_\-=,'"][.:]?$/.test(noteToken)) continue;

        // Check for accidental prefix
        let accidental: -1 | 0 | 1 = 0;
        let actualNote = noteToken;

        // Handle accidentals at start of token
        if (noteToken.startsWith("b")) {
          accidental = -1;
          actualNote = noteToken.slice(1);
        } else if (noteToken.startsWith("#")) {
          accidental = 1;
          actualNote = noteToken.slice(1);
        }

        // Skip if not a valid note
        if (!/^[a-zA-Z1-90x]$/.test(actualNote)) continue;

        // Handle rest
        if (actualNote === "x") {
          result.push({
            scaleDegree: -Infinity,
            duration: TICKS_PER_QUARTER,
            span: { ...span },
            midiNumber: null,
          });
          continue;
        }

        const absoluteScaleDegree = NOTE_LETTER_MAP[actualNote.toLowerCase()];
        if (absoluteScaleDegree === undefined) continue;

        const midiNumber = calculateMidiNumber(
          absoluteScaleDegree,
          accidental,
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
            accidental,
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
  // Split marker into base duration and check for dot and triplet
  const hasDot = marker.includes(".");
  const hasTriplet = marker.includes(":");
  const baseDuration = marker.split(/[.:]/, 1)[0];
  let duration: number;

  switch (baseDuration) {
    case "+":
      duration = 4; // Always 4 beats for whole note, regardless of time signature
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
    case "'":
      duration = 0.125; // thirty-second note
      break;
    case '"':
      duration = 0.0625; // sixty-fourth note
      break;
    default:
      duration = 1; // default to quarter note
  }

  // If there's a dot, increase duration by half of the original duration
  if (hasDot) {
    duration = duration + duration / 2;
  }

  // If there's a triplet marker, multiply duration by 2/3
  if (hasTriplet) {
    duration = duration * (2 / 3);
  }

  return duration;
};

// Helper to process melody string into tokens
const processTokens = (melodyPart: string): string[] => {
  // Remove all spaces from melody part before processing
  const cleanMelodyPart = melodyPart.replace(/\s+/g, "");

  // Split input into tokens, preserving duration markers and their modifiers
  const tokens: string[] = [];
  let currentToken = "";

  for (let i = 0; i < cleanMelodyPart.length; i++) {
    const char = cleanMelodyPart[i];

    if (/[+_\-=,'"]/.test(char)) {
      // If we have accumulated a token, push it
      if (currentToken) {
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
        i++; // Skip the modifier in next iteration
      }
      tokens.push(durationToken);
    } else if (/[.:]/.test(char)) {
      continue;
    } else if (/[#b]/.test(char)) {
      // Handle accidentals - they should be part of the next note
      if (currentToken) {
        // If we have a token already, push it before starting new one with accidental
        tokens.push(currentToken);
        currentToken = "";
      }
      currentToken = char;
    } else if (/[a-zA-Z1-90x]/.test(char)) {
      currentToken += char;
      // If this is a complete note (accidental + note or just note), push it
      if (
        currentToken.length === 2 ||
        (currentToken.length === 1 && !/[#b]/.test(currentToken))
      ) {
        tokens.push(currentToken);
        currentToken = "";
      }
    }
  }

  // Push any remaining token
  if (currentToken) {
    tokens.push(currentToken);
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
  targetMode?: ModeName,
): { newDegree: number; newMidi: number } => {
  const newDegree = originalDegree + shift;

  // Implement proper modulo that always gives positive result
  const properModulo = (n: number, m: number): number => {
    return ((n % m) + m) % m;
  };

  // Get positive base degree (0-6) and adjust octave accordingly
  const baseDegree = properModulo(newDegree, 7);
  const octave = Math.floor(newDegree / 7);

  // Create a copy of the key to avoid modifying the original
  const effectiveKey = { ...key };

  // If a target mode is specified, use it instead of the original key's mode
  if (targetMode) {
    effectiveKey.mode = targetMode;
  }

  // Get the scale map based on mode
  const scaleMap = getScaleMapForMode(effectiveKey.mode);

  // Use the appropriate base octave from context
  const baseOctave = getBaseOctaveForTrack(track, context);

  // Include baseOctave in calculation
  const newMidi =
    effectiveKey.tonic +
    scaleMap[baseDegree] +
    (baseOctave + octave) * 12 +
    accidental;

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
    return {
      type: "track",
      track,
      baseOctave,
    };
  }

  return null;
}

function getBaseOctaveForTrack(track: number, context: CommandContext): number {
  const channel = track - 1;
  return context.channelOctaves[channel] ?? (channel === 1 ? 3 : 5);
}
