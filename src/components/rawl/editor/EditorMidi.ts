import MidiWriter from "midi-writer-js";
import { Analysis, PitchClass } from "../analysis";
import { Note } from "../forge/ForgeGenerator";

type Track = {
  addTrackName(name: string): void;
  setTempo(tempo: number): void;
  addEvent(event: any): void;
  setTimeSignature(
    numerator: number,
    denominator: number,
    midiclockspertick: number,
    notespermidiclock: number,
  ): Track;
};

type TimeSignature = {
  numerator: number;
  startMeasure: number;
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

// Mid-level representation of musical events
interface MusicalEvent {
  pitches: number[];
  startTick: number;
  duration: number;
  velocity: number;
  channel: number;
  measure: number; // Added to track which measure this event belongs to
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
    // Calculate measure number from startTime (assuming TICKS_PER_QUARTER = 128)
    const measure = Math.floor(startTime / (128 * 4)) + 1;
    events.push({
      pitches,
      startTick: startTime,
      duration,
      velocity: 100,
      channel,
      measure,
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
  bpm: number,
  timeSignatures: TimeSignature[],
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
      track.setTempo(bpm);

      // Add time signatures to the track
      timeSignatures.forEach((ts, index) => {
        // Only add time signature if it affects this event's measure
        if (ts.startMeasure <= event.measure) {
          track.setTimeSignature(ts.numerator, 4, 24, 8);
        }
      });

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
  bpm: number,
  timeSignatures: TimeSignature[],
): Uint8Array => {
  const musicalEvents = convertToMusicalEvents(notes);
  return generateMidiFromEvents(musicalEvents, bpm, timeSignatures);
};

export const generateInitialAnalysis = (title: string): Analysis => {
  return {
    modulations: {
      1: 0 as PitchClass,
    },
    comment: title,
    tags: ["generated", "melody"],
    form: {},
    phrasePatch: [],
    sections: [0],
  };
};

export const generateMidiWithMetadata = (
  notes: Note[],
  title: string,
  bpm: number,
  timeSignatures: TimeSignature[],
): MidiGenerationResult => {
  const midiData = generateMidiFile(notes, bpm, timeSignatures);

  return {
    midiData,
    midiInfo: {
      id: title,
      title,
      slug: title,
      sourceUrl: null,
      isHiddenRoute: false,
    },
    analysis: generateInitialAnalysis(title),
  };
};
