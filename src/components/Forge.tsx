import * as React from "react";
import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { AppContext } from "./AppContext";
import InlineRawlPlayer from "./rawl/InlineRawlPlayer";

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
    const TICKS_PER_QUARTER = 480;
    const pattern = [0, 2, 1, 2]; // Alberti pattern indices (low, high, middle, high)
    const notes: Note[] = [];

    // Generate one bar of Alberti pattern
    for (let i = 0; i < 4; i++) {
      const chordIndex = pattern[i];
      notes.push({
        pitch: C3 + baseChord[chordIndex],
        velocity: 80,
        startTime: i * TICKS_PER_QUARTER,
        duration: TICKS_PER_QUARTER - 10, // Slightly shorter for articulation
      });
    }

    return notes;
  };

  // Convert IR to MIDI file
  const generateMidiFile = (notes: Note[]): Uint8Array => {
    // Simple MIDI file format implementation
    const header = new Uint8Array([
      0x4d,
      0x54,
      0x68,
      0x64, // MThd
      0x00,
      0x00,
      0x00,
      0x06, // Header size
      0x00,
      0x00, // Format 0
      0x00,
      0x01, // One track
      0x01,
      0xe0, // 480 ticks per quarter note
    ]);

    const trackEvents: number[] = [
      0x4d,
      0x54,
      0x72,
      0x6b, // MTrk
      0x00,
      0x00,
      0x00,
      0x00, // Track length (placeholder)
    ];

    // Add time signature and tempo meta events
    trackEvents.push(
      0x00, // Delta time
      0xff,
      0x58,
      0x04, // Time signature
      0x04,
      0x02,
      0x18,
      0x08, // 4/4 time
      0x00, // Delta time
      0xff,
      0x51,
      0x03, // Tempo
      0x07,
      0xa1,
      0x20, // 500,000 microseconds per quarter note (120 BPM)
    );

    // Sort notes by start time
    const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

    let currentTime = 0;

    // Add note events
    sortedNotes.forEach((note) => {
      // Calculate delta time for note on
      const deltaTimeOn = note.startTime - currentTime;
      currentTime = note.startTime;

      // Note on event
      if (deltaTimeOn > 127) {
        // Handle variable-length quantity for delta time
        const bytes = [];
        let value = deltaTimeOn;
        while (value > 0) {
          bytes.unshift(value & 0x7f);
          value = value >> 7;
          if (value > 0) {
            bytes[0] |= 0x80;
          }
        }
        trackEvents.push(...bytes);
      } else {
        trackEvents.push(deltaTimeOn);
      }

      trackEvents.push(
        0x90, // Note on, channel 0
        note.pitch,
        note.velocity,
      );

      // Calculate delta time for note off
      const deltaTimeOff = note.duration;
      currentTime += deltaTimeOff;

      // Note off event
      if (deltaTimeOff > 127) {
        // Handle variable-length quantity for delta time
        const bytes = [];
        let value = deltaTimeOff;
        while (value > 0) {
          bytes.unshift(value & 0x7f);
          value = value >> 7;
          if (value > 0) {
            bytes[0] |= 0x80;
          }
        }
        trackEvents.push(...bytes);
      } else {
        trackEvents.push(deltaTimeOff);
      }

      trackEvents.push(
        0x80, // Note off, channel 0
        note.pitch,
        0x00, // velocity for note off
      );
    });

    // End of track
    trackEvents.push(0x00, 0xff, 0x2f, 0x00);

    // Update track length
    const trackLength = trackEvents.length - 8;
    trackEvents[4] = (trackLength >> 24) & 0xff;
    trackEvents[5] = (trackLength >> 16) & 0xff;
    trackEvents[6] = (trackLength >> 8) & 0xff;
    trackEvents[7] = trackLength & 0xff;

    return new Uint8Array([...header, ...trackEvents]);
  };

  const handleGenerate = async () => {
    // Get the chord based on mode
    const chord = mode === "major" ? [0, 4, 7] : [0, 3, 7];

    // Generate Alberti pattern
    const notes = generateAlbertiPattern(chord);

    // Generate MIDI file
    const midiData = generateMidiFile(notes);

    // Create a fake MIDI info object
    const midiInfo = {
      id: "generated-alberti",
      title: `Generated ${mode} Alberti Pattern`,
      slug: "generated-alberti",
      sourceUrl: null,
      isHiddenRoute: false,
    };

    // Set current MIDI info
    setCurrentMidi(midiInfo);

    // Try to play the MIDI
    try {
      // Load the MIDI data directly
      await playSongBuffer("generated-alberti.mid", midiData);

      // Update rawlProps
      if (rawlProps) {
        rawlProps.savedAnalysis = null;
        rawlProps.isHiddenRoute = false;
        rawlProps.parsingResult = null;
      }

      console.log("[App] Starting playback after load");
    } catch (error) {
      console.error("Error loading MIDI:", error);
    }
  };

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
      {currentMidi && rawlProps && (
        <InlineRawlPlayer>
          <div />
        </InlineRawlPlayer>
      )}
    </ForgeContainer>
  );
};

export default Forge;
