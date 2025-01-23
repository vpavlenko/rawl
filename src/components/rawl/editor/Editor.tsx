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
  startMeasure: number; // 1-based measure number
  startBeat: number; // 1-based beat number within measure
  endMeasure: number; // 1-based measure number
  endBeat: number; // 1-based beat number within measure
};

type LogicalNote = {
  scaleDegree: number; // 1-7 with optional accidentals (for copying)
  duration: number; // in MIDI ticks
  span: MeasureSpan; // When this note occurs
  octaveShift: number; // Number of octaves to shift (from ^/v modifiers)
  accidental?: -1 | 0 | 1; // -1 for flat, 1 for sharp (for copying)
  midiNumber: number | null; // Calculated MIDI number at creation time (null for rests)
};

type CommandContext = {
  currentKey: KeySignature;
  measureToKey: Map<number, KeySignature>;
};

type Command =
  | { type: "key"; key: KeySignature }
  | { type: "notes"; notes: LogicalNote[] }
  | {
      type: "copy";
      targetMeasure: number;
      sourceMeasure: number;
      shifts: number[]; // Array of diatonic shifts to apply
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

  const normalizedRoot = root.replace("b", "b").replace("#", "#");
  const tonic = noteToNumber[normalizedRoot];

  if (tonic === undefined) return null;

  return {
    tonic,
    mode: mode.toLowerCase() as "major" | "minor",
  };
};

const parseCopyCommand = (line: string): Command | null => {
  const match = line.match(/^(\d+)\s+copy\s+(\d+)(?:\s+(-?\d+))*$/);
  if (!match) return null;

  const [_, targetMeasureStr, sourceMeasureStr, ...shiftStrs] = match;
  const targetMeasure = parseInt(targetMeasureStr);
  const sourceMeasure = parseInt(sourceMeasureStr);
  const shifts = shiftStrs
    .filter((s) => s !== undefined)
    .map((s) => parseInt(s));

  return {
    type: "copy",
    targetMeasure,
    sourceMeasure,
    shifts,
  };
};

const parseCommand = (
  line: string,
  context: CommandContext,
): Command | null => {
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

  // Parse as note command (existing logic)
  const notes = parseMelodyString(line, context);
  if (notes.length > 0) {
    return { type: "notes", notes };
  }

  return null;
};

// Helper function to calculate MIDI number from scale degree and key
const calculateMidiNumber = (
  scaleDegree: number,
  accidental: number | undefined,
  octaveShift: number,
  key: KeySignature,
): number | null => {
  if (scaleDegree === 0) return null; // Rest

  // Map scale degree to chromatic pitch (using major scale as reference)
  const majorScaleMap = [0, 2, 4, 5, 7, 9, 11];
  let pitch = majorScaleMap[scaleDegree - 1];

  // Apply accidental if any
  if (accidental) {
    pitch += accidental;
  }

  // Apply key signature offset
  pitch = (pitch + key.tonic) % 12;

  // If minor key, adjust scale degrees 3, 6, and 7
  if (key.mode === "minor") {
    if (scaleDegree === 3) pitch--;
    if (scaleDegree === 6) pitch--;
    if (scaleDegree === 7) pitch--;
  }

  // Apply octave shift
  return pitch + octaveShift * 12 + 60; // Middle C (60) as base
};

const handleCommand = (
  command: Command,
  context: CommandContext,
): LogicalNote[] => {
  switch (command.type) {
    case "key":
      // Update context with new key - store for the next measure
      context.currentKey = command.key;
      // Find the next measure number that doesn't have notes yet
      const nextMeasure =
        Math.max(0, ...Array.from(context.measureToKey.keys())) + 1;
      context.measureToKey.set(nextMeasure, command.key);
      return [];

    case "copy": {
      // Find notes in the source measure
      const sourceNotes = parseMelodyString(
        `${command.sourceMeasure} 1_2_3_4_`,
        context,
      ).filter((n) => n.span.startMeasure === command.sourceMeasure);

      // Create copies with shifts
      return [
        // First copy is verbatim
        ...sourceNotes.map((n) => {
          const newSpan = {
            startMeasure: command.targetMeasure,
            startBeat: n.span.startBeat,
            endMeasure: command.targetMeasure,
            endBeat: n.span.endBeat,
          };
          const key =
            context.measureToKey.get(command.targetMeasure) ||
            context.currentKey;
          return {
            ...n,
            span: newSpan,
            midiNumber: calculateMidiNumber(
              n.scaleDegree,
              n.accidental,
              n.octaveShift,
              key,
            ),
          };
        }),
        // Then apply shifts
        ...command.shifts.flatMap((shift, idx) =>
          sourceNotes.map((n) => {
            const targetMeasure = command.targetMeasure + idx + 1;
            const newSpan = {
              startMeasure: targetMeasure,
              startBeat: n.span.startBeat,
              endMeasure: targetMeasure,
              endBeat: n.span.endBeat,
            };
            const newScaleDegree = ((n.scaleDegree + shift - 1) % 7) + 1;
            const key =
              context.measureToKey.get(targetMeasure) || context.currentKey;
            return {
              ...n,
              span: newSpan,
              scaleDegree: newScaleDegree,
              midiNumber: calculateMidiNumber(
                newScaleDegree,
                n.accidental,
                n.octaveShift,
                key,
              ),
            };
          }),
        ),
      ];
    }

    case "notes":
      return command.notes;
  }
};

