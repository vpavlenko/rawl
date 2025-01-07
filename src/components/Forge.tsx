import MidiWriter from "midi-writer-js";
import * as React from "react";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import Rawl from "./rawl/Rawl";
import { Analysis, PitchClass } from "./rawl/analysis";
import { Chord, rehydrateChords } from "./rawl/legends/chords";

const ForgeContainer = styled.div`
  padding: 20px;
  width: 100vw;
  color: white;
  box-sizing: border-box;
`;

const FORGE_MOCK_ID = "forge_mock";

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
  startTime: number; // in ticks (128 per quarter note)
  duration: number; // in ticks
}

const MAJOR_PROGRESSION: Chord[] = ["I", "vi", "IV", "V"];
const MINOR_PROGRESSION: Chord[] = ["i", "bVI", "iv", "V"];

const Forge: React.FC = () => {
  const [mode, setMode] = useState<"major" | "minor">("major");
  const { currentMidi, rawlProps, setCurrentMidi, playSongBuffer } =
    useContext(AppContext);

  // Convert chord to Alberti pattern in IR
  const generateAlbertiPattern = (chordProgression: number[][]): Note[] => {
    const C3 = 48; // MIDI note number for C3
    const TICKS_PER_QUARTER = 128; // Standard MIDI ticks per quarter note
    const MEASURE_LENGTH = TICKS_PER_QUARTER * 4; // 4 quarter notes per measure
    const pattern = [0, 2, 1, 2]; // Alberti pattern indices (low, high, middle, high)
    const notes: Note[] = [];

    // Generate eight bars of Alberti pattern (4 bars repeated)
    for (let repeat = 0; repeat < 2; repeat++) {
      for (let measure = 0; measure < 4; measure++) {
        const chord = chordProgression[measure];
        for (let i = 0; i < 4; i++) {
          const chordIndex = pattern[i] % chord.length;
          notes.push({
            pitch: C3 + chord[chordIndex],
            velocity: 80,
            startTime:
              (repeat * 4 + measure) * MEASURE_LENGTH + i * TICKS_PER_QUARTER,
            duration: TICKS_PER_QUARTER - 10, // Slightly shorter for articulation
          });
        }
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
    // Create an analysis object that matches our eight measures
    return {
      modulations: {
        1: mode === "major" ? (0 as PitchClass) : (9 as PitchClass), // C major or minor
      },
      comment: `Generated ${mode} Alberti pattern - eight measures in 4/4 time`,
      tags: ["generated", "alberti", mode],
      form: {},
      phrasePatch: [],
      sections: [0, 1, 2, 3, 4, 5, 6, 7], // Mark each measure as a section
    };
  };

  const generatePattern = async () => {
    console.log("[Forge] Starting MIDI generation");

    // Get the chord progression based on mode
    const progression =
      mode === "major" ? MAJOR_PROGRESSION : MINOR_PROGRESSION;
    const rehydratedProgression = rehydrateChords(progression);
    const chords = rehydratedProgression.map((chord) => chord.pitches);

    console.log("[Forge] Using progression:", progression);

    // Generate Alberti pattern
    const notes = generateAlbertiPattern(chords);
    console.log("[Forge] Generated Alberti pattern:", notes);

    // Generate MIDI file
    const midiData = generateMidiFile(notes);
    console.log("[Forge] Generated MIDI data:", midiData);

    // Create a fake MIDI info object with analysis
    const midiInfo = {
      id: FORGE_MOCK_ID,
      title: `Generated ${mode} Alberti Pattern`,
      slug: FORGE_MOCK_ID,
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

  // Generate on mode change
  useEffect(() => {
    generatePattern();
  }, [mode]);

  return (
    <ForgeContainer>
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
        <div>
          Progression:{" "}
          {mode === "major"
            ? MAJOR_PROGRESSION.join(" ")
            : MINOR_PROGRESSION.join(" ")}
        </div>
      </ContentArea>
      {currentMidi && rawlProps && rawlProps.parsingResult && (
        <Rawl {...rawlProps} />
      )}
    </ForgeContainer>
  );
};

export default Forge;
