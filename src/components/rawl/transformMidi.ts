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

// Adjust delta times by shifting them forward
function adjustDeltaTimes(track: MidiEvent[]) {
  // Traverse the track for local adjustment
  for (let i = 1; i < track.length; i++) {
    // Shift deltaTime from the current event to the previous one
    track[i - 1].deltaTime = track[i].deltaTime;
  }

  // The last event should have zero deltaTime in the reversed sequence
  track[track.length - 1].deltaTime = 0;
}

// Helper function to reverse a single track
function reverseTrack(track: MidiEvent[]): MidiEvent[] {
  const noteOnIndices: { [key: number]: number } = {};

  // First pass: Handle noteOn and noteOff swaps
  for (let i = 0; i < track.length; i++) {
    const event = track[i];

    if (event.type === "noteOn") {
      // Track the index of noteOn event
      noteOnIndices[event.noteNumber] = i;
    } else if (event.type === "noteOff") {
      const noteOnIndex = noteOnIndices[event.noteNumber];
      if (noteOnIndex !== undefined) {
        // Swap noteOn and noteOff events
        const noteOnEvent = track[noteOnIndex] as MidiNoteOnEvent;

        const leftDeltaTime = noteOnEvent.deltaTime;
        const rightDeltaTime = event.deltaTime;
        // Correct swap
        track[noteOnIndex] = {
          ...event,
          type: "noteOff",
          deltaTime: leftDeltaTime,
        };
        track[i] = {
          ...noteOnEvent,
          type: "noteOn",
          velocity: noteOnEvent.velocity,
          deltaTime: rightDeltaTime,
        };

        // Remove the tracked noteOn index
        delete noteOnIndices[event.noteNumber];
      }
    }
  }

  // Step 1: Remove the end of track event
  const endOfTrackEvent = track.pop();

  // Step 2: Adjust all other events
  adjustAllEvents(track);

  // Step 3: Adjust delta times
  adjustDeltaTimes(track);

  // Step 4: Reverse the entire track
  track.reverse();

  // Step 5: Add the end of track event back
  track.push(endOfTrackEvent);

  return track;
}

// Adjust all events, including control changes and meta events
function adjustAllEvents(track: MidiEvent[]) {
  const lastEventOfType: { [key: string]: MidiEvent | null } = {};

  for (let i = 0; i < track.length; i++) {
    const event = track[i];
    const eventType = event.type;

    if (event.type === "noteOn" || event.type === "noteOff") {
      continue; // Skip notes since they're already handled
    }

    const key =
      event.type === "controller"
        ? `controller_${event.controllerType}`
        : eventType;

    // Check if there's a previous event of this type
    if (lastEventOfType[key]) {
      // Copy all properties except deltaTime from the previous event
      const previousEvent = lastEventOfType[key] as MidiEvent;
      track[i] = { ...previousEvent, deltaTime: event.deltaTime };
    }

    // Store this event for future swaps
    lastEventOfType[key] = event;
  }

  // Handle dangling events
  for (const key in lastEventOfType) {
    const event = lastEventOfType[key];
    if (event) {
      const idx = track.findIndex((e) => e === event);
      // Remove the event from its current position
      track.splice(idx, 1);
      // Push a new event to the end of the track
      track.push({ ...event, deltaTime: 0 });
    }
  }
}

function transformMidi(inputData: Uint8Array): Uint8Array {
  const midi: MidiData = parseMidi(inputData);

  midi.tracks = midi.tracks.map((track) => {
    return reverseTrack(track);
  });

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
      if (event.originalTrack === 0 || event.type === "noteOff") {
        // Right hand (originally track 0)
        const deltaTime = event.absoluteTime - rightHandLastEventTime;
        rightHandEvents.push({ ...event, deltaTime, channel: 0 });
        rightHandLastEventTime = event.absoluteTime;
      }
      if (event.originalTrack === 1 || event.type === "noteOff") {
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
