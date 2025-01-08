import MidiWriter from "midi-writer-js";
import { Analysis, PitchClass } from "../analysis";
import { DEFAULT_VELOCITY } from "./constants";
import { ForgeConfig, Note } from "./ForgeGenerator";

type Track = {
  addTrackName(name: string): void;
  setTempo(tempo: number): void;
  addEvent(event: any): void;
};

type NoteEventParams = {
  pitch: number[];
  duration: string;
  velocity: number;
  startTick: number;
  channel: number;
};

// Type assertion for the imported MidiWriter
const { Track, NoteEvent, Writer } = MidiWriter as {
  Track: new () => Track;
  NoteEvent: new (params: NoteEventParams) => any;
  Writer: new (tracks: Track[]) => { dataUri(): string };
};

export const FORGE_MOCK_ID = "forge_mock";

// Mid-level representation of musical events
interface MusicalEvent {
  pitches: number[];
  startTick: number;
  duration: number;
  velocity: number;
  channel: number;
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
  let currentChannel = -1;
  let currentPitches: number[] = [];

  const addEvent = (
    startTime: number,
    pitches: number[],
    duration: number,
    channel: number,
  ) => {
    events.push({
      pitches,
      startTick: startTime,
      duration,
      velocity: DEFAULT_VELOCITY,
      channel,
    });
  };

  sortedNotes.forEach((note, index) => {
    if (
      note.startTime !== currentStartTime ||
      note.channel !== currentChannel
    ) {
      // Add previous group if it exists
      if (currentPitches.length > 0) {
        addEvent(
          currentStartTime,
          currentPitches,
          sortedNotes[index - 1].duration,
          sortedNotes[index - 1].channel || 0,
        );
      }
      // Start new group
      currentStartTime = note.startTime;
      currentChannel = note.channel || 0;
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
      sortedNotes[sortedNotes.length - 1].channel || 0,
    );
  }

  return events;
};

// Convert musical events to MIDI file
const generateMidiFromEvents = (
  events: MusicalEvent[],
  config: ForgeConfig,
): Uint8Array => {
  // Create separate tracks for each channel
  const tracks = new Map<number, Track>();

  events.forEach((event) => {
    if (!tracks.has(event.channel)) {
      const track = new Track();
      if (event.channel === 0) {
        track.addTrackName("Melody");
      } else if (event.channel === 1) {
        track.addTrackName("Chords");
      }
      track.setTempo(config.bpm);
      tracks.set(event.channel, track);
    }

    const track = tracks.get(event.channel)!;
    track.addEvent(
      new NoteEvent({
        pitch: event.pitches,
        duration: "T" + event.duration,
        velocity: event.velocity,
        startTick: event.startTick,
        channel: event.channel,
      }),
    );
  });

  const writer = new Writer(Array.from(tracks.values()));
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
export const generateMidiFile = (
  notes: Note[],
  config: ForgeConfig,
): Uint8Array => {
  const musicalEvents = convertToMusicalEvents(notes);
  return generateMidiFromEvents(musicalEvents, config);
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
    sections: [0],
  };
};

export const generateMidiWithMetadata = (
  { melody, chords }: { melody: Note[]; chords: Note[] },
  mode: ForgeConfig["mode"],
  tonic: number,
  config: ForgeConfig,
): MidiGenerationResult => {
  const midiData = generateMidiFile([...melody, ...chords], config);

  return {
    midiData,
    midiInfo: {
      id: FORGE_MOCK_ID,
      title: `Generated ${mode} Pattern with Melody`,
      slug: FORGE_MOCK_ID,
      sourceUrl: null,
      isHiddenRoute: false,
    },
    analysis: generateInitialAnalysis(mode, tonic),
  };
};