const parseMelodyString = (
  melodyString: string,
  context: CommandContext,
): LogicalNote[] => {
  // Split into lines and filter out empty lines
  const lines = melodyString.split("\n").filter((line) => line.trim());

  // Process each line
  return lines.flatMap((line) => {
    // Extract measure number and melody
    const match = line.match(/^\s*(\d+)\s+(.+)$/);
    if (!match) return [];

    const [_, measureStr, melodyPart] = match;
    const startMeasure = parseInt(measureStr);
    const key = context.measureToKey.get(startMeasure) || context.currentKey;

    // Match notes in the melody part
    const notePattern = /(\s+|[v^]?[b#]?[1-7])([|+_\-=])/g;
    const matches = Array.from(melodyPart.matchAll(notePattern));

    if (matches.length === 0) return [];

    let currentBeat = 1;
    const BEATS_PER_MEASURE = 4;

    return matches.map((match) => {
      const [_, noteOrRest, durationMarker] = match;
      const duration = getDuration(durationMarker);
      const durationInBeats = duration / TICKS_PER_QUARTER;

      const span: MeasureSpan = {
        startMeasure,
        startBeat: currentBeat,
        endMeasure: startMeasure,
        endBeat: currentBeat + durationInBeats,
      };

      // Handle measure overflow
      if (span.endBeat > BEATS_PER_MEASURE + 1) {
        const extraMeasures = Math.floor(
          (span.endBeat - 1) / BEATS_PER_MEASURE,
        );
        span.endMeasure += extraMeasures;
        span.endBeat = ((span.endBeat - 1) % BEATS_PER_MEASURE) + 1;
      }

      // Update currentBeat for next note
      currentBeat = span.endBeat;
      if (currentBeat > BEATS_PER_MEASURE) {
        currentBeat = 1;
      }

      // Handle rests (spaces)
      if (noteOrRest.trim() === "") {
        return {
          scaleDegree: 0,
          duration,
          span,
          octaveShift: 0,
          midiNumber: null,
        };
      }

      const note = noteOrRest;
      const hasUpOctave = note.startsWith("^");
      const hasDownOctave = note.startsWith("v");
      const octaveShift = hasUpOctave ? 1 : hasDownOctave ? -1 : 0;

      let accidental: -1 | 0 | 1 = 0;
      const noteWithoutOctave = note.replace(/[v^]/, "");
      if (noteWithoutOctave.startsWith("b")) accidental = -1;
      if (noteWithoutOctave.startsWith("#")) accidental = 1;

      const scaleDegree = parseInt(noteWithoutOctave.replace(/[b#]/, ""));

      if (isNaN(scaleDegree) || scaleDegree < 1 || scaleDegree > 7) {
        return {
          scaleDegree: 0,
          duration,
          span,
          octaveShift: 0,
          midiNumber: null,
        };
      }

      return {
        scaleDegree,
        duration,
        span,
        octaveShift,
        accidental,
        midiNumber: calculateMidiNumber(
          scaleDegree,
          accidental,
          octaveShift,
          key,
        ),
      };
    });
  });
};

const getDuration = (marker: string): number => {
  switch (marker) {
    case "|":
      return TICKS_PER_QUARTER * 4; // whole note
    case "+":
      return TICKS_PER_QUARTER * 2; // half note
    case "_":
      return TICKS_PER_QUARTER; // quarter note
    case "-":
      return TICKS_PER_QUARTER / 2; // eighth note
    case "=":
      return TICKS_PER_QUARTER / 4; // sixteenth note
    default:
      return TICKS_PER_QUARTER; // default to quarter note
  }
};

// Simplified MIDI conversion that just uses pre-calculated MIDI numbers
const logicalNoteToMidi = (note: LogicalNote): Note | null => {
  if (note.midiNumber === null) return null; // Rest

  const startTicks =
    ((note.span.startMeasure - 1) * 4 + (note.span.startBeat - 1)) *
    TICKS_PER_QUARTER;

  return {
    pitch: note.midiNumber,
    velocity: 100,
    startTime: startTicks,
    duration: note.duration - 1,
    channel: 0,
  };
};

const convertToMidiNotes = (notes: LogicalNote[]): Note[] => {
  return notes.map(logicalNoteToMidi).filter((n): n is Note => n !== null);
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { playSongBuffer, rawlProps } = useContext(AppContext);
  const [context, setContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" }, // Default to C major
    measureToKey: new Map(),
  });

  // Signal to App that this route should not have global shortcuts
  React.useEffect(() => {
    window.__disableGlobalShortcuts = true;
    return () => {
      delete window.__disableGlobalShortcuts;
    };
  }, []);

  const handleMelodyPlayback = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;

    try {
      // Split into lines and process each line
      const lines = text.split("\n").filter((line) => line.trim());

      let allNotes: LogicalNote[] = [];
      const newContext: CommandContext = {
        currentKey: { ...context.currentKey },
        measureToKey: new Map(context.measureToKey),
      };

      for (const line of lines) {
        const command = parseCommand(line, newContext);
        if (command) {
          const notes = handleCommand(command, newContext);
          allNotes = [...allNotes, ...notes];
        }
      }

      if (allNotes.length === 0) {
        setError("No valid notes found");
        return;
      }

      setError(null);
      setContext(newContext);

      const midiNotes = convertToMidiNotes(allNotes);
      const midiResult = generateMidiWithMetadata(
        midiNotes,
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
      <RawlContainer>{rawlProps && <Rawl {...rawlProps} />}</RawlContainer>
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
          Press Cmd+Enter to play.
        </p>
        <MelodyTextArea
          ref={textareaRef}
          defaultValue={`C major
1 1-2-3-
2 4-5-6-1_`}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
