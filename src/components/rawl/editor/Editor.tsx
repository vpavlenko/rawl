import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { createTheme } from "@uiw/codemirror-themes";
import CodeMirror from "@uiw/react-codemirror";
import React, { useContext, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { TICKS_PER_QUARTER } from "../forge/constants";
import { Note } from "../forge/ForgeGenerator";
import Rawl from "../Rawl";
import { generateMidiWithMetadata } from "./EditorMidi";
import { scores } from "./scores";

// Scale maps and note mappings at the top level
const MINOR_SCALE_MAP = [0, 2, 3, 5, 7, 8, 10];
const MAJOR_SCALE_MAP = [0, 2, 4, 5, 7, 9, 11];

const NOTE_LETTER_MAP: { [key: string]: number } = {
  // First octave (numeric)
  "1": 0,
  "2": 1,
  "3": 2,
  "4": 3,
  "5": 4,
  "6": 5,
  "7": 6,
  "8": 7,
  "9": 8,
  "0": 9,

  // Second octave (letters)
  q: 7,
  w: 8,
  e: 9,
  r: 10,
  t: 11,
  y: 12,
  u: 13,

  // Third octave
  i: 14,
  o: 15,
  p: 16,
  a: 14,
  s: 15,
  d: 16, // Alternative fingering
  f: 17,
  g: 18,
  h: 19,
  j: 20,
  k: 21,
  l: 22,
};

// Text color mapping based on background color darkness
const NOTE_TEXT_COLORS: { [key: number]: string } = {
  0: "#000000", // white bg -> black text
  1: "#ffffff", // dark red -> white text
  2: "#000000", // bright red -> black text
  3: "#ffffff", // dark green -> white text
  4: "#000000", // bright green -> black text
  5: "#ffffff", // purple -> white text
  6: "#000000", // light purple -> black text
  7: "#ffffff", // gray -> white text
  8: "#ffffff", // blue -> white text
  9: "#000000", // cyan -> black text
  10: "#000000", // orange -> black text
  11: "#000000", // yellow -> black text
};

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
  | { type: "insert"; notes: LogicalNote[] }
  | {
      type: "copy";
      targetMeasure: number;
      targetBeat: number;
      sourceStart: number;
      sourceStartBeat: number;
      sourceEnd: number;
      sourceEndBeat: number;
      shifts: (number | "x")[]; // Allow 'x' in shifts array
    }
  | { type: "track"; track: 1 | 2; baseOctave?: number }
  | { type: "time"; signatures: TimeSignature[] };

type CommandContext = {
  currentKey: KeySignature;
  existingNotes?: LogicalNote[];
  lastNoteIndex?: number; // Index of last note before current command
  currentTrack: 1 | 2; // Track 1 for right hand, 2 for left hand
  timeSignatures: TimeSignature[]; // List of time signatures in effect
  beatsPerMeasure?: number; // Optional because only needed during note parsing
  baseOctaveRH: number; // Base octave for right hand
  baseOctaveLH: number; // Base octave for left hand
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
  position: relative;
  z-index: 1;
`;

interface EditorPanelProps {
  isFolded: boolean;
}

const EditorPanel = styled.div<EditorPanelProps>`
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 50%;
  height: 40%;
  background-color: #1e1e1e;
  border-left: 1px solid #333;
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 99999;
  isolation: isolate;
  transform: translateX(${(props) => (props.isFolded ? "100%" : "0")});
  transition: transform 0.3s ease;
`;

const CodeMirrorWrapper = styled.div`
  position: relative;
  flex: 1;
  isolation: isolate;
  background-color: #1e1e1e;
  z-index: 100000;

  /* Ensure all CodeMirror elements stay on top */
  & * {
    z-index: 100001;
  }

  .cm-editor {
    position: absolute !important;
    inset: 0;
    height: 100%;
    font-family: "Menlo", "Monaco", "Courier New", monospace;
    font-size: 14px;
    line-height: 1.4;
    z-index: 100002;
  }

  .cm-scroller,
  .cm-content,
  .cm-line,
  .cm-activeLine,
  .cm-activeLineGutter {
    z-index: 100003;
    position: relative;
  }

  .cm-editor .cm-gutters {
    position: relative;
    z-index: 100004;
  }

  /* Override text colors for note backgrounds */
  .noteColor_0_colors {
    color: #000000 !important;
  }
  .noteColor_1_colors {
    color: #ffffff !important;
  }
  .noteColor_2_colors {
    color: #000000 !important;
  }
  .noteColor_3_colors {
    color: #ffffff !important;
  }
  .noteColor_4_colors {
    color: #000000 !important;
  }
  .noteColor_5_colors {
    color: #ffffff !important;
  }
  .noteColor_6_colors {
    color: #000000 !important;
  }
  .noteColor_7_colors {
    color: #000000 !important;
  }
  .noteColor_8_colors {
    color: #ffffff !important;
  }
  .noteColor_9_colors {
    color: #000000 !important;
  }
  .noteColor_10_colors {
    color: #000000 !important;
  }
  .noteColor_11_colors {
    color: #000000 !important;
  }

  /* Add dot styles */
  .dotAbove {
    position: relative;
  }
  .dotAbove::before {
    content: "·";
    position: absolute;
    font-family: serif;
    color: white;
    top: -0.75em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.2em;
  }
  .dotBelow {
    position: relative;
  }
  .dotBelow::before {
    content: "·";
    position: absolute;
    font-family: serif;
    color: white;
    bottom: -0.75em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 1.2em;
  }
`;

const FoldButton = styled.button`
  position: absolute;
  left: -30px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  background: #1e1e1e;
  border: 1px solid #333;
  border-right: none;
  border-radius: 4px 0 0 4px;
  color: #d4d4d4;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2d2d2d;
  }
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;

const customTheme = createTheme({
  theme: "dark",
  settings: {
    background: "#1e1e1e",
    foreground: "#ffffff",
    caret: "#ffffff",
    selection: "#036dd626",
    selectionMatch: "#036dd626",
    lineHighlight: "#8a91991a",
    gutterBackground: "#1e1e1e",
    gutterForeground: "#8a919966",
  },
  styles: [],
});

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

const parseTimeSignatures = (line: string): TimeSignature[] | null => {
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
const calculateMidiNumber = (
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
const calculateShiftedNote = (
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

// Function to get background colors for each character in a line
const getBackgroundsForLine = (
  line: string,
  currentKey: KeySignature,
  allLines: string[],
  lineIndex: number,
) => {
  console.log("Processing line:", line);
  console.log("Initial key:", currentKey);

  // Process all previous lines to find the latest key signature
  for (let i = 0; i < lineIndex; i++) {
    const prevLine = allLines[i].trim();
    console.log("Checking previous line for key:", prevLine);
    const keyMatch = prevLine.match(/^([A-G][b#]?)\s+(major|minor)$/i);
    if (keyMatch) {
      const [_, root, mode] = keyMatch;
      console.log("Found key change:", root, mode);
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
      currentKey = {
        tonic: noteToNumber[root],
        mode: mode.toLowerCase() as "major" | "minor",
      };
      console.log("Updated key:", currentKey);
    }
  }

  // Check if this line is an insert command
  const insertMatch = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
  console.log("Insert command match:", insertMatch);

  if (!insertMatch) {
    console.log("Not an insert command, returning null");
    return Array.from(line).map(() => ({ class: null }));
  }

  const [fullMatch, measure, beat, melodyPart] = insertMatch;
  console.log("Melody part:", melodyPart);

  // Calculate where the melody part starts in the full line
  const melodyStartIndex = line.indexOf(melodyPart);

  // Process only the melody part
  const melodyDecorations = Array.from(melodyPart).map((char, index) => {
    console.log("\nProcessing char:", char, "at index:", index);

    // Check if character is a note
    const noteDegree = NOTE_LETTER_MAP[char.toLowerCase()];
    console.log("Note degree from map:", noteDegree);

    if (noteDegree === undefined) {
      console.log("Not a note, returning null");
      return { class: null };
    }

    // Calculate scale degree (0-6)
    const scaleDegree = noteDegree % 7;
    console.log("Scale degree (0-6):", scaleDegree);

    // Get the semitone offset from the scale map which we'll use for coloring
    const scaleMap =
      currentKey.mode === "major" ? MAJOR_SCALE_MAP : MINOR_SCALE_MAP;
    const colorIndex = scaleMap[scaleDegree];
    console.log("Color index from scale map:", colorIndex);

    // Add dot classes based on note degree
    let dotClass = "";
    if (noteDegree >= 14) {
      dotClass = " dotAbove";
    } else if (noteDegree <= 6) {
      dotClass = " dotBelow";
    }

    return {
      class: `noteColor_${colorIndex}_colors${dotClass}`,
    };
  });

  return [
    ...Array(melodyStartIndex).fill({ class: null }),
    ...melodyDecorations,
  ];
};

const characterBackgroundsPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      console.log("Plugin constructor called");
      this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
      console.log("Plugin update called");
      if (update.docChanged || update.viewportChanged) {
        this.decorations = this.buildDecorations(update.view);
      }
    }

    buildDecorations(view: EditorView) {
      console.log("\nBuilding decorations");
      const builder = new RangeSetBuilder<Decoration>();
      const doc = view.state.doc;
      const allLines = doc.toString().split("\n");
      console.log("Total lines:", allLines.length);

      // Start with C major as default
      let currentKey: KeySignature = { tonic: 0, mode: "major" };
      console.log("Starting with key:", currentKey);

      // Iterate through visible lines
      for (let { from, to } of view.visibleRanges) {
        console.log("\nProcessing visible range:", from, "to", to);
        let pos = from;
        while (pos <= to) {
          const line = view.state.doc.lineAt(pos);
          const lineIndex = doc.lineAt(pos).number - 1;
          console.log("\nProcessing line:", line.text, "at index:", lineIndex);

          const backgrounds = getBackgroundsForLine(
            line.text,
            currentKey,
            allLines,
            lineIndex,
          );
          console.log("Got backgrounds:", backgrounds);

          // Apply background to each character
          for (let i = 0; i < line.length; i++) {
            const charPos = line.from + i;
            if (charPos < line.to) {
              const decoration = backgrounds[i];
              if (decoration.class) {
                builder.add(
                  charPos,
                  charPos + 1,
                  Decoration.mark({ class: decoration.class }),
                );
              }
            }
          }
          pos = line.to + 1;
        }
      }

      return builder.finish();
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isFolded, setIsFolded] = useState(false);
  const editorRef = useRef<any>(null);
  const { playSongBuffer, rawlProps, analyses } = useContext(AppContext);
  const [score, setScore] = useState(scores[slug || ""] || "");
  const [context, setContext] = useState<CommandContext>({
    currentKey: { tonic: 0, mode: "major" }, // Default to C major
    currentTrack: 1, // Default to right hand
    timeSignatures: [{ numerator: 4, measureStart: 1 }], // Default to 4/4 time
    baseOctaveRH: 5, // Base octave for right hand
    baseOctaveLH: 3, // Base octave for left hand
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

  const handleMelodyPlayback = React.useCallback(
    (text: string) => {
      try {
        const lines = text.split("\n").filter((line) => line.trim());

        let scoreTrack1: LogicalNote[] = []; // Right hand score
        let scoreTrack2: LogicalNote[] = []; // Left hand score
        const newContext: CommandContext = {
          currentKey: { ...context.currentKey },
          currentTrack: context.currentTrack,
          timeSignatures: [...context.timeSignatures], // Start with default 4/4
          baseOctaveRH: context.baseOctaveRH,
          baseOctaveLH: context.baseOctaveLH,
        };

        for (const line of lines) {
          const command = parseCommand(line, newContext);
          if (!command) continue;

          switch (command.type) {
            case "track":
              newContext.currentTrack = command.track;
              if (command.baseOctave !== undefined) {
                if (command.track === 1) {
                  newContext.baseOctaveRH = command.baseOctave;
                } else {
                  newContext.baseOctaveLH = command.baseOctave;
                }
              }
              break;

            case "key":
              newContext.currentKey = command.key;
              break;

            case "time":
              newContext.timeSignatures = command.signatures;
              break;

            case "insert":
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
              ).filter((n) => {
                // Convert note's global beat position to measure and beat
                const { measure, beatInMeasure } = globalBeatToMeasureAndBeat(
                  n.span.start,
                  newContext.timeSignatures,
                );

                // Check if note is within the source range
                if (
                  measure < command.sourceStart ||
                  measure > command.sourceEnd
                ) {
                  return false;
                }

                // For start measure, check beat position
                if (
                  measure === command.sourceStart &&
                  beatInMeasure < command.sourceStartBeat
                ) {
                  return false;
                }

                // For end measure, check beat position
                if (
                  measure === command.sourceEnd &&
                  beatInMeasure >= command.sourceEndBeat
                ) {
                  return false;
                }

                return true;
              });

              if (sourceNotes.length === 0) {
                continue;
              }

              // Calculate the length of the source span in beats
              const sourceStartBeat = calculateGlobalBeatPosition(
                command.sourceStart,
                command.sourceStartBeat,
                newContext.timeSignatures,
              );
              const sourceEndBeat = calculateGlobalBeatPosition(
                command.sourceEnd,
                command.sourceEndBeat,
                newContext.timeSignatures,
              );
              const spanLengthInBeats = sourceEndBeat - sourceStartBeat;

              const allCopies = command.shifts
                .map((shift, idx) => {
                  // Calculate how many measures the source spans
                  let sourceMeasureSpan =
                    command.sourceEnd - command.sourceStart;
                  if (command.sourceEndBeat === 0) {
                    // If ending at start of measure, subtract one from span
                    // since sourceEnd points to the next measure
                    sourceMeasureSpan--;
                  }

                  // Each copy block starts at the target measure + (idx * source span length)
                  const targetStartBeat = calculateGlobalBeatPosition(
                    command.targetMeasure + idx * (sourceMeasureSpan + 1),
                    command.targetBeat,
                    newContext.timeSignatures,
                  );

                  // If this is a rest marker ('x'), return a rest note for the span
                  if (shift === "x") {
                    // Create a rest that spans the entire source duration
                    return [
                      {
                        scaleDegree: -Infinity, // Use -Infinity for rests
                        duration: spanLengthInBeats * TICKS_PER_QUARTER,
                        span: {
                          start: targetStartBeat,
                          end: targetStartBeat + spanLengthInBeats,
                        },
                        midiNumber: null,
                      },
                    ];
                  }

                  // Convert back to measure and beat for logging
                  const targetPos = globalBeatToMeasureAndBeat(
                    targetStartBeat,
                    newContext.timeSignatures,
                  );

                  return sourceNotes.map((n) => {
                    // Calculate relative position within the source span
                    const relativePosition = n.span.start - sourceStartBeat;
                    const targetPosition = targetStartBeat + relativePosition;

                    if (n.midiNumber === null) {
                      return {
                        ...n,
                        span: {
                          start: targetPosition,
                          end: targetPosition + (n.span.end - n.span.start),
                        },
                      };
                    }

                    // Calculate new scale degree and MIDI number with the shift
                    const { newDegree, newMidi } = calculateShiftedNote(
                      n.scaleDegree,
                      shift,
                      newContext.currentKey,
                      n.accidental || 0,
                      newContext.currentTrack,
                      newContext,
                    );

                    return {
                      ...n,
                      span: {
                        start: targetPosition,
                        end: targetPosition + (n.span.end - n.span.start),
                      },
                      scaleDegree: newDegree,
                      midiNumber: newMidi,
                      accidental: n.accidental, // Preserve the original accidental
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

        // Convert both tracks to MIDI notes
        const midiNotesTrack1 = scoreTrack1
          .map((n) => logicalNoteToMidi(n, 1, newContext.timeSignatures))
          .filter((n): n is Note => n !== null);
        const midiNotesTrack2 = scoreTrack2
          .map((n) => logicalNoteToMidi(n, 2, newContext.timeSignatures))
          .filter((n): n is Note => n !== null);

        // Combine both tracks
        const allMidiNotes = [...midiNotesTrack1, ...midiNotesTrack2];

        const midiResult = generateMidiWithMetadata(
          allMidiNotes,
          `melody-${slug}`,
          120,
          newContext.timeSignatures,
        );

        if (playSongBuffer) {
          playSongBuffer(midiResult.midiInfo.id, midiResult.midiData, true);
        }
      } catch (e) {
        console.error("Error during playback:", e);
        setError(
          e instanceof Error ? e.message : "Unknown error during playback",
        );
      }
    },
    [context, playSongBuffer, slug],
  );

  // Generate MIDI on initial load
  React.useEffect(() => {
    handleMelodyPlayback(score);
  }, []); // Run only once on mount

  const handleTextChange = React.useCallback(
    (value: string) => {
      setScore(value);
      handleMelodyPlayback(value);
    },
    [handleMelodyPlayback],
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleMelodyPlayback(score);
      }
    },
    [handleMelodyPlayback, score],
  );

  return (
    <EditorContainer>
      <RawlContainer>
        {rawlProps && <Rawl {...rawlProps} savedAnalysis={analysis} />}
      </RawlContainer>
      <EditorPanel isFolded={isFolded}>
        <FoldButton onClick={() => setIsFolded(!isFolded)}>
          {isFolded ? ">" : "<"}
        </FoldButton>
        <CodeMirrorWrapper>
          <CodeMirror
            ref={editorRef}
            value={score}
            onChange={handleTextChange}
            theme={customTheme}
            height="100%"
            style={{ flex: 1 }}
            extensions={[characterBackgroundsPlugin]}
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              highlightActiveLine: true,
              foldGutter: true,
            }}
          />
        </CodeMirrorWrapper>
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
