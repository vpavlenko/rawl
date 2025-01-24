import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { TICKS_PER_QUARTER } from "../forge/constants";
import { Note } from "../forge/ForgeGenerator";
import Rawl from "../Rawl";
import { generateMidiWithMetadata } from "./EditorMidi";

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
  | { type: "track"; track: 1 | 2 };

type CommandContext = {
  currentKey: KeySignature;
  existingNotes?: LogicalNote[];
  lastNoteIndex?: number; // Index of last note before current command
  currentTrack: 1 | 2; // Track 1 for right hand, 2 for left hand
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

const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
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

// Helper to convert measure.beat to decimal position
const toDecimalPosition = (measure: number, beat: number): number => {
  return measure + (beat - 1) / 4; // Assuming 4/4 time signature
};

// Helper to convert decimal position to measure and beat
const fromDecimalPosition = (
  position: number,
): { measure: number; beat: number } => {
  const measure = Math.floor(position);
  const beat = 1 + (position - measure) * 4; // Assuming 4/4 time signature
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

    // Updated regex to capture multiple ^ or v characters and optional dots after duration markers
    const notePattern = /(\s+|[v^]+[b#]?[1-7]|[b#]?[1-7])([|+_\-=]\.?)/g;
    const matches = Array.from(melodyPart.matchAll(notePattern));

    if (matches.length === 0) return [];

    let currentPosition = toDecimalPosition(startMeasure, 1);
    let previousMidiNumber: number | null = null;

    return matches.map((match) => {
      const [_, noteOrRest, durationMarker] = match;
      const duration = getDuration(durationMarker);
      const durationInBeats = duration / TICKS_PER_QUARTER;

      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + durationInBeats / 4, // Convert beats to measure fraction
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
      // Count the number of ^ and v characters
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

      // Update previous MIDI number for next iteration
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

// Modify logicalNoteToMidi to include track information
const logicalNoteToMidi = (note: LogicalNote, track: number): Note | null => {
  if (note.midiNumber === null) return null; // Rest

  const { measure, beat } = fromDecimalPosition(note.span.start);
  const startTicks = ((measure - 1) * 4 + (beat - 1)) * TICKS_PER_QUARTER;

  return {
    pitch: note.midiNumber,
    velocity: 100,
    startTime: startTicks,
    duration: note.duration - 1,
    channel: track - 1, // Track 1 (rh) uses channel 1, Track 2 (lh) uses channel 0
  };
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { playSongBuffer, rawlProps, analyses } = useContext(AppContext);
  const [melodyText, setMelodyText] = useState(`A minor
lh
1 vv1-1-^5-b3-^1-vb3-5-b3-
2 copy 1 0 0 -4 -1 -5 -2 -4 -3 0
11 copy 3-10 0 0 0 0 0 0 0
67 1|
68 copy 67 -4 -1 -5 -2 -4 -3 0
67 copy 67-74 7
74 1-
rh
9 ^1_7-6-7_.1-1|
11 copy 3-10 0 0 0 0 0
3 ^b3-^b3-2-b3-1-b3-b7-b3-vb6-^b3-v5-^b3-v4-^b3-vb3-^b3-
5 copy 3-4 -1 -2
11 ^^b3-vb3-4-b3-5-b3-b6-b3-^b7-vb3-^1-vb3-^2-vb3-^b3-vb3-
13 copy 11-12 -1 -2
17 copy 9-10 0
51 copy 3-18 0`);
  const [context, setContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" }, // Default to C major
    currentTrack: 1, // Default to right hand (track 2)
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
    const newText = e.target.value;
    setMelodyText(newText);
    handleMelodyPlayback();
  };

  const handleMelodyPlayback = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;

    try {
      const lines = text.split("\n").filter((line) => line.trim());
      let scoreTrack1: LogicalNote[] = []; // Left hand score
      let scoreTrack2: LogicalNote[] = []; // Right hand score
      const newContext: CommandContext = {
        currentKey: { ...context.currentKey },
        currentTrack: context.currentTrack,
      };

      for (const line of lines) {
        const command = parseCommand(line, newContext);
        if (!command) continue;

        switch (command.type) {
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

          case "copy": {
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
      }

      if (scoreTrack1.length === 0 && scoreTrack2.length === 0) {
        setError("No valid notes found");
        return;
      }

      setError(null);
      setContext(newContext);

      debugger;
      // Convert both tracks to MIDI notes
      const midiNotesTrack1 = scoreTrack1
        .map((n) => logicalNoteToMidi(n, 1))
        .filter((n): n is Note => n !== null);
      const midiNotesTrack2 = scoreTrack2
        .map((n) => logicalNoteToMidi(n, 2))
        .filter((n): n is Note => n !== null);

      // Combine both tracks
      const allMidiNotes = [...midiNotesTrack1, ...midiNotesTrack2];

      const midiResult = generateMidiWithMetadata(
        allMidiNotes,
        `melody-${slug}`,
        120,
      );

      if (playSongBuffer) {
        playSongBuffer(midiResult.midiInfo.id, midiResult.midiData, true);
      }
    } catch (e) {
      console.log("Error during playback:", e);
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
        <h3>Melody Editor</h3>
        <p>
          Commands:
          <br />
          1. Notes: Start line with measure number, then use scale degrees (1-7)
          <br />
          Durations: | (whole), + (half), _ (quarter), - (eighth), = (16th)
          <br />
          Modifiers: ^ (octave up), v (octave down), b/# (flat/sharp)
          <br />
          2. Key changes: "C major", "Ab minor", "F# major"
          <br />
          3. Copy: "11 copy 1 0 -4 -1" (copy measure 1 to 11-13 with shifts)
          <br />
          4. Tracks: "lh" (left hand), "rh" (right hand)
          <br />
          Press Cmd+Enter to play.
        </p>
        <MelodyTextArea
          ref={textareaRef}
          value={melodyText}
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
