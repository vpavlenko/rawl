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

// Source map information to track where a note came from in the original code
export interface SourceLocation {
  row: number; // 1-based line number
  col: number; // 1-based column position
  command: string; // 'insert', 'copy', or 'ac'
}

// Type assertion for the imported MidiWriter
const { Track: MidiTrack, NoteEvent, Writer } = MidiWriter;

// Mid-level representation of musical events
interface MusicalEvent {
  pitches: number[];
  startTick: number;
  duration: number;
  velocity: number;
  channel: number;
  sourceLocation?: SourceLocation; // Where this note originated in the source code
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
  extractedNotes?: {
    eventsByChannel: Map<number, MusicalEvent[]>;
    trackNames: Map<number, string>;
  };
}

// Main MIDI generation function now uses the two-step process
export const generateMidiFile = (
  notes: (Note & { sourceLocation?: SourceLocation })[],
  bpm: number,
  timeSignatures: TimeSignature[],
): {
  midiData: Uint8Array;
  extractedNotes: {
    eventsByChannel: Map<number, MusicalEvent[]>;
    trackNames: Map<number, string>;
  };
} => {
  // Sort the notes by start time for processing
  const sortedNotes = [...notes].sort((a, b) => a.startTime - b.startTime);
  const events: MusicalEvent[] = [];

  // Create individual note events for each note, including separate events for each pitch in chords
  sortedNotes.forEach((note, idx) => {
    // Log source location if available
    if (note.sourceLocation) {
      console.log(
        `[generateMidiFile] Note ${idx} has sourceLocation = { row: ${note.sourceLocation.row}, col: ${note.sourceLocation.col} }`,
      );
    } else {
      console.log(`[generateMidiFile] Note ${idx} has no sourceLocation`);
    }

    events.push({
      pitches: [note.pitch], // Each event has exactly one pitch
      startTick: note.startTime,
      duration: note.duration,
      velocity: note.velocity || 100,
      channel: note.channel || 0,
      sourceLocation: note.sourceLocation, // Preserve the source location exactly as is
    });
  });

  // Inline implementation of generateMidiFromEvents
  const eventsByChannel = new Map<number, MusicalEvent[]>();
  const trackNames = new Map<number, string>();

  // Group events by channel
  events.forEach((event) => {
    const channelEvents = eventsByChannel.get(event.channel) || [];
    channelEvents.push(event);
    eventsByChannel.set(event.channel, channelEvents);
  });

  // Create separate tracks for each channel
  const tracks = new Map<number, Track>();

  // Create a tempo/time signature track (track 0)
  const tempoTrack = new MidiTrack() as Track;
  const tempoTrackName = "Tempo and Time Signatures";
  tempoTrack.addTrackName(tempoTrackName);
  trackNames.set(-1, tempoTrackName);
  tempoTrack.setTempo(bpm);

  // Add time signatures using the official API
  timeSignatures.forEach((ts) => {
    tempoTrack.setTimeSignature(ts.numerator, 4, 24, 8);
  });

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
    }

    const track = tracks.get(event.channel)!;

    // Create the note event, preserving source location metadata
    const noteEvent = new NoteEvent({
      pitch: event.pitches,
      duration: "T" + event.duration,
      velocity: event.velocity,
      startTick: event.startTick,
      channel: event.channel, // Ensure channel number is preserved
    });

    // Manually attach source location to the note event
    // This is the only way to ensure it's preserved through the MIDI writer
    (noteEvent as any).sourceLocation = event.sourceLocation;

    track.addEvent(noteEvent);
  });

  // Sort tracks by channel number to ensure consistent order
  const sortedTracks = Array.from(tracks.entries())
    .sort(([a], [b]) => a - b)
    .map(([channel, track]) => ({ channel, track }));

  const writer = new Writer(sortedTracks.map(({ track }) => track));
  const base64Data = writer.dataUri().split(",")[1];

  // Convert base64 to Uint8Array
  const binaryString = window.atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Log final event count by channel
  eventsByChannel.forEach((events, channel) => {
    console.log(
      `[generateMidiFile] Channel ${channel} has ${events.length} events`,
    );
    // Log source location tracking for the first few events in each channel
    events.slice(0, 5).forEach((event, idx) => {
      if (event.sourceLocation) {
        console.log(
          `[generateMidiFile] Channel ${channel}, Event ${idx}: sourceLocation = { row: ${event.sourceLocation.row}, col: ${event.sourceLocation.col} }`,
        );
      } else {
        console.log(
          `[generateMidiFile] Channel ${channel}, Event ${idx}: No sourceLocation`,
        );
      }
    });
  });

  return {
    midiData: bytes,
    extractedNotes: {
      eventsByChannel,
      trackNames,
    },
  };
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
  const { midiData, extractedNotes } = generateMidiFile(
    notes,
    bpm,
    timeSignatures,
  );

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
    extractedNotes,
  };
};
