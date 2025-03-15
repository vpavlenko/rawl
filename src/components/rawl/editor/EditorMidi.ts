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

  // First, group notes by start time, duration, and channel to identify chords
  const groupedNotes = new Map<
    string,
    {
      startTime: number;
      duration: number;
      channel: number;
      pitches: number[];
      velocity: number;
      sourceLocation?: SourceLocation;
    }
  >();

  sortedNotes.forEach((note) => {
    // Create a key from the note properties that should be identical for chord notes
    const key = `${note.startTime}-${note.duration}-${note.channel || 0}`;

    if (!groupedNotes.has(key)) {
      groupedNotes.set(key, {
        startTime: note.startTime,
        duration: note.duration,
        channel: note.channel || 0,
        pitches: [note.pitch],
        velocity: note.velocity || 100,
        sourceLocation: note.sourceLocation,
      });
    } else {
      // If we already have a group with this key, add the pitch to it (it's part of a chord)
      const group = groupedNotes.get(key)!;
      group.pitches.push(note.pitch);

      // Keep the source location from the first note in the group
      // or update if this note has source location and the group doesn't
      if (note.sourceLocation && !group.sourceLocation) {
        group.sourceLocation = note.sourceLocation;
      }
    }
  });

  // Convert the grouped notes to events
  const events: MusicalEvent[] = Array.from(groupedNotes.values()).map(
    (group) => ({
      pitches: group.pitches,
      startTick: group.startTime,
      duration: group.duration,
      velocity: group.velocity,
      channel: group.channel,
      sourceLocation: group.sourceLocation,
    }),
  );

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
      pitch: event.pitches, // This now contains multiple pitches for chords
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
    // Remove console logs for channel events count and source locations
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
