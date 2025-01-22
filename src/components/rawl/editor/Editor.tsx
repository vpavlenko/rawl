import React, { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { TICKS_PER_QUARTER } from "../forge/constants";
import { Note } from "../forge/ForgeGenerator";
import { generateMidiWithMetadata } from "../forge/ForgeMidi";
import Rawl from "../Rawl";

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
  font-family: monospace;
  padding: 10px;
  background: #1e1e1e;
  color: #d4d4d4;
  border: 1px solid #333;
  border-radius: 4px;
  flex-shrink: 0;
  white-space: pre;
  resize: vertical;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;

const parseMelodyString = (
  melodyString: string,
): { pitch: number | null; duration: number }[] => {
  // Match either a rest (space followed by duration) or a note (optional octave jump, optional accidental, number, and duration)
  const notePattern = /(\s+|[v^]?[b#]?[1-7])([|+_\-=])/g;
  const matches = Array.from(melodyString.matchAll(notePattern));

  console.log("Matches:", matches); // Debug log

  if (matches.length === 0) return [];

  let lastPitch: number | null = null;

  return matches.map((match) => {
    const [_, noteOrRest, durationMarker] = match;
    console.log("Processing note:", { noteOrRest, durationMarker }); // Debug log

    // Handle rests (spaces)
    if (noteOrRest.trim() === "") {
      return { pitch: null, duration: getDuration(durationMarker) };
    }

    // Handle notes
    const note = noteOrRest;

    // Check for octave modifiers
    const hasUpOctave = note.startsWith("^");
    const hasDownOctave = note.startsWith("v");

    // Handle accidentals after octave modifiers
    let offset = 0;
    const noteWithoutOctave = note.replace(/[v^]/, "");
    if (noteWithoutOctave.startsWith("b")) offset = -1;
    if (noteWithoutOctave.startsWith("#")) offset = 1;

    // Get the base note number, removing any modifiers
    const baseNote = parseInt(noteWithoutOctave.replace(/[b#]/, ""));
    console.log("Parsed note:", { note, offset, baseNote }); // Debug log

    if (isNaN(baseNote) || baseNote < 1 || baseNote > 7) {
      return { pitch: null, duration: TICKS_PER_QUARTER };
    }

    // Map scale degree to chromatic pitch (using major scale as reference)
    const majorScaleMap = [0, 2, 4, 5, 7, 9, 11];
    let pitch = majorScaleMap[baseNote - 1] + offset;

    // Adjust octave based on previous note for minimal interval movement
    if (lastPitch !== null) {
      // Calculate the three possible positions relative to the last note
      const below = pitch - 12; // One octave below
      const same = pitch; // Same octave
      const above = pitch + 12; // One octave above

      // Find the position that minimizes the interval
      const intervals = [
        Math.abs(below - lastPitch),
        Math.abs(same - lastPitch),
        Math.abs(above - lastPitch),
      ];
      const minInterval = Math.min(...intervals);
      const bestPosition = [below, same, above][intervals.indexOf(minInterval)];
      pitch = bestPosition;
    }

    // Apply forced octave jumps after interval optimization
    if (hasUpOctave) pitch += 12;
    if (hasDownOctave) pitch -= 12;

    lastPitch = pitch;
    return {
      pitch,
      duration: getDuration(durationMarker),
    };
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

const convertToMidiNotes = (
  notes: { pitch: number | null; duration: number }[],
): Note[] => {
  let currentTime = 0;
  return notes
    .map((note) => {
      if (note.pitch === null) {
        // For rests, just advance the time
        const startTime = currentTime;
        currentTime += note.duration;
        return null;
      }

      const midiNote: Note = {
        pitch: note.pitch + 60, // Middle C (60) as base
        velocity: 100,
        startTime: currentTime,
        duration: note.duration - 1,
        channel: 0,
      };
      currentTime += note.duration;
      return midiNote;
    })
    .filter((n): n is Note => n !== null);
};

const Editor: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [error, setError] = useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { playSongBuffer, rawlProps } = useContext(AppContext);

  // Signal to App that this route should not have global shortcuts
  React.useEffect(() => {
    // Set a flag on the window object to disable shortcuts
    window.__disableGlobalShortcuts = true;
    return () => {
      // Clean up when component unmounts
      delete window.__disableGlobalShortcuts;
    };
  }, []);

  const handleMelodyPlayback = () => {
    if (!textareaRef.current) return;
    const text = textareaRef.current.value;

    try {
      const notes = parseMelodyString(text);
      if (notes.length === 0) {
        return;
      }
      setError(null);
      const midiNotes = convertToMidiNotes(notes);

      const midiResult = generateMidiWithMetadata(
        { melody: midiNotes, chords: [] },
        "major",
        0,
        {
          mode: "major",
          bpm: 120,
          pattern: 0,
          progression: "CLASSIC",
          playbackStyle: "arpeggio",
          tonic: 0,
          melodyRhythm: "quarter",
          melodyType: "static",
        },
      );

      if (playSongBuffer) {
        playSongBuffer(`melody-${slug}`, midiResult.midiData, true);
      }
    } catch (e) {
      console.log("Error during playback:", e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Play on Enter
    if (e.key === "Enter" && !e.shiftKey) {
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
          Enter melody using scale degrees (1-7) with optional accidentals (b/#)
          and durations:
          <br />
          | (whole), + (half), _ (quarter), - (eighth), = (16th)
          <br />
          Use ^ for octave up, v for octave down. Use space for rests. Press
          Enter to play.
        </p>
        <MelodyTextArea
          ref={textareaRef}
          defaultValue="1_^3_v7_1|"
          onKeyDown={handleKeyDown}
          placeholder="Enter melody (e.g. 1_^2_b3-v7-4+#4_5|)"
          spellCheck={false}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
