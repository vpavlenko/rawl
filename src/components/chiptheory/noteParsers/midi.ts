import { Note, ParsingResult } from ".";

const getNotes = (events, channel): Note[] => {
  const notes = [];
  const noteOnTime = {};
  events.forEach((event) => {
    if (channel === 9) {
      return []; // skip drums for now
    }
    if (event.channel === channel && event.type === 8) {
      const midiNumber = event.param1;
      if (event.subtype === 9) {
        noteOnTime[midiNumber] = event.playTime;
      }
      if (event.subtype === 8) {
        if (!(midiNumber in noteOnTime)) {
          //   console.log("WEIRD: noteOff for note not seen before", event);
        }
        notes.push({
          note: {
            midiNumber,
            name: "??",
          },
          span: [noteOnTime[midiNumber] / 1000, event.playTime / 1000],
          chipState: event, // this is noteOff event, not useful - doesn't have original velocity
        });
        delete noteOnTime[midiNumber];
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

const microsecPerQuarterNoteToBPM = (microsecondsPerQuarterNote) => {
  return 60000000 / microsecondsPerQuarterNote;
};

function calculateMeasureAndBeats(timeEvents, timebase) {
  debugger;
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
      lastBeatTime + (1 - lastBeatFractionGone) * secondsPerQuarterNote;
    if (newBeatEndTime <= timeUntil) {
      if (constructedBeatsInLastMeasure + 1 === numerator) {
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

// Example usage:
// const events = [...]; // Your combined tempo and time signature events with type field
// const timebase = 480; // Example timebase
// const measureStarts = calculateMeasureStarts(events, timebase);

// The buildMeasures function would remain the same.

export const parseMIDI = ({
  events,
  activeChannels,
  timebase,
  timeEvents,
}): ParsingResult => {
  const measuresAndBeats = calculateMeasureAndBeats(timeEvents, timebase);
  return {
    notes: activeChannels.map((channel) => getNotes(events, channel)),
    measuresAndBeats,
  };
};
