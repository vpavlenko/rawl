import {
  MidiData,
  MidiEvent,
  MidiNoteOffEvent,
  MidiNoteOnEvent,
  MidiPitchBendEvent,
  parseMidi,
  writeMidi,
} from "midi-file";

type EnhancedMidiEvent = MidiEvent & {
  absoluteTime: number;
  originalTrack: number;
};

function isNoteOrPitchBendEvent(
  event: MidiEvent,
): event is MidiNoteOnEvent | MidiNoteOffEvent | MidiPitchBendEvent {
  return (
    event.type === "noteOn" ||
    event.type === "noteOff" ||
    event.type === "pitchBend"
  );
}

function hasOnlyChannelZeroNotesAndAtLeastOne(track: MidiEvent[]): boolean {
  let hasChannelZeroNote = false;

  for (const event of track) {
    if (isNoteOrPitchBendEvent(event)) {
      if (event.channel === 0) {
        hasChannelZeroNote = true;
      } else {
        return false; // Found a note in a channel other than 0
      }
    }
  }

  return hasChannelZeroNote; // Must have at least one note in channel 0
}

function transformMidi(inputData: Uint8Array): Uint8Array {
  const midi: MidiData = parseMidi(inputData);

  if (midi.tracks.length !== 2) {
    return inputData;
  }

  const bothTracksValid = midi.tracks.every(
    hasOnlyChannelZeroNotesAndAtLeastOne,
  );
  if (!bothTracksValid) {
    return inputData;
  }

  // Step 1: Merge tracks while converting delta times to absolute times
  const mergedEvents: EnhancedMidiEvent[] = [];

  midi.tracks.forEach((track, trackIndex) => {
    let absoluteTime = 0;
    track.forEach((event) => {
      absoluteTime += event.deltaTime;
      mergedEvents.push({ ...event, absoluteTime, originalTrack: trackIndex });
    });
  });

  mergedEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);

  // Step 2: Split events into two channels based on their original tracks
  const rightHandEvents: EnhancedMidiEvent[] = [];
  const leftHandEvents: EnhancedMidiEvent[] = [];

  rightHandEvents.push({
    type: "trackName",
    text: "right hand",
    deltaTime: 0,
    meta: true,
    originalTrack: 0,
    absoluteTime: 0,
  });

  leftHandEvents.push({
    type: "trackName",
    text: "left hand",
    deltaTime: 0,
    meta: true,
    originalTrack: 1,
    absoluteTime: 0,
  });

  let rightHandLastEventTime = 0;
  let leftHandLastEventTime = 0;

  mergedEvents.forEach((event) => {
    if (event.type === "trackName") return;
    if (isNoteOrPitchBendEvent(event)) {
      if (event.originalTrack === 0) {
        // Right hand (originally track 0)
        const deltaTime = event.absoluteTime - rightHandLastEventTime;
        rightHandEvents.push({ ...event, deltaTime, channel: 0 });
        rightHandLastEventTime = event.absoluteTime;
      } else if (event.originalTrack === 1) {
        // Left hand (originally track 1)
        const deltaTime = event.absoluteTime - leftHandLastEventTime;
        leftHandEvents.push({ ...event, deltaTime, channel: 1 });
        leftHandLastEventTime = event.absoluteTime;
      }
    } else {
      // Meta and control events are copied to both tracks
      const deltaTimeRight = event.absoluteTime - rightHandLastEventTime;
      const deltaTimeLeft = event.absoluteTime - leftHandLastEventTime;
      rightHandEvents.push({
        ...event,
        deltaTime: deltaTimeRight,
        ...("channel" in event ? { channel: 0 } : {}),
      });
      leftHandEvents.push({
        ...event,
        deltaTime: deltaTimeLeft,
        ...("channel" in event ? { channel: 1 } : {}),
      });
      rightHandLastEventTime = event.absoluteTime;
      leftHandLastEventTime = event.absoluteTime;
    }
  });

  rightHandEvents.forEach((event) => {
    delete event.absoluteTime;
    delete event.originalTrack;
  });
  leftHandEvents.forEach((event) => {
    delete event.absoluteTime;
    delete event.originalTrack;
  });

  // Combine the events into new tracks
  const newTracks = [rightHandEvents, leftHandEvents];
  const newMidiData: MidiData = {
    header: midi.header,
    tracks: newTracks,
  };

  // Write the modified MIDI data back to a Uint8Array
  const outputData = writeMidi(newMidiData);
  return new Uint8Array(outputData);
}

export default transformMidi;
