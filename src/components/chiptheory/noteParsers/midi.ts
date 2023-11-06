import { Note } from ".";

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
          console.log("WEIRD: noteOff for note not seen before", event);
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

export const parseMIDI = ({ events, activeChannels }): Note[][] =>
  activeChannels.map((channel) => getNotes(events, channel));
