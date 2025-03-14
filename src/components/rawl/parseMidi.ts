import MIDIEvents from "midievents";
import { SecondsSpan } from "./Rawl";
import { MeasuresAndBeats } from "./SystemLayout";

const DRUM_CHANNEL = 9;

export interface SourceLocation {
  row: number;
  col: number;
  command: string;
}

export type Note = {
  note: {
    midiNumber: number;
    relativeNumber?: number;
  };
  isDrum: boolean;
  id: string;
  span: SecondsSpan;
  tickSpan?: [number, number]; // [startTick, endTick]
  pitchBend?: PitchBendPoint[];
  voiceIndex: number;
  sourceLocation?: SourceLocation;
  noteUnderCursor?: boolean;
};

export type ColoredNote = Note & {
  color: string;
  isActive: boolean;
  colorPitchClass: number | "default" | "drum";
  sourceLocation?: SourceLocation;
  noteUnderCursor?: boolean;
};

export type PitchBendPoint = {
  time: number;
  value: number;
};

export type NotesInVoices = Note[][];

export type ColoredNotesInVoices = ColoredNote[][];

export type MidiSource = {
  events: any;
  activeChannels: any;
  timebase: any;
  timeEvents: any;
  ticksPerBeat: number;
};

export type ParsingResult = {
  notes: NotesInVoices;
  measuresAndBeats?: MeasuresAndBeats;
};

const getNotes = (events, channel, voiceIndex): Note[] => {
  const notes: Note[] = [];
  const noteOn = {};
  let currentTick = 0;

  events.forEach((event) => {
    // Accumulate delta for tick tracking
    currentTick += event.delta || 0;

    if (event.channel === channel && event.type === MIDIEvents.EVENT_MIDI) {
      const midiNumber = event.param1;
      if (
        event.subtype === MIDIEvents.EVENT_MIDI_NOTE_OFF ||
        (event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON && noteOn[midiNumber])
      ) {
        if (channel === DRUM_CHANNEL && midiNumber > 87) {
          return;
          // probably a bug? can't be played by a default MIDI sound font
        }
        if (midiNumber in noteOn) {
          if (channel !== DRUM_CHANNEL && noteOn[midiNumber].param2 === 0) {
            return;
          }
          if (event.playTime >= noteOn[midiNumber].playTime) {
            // Ensure we have a valid tickSpan
            const startTick = noteOn[midiNumber].tickPosition || 0;
            const endTick = currentTick;

            notes.push({
              note: {
                midiNumber,
              },
              id: `${voiceIndex}_${startTick}_${
                endTick - startTick
              }_${midiNumber}`,
              isDrum: channel === DRUM_CHANNEL,
              span: [noteOn[midiNumber].playTime / 1000, event.playTime / 1000],
              tickSpan: [startTick, endTick], // Always explicitly set the tickSpan
              pitchBend: noteOn[midiNumber].pitchBend,
              voiceIndex,
              sourceLocation: noteOn[midiNumber].sourceLocation,
              noteUnderCursor: noteOn[midiNumber].noteUnderCursor,
            });
          }
          delete noteOn[midiNumber];
        }
      }
      if (event.subtype === MIDIEvents.EVENT_MIDI_PITCH_BEND) {
        // TODO: Process pitch bend range change messages.
        // https://chat.openai.com/share/8332f454-6d52-4911-a40c-f11c251fea1b
        for (const midiNumber in noteOn) {
          (noteOn[midiNumber].pitchBend ||= []).push({
            time: event.playTime / 1000,
            value: (event.param2 << 7) + event.param1,
          });
        }
      }
      if (event.subtype === MIDIEvents.EVENT_MIDI_NOTE_ON) {
        noteOn[midiNumber] = event;
        // Store the current tick position with the note-on event
        noteOn[midiNumber].tickPosition = currentTick;
        noteOn[midiNumber].sourceLocation = event.sourceLocation;
        noteOn[midiNumber].noteUnderCursor = event.noteUnderCursor;
      }
    }
  });
  if (channel === DRUM_CHANNEL) {
    const uniqueMidiNumbers = [
      ...new Set(notes.map((note) => note.note.midiNumber)),
    ].sort((a, b) => a - b);

    const midiToRelativeNumberMap = new Map();
    uniqueMidiNumbers.forEach((midiNumber, index) => {
      midiToRelativeNumberMap.set(midiNumber, index * 2);
    });

    notes.forEach((note) => {
      note.note.relativeNumber = midiToRelativeNumberMap.get(
        note.note.midiNumber,
      );
    });
  }
  return notes;
};

