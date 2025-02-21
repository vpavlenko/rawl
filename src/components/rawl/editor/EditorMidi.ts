import MidiWriter from "midi-writer-js";
import { Analysis, PitchClass } from "../analysis";
import { Note } from "../forge/ForgeGenerator";

// Define TimeSignature type locally since we can't import it
type TimeSignature = {
  numerator: number;
  measureStart: number;
};

// Define Track type with time signature method
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

// Type assertion for the imported MidiWriter
const { Track: MidiTrack, NoteEvent, Writer } = MidiWriter;

// Mid-level representation of musical events
interface MusicalEvent {
  pitches: number[];
  startTick: number;
  duration: number;
  velocity: number;
  channel: number;
}

// Constants for MIDI meta events
const META_EVENT_TYPE = 0xff;
const META_TIME_SIGNATURE = 0x58;

// Helper to create a time signature meta event
const createTimeSignatureEvent = (
  numerator: number,
  denominator: number = 4,
) => {
  // Time signature meta event format:
  // FF 58 04 nn dd cc bb
  // nn = numerator
  // dd = denominator (as power of 2: 2 = quarter note, 3 = eighth note, etc.)
  // cc = MIDI clocks per metronome click (usually 24)
  // bb = number of 32nd notes per MIDI quarter note (usually 8)
  return {
    type: META_EVENT_TYPE,
    subtype: META_TIME_SIGNATURE,
    data: new Uint8Array([
      numerator,
      Math.log2(denominator), // 2 for quarter note (2^2 = 4)
      24, // MIDI clocks per click
      8, // 32nd notes per quarter
    ]),
    deltaTime: 0,
  };
};

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
    velocity: number,
  ) => {
    events.push({
      pitches,
      startTick: startTime,
      duration,
      velocity,
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
          sortedNotes[index - 1].velocity || 100,
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
      sortedNotes[sortedNotes.length - 1].velocity || 100,
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
  console.log("\n=== MIDI Generation Debug ===");
  console.log("Events by channel:");
  const eventsByChannel = new Map<number, MusicalEvent[]>();
  const trackNames = new Map<number, string>();

  events.forEach((event) => {
    const channelEvents = eventsByChannel.get(event.channel) || [];
    channelEvents.push(event);
    eventsByChannel.set(event.channel, channelEvents);
  });

  eventsByChannel.forEach((channelEvents, channel) => {
    console.log(`\nChannel ${channel}:`);
    console.log(`- Note count: ${channelEvents.length}`);
    console.log(
      `- Sample notes: `,
      channelEvents.slice(0, 3).map((e) => ({
        pitches: e.pitches,
        startTick: e.startTick,
        duration: e.duration,
      })),
    );
  });

  // Create separate tracks for each channel
  const tracks = new Map<number, Track>();

  // Create a tempo/time signature track (track 0)
  const tempoTrack = new MidiTrack() as Track;
  const tempoTrackName = "Tempo and Time Signatures";
  tempoTrack.addTrackName(tempoTrackName);
  trackNames.set(-1, tempoTrackName);
  tempoTrack.setTempo(bpm);
  console.log("\nTempo track:");
  console.log(`- Tempo: ${bpm} BPM`);

  // Add time signatures using the official API
  timeSignatures.forEach((ts) => {
    tempoTrack.setTimeSignature(ts.numerator, 4, 24, 8);
  });
  console.log(`- Time signatures:`, timeSignatures);

  tracks.set(-1, tempoTrack); // Special track for tempo/time sig

  events.forEach((event) => {
    if (!tracks.has(event.channel)) {
      const track = new MidiTrack() as Track;
      // Give each track a name based on its channel
      const trackName =
        event.channel === 0
          ? "Right Hand (Channel 0)"
          : event.channel === 1
          ? "Left Hand (Channel 1)"
          : `Channel ${event.channel}`;

      track.addTrackName(trackName);
      trackNames.set(event.channel, trackName);
      tracks.set(event.channel, track);
      console.log(`\nCreated track: ${trackName}`);
      console.log(`- Channel: ${event.channel}`);
    }

    const track = tracks.get(event.channel)!;
    track.addEvent(
      new NoteEvent({
        pitch: event.pitches,
        duration: "T" + event.duration,
        velocity: event.velocity,
        startTick: event.startTick,
        channel: event.channel, // Ensure channel number is preserved
      }),
    );
  });

  // Sort tracks by channel number to ensure consistent order
  const sortedTracks = Array.from(tracks.entries())
    .sort(([a], [b]) => a - b)
    .map(([channel, track]) => ({ channel, track }));

  console.log("\nFinal track order:");
  sortedTracks.forEach(({ channel, track }, index) => {
    console.log(
      `${index}: ${
        trackNames.get(channel) || "Unnamed track"
      } (Channel ${channel})`,
    );
  });
  console.log("=== End MIDI Generation Debug ===\n");

  const writer = new Writer(sortedTracks.map(({ track }) => track));
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
