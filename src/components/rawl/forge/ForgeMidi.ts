import MidiWriter from "midi-writer-js";
import { Analysis, PitchClass } from "../analysis";
import { DEFAULT_VELOCITY } from "./constants";
import { ForgeConfig, Note } from "./ForgeGenerator";

export const FORGE_MOCK_ID = "forge_mock";

// Mid-level representation of musical events
interface MusicalEvent {
  pitches: number[];
  startTick: number;
  duration: number;
  velocity: number;
}

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

// Convert raw notes to musical events (mid-level representation)
const convertToMusicalEvents = (notes: Note[]): MusicalEvent[] => {
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
  const events: MusicalEvent[] = [];

  let currentStartTime = -1;
  let currentPitches: number[] = [];

  const addEvent = (startTime: number, pitches: number[], duration: number) => {
    events.push({
      pitches,
      startTick: startTime,
      duration,
      velocity: DEFAULT_VELOCITY,
    });
  };

  sortedNotes.forEach((note, index) => {
    if (note.startTime !== currentStartTime) {
      // Add previous group if it exists
      if (currentPitches.length > 0) {
        addEvent(
          currentStartTime,
          currentPitches,
          sortedNotes[index - 1].duration,
        );
      }
      // Start new group
      currentStartTime = note.startTime;
      currentPitches = [note.pitch];
    } else {
      // Add to current group
      currentPitches.push(note.pitch);
    }
  });

  // Add the last group
  if (currentPitches.length > 0) {
    addEvent(
      currentStartTime,
      currentPitches,
      sortedNotes[sortedNotes.length - 1].duration,
    );
  }

  return events;
};

// Convert musical events to MIDI file
const generateMidiFromEvents = (events: MusicalEvent[]): Uint8Array => {
  const track = new MidiWriter.Track();
  track.setTempo(120);

  events.forEach((event) => {
    track.addEvent(
      new MidiWriter.NoteEvent({
        pitch: event.pitches,
        duration: "T" + event.duration,
        velocity: event.velocity,
        startTick: event.startTick,
      }),
    );
  });

  const writer = new MidiWriter.Writer([track]);
  const base64Data = writer.dataUri().split(",")[1];

  // Convert base64 to Uint8Array
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
};

// Main MIDI generation function now uses the two-step process
export const generateMidiFile = (notes: Note[]): Uint8Array => {
  const musicalEvents = convertToMusicalEvents(notes);
  return generateMidiFromEvents(musicalEvents);
};

export const generateInitialAnalysis = (
  mode: ForgeConfig["mode"],
  tonic: number,
): Analysis => {
  return {
    modulations: {
      1: tonic as PitchClass,
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
  mode: ForgeConfig["mode"],
  tonic: number,
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
    analysis: generateInitialAnalysis(mode, tonic),
  };
};
