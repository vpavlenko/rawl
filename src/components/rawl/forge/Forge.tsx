import MidiWriter from "midi-writer-js";
import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import Rawl from "../Rawl";
import { Analysis, PitchClass } from "../analysis";
import { Chord, rehydrateChords } from "../legends/chords";

const ForgeContainer = styled.div`
  padding: 20px;
  width: 100vw;
  color: white;
  box-sizing: border-box;
`;

const FORGE_MOCK_ID = "forge_mock";

const SelectorContainer = styled.div`
  display: flex;
  gap: 24px;
  margin: 20px 0;
  padding: 8px;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  width: fit-content;
`;

const CategoryHeader = styled.div`
  padding-left: 5px;
  color: #999;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-align: left;
  user-select: none;
`;

const Button = styled.button<{ active: boolean }>`
  padding: 0px 5px;
  text-align: left;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  border-radius: 4px;
  width: fit-content;
  user-select: none;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#333")};
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
  const [pattern, setPattern] = useState<"classic" | "alternate">("classic");
  const [preparedMidi, setPreparedMidi] = useState<{
    midiData: Uint8Array;
    midiInfo: any;
    analysis: Analysis;
  } | null>(null);
  const {
    currentMidi,
    rawlProps,
    setCurrentMidi,
    playSongBuffer,
    togglePause,
  } = useContext(AppContext);

  // Convert chord to Alberti pattern in IR
  const generateAlbertiPattern = (
    chordProgression: number[][],
    newMode: "major" | "minor",
    newPattern: "classic" | "alternate",
  ): Note[] => {
    const C3 = 48; // MIDI note number for C3
    const TICKS_PER_QUARTER = 128; // Standard MIDI ticks per quarter note
    const MEASURE_LENGTH = TICKS_PER_QUARTER * 4; // 4 quarter notes per measure
    const EIGHTH_NOTE = TICKS_PER_QUARTER / 2;

    // Two different patterns: r m u m u m u m  or  r m u m r m u m
    const patterns = {
      classic: [0, 1, 2, 1, 2, 1, 2, 1], // r m u m u m u m
      alternate: [0, 1, 2, 1, 0, 1, 2, 1], // r m u m r m u m
    };
    const selectedPattern = patterns[newPattern];
    const notes: Note[] = [];

    // Get the progression for octave adjustment check
    const progression =
      newMode === "major" ? MAJOR_PROGRESSION : MINOR_PROGRESSION;

    // Generate eight bars of Alberti pattern (4 bars repeated)
    for (let repeat = 0; repeat < 2; repeat++) {
      for (let measure = 0; measure < 4; measure++) {
        const chord = chordProgression[measure];
        const currentChord = progression[measure];
        // Lower vi and bVI chords by an octave
        const octaveAdjust =
          currentChord === "vi" || currentChord === "bVI" ? -12 : 0;

        for (let i = 0; i < 8; i++) {
          // 8 eighth notes per measure
          const chordIndex = selectedPattern[i] % chord.length;
          notes.push({
            pitch: C3 + chord[chordIndex] + octaveAdjust,
            velocity: 80,
            startTime:
              (repeat * 4 + measure) * MEASURE_LENGTH + i * EIGHTH_NOTE,
            duration: EIGHTH_NOTE - 10, // Slightly shorter for articulation
          });
        }
      }
    }

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

  const prepareMidi = async (
    newMode: "major" | "minor",
    newPattern: "classic" | "alternate",
    shouldAutoPlay: boolean = false,
  ) => {
    console.log("[Forge] Preparing MIDI generation for:", newMode, newPattern);

    try {
      // Get the chord progression based on mode
      const progression =
        newMode === "major" ? MAJOR_PROGRESSION : MINOR_PROGRESSION;
      const rehydratedProgression = rehydrateChords(progression);
      const chords = rehydratedProgression.map((chord) => chord.pitches);

      // Generate Alberti pattern with new mode and pattern
      const notes = generateAlbertiPattern(chords, newMode, newPattern);
      console.log("[Forge] Generated notes:", notes.length);

      // Generate MIDI file
      const midiData = generateMidiFile(notes);
      console.log("[Forge] Generated MIDI data:", midiData.length, "bytes");

      // Create MIDI info object
      const midiInfo = {
        id: FORGE_MOCK_ID,
        title: `Generated ${newMode} Alberti Pattern`,
        slug: FORGE_MOCK_ID,
        sourceUrl: null,
        isHiddenRoute: false,
      };

      // Set the current MIDI info in global context
      setCurrentMidi(midiInfo);

      // Use playSongBuffer to load the MIDI data globally, with autoplay parameter
      await playSongBuffer("generated-alberti.mid", midiData, shouldAutoPlay);

      return { midiData, midiInfo };
    } catch (error) {
      console.error("[Forge] Error preparing MIDI:", error);
      return null;
    }
  };

  // Prepare MIDI on mode/pattern change
  useEffect(() => {
    console.log(
      "[Forge] useEffect triggered for mode/pattern change:",
      mode,
      pattern,
    );
    // Only prepare if not from a click (which will handle its own preparation)
    if (!isClickPending.current) {
      prepareMidi(mode, pattern, false);
    }
    isClickPending.current = false;
  }, [mode, pattern]);

  // Add ref to track if change is from click
  const isClickPending = useRef(false);

  return (
    <ForgeContainer>
      <SelectorContainer>
        <CategorySection>
          <CategoryHeader>Mode</CategoryHeader>
          <Button
            active={mode === "major"}
            onClick={async () => {
              console.log("[Forge] Major button clicked");
              isClickPending.current = true;
              setMode("major");
              await prepareMidi("major", pattern, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Major button hover");
              prepareMidi("major", pattern, false);
            }}
          >
            Major
          </Button>
          <Button
            active={mode === "minor"}
            onClick={async () => {
              console.log("[Forge] Minor button clicked");
              isClickPending.current = true;
              setMode("minor");
              await prepareMidi("minor", pattern, true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Minor button hover");
              prepareMidi("minor", pattern, false);
            }}
          >
            Minor
          </Button>
        </CategorySection>

        <CategorySection>
          <CategoryHeader>Pattern</CategoryHeader>
          <Button
            active={pattern === "classic"}
            onClick={async () => {
              console.log("[Forge] Classic pattern clicked");
              isClickPending.current = true;
              setPattern("classic");
              await prepareMidi(mode, "classic", true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Classic pattern hover");
              prepareMidi(mode, "classic", false);
            }}
          >
            r m u m u m u m
          </Button>
          <Button
            active={pattern === "alternate"}
            onClick={async () => {
              console.log("[Forge] Alternate pattern clicked");
              isClickPending.current = true;
              setPattern("alternate");
              await prepareMidi(mode, "alternate", true);
            }}
            onMouseEnter={() => {
              console.log("[Forge] Alternate pattern hover");
              prepareMidi(mode, "alternate", false);
            }}
          >
            r m u m r m u m
          </Button>
        </CategorySection>
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
