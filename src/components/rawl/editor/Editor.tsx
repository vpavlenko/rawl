import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { TICKS_PER_QUARTER } from "../forge/constants";
import { Note } from "../forge/ForgeGenerator";
import Rawl from "../Rawl";
import { generateMidiWithMetadata } from "./EditorMidi";
import { scores } from "./scores";

// Types for command handling
type TimeSignature = {
  numerator: number; // Only numerator is stored since denominator is always 4
  measureStart: number; // Which measure this time signature starts at
};

type KeySignature = {
  tonic: number; // 0 = C, 1 = C#/Db, etc.
  mode: "major" | "minor";
};

type BeatPosition = number; // Integer part is beat number, fraction is position within beat

type MeasureSpan = {
  start: BeatPosition;
  end: BeatPosition;
};

type LogicalNote = {
  scaleDegree: number; // 1-7 with optional accidentals (for copying)
  duration: number; // in MIDI ticks
  span: MeasureSpan; // When this note occurs
  accidental?: -1 | 0 | 1; // -1 for flat, 1 for sharp (for copying)
  midiNumber: number | null; // Calculated MIDI number at creation time (null for rests)
};

type Command =
  | { type: "key"; key: KeySignature }
  | { type: "notes"; notes: LogicalNote[] }
  | {
      type: "copy";
      targetMeasure: number;
      sourceStart: number;
      sourceEnd: number;
      shifts: number[]; // Array of diatonic shifts to apply
    }
  | { type: "track"; track: 1 | 2 }
  | { type: "time"; signatures: TimeSignature[] };

type CommandContext = {
  currentKey: KeySignature;
  existingNotes?: LogicalNote[];
  lastNoteIndex?: number; // Index of last note before current command
  currentTrack: 1 | 2; // Track 1 for right hand, 2 for left hand
  timeSignatures: TimeSignature[]; // List of time signatures in effect
  beatsPerMeasure?: number; // Optional because only needed during note parsing
};

// Add type declaration at the top of the file
declare global {
  interface Window {
    __disableGlobalShortcuts?: boolean;
  }
}

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const RawlContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const EditorPanel = styled.div`
  position: absolute;
  right: 20px;
  bottom: 20px;
  width: 25%;
  height: 50%;
  background-color: #1e1e1e;
  border: 1px solid #333;
  border-radius: 4px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
  overflow: auto;
`;

const MelodyTextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 10px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #333;
  border-radius: 4px;
  flex-shrink: 0;
  resize: vertical;
  font-family:
    system-ui,
    -apple-system,
    sans-serif;
  font-size: 14px;
  line-height: 1.4;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;

const parseKey = (keyString: string): KeySignature | null => {
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

const parseCopyCommand = (line: string): Command | null => {
  // Match the command format: measure copy source-end shift1 shift2 ...
  // source can be either a single number or a range like "3-4"
  const match = line.match(
    /^(\d+)\s+copy\s+(\d+(?:-\d+)?)\s+(-?\d+(?:\s+-?\d+)*)?$/,
  );
  if (!match) return null;

  const [fullMatch, targetMeasureStr, sourceStr, shiftsStr] = match;
  const targetMeasure = parseInt(targetMeasureStr);

  // Parse source measure(s)
  let sourceStart: number;
  let sourceEnd: number;
  if (sourceStr.includes("-")) {
    const [start, end] = sourceStr.split("-").map(Number);
    sourceStart = start;
    sourceEnd = end + 1; // Increment end by 1 to get actual slice coordinates
  } else {
    sourceStart = parseInt(sourceStr);
    sourceEnd = sourceStart + 1;
  }

  // Extract all shifts by matching numbers
  const shifts = (shiftsStr || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(Number);

  return {
    type: "copy",
    targetMeasure,
    sourceStart,
    sourceEnd,
    shifts,
  };
};

const parseTimeSignatures = (line: string): TimeSignature[] | null => {
  console.log("Parsing time signature line:", line);
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
        console.log("Invalid time signature format:", part);
        return null;
      }

      signatures.push({
        numerator: num,
        measureStart: currentMeasure,
      });
      console.log("Added time signature:", {
        numerator: num,
        measureStart: currentMeasure,
      });
    } else {
      // Must be a measure number
      const measure = parseInt(part);
      if (isNaN(measure) || measure <= currentMeasure) {
        console.log("Invalid measure number:", part);
        return null;
      }

      // Next part must be a time signature
      if (i + 1 >= parts.length || !parts[i + 1].includes("/")) {
        console.log("Missing time signature after measure number:", part);
        return null;
      }

      currentMeasure = measure;
    }
  }

  console.log("Final time signatures:", signatures);
  return signatures.length > 0 ? signatures : null;
};

