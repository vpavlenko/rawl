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
    const measure = parseInt(measureStr);
    const beat = beatStr ? parseFloat(beatStr) : 1;

    // Validate measure and beat
    if (isNaN(measure) || measure < 1 || isNaN(beat) || beat < 1) {
      return null;
    }

    // Get time signature for this measure
    const beatsPerMeasure = context.beatsPerMeasure || 4;
    if (beat > beatsPerMeasure) {
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
    // Updated regex to match new syntax with explicit 'i' command
    const match = line.match(/^\s*(\d+)(?:b(\d+(?:\.\d+)?))?\s+i\s+(.+)$/);
    if (!match) return [];

    const [_, measureStr, beatStr, melodyPart] = match;
    const startMeasure = parseInt(measureStr);
    const startBeat = beatStr ? parseFloat(beatStr) : 1;
    const key = context.currentKey;
    const beatsPerMeasure = context.beatsPerMeasure || 4;

    // Updated regex to capture multiple ^ or v characters and optional dots after duration markers
    // Made the duration marker group optional with ? to handle last note properly
    const notePattern = /(\s+|[v^]+[b#]?[1-7]|[b#]?[1-7]|x)([+_\-=\s]\.?)?/g;
    const matches = Array.from(melodyPart.matchAll(notePattern));

    if (matches.length === 0) return [];

    let currentPosition = toDecimalPosition(startMeasure, startBeat);
    let previousMidiNumber: number | null = null;

    return matches.map((match) => {
      const [_, noteOrRest, durationMarker = ""] = match; // Default to empty string for duration if not present
      const duration = getDuration(durationMarker, beatsPerMeasure);
      const durationInBeats = duration / TICKS_PER_QUARTER;

      const span: MeasureSpan = {
        start: currentPosition,
        end: currentPosition + durationInBeats / beatsPerMeasure, // Convert beats to measure fraction
      };

      // Update position for next note
      currentPosition = span.end;

      // Handle rest cases: either empty space or 'x' marker
      if (noteOrRest.trim() === "" || noteOrRest === "x") {
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
    case " ":
    case "":
      duration = TICKS_PER_QUARTER; // quarter note (space)
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

// Modify logicalNoteToMidi to include time signatures
const logicalNoteToMidi = (
  note: LogicalNote,
  track: number,
  timeSignatures: TimeSignature[],
): Note | null => {
  if (note.midiNumber === null) return null; // Rest

  const { measure, beat } = fromDecimalPosition(note.span.start);
  console.log("Converting logical note to MIDI:", {
    note,
    measure,
    beat,
    track,
  });

  // Get the time signature for this measure
  const beatsPerMeasure = getTimeSignatureAt(measure, timeSignatures);
  console.log("Time signature for measure:", { measure, beatsPerMeasure });

  // Calculate total ticks up to this measure
  let totalTicks = 0;
  for (let m = 1; m < measure; m++) {
    totalTicks += getTimeSignatureAt(m, timeSignatures) * TICKS_PER_QUARTER;
  }

  // Add ticks for beats within this measure
  totalTicks += (beat - 1) * TICKS_PER_QUARTER;

  return {
    pitch: note.midiNumber,
    velocity: 100,
    startTime: totalTicks,
    duration: note.duration - 1,
    channel: track - 1, // Track 1 (rh) uses channel 1, Track 2 (lh) uses channel 0
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
