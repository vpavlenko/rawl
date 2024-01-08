import MIDIEvents from "midievents";
import { SecondsSpan } from "./Chiptheory";
import { MeasuresAndBeats } from "./SystemLayout";

export type Note = {
  note: {
    midiNumber: number;
    name: string;
  };
  isDrum: boolean;
  id: number;
  span: SecondsSpan;
  chipState: any;
};

export type NotesInVoices = Note[][];

export type MidiSource = {
  events: any;
  activeChannels: any;
  timebase: any;
  timeEvents: any;
};

export type ParsingResult = {
  notes: NotesInVoices;
  measuresAndBeats?: MeasuresAndBeats;
};

let id = 0;

const getNotes = (events, channel): Note[] => {
  const notes = [];
  const noteOn = {};
  events.forEach((event) => {
    if (event.channel === channel && event.type === 8) {
      const midiNumber = event.param1;
      if (event.subtype === 9) {
        noteOn[midiNumber] = event;
      }
      if (event.subtype === 8) {
        if (midiNumber in noteOn) {
          if (event.playTime / 1000 > noteOn[midiNumber].playTime / 1000) {
            notes.push({
              note: {
                midiNumber,
                name: "??",
              },
              id,
              isDrum: channel === 9,
              span: [noteOn[midiNumber].playTime / 1000, event.playTime / 1000],
              chipState: { on: noteOn[midiNumber], off: event },
            });

            id++;
          }
          delete noteOn[midiNumber];
        }
      }
    }
  });
  return notes;
};

// We can also find key event:
// key: 0,
// scale: 0,
// subtype: 89,
// type: 255,
// Except that in practice these events are always key=0 scale=0 (no one is setting them)
// Although classics might have it

function calculateMeasureAndBeats(timeEvents) {
  // Sort events by playTime
  //   events.sort((a, b) => a.playTime - b.playTime);
  const measures = [0];
  const beats = [];
  let secondsPerQuarterNote = 0.5;
  let numerator = 4;
  let denominator = 4;
  let lastBeatFractionGone = 0;
  let constructedBeatsInLastMeasure = 0;
  let lastBeatTime = 0; // either measures[-1] or beats[-1]

  const createNewBeat = (timeUntil) => {
    // TODO adjust with time signature
    const newBeatEndTime =
      lastBeatTime +
      (1 - lastBeatFractionGone) * ((secondsPerQuarterNote / denominator) * 4);
    if (newBeatEndTime - 0.005 <= timeUntil) {
      if (constructedBeatsInLastMeasure + 1 >= numerator) {
        measures.push(newBeatEndTime);
        constructedBeatsInLastMeasure = 0;
      } else {
        beats.push(newBeatEndTime);
        constructedBeatsInLastMeasure++;
      }
      lastBeatFractionGone = 0;
      lastBeatTime = newBeatEndTime;
      return true;
    } else {
      lastBeatFractionGone +=
        (timeUntil - lastBeatTime) / secondsPerQuarterNote;
      lastBeatTime = timeUntil;
      return false;
    }
  };

  timeEvents.forEach((event) => {
    if (event.type === "timeSignature") {
      numerator = event.numerator;
      denominator = 2 ** event.denominatorPower;
      // TODO: think about starting a new measure right here
    } else {
      const { bpm: newBpm, playTime } = event;
      // we should construst all measures and beats before the change
      while (createNewBeat(playTime / 1000));

      secondsPerQuarterNote = 60 / newBpm;
    }
  });

  return { measures, beats };
}

export const parseNotes = ({
  events,
  activeChannels,
  timeEvents,
}: MidiSource): ParsingResult => {
  const measuresAndBeats = calculateMeasureAndBeats(timeEvents);
  events.forEach((event) => {
    if (event.subtype === MIDIEvents.EVENT_META_KEY_SIGNATURE) {
      console.log("KEY SIGNATURE" + JSON.stringify(event));
    }
  });
  const notes = activeChannels.map((channel) => getNotes(events, channel));
  return {
    measuresAndBeats,
    notes,
  };
};
