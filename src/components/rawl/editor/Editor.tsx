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

const TestTextArea = styled.textarea`
  width: 100%;
  height: 80px;
  font-family: monospace;
  padding: 10px;
  background: #2d2d2d;
  color: #d4d4d4;
  border: 1px solid #444;
  border-radius: 4px;
  margin-top: 10px;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
`;

const parseMelodyString = (melodyString: string): number[] => {
  // Don't trim - split on one or more spaces but preserve trailing space in original input
  const notes = melodyString.split(/\s+/).filter((n) => n.length > 0);
  return notes
    .map((note) => {
      const baseNote = parseInt(note.replace(/[b#]/, ""));
      if (isNaN(baseNote)) return null;

      let offset = 0;
      if (note.includes("b")) offset = -1;
      if (note.includes("#")) offset = 1;

      // Map scale degree to chromatic pitch (using major scale as reference)
      const majorScaleMap = [0, 2, 4, 5, 7, 9, 11];
      const pitch = majorScaleMap[baseNote - 1] + offset;

      return pitch;
    })
    .filter((n): n is number => n !== null);
};

const convertToMidiNotes = (pitches: number[]): Note[] => {
  return pitches.map((pitch, index) => ({
    pitch: pitch + 60, // Middle C (60) as base
    velocity: 100,
    startTime: index * TICKS_PER_QUARTER,
    duration: TICKS_PER_QUARTER - 1,
    channel: 0,
  }));
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
      const pitches = parseMelodyString(text);
      if (pitches.length === 0) {
        return;
      }
      setError(null);
      const notes = convertToMidiNotes(pitches);

      const midiResult = generateMidiWithMetadata(
        { melody: notes, chords: [] },
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
          Enter melody using scale degrees (1-7) with optional accidentals
          (b/#).
          <br />
          Press Enter to play.
        </p>
        <MelodyTextArea
          ref={textareaRef}
          defaultValue="1 2 3 4 5"
          onKeyDown={handleKeyDown}
          placeholder="Enter melody (e.g. 1 2 b3 3 4 #4 5)"
          spellCheck={false}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <p>Test textarea (completely uncontrolled):</p>
        <TestTextArea defaultValue="This is a test textarea. You should be able to type freely here." />
      </EditorPanel>
    </EditorContainer>
  );
};

export default Editor;
