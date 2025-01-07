import MidiWriter from "midi-writer-js";
import { Analysis, PitchClass } from "../analysis";
import { FORGE_MOCK_ID, Note } from "./ForgeGenerator";

export interface MidiGenerationResult {
  midiData: Uint8Array;
  midiInfo: {
    id: string;
    title: string;
    slug: string;
    sourceUrl: null;
    isHiddenRoute: boolean;
  };
  analysis: Analysis;
}

// Convert IR to MIDI file using MidiWriter
export const generateMidiFile = (notes: Note[]): Uint8Array => {
  // Sort notes by start time
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);

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

export const generateInitialAnalysis = (mode: "major" | "minor"): Analysis => {
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

export const generateMidiWithMetadata = (
  notes: Note[],
  mode: "major" | "minor",
): MidiGenerationResult => {
  const midiData = generateMidiFile(notes);

  return {
    midiData,
    midiInfo: {
      id: FORGE_MOCK_ID,
      title: `Generated ${mode} Alberti Pattern`,
      slug: FORGE_MOCK_ID,
      sourceUrl: null,
      isHiddenRoute: false,
    },
    analysis: generateInitialAnalysis(mode),
  };
};
