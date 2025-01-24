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
type KeySignature = {
  tonic: number; // 0 = C, 1 = C#/Db, etc.
  mode: "major" | "minor";
};

type MeasureSpan = {
  start: number; // e.g. 1.5 means measure 1, beat 3 in 4/4
  end: number; // e.g. 2.0 means measure 2, beat 1 (downbeat)
};

type LogicalNote = {
  scaleDegree: number; // 1-7 with optional accidentals (for copying)
  duration: number; // in MIDI ticks
  span: MeasureSpan; // When this note occurs
  accidental?: -1 | 0 | 1; // -1 for flat, 1 for sharp (for copying)
  midiNumber: number | null; // Calculated MIDI number at creation time (null for rests)
};

type TimeSignature = {
  numerator: number;
  startMeasure: number;
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
  | { type: "timeSignature"; timeSignatures: TimeSignature[] };

type CommandContext = {
  currentKey: KeySignature;
  existingNotes?: LogicalNote[];
  lastNoteIndex?: number; // Index of last note before current command
  currentTrack: 1 | 2; // Track 1 for right hand, 2 for left hand
  timeSignatures: TimeSignature[]; // Array of time signatures in effect
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

const parseTimeSignature = (line: string): Command | null => {
  // Match time signature grid format
  const parts = line.trim().split(/\s+/);
  const timeSignatures: TimeSignature[] = [];
  let currentMeasure = 1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part.includes("/")) {
      // Parse time signature (e.g. "3/4")
      const [numerator] = part.split("/");
      timeSignatures.push({
        numerator: parseInt(numerator),
        startMeasure: currentMeasure,
      });
    } else if (/^\d+$/.test(part)) {
      // Next measure number
      currentMeasure = parseInt(part);
    }
  }

  return timeSignatures.length > 0
    ? { type: "timeSignature", timeSignatures }
    : null;
};

const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
  // Try parsing as time signature first (if it's the first line)
  if (line.includes("/")) {
    const timeSignatureCmd = parseTimeSignature(line);
    if (timeSignatureCmd) {
      return timeSignatureCmd;
    }
  }

  // Handle track switch commands
  if (line.trim().toLowerCase() === "lh") {
    return { type: "track", track: 2 };
  }
  if (line.trim().toLowerCase() === "rh") {
    return { type: "track", track: 1 };
  }

  // Try parsing as key command
  const key = parseKey(line);
  if (key) {
    return { type: "key", key };
  }

  // Try parsing as copy command
  const copyCmd = parseCopyCommand(line);
  if (copyCmd) {
    return copyCmd;
  }

  // Parse as note command
  const match = line.match(/^\s*(\d+)\s+(.+)$/);
  if (match) {
    const notes = parseMelodyString(line, context);
    if (notes.length > 0) {
      return { type: "notes", notes };
    }
  }

  return null;
};

// Helper function to calculate MIDI number from scale degree and key
const calculateMidiNumber = (
  scaleDegree: number,
  accidental: number | undefined,
  octaveShift: number,
  key: KeySignature,
  previousMidiNumber: number | null = null,
): number | null => {
  if (scaleDegree === 0) return null; // Rest

  // Map scale degree to chromatic pitch (using major scale as reference)
  const majorScaleMap = [0, 2, 4, 5, 7, 9, 11];
  let pitch = majorScaleMap[scaleDegree - 1];

  // Apply accidental if any (this modifies from major scale reference)
  if (accidental) {
    pitch += accidental;
  }

  // Apply key signature offset
  pitch = (pitch + key.tonic) % 12;

  // Start with middle C octave
  let baseNote = pitch + 60;

  // If there's a previous note, find the closest octave BEFORE applying the octave shift
  if (previousMidiNumber !== null) {
    // Try all possible octaves within MIDI range to find the smallest interval
    let bestNote = baseNote;
    let smallestInterval = Math.abs(baseNote - previousMidiNumber);

    // Calculate how many octaves we can go up/down while staying in MIDI range
    const pitchClass = baseNote % 12;
    const minOctave = Math.floor(-pitchClass / 12); // To reach 0
    const maxOctave = Math.floor((127 - pitchClass) / 12); // To reach 127

    for (let octave = minOctave; octave <= maxOctave; octave++) {
      const candidateNote = baseNote + octave * 12;
      if (candidateNote < 0 || candidateNote > 127) continue; // Safety check
      const interval = Math.abs(candidateNote - previousMidiNumber);
      if (interval < smallestInterval) {
        smallestInterval = interval;
        bestNote = candidateNote;
      }
    }

    baseNote = bestNote;
  }

  // Apply explicit octave shift after finding closest position
  return baseNote + octaveShift * 12;
};

// Helper to get time signature for a given measure
const getTimeSignatureForMeasure = (
  measure: number,
  timeSignatures: TimeSignature[],
): number => {
  // Default to 4/4 if no time signatures or measure before first time signature
  if (timeSignatures.length === 0 || measure < timeSignatures[0].startMeasure) {
    return 4;
  }

  // Find the last time signature that starts before or at this measure
  for (let i = timeSignatures.length - 1; i >= 0; i--) {
    if (timeSignatures[i].startMeasure <= measure) {
      return timeSignatures[i].numerator;
    }
  }

  return 4; // Default to 4/4 if no matching time signature found
};

