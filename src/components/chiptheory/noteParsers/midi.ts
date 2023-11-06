import { Note } from ".";

const getNotes = (data, channel): Note[] => {
  const notes = [];
  const noteOnTime = {};
  data.forEach((event) => {
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

export const parseMIDI = (data): Note[][] => {
  // TODO: show channel with notes
  return [getNotes(data, 0), getNotes(data, 3), getNotes(data, 4)];
};
