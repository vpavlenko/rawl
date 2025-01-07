import MidiWriter from "midi-writer-js";
import * as React from "react";
import { useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import Rawl from "./rawl/Rawl";
import { Analysis, PitchClass } from "./rawl/analysis";

const ForgeContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  color: white;
`;

const SelectorContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 20px 0;
`;

const Button = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  border: 2px solid #333;
  border-radius: 4px;
  background: ${(props) => (props.active ? "#333" : "transparent")};
  color: ${(props) => (props.active ? "white" : "white")};
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;

  &:hover {
    background: ${(props) => (props.active ? "#444" : "#222")};
  }
`;

const GenerateButton = styled.button`
  padding: 10px 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;

  &:hover {
    background: #45a049;
  }
`;

const ContentArea = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #111;
  border-radius: 4px;
`;

// Intermediate Representation type
interface Note {
  pitch: number; // MIDI note number
  velocity: number;
  startTime: number; // in ticks (480 per quarter note)
  duration: number; // in ticks
}

const Forge: React.FC = () => {
  const [mode, setMode] = useState<"major" | "minor">("major");
  const {
    handleSongClick,
    currentMidi,
    rawlProps,
    setCurrentMidi,
    playSongBuffer,
  } = useContext(AppContext);
  const [generatedMidiUrl, setGeneratedMidiUrl] = useState<string | null>(null);

  // Convert chord to Alberti pattern in IR
  const generateAlbertiPattern = (baseChord: number[]): Note[] => {
    const C3 = 48; // MIDI note number for C3
    const TICKS_PER_QUARTER = 128; // Standard MIDI ticks per quarter note
    const MEASURE_LENGTH = TICKS_PER_QUARTER * 4; // 4 quarter notes per measure
    const pattern = [0, 2, 1, 2]; // Alberti pattern indices (low, high, middle, high)
    const notes: Note[] = [];

    // Generate four bars of Alberti pattern
    for (let measure = 0; measure < 4; measure++) {
      for (let i = 0; i < 4; i++) {
        const chordIndex = pattern[i];
        notes.push({
          pitch: C3 + baseChord[chordIndex],
          velocity: 80,
          startTime: measure * MEASURE_LENGTH + i * TICKS_PER_QUARTER,
          duration: TICKS_PER_QUARTER - 10, // Slightly shorter for articulation
        });
      }
    }

    console.log("[Forge.generateAlbertiPattern] Generated notes:", notes);
    return notes;
  };

  // Convert IR to MIDI file using MidiWriter
  const generateMidiFile = (notes: Note[]): Uint8Array => {
    console.log("[Forge.generateMidiFile] Input notes:", notes);

    // Sort notes by start time
    const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
    console.log("[Forge.generateMidiFile] Sorted notes:", sortedNotes);

    // Create a track
    const track = new MidiWriter.Track();

    // Set tempo to 120 BPM (500,000 microseconds per quarter note)
    track.setTempo(120);

    // Add notes with their start times
    sortedNotes.forEach((note) => {
      track.addEvent(
        new MidiWriter.NoteEvent({
          pitch: [note.pitch],
          duration: "T" + note.duration,
          startTick: note.startTime,
          velocity: note.velocity,
        }),
      );
    });

    // Create a writer and write the MIDI file
    const writer = new MidiWriter.Writer([track]);

    // Get the output as a base64 string
    const base64Data = writer.dataUri().split(",")[1];

    // Convert base64 to Uint8Array
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
  };

  const generateInitialAnalysis = (mode: "major" | "minor"): Analysis => {
    // Create an analysis object that matches our four measures
    return {
      modulations: {
        1: mode === "major" ? (0 as PitchClass) : (9 as PitchClass), // C major or minor
      },
      comment: `Generated ${mode} Alberti pattern - four measures in 4/4 time`,
      tags: ["generated", "alberti", mode],
      form: {},
      phrasePatch: [],
      sections: [0, 1, 2, 3], // Mark each measure as a section
    };
  };

  const handleGenerate = async () => {
    console.log("[Forge] Starting MIDI generation");

    // Get the chord based on mode
    const chord = mode === "major" ? [0, 4, 7] : [0, 3, 7];
    console.log("[Forge] Using chord:", chord);

    // Generate Alberti pattern
    const notes = generateAlbertiPattern(chord);
    console.log("[Forge] Generated Alberti pattern:", notes);

    // Generate MIDI file
    const midiData = generateMidiFile(notes);
    console.log("[Forge] Generated MIDI data:", midiData);

    // Create a fake MIDI info object with analysis
    const midiInfo = {
      id: "generated-alberti",
      title: `Generated ${mode} Alberti Pattern`,
      slug: "generated-alberti",
      sourceUrl: null,
      isHiddenRoute: false,
    };
    console.log("[Forge] Created MIDI info:", midiInfo);

    // Generate initial analysis
    const initialAnalysis = generateInitialAnalysis(mode);
    console.log("[Forge] Generated initial analysis:", initialAnalysis);

    // Set current MIDI info
    setCurrentMidi(midiInfo);

    // Try to play the MIDI
    try {
      console.log("[Forge] Attempting to play MIDI");
      // Load the MIDI data directly - App.tsx will handle transformation
      await playSongBuffer("generated-alberti.mid", midiData);

      console.log("[Forge] MIDI loaded, checking rawlProps:", rawlProps);
      if (rawlProps) {
        console.log("[Forge] Current parsingResult:", rawlProps.parsingResult);
        console.log("[Forge] Current savedAnalysis:", rawlProps.savedAnalysis);

        // Update the analysis in rawlProps
        if (rawlProps.saveAnalysis) {
          console.log("[Forge] Saving initial analysis");
          rawlProps.saveAnalysis(initialAnalysis);
        }
      }

      console.log("[Forge] Starting playback after load");
    } catch (error) {
      console.error("[Forge] Error loading MIDI:", error);
    }
  };

  // Add logging when rawlProps changes
  useEffect(() => {
    if (rawlProps) {
      console.log("[Forge] rawlProps updated:", {
        parsingResult: rawlProps.parsingResult,
        savedAnalysis: rawlProps.savedAnalysis,
      });
    }
  }, [rawlProps]);

  // Add useEffect for cleanup
  useEffect(() => {
    return () => {
      // Cleanup blob URL when component unmounts
      if (generatedMidiUrl) {
        URL.revokeObjectURL(generatedMidiUrl);
      }
    };
  }, [generatedMidiUrl]);

  // Add cleanup effect for blob URLs
  useEffect(() => {
    return () => {
      if (currentMidi?.id.startsWith("blob:")) {
        URL.revokeObjectURL(currentMidi.id);
      }
    };
  }, [currentMidi]);

  const memoizedProps = useMemo(() => {
    if (!rawlProps) return null;
    return {
      parsingResult: rawlProps.parsingResult,
      savedAnalysis: rawlProps.savedAnalysis,
      voiceNames: rawlProps.voiceNames,
      voiceMask: rawlProps.voiceMask,
    };
  }, [rawlProps]);

  return (
    <ForgeContainer>
      <h1>Forge</h1>
      <SelectorContainer>
        <Button active={mode === "major"} onClick={() => setMode("major")}>
          Major
        </Button>
        <Button active={mode === "minor"} onClick={() => setMode("minor")}>
          Minor
        </Button>
      </SelectorContainer>
      <ContentArea>
        <div>Current mode: {mode}</div>
        <div>Chord: {mode === "major" ? "[0, 4, 7]" : "[0, 3, 7]"}</div>
        <GenerateButton onClick={handleGenerate}>
          Generate Alberti Pattern
        </GenerateButton>
      </ContentArea>
      {currentMidi && rawlProps && rawlProps.parsingResult && memoizedProps && (
        <Rawl
          parsingResult={memoizedProps.parsingResult}
          getCurrentPositionMs={rawlProps.getCurrentPositionMs}
          savedAnalysis={memoizedProps.savedAnalysis}
          saveAnalysis={rawlProps.saveAnalysis}
          voiceNames={memoizedProps.voiceNames}
          voiceMask={memoizedProps.voiceMask}
          setVoiceMask={rawlProps.setVoiceMask}
          showAnalysisBox={rawlProps.showAnalysisBox}
          seek={rawlProps.seek}
          latencyCorrectionMs={rawlProps.latencyCorrectionMs}
          sourceUrl={currentMidi.sourceUrl}
          isHiddenRoute={false}
        />
      )}
    </ForgeContainer>
  );
};

export default Forge;