// We can also find key events:
// key: 0,
// scale: 0,
// subtype: 89,
// type: 255,
// Except that in practice these events are always key=0 scale=0 (no one is setting them)
// Although classical music MIDI might have it.

function calculateMeasureAndBeats(timeEvents, timebase) {
  const measures = [0];
  const beats = [];
  const measuresInTicks = [0];
  let secondsPerQuarterNote = 0.5;
  let numerator = 4;
  let denominator = 4;
  let lastBeatFractionGone = 0;
  let constructedBeatsInLastMeasure = 0;
  let lastBeatTime = 0; // either measures[-1] or beats[-1]
  let lastTick = 0; // Track the last tick time

  const createNewBeat = (timeUntil, tick) => {
    const newBeatEndTime =
      lastBeatTime +
      (1 - lastBeatFractionGone) * ((secondsPerQuarterNote / denominator) * 4);

    const newBeatEndTick =
      lastTick + (1 - lastBeatFractionGone) * ((timebase / denominator) * 4);

    if (newBeatEndTime - 0.005 <= timeUntil) {
      if (constructedBeatsInLastMeasure + 1 >= numerator) {
        measures.push(newBeatEndTime);
        measuresInTicks.push(Math.round(newBeatEndTick)); // Push measure in ticks
        constructedBeatsInLastMeasure = 0;
      } else {
        beats.push(newBeatEndTime);
        constructedBeatsInLastMeasure++;
      }
      lastBeatFractionGone = 0;
      lastBeatTime = newBeatEndTime;
      lastTick = newBeatEndTick;
      return true;
    } else {
      lastBeatFractionGone +=
        (timeUntil - lastBeatTime) /
        ((secondsPerQuarterNote / denominator) * 4);
      lastBeatTime = timeUntil;
      lastTick = tick; // Update the last tick position
      return false;
    }
  };

  timeEvents.forEach((event) => {
    const { bpm, playTime, tick } = event;

    while (createNewBeat(playTime / 1000, tick));

    if (event.type === "timeSignature") {
      numerator = event.numerator;
      denominator = 2 ** event.denominatorPower;
    } else {
      secondsPerQuarterNote = 60 / bpm;
    }
  });

  if (measures.length >= 2) {
    measures.push(2 * measures.at(-1) - measures.at(-2));
    measuresInTicks.push(2 * measuresInTicks.at(-1) - measuresInTicks.at(-2));
  }

  return { measures, beats, ticks: { measures: measuresInTicks } };
}

export const parseNotes = ({
  events,
  activeChannels,
  timeEvents,
  timebase,
}: MidiSource): ParsingResult => {
  const measuresAndBeats = calculateMeasureAndBeats(timeEvents, timebase);
  events.forEach((event) => {
    if (event.subtype === MIDIEvents.EVENT_META_KEY_SIGNATURE) {
      console.log("KEY SIGNATURE" + JSON.stringify(event));
    }
  });

  // Get notes for each voice
  let notes = activeChannels.map((channel, index) =>
    getNotes(events, channel, index),
  );

  // Filter out duplicate IDs, keeping only the first occurrence
  notes = notes.map((voiceNotes) => {
    const uniqueIds = new Set();
    return voiceNotes.filter((note) => {
      if (uniqueIds.has(note.id)) {
        return false; // Skip this note as the ID already exists
      }
      uniqueIds.add(note.id);
      return true;
    });
  });

  // Remove last measure if second-to-last measure is empty
  if (measuresAndBeats.measures.length > 2) {
    const secondToLastMeasureStart =
      measuresAndBeats.measures[measuresAndBeats.measures.length - 2];
    const hasNotesInSecondToLastMeasure = notes.some((voiceNotes) =>
      voiceNotes.some((note) => note.span[1] > secondToLastMeasureStart),
    );

    if (!hasNotesInSecondToLastMeasure) {
      measuresAndBeats.measures.pop();
      measuresAndBeats.ticks.measures.pop();
      measuresAndBeats.beats = measuresAndBeats.beats.filter(
        (beat) =>
          beat <
          measuresAndBeats.measures[measuresAndBeats.measures.length - 1],
      );
    }
  }

  return {
    measuresAndBeats,
    notes,
  };
};