const getTimeSignatureAt = (
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

const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
  // Remove comments
  const cleanLine = line.split("#")[0].trim();
  if (!cleanLine) return null;

  console.log("Parsing command line:", cleanLine);

  // Handle track switch commands
  if (cleanLine.toLowerCase() === "lh") {
    return { type: "track", track: 2 };
  }
  if (cleanLine.toLowerCase() === "rh") {
    return { type: "track", track: 1 };
  }

  // Try parsing as time signature command
  if (cleanLine.includes("/4")) {
    console.log("Attempting to parse time signature:", cleanLine);
    const signatures = parseTimeSignatures(cleanLine);
    if (signatures) {
      console.log("Successfully parsed time signature command:", signatures);
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
      return { type: "notes", notes };
    }
  }

  return null;
};

// Helper function to calculate MIDI number from scale degree and key
const calculateMidiNumber = (
  scaleDegree: number | string,
  accidental: number | undefined,
  octaveShift: number,
  key: KeySignature,
  track: number, // 1 for RH, 2 for LH
): number | null => {
  if (scaleDegree === 0) return null; // Rest

  // Define the mapping of scale degrees to semitones from tonic
  const majorScaleMap = [0, 2, 4, 5, 7, 9, 11];
  const minorScaleMap = [0, 2, 3, 5, 7, 8, 10];
  const scaleMap = key.mode === "major" ? majorScaleMap : minorScaleMap;

  // Function to convert a character input to a scale degree (1-based)
  const charToScaleDegree = (char: string): number => {
    if (char >= "1" && char <= "9") return parseInt(char);
    if (char === "0") return 10;
    const letterMap: { [key: string]: number } = {
      q: 8,
      w: 9,
      e: 10,
      r: 11,
      t: 12,
      y: 13,
      u: 14,
      i: 15,
      o: 16,
      p: 17,
      a: 15,
      s: 16,
      d: 17,
      f: 18,
      g: 19,
      h: 20,
      j: 21,
      k: 22,
      l: 23,
    };
    return letterMap[char.toLowerCase()] || 0;
  };

  // Convert input to scale degree if it's a string
  const degree =
    typeof scaleDegree === "string"
      ? charToScaleDegree(scaleDegree as string)
      : scaleDegree;

  // Calculate which octave this scale degree belongs to
  let octave = Math.floor((degree - 1) / 7);
  const degreeInOctave = ((degree - 1) % 7) + 1;

  // Get the semitone offset for this scale degree
  const semitoneOffset = scaleMap[degreeInOctave - 1];

  // Base octave is different for LH and RH
  const baseOctave = track === 1 ? 3 : 1; // RH starts at C3, LH starts at C1

  // Calculate final MIDI number
  const midiNumber = (baseOctave + octave) * 12 + semitoneOffset + key.tonic;

  // Ensure the note is within MIDI range (0-127)
  if (midiNumber < 0 || midiNumber > 127) return null;

  return midiNumber;
};