// Helper to convert measure.beat to decimal position with time signatures
const toDecimalPosition = (
  measure: number,
  beat: number,
  timeSignatures: TimeSignature[],
): number => {
  let position = measure;
  const beatsPerMeasure = getTimeSignatureForMeasure(measure, timeSignatures);
  // Each beat takes up 1/beatsPerMeasure of the measure
  position += (beat - 1) / beatsPerMeasure;
  return position;
};

// Helper to convert decimal position to measure and beat with time signatures
const fromDecimalPosition = (
  position: number,
  timeSignatures: TimeSignature[],
): { measure: number; beat: number } => {
  const measure = Math.floor(position);
  const beatsPerMeasure = getTimeSignatureForMeasure(measure, timeSignatures);
  // Convert decimal position back to beat number
  const beat = 1 + (position - measure) * beatsPerMeasure;
  return { measure, beat };
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

const parseMelodyString = (
  melodyString: string,
  context: CommandContext,
): LogicalNote[] => {
  const lines = melodyString.split("\n").filter((line) => line.trim());

  return lines.flatMap((line) => {
    const match = line.match(/^\s*(\d+)\s+(.+)$/);
    if (!match) return [];

    const [_, measureStr, melodyPart] = match;
    const startMeasure = parseInt(measureStr);
    const key = context.currentKey;

    const notePattern = /(\s+|[v^]+[b#]?[1-7]|[b#]?[1-7])([|+_\-=]\.?)/g;
    const matches = Array.from(melodyPart.matchAll(notePattern));

    if (matches.length === 0) return [];

    let currentPosition = startMeasure;
    let previousMidiNumber: number | null = null;

    return matches.map((match) => {
      const [_, noteOrRest, durationMarker] = match;
      const duration = getDuration(durationMarker);
      const durationInBeats = duration / TICKS_PER_QUARTER;
      const beatsPerMeasure = getTimeSignatureForMeasure(
        Math.floor(currentPosition),
        context.timeSignatures,
      );

      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + durationInBeats / beatsPerMeasure,
      };

      // Update position for next note
      currentPosition = span.end;

      if (noteOrRest.trim() === "") {
        return {
          scaleDegree: 0,
          duration,
          span,
          midiNumber: null,
        };
      }

      const note = noteOrRest;
      const upOctaves = (note.match(/\^/g) || []).length;
      const downOctaves = (note.match(/v/g) || []).length;
      const octaveShift = upOctaves - downOctaves;

      let accidental: -1 | 0 | 1 = 0;
      const noteWithoutOctave = note.replace(/[v^]+/, "");
      if (noteWithoutOctave.startsWith("b")) accidental = -1;
      if (noteWithoutOctave.startsWith("#")) accidental = 1;

      const scaleDegree = parseInt(noteWithoutOctave.replace(/[b#]/, ""));

      if (isNaN(scaleDegree) || scaleDegree < 1 || scaleDegree > 7) {
        return {
          scaleDegree: 0,
          duration,
          span,
          midiNumber: null,
        };
      }

      const midiNumber = calculateMidiNumber(
        scaleDegree,
        accidental,
        octaveShift,
        key,
        previousMidiNumber,
      );

      previousMidiNumber = midiNumber;

      return {
        scaleDegree,
        duration,
        span,
        accidental,
        midiNumber,
      };
    });
  });
};

const getDuration = (marker: string): number => {
  // Split marker into base duration and dot if present
  const [baseDuration, dot] = marker.split(".");
  let duration: number;

  switch (baseDuration) {
    case "|":
      duration = TICKS_PER_QUARTER * 4; // whole note
      break;
    case "+":
      duration = TICKS_PER_QUARTER * 2; // half note
      break;
    case "_":
      duration = TICKS_PER_QUARTER; // quarter note
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

// Modify logicalNoteToMidi to include track information and time signatures
const logicalNoteToMidi = (
  note: LogicalNote,
  track: number,
  timeSignatures: TimeSignature[],
): Note | null => {
  if (note.midiNumber === null) return null; // Rest

  const { measure, beat } = fromDecimalPosition(
    note.span.start,
    timeSignatures,
  );

  // Calculate total ticks by accumulating all previous measures' ticks
  let startTicks = 0;
  for (let m = 1; m < measure; m++) {
    const beatsInMeasure = getTimeSignatureForMeasure(m, timeSignatures);
    startTicks += beatsInMeasure * TICKS_PER_QUARTER;
  }
  // Add ticks for the current measure
  startTicks += (beat - 1) * TICKS_PER_QUARTER;

  const result = {
    pitch: note.midiNumber,
    velocity: 100,
    startTime: startTicks,
    duration: note.duration - 1,
    channel: track - 1,
  };

  console.log(`Note: Track ${track}, Measure ${measure}, Beat ${beat}`);
  console.log(
    `  Span: ${note.span.start.toFixed(3)} to ${note.span.end.toFixed(3)}`,
  );
  console.log(
    `  MIDI: pitch=${result.pitch}, start=${result.startTime}, duration=${result.duration}`,
  );

  return result;
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { playSongBuffer, rawlProps, analyses } = useContext(AppContext);
  const [score, setScore] = useState(scores[slug || ""] || "");
  const [editorContext, setEditorContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" }, // Default to C major
    currentTrack: 1, // Default to right hand
    timeSignatures: [], // Start with no time signatures (defaults to 4/4)
  });

  // Keep a ref to the latest context to avoid dependency cycles
  const contextRef = React.useRef(editorContext);
  React.useEffect(() => {
    contextRef.current = editorContext;
  }, [editorContext]);

  // Get the analysis for this slug if it exists
  const analysis = analyses[`f/${slug}`];

  // Signal to App that this route should not have global shortcuts
  React.useEffect(() => {
    console.log("Setting up global shortcuts effect");
    window.__disableGlobalShortcuts = true;
    return () => {
      console.log("Cleaning up global shortcuts effect");
      delete window.__disableGlobalShortcuts;
    };
  }, []);

  const handleMelodyPlayback = React.useCallback(() => {
    console.log("handleMelodyPlayback called");
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;

    try {
      const lines = text.split("\n").filter((line) => line.trim());
      let scoreTrack1: LogicalNote[] = []; // Left hand score
      let scoreTrack2: LogicalNote[] = []; // Right hand score
      const newContext: CommandContext = {
        currentKey: { ...contextRef.current.currentKey },
        currentTrack: contextRef.current.currentTrack,
        timeSignatures: [...contextRef.current.timeSignatures],
      };

      for (const line of lines) {
        console.log("Processing line:", line);
        const command = parseCommand(line, newContext);
        if (!command) continue;

        console.log("Parsed command:", command);
        switch (command.type) {
          case "timeSignature":
            newContext.timeSignatures = command.timeSignatures;
            break;

          case "track":
            newContext.currentTrack = command.track;
            break;

          case "key":
            newContext.currentKey = command.key;
            break;

          case "notes":
            // Add notes to the current track's score
            if (newContext.currentTrack === 1) {
              scoreTrack1 = [...scoreTrack1, ...command.notes];
            } else {
              scoreTrack2 = [...scoreTrack2, ...command.notes];
            }
            break;

          case "copy":
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
                return sourceNotes.map((n) => {
                  if (n.midiNumber === null) {
                    return {
                      ...n,
                      span: {
                        start:
                          n.span.start + (targetMeasure - command.sourceStart),
                        end: n.span.end + (targetMeasure - command.sourceStart),
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
                      start:
                        n.span.start + (targetMeasure - command.sourceStart),
                      end: n.span.end + (targetMeasure - command.sourceStart),
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

      if (scoreTrack1.length === 0 && scoreTrack2.length === 0) {
        setError("No valid notes found");
        return;
      }

      setError(null);
      console.log("Setting new context:", newContext);
      setEditorContext(newContext);

      // Convert both tracks to MIDI notes
      const midiNotesTrack1 = scoreTrack1
        .map((n) => logicalNoteToMidi(n, 1, newContext.timeSignatures))
        .filter((n): n is Note => n !== null);
      const midiNotesTrack2 = scoreTrack2
        .map((n) => logicalNoteToMidi(n, 2, newContext.timeSignatures))
        .filter((n): n is Note => n !== null);

      // Combine both tracks
      const allMidiNotes = [...midiNotesTrack1, ...midiNotesTrack2];

      console.log("Generating MIDI with metadata");
      const midiResult = generateMidiWithMetadata(
        allMidiNotes,
        `melody-${slug}`,
        120,
        newContext.timeSignatures,
      );

      if (playSongBuffer) {
        console.log("Playing song buffer");
        playSongBuffer(midiResult.midiInfo.id, midiResult.midiData, true);
      }
    } catch (e) {
      console.log("Error during playback:", e);
      setError(
        e instanceof Error ? e.message : "Unknown error during playback",
      );
    }
  }, [playSongBuffer, slug]); // Removed editorContext from dependencies

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Text changed");
    const newScore = e.target.value;
    setScore(newScore);
    handleMelodyPlayback();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      console.log("Cmd+Enter pressed");
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
          1. Time Signatures: Start with "N/4" (e.g. "3/4 13 4/4 19 3/4")
          <br />
          2. Notes: Start line with measure number, then use scale degrees (1-7)
          <br />
          Durations: | (whole), + (half), _ (quarter), - (eighth), = (16th)
          <br />
          Modifiers: ^ (octave up), v (octave down), b/# (flat/sharp)
          <br />
          3. Key changes: "C major", "Ab minor", "F# major"
          <br />
          4. Copy: "11 copy 1 0 -4 -1" (copy measure 1 to 11-13 with shifts)
          <br />
          5. Tracks: "lh" (left hand), "rh" (right hand)
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