// Helper to calculate the global beat position for a measure and beat
const calculateGlobalBeatPosition = (
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
const globalBeatToMeasureAndBeat = (
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

const parseMelodyString = (
  melodyString: string,
  context: CommandContext,
): LogicalNote[] => {
  debugger;
  const lines = melodyString.split("\n").filter((line) => line.trim());

  return lines.flatMap((line) => {
    debugger;
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

      console.log(
        "\nProcessing token:",
        JSON.stringify({
          token,
          currentPosition,
          isDurationMarker: /^[+_\-=,]\.?$/.test(token),
          resultLength: result.length,
        }),
      );

      // Check if this token is a duration marker
      const isDurationMarker = /^[+_\-=,]\.?$/.test(token);

      if (isDurationMarker) {
        // Apply this duration to the previous note(s)
        const duration = getDuration(token);
        const durationInBeats = duration / TICKS_PER_QUARTER;

        // Find the last group of notes (could be a single note or chord)
        let lastNoteIndex = result.length - 1;
        while (
          lastNoteIndex >= 0 &&
          result[lastNoteIndex].span.start ===
            result[result.length - 1].span.start
        ) {
          result[lastNoteIndex].duration = duration;
          result[lastNoteIndex].span.end =
            result[lastNoteIndex].span.start + durationInBeats;
          lastNoteIndex--;
        }

        // Update position for next note
        if (result.length > 0) {
          currentPosition = result[result.length - 1].span.end;
        }
        continue;
      }

      // Handle note or chord
      const noteChars = token.match(/[1-9a-zA-Z0]/g) || [];
      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + 1, // Default to one beat duration
      };

      // Process each note in the chord (or single note)
      for (const noteChar of noteChars) {
        const midiNumber = calculateMidiNumber(
          noteChar,
          0, // No accidentals support yet
          0, // No octave shifts needed with new system
          key,
          context.currentTrack,
        );

        if (midiNumber !== null) {
          result.push({
            scaleDegree:
              typeof noteChar === "string" && /[a-zA-Z]/.test(noteChar)
                ? noteChar.charCodeAt(0) - "a".charCodeAt(0) + 1
                : parseInt(noteChar),
            duration: TICKS_PER_QUARTER, // Default duration, may be updated by subsequent duration marker
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
  // Split marker into base duration and dot if present
  const [baseDuration, dot] = marker.split(".");
  let duration: number;

  switch (baseDuration) {
    case "+":
      duration = TICKS_PER_QUARTER * beatsPerMeasure; // length of time signature at insertion
      break;
    case "_":
      duration = TICKS_PER_QUARTER * 2; // half note
      break;
    case ",":
      duration = TICKS_PER_QUARTER; // quarter note (comma)
      break;
    case "-":
      duration = TICKS_PER_QUARTER / 2; // eighth note
      break;
    case "=":
      duration = TICKS_PER_QUARTER / 4; // sixteenth note
      break;
    default:
      duration = TICKS_PER_QUARTER; // default to quarter note
  }

  // If there's a dot, multiply duration by 1.5
  if (dot === "") {
    duration = duration * 1.5;
  }

  return duration;
};

// Modify logicalNoteToMidi to use global beat positions
const logicalNoteToMidi = (
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

// Helper to process melody string into tokens
const processTokens = (melodyPart: string): string[] => {
  // Remove all spaces from melody part before processing
  const cleanMelodyPart = melodyPart.replace(/\s+/g, "");

  // Split input into tokens, preserving only commas and other duration markers
  const rawTokens = cleanMelodyPart.split(/([+_\-=,])/);
  console.log("Raw tokens:", JSON.stringify(rawTokens));

  // Split the melody part into tokens, handling both single notes and chords
  const tokens: string[] = [];
  let currentChord: string[] = [];

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];
    if (!token) continue;

    // Check if this is a duration marker (including comma)
    if (/^[+_\-=,]$/.test(token)) {
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
      const noteChars = token.match(/[1-9a-zA-Z0]/g);
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
const calculateShiftedNote = (
  originalDegree: number,
  shift: number,
  originalMidi: number,
  key: KeySignature,
): { newDegree: number; newMidi: number } => {
  // Map of chromatic steps between scale degrees in minor/major
  const minorSteps = [2, 1, 2, 2, 1, 2, 2]; // Steps between degrees in minor
  const majorSteps = [2, 2, 1, 2, 2, 2, 1]; // Steps between degrees in major
  const steps = key.mode === "major" ? majorSteps : minorSteps;

  // Convert scale degrees to 0-based for arithmetic
  const zeroBased = originalDegree - 1;

  // Calculate new scale degree (0-based)
  let newDegree = (((zeroBased + shift) % 7) + 7) % 7;

  // Calculate semitone adjustment by walking through the scale
  let semitonesAdjust = 0;
  if (shift > 0) {
    // Moving up
    for (let i = 0; i < shift; i++) {
      const fromDegree = (zeroBased + i) % 7;
      semitonesAdjust += steps[fromDegree];
    }
  } else {
    // Moving down
    for (let i = 0; i > shift; i--) {
      const fromDegree = (((zeroBased + i - 1) % 7) + 7) % 7;
      semitonesAdjust -= steps[fromDegree];
    }
  }

  return {
    newDegree: newDegree + 1, // Convert back to 1-based
    newMidi: originalMidi + semitonesAdjust,
  };
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { playSongBuffer, rawlProps, analyses } = useContext(AppContext);
  const [score, setScore] = useState(scores[slug || ""] || "");
  const [context, setContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" }, // Default to C major
    currentTrack: 1, // Default to right hand
    timeSignatures: [{ numerator: 4, measureStart: 1 }], // Default to 4/4 time
  });

  // Get the analysis for this slug if it exists
  const analysis = analyses[`f/${slug}`];

  // Signal to App that this route should not have global shortcuts
  React.useEffect(() => {
    window.__disableGlobalShortcuts = true;
    return () => {
      delete window.__disableGlobalShortcuts;
    };
  }, []);

  // Generate MIDI on initial load
  React.useEffect(() => {
    handleMelodyPlayback();
  }, []);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newScore = e.target.value;
    setScore(newScore);
    handleMelodyPlayback();
  };

  const handleMelodyPlayback = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;

    try {
      const lines = text.split("\n").filter((line) => line.trim());
      console.log("Processing score lines:", lines);

      let scoreTrack1: LogicalNote[] = []; // Right hand score
      let scoreTrack2: LogicalNote[] = []; // Left hand score
      const newContext: CommandContext = {
        currentKey: { ...context.currentKey },
        currentTrack: context.currentTrack,
        timeSignatures: [...context.timeSignatures], // Start with default 4/4
      };
      console.log("Initial context:", newContext);

      for (const line of lines) {
        const command = parseCommand(line, newContext);
        console.log("Parsed command:", command);
        if (!command) continue;

        switch (command.type) {
          case "track":
            newContext.currentTrack = command.track;
            break;

          case "key":
            newContext.currentKey = command.key;
            break;

          case "time":
            console.log("Applying time signature change:", command.signatures);
            newContext.timeSignatures = command.signatures;
            break;

          case "notes":
            // Add notes to the current track's score
            if (newContext.currentTrack === 1) {
              scoreTrack1 = [...scoreTrack1, ...command.notes];
            } else {
              scoreTrack2 = [...scoreTrack2, ...command.notes];
            }
            break;

          case "copy": {
            // Get time signature for source measures
            const sourceBeatsPerMeasure = getTimeSignatureAt(
              command.sourceStart,
              newContext.timeSignatures,
            );

            // Find source notes from the current track
            const sourceNotes = (
              newContext.currentTrack === 1 ? scoreTrack1 : scoreTrack2
            ).filter(
              (n) =>
                Math.floor(n.span.start) >= command.sourceStart &&
                Math.floor(n.span.end) <= command.sourceEnd,
            );

            if (sourceNotes.length === 0) {
              console.warn(
                `No notes found in measure ${command.sourceStart} to ${command.sourceEnd} to copy`,
              );
              continue;
            }

            // Calculate the length of the source span
            const spanLength = command.sourceEnd - command.sourceStart;

            const allCopies = command.shifts
              .map((shift, idx) => {
                // Each copy block starts after previous blocks
                const targetMeasure = command.targetMeasure + idx * spanLength;

                // Get time signature for target measure
                const targetBeatsPerMeasure = getTimeSignatureAt(
                  targetMeasure,
                  newContext.timeSignatures,
                );

                return sourceNotes.map((n) => {
                  // Adjust timing based on potentially different time signatures
                  const sourcePosition = n.span.start - command.sourceStart;
                  const targetPosition =
                    targetMeasure +
                    (sourcePosition * targetBeatsPerMeasure) /
                      sourceBeatsPerMeasure;

                  if (n.midiNumber === null) {
                    return {
                      ...n,
                      span: {
                        start: targetPosition,
                        end:
                          targetPosition +
                          ((n.span.end - n.span.start) *
                            targetBeatsPerMeasure) /
                            sourceBeatsPerMeasure,
                      },
                    };
                  }

                  const { newDegree, newMidi } = calculateShiftedNote(
                    n.scaleDegree,
                    shift,
                    n.midiNumber,
                    newContext.currentKey,
                  );

                  return {
                    ...n,
                    span: {
                      start: targetPosition,
                      end:
                        targetPosition +
                        ((n.span.end - n.span.start) * targetBeatsPerMeasure) /
                          sourceBeatsPerMeasure,
                    },
                    scaleDegree: newDegree,
                    midiNumber: newMidi,
                  };
                });
              })
              .flat();

            // Add copies to the current track's score
            if (newContext.currentTrack === 1) {
              scoreTrack1 = [...scoreTrack1, ...allCopies];
            } else {
              scoreTrack2 = [...scoreTrack2, ...allCopies];
            }
            break;
          }
        }
      }

      console.log("Final context:", newContext);
      console.log("Final notes:", { scoreTrack1, scoreTrack2 });

      if (scoreTrack1.length === 0 && scoreTrack2.length === 0) {
        setError("No valid notes found");
        return;
      }

      setError(null);
      setContext(newContext);

      // Convert both tracks to MIDI notes
      const midiNotesTrack1 = scoreTrack1
        .map((n) => {
          const midi = logicalNoteToMidi(n, 1, newContext.timeSignatures);
          console.log("Converting to MIDI (track 1):", { note: n, midi });
          return midi;
        })
        .filter((n): n is Note => n !== null);
      const midiNotesTrack2 = scoreTrack2
        .map((n) => {
          const midi = logicalNoteToMidi(n, 2, newContext.timeSignatures);
          console.log("Converting to MIDI (track 2):", { note: n, midi });
          return midi;
        })
        .filter((n): n is Note => n !== null);

      // Combine both tracks
      const allMidiNotes = [...midiNotesTrack1, ...midiNotesTrack2];
      console.log("All MIDI notes:", allMidiNotes);

      const midiResult = generateMidiWithMetadata(
        allMidiNotes,
        `melody-${slug}`,
        120,
        newContext.timeSignatures,
      );
      console.log("Generated MIDI result:", midiResult);

      if (playSongBuffer) {
        playSongBuffer(midiResult.midiInfo.id, midiResult.midiData, true);
      }
    } catch (e) {
      console.error("Error during playback:", e);
      setError(
        e instanceof Error ? e.message : "Unknown error during playback",
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleMelodyPlayback();
    }
  };

  return (
    <EditorContainer>
      <RawlContainer>
        {rawlProps && <Rawl {...rawlProps} savedAnalysis={analysis} />}
      </RawlContainer>
      <EditorPanel>
        <h3>Score Editor</h3>
        <p>
          Commands:
          <br />
          1. Insert notes: "measure i notes" (e.g. "1 i 1 2 3")
          <br />
          Durations: + (measure length), _ (half), space (quarter), - (eighth),
          = (16th)
          <br />
          Modifiers: ^ (octave up), v (octave down), b/# (flat/sharp), x (rest)
          <br />
          2. Key changes: "C major", "Ab minor", "F# major"
          <br />
          3. Copy: "11 copy 1 0 -4 -1" (copy measure 1 to 11-13 with shifts)
          <br />
          4. Tracks: "lh" (left hand), "rh" (right hand)
          <br />
          5. Time signatures: "4/4 5 3/4 9 4/4"
          <br />
          Press Cmd+Enter to play.
        </p>
        <MelodyTextArea
          ref={textareaRef}
          value={score}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
