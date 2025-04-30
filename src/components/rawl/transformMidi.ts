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

function isGlobalMetaEvent(event: MidiEvent): boolean {
  return (
    "subtype" in event &&
    typeof event.subtype === "string" &&
    ["setTempo", "timeSignature", "keySignature"].includes(event.subtype)
  );
}

function getTrackName(track: MidiEvent[]): string | undefined {
  const nameEvent = track.find(
    (event) => event.type === "trackName" && "text" in event,
  );
  if (nameEvent && "text" in nameEvent) {
    return nameEvent.text;
  }
  return undefined;
}

function createTrackNameEvent(name: string, deltaTime: number = 0): MidiEvent {
  return {
    deltaTime,
    type: "trackName",
    text: name,
  };
}

function createEndOfTrackEvent(deltaTime: number = 0): MidiEvent {
  return {
    deltaTime,
    type: "endOfTrack",
  };
}

function ensureTrackEnding(track: MidiEvent[]): MidiEvent[] {
  // Remove any existing end of track events
  const eventsWithoutEnd = track.filter((event) => event.type !== "endOfTrack");

  // Add a new end of track event
  return [...eventsWithoutEnd, createEndOfTrackEvent()];
}

function findUnusedChannel(
  midi: MidiData,
  usedChannels: Set<number>,
): number | null {
  // Find the first unused channel number between 0-15, skipping channel 9 (drums)
  for (let channel = 0; channel < 16; channel++) {
    if (channel === 9) continue; // Skip drum channel
    if (!usedChannels.has(channel)) {
      return channel;
    }
  }
  return null;
}

function getUsedChannels(midi: MidiData): Set<number> {
  const usedChannels = new Set<number>();
  midi.tracks.forEach((track) => {
    track.forEach((event) => {
      if ("channel" in event) {
        usedChannels.add(event.channel);
      }
    });
  });
  return usedChannels;
}

function pushEventWithDeltaTime(
  event: EnhancedMidiEvent,
  events: EnhancedMidiEvent[],
  lastEventTime: number,
  targetChannel?: number,
): number {
  const deltaTime = event.absoluteTime - lastEventTime;
  events.push({
    ...event,
    deltaTime,
    ...(targetChannel !== undefined && { channel: targetChannel }),
  } as EnhancedMidiEvent);
  return event.absoluteTime;
}

function transformMidi(
  inputData: Uint8Array,
  _forcedPanning?: boolean,
): Uint8Array {
  // Read forcedPanning directly from localStorage, fallback to false if not set
  const forcedPanning = localStorage.getItem("forcedPanning") === "true";

  const midi: MidiData = parseMidi(inputData);
  const usedChannels = getUsedChannels(midi);

  // Group tracks by channel
  const channelTracks: Map<number, number[]> = new Map();
  midi.tracks.forEach((track, trackIndex) => {
    track.forEach((event) => {
      if (isNoteOrPitchBendEvent(event)) {
        const tracks = channelTracks.get(event.channel) || [];
        if (!tracks.includes(trackIndex)) {
          tracks.push(trackIndex);
        }
        channelTracks.set(event.channel, tracks);
      }
    });
  });

  // If no multi-track channels found, return original
  const hasMultiTrackChannels = Array.from(channelTracks.values()).some(
    (tracks) => tracks.length > 1,
  );
  if (!hasMultiTrackChannels) {
    console.log("[transformMidi] skipping - no multi-track channels");
    return inputData;
  }

  // Step 1: Convert all tracks to absolute time and separate global meta events
  const mergedEvents: EnhancedMidiEvent[] = [];
  const globalMetaEvents: EnhancedMidiEvent[] = [];

  midi.tracks.forEach((track, trackIndex) => {
    let absoluteTime = 0;
    track.forEach((event) => {
      if (event.type === "endOfTrack") return;
      absoluteTime += event.deltaTime;

      const enhancedEvent = {
        ...event,
        absoluteTime,
        originalTrack: trackIndex,
      } as EnhancedMidiEvent;

      if (isGlobalMetaEvent(event)) {
        globalMetaEvents.push(enhancedEvent);
      } else {
        mergedEvents.push(enhancedEvent);
      }
    });
  });

  mergedEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);
  globalMetaEvents.sort((a, b) => a.absoluteTime - b.absoluteTime);

  // Step 2: Split into new tracks
  const newTracks: MidiEvent[][] = [];
  const processedChannels = new Set<number>();

  // Process multi-track channels
  for (const [channel, trackIndices] of channelTracks.entries()) {
    if (trackIndices.length <= 1) continue;

    // Find an unused channel for the left hand
    const leftHandChannel = findUnusedChannel(midi, usedChannels);
    if (leftHandChannel === null) {
      // Skip splitting this channel if no unused channels available
      continue;
    }

    processedChannels.add(channel);
    usedChannels.add(leftHandChannel); // Reserve this channel

    const baseTrackName =
      trackIndices
        .map((idx) => getTrackName(midi.tracks[idx]))
        .find((name) => name !== undefined) || "";

    // Create left/right hand tracks
    const leftHandEvents: EnhancedMidiEvent[] = [];
    const rightHandEvents: EnhancedMidiEvent[] = [];

    // Add track names
    const leftName = baseTrackName
      ? `${baseTrackName}: left hand`
      : "left hand";
    const rightName = baseTrackName
      ? `${baseTrackName}: right hand`
      : "right hand";
    rightHandEvents.push({
      ...createTrackNameEvent(rightName),
      absoluteTime: 0,
      originalTrack: trackIndices[0],
    } as EnhancedMidiEvent);
    leftHandEvents.push({
      ...createTrackNameEvent(leftName),
      absoluteTime: 0,
      originalTrack: trackIndices[1],
    } as EnhancedMidiEvent);

    // Add global meta events to both tracks
    let lastMetaTime = 0;
    globalMetaEvents.forEach((event) => {
      const deltaTime = event.absoluteTime - lastMetaTime;
      rightHandEvents.push({ ...event, deltaTime } as EnhancedMidiEvent);
      leftHandEvents.push({ ...event, deltaTime } as EnhancedMidiEvent);
      lastMetaTime = event.absoluteTime;
    });

    if (forcedPanning) {
      // Add pan right (CC #10 = 127) for right hand
      rightHandEvents.push({
        type: "controller",
        controllerType: 10,
        value: 127,
        deltaTime: 0,
        channel: channel,
        originalTrack: trackIndices[0],
        absoluteTime: 0,
      } as EnhancedMidiEvent);

      // Add pan left (CC #10 = 0) for left hand
      leftHandEvents.push({
        type: "controller",
        controllerType: 10,
        value: 0,
        deltaTime: 0,
        channel: leftHandChannel,
        originalTrack: trackIndices[1],
        absoluteTime: 0,
      } as EnhancedMidiEvent);
    }

    let rightHandLastEventTime = 0;
    let leftHandLastEventTime = 0;

    // Split events between hands
    mergedEvents.forEach((event) => {
      if (!("channel" in event)) {
        // Handle non-channel events (except global meta events which were handled earlier)
        if (!isGlobalMetaEvent(event)) {
          rightHandLastEventTime = pushEventWithDeltaTime(
            event,
            rightHandEvents,
            rightHandLastEventTime,
          );
          leftHandLastEventTime = pushEventWithDeltaTime(
            event,
            leftHandEvents,
            leftHandLastEventTime,
          );
        }
        return;
      }

      if (event.channel !== channel) return;

      const isFirstTrack = event.originalTrack === trackIndices[0];
      if (isNoteOrPitchBendEvent(event)) {
        if (isFirstTrack || event.type === "noteOff") {
          rightHandLastEventTime = pushEventWithDeltaTime(
            event,
            rightHandEvents,
            rightHandLastEventTime,
            channel,
          );
        }
        if (!isFirstTrack || event.type === "noteOff") {
          leftHandLastEventTime = pushEventWithDeltaTime(
            event,
            leftHandEvents,
            leftHandLastEventTime,
            leftHandChannel,
          );
        }
      } else if (event.type === "programChange") {
        // Copy program changes to both hands to maintain the same instrument
        rightHandLastEventTime = pushEventWithDeltaTime(
          event,
          rightHandEvents,
          rightHandLastEventTime,
          channel,
        );
        leftHandLastEventTime = pushEventWithDeltaTime(
          event,
          leftHandEvents,
          leftHandLastEventTime,
          leftHandChannel,
        );
      } else {
        // Skip existing pan control messages when forced panning is enabled
        if (
          forcedPanning &&
          event.type === "controller" &&
          event.controllerType === 10
        ) {
          return;
        }

        // Copy other channel events to both tracks
        rightHandLastEventTime = pushEventWithDeltaTime(
          event,
          rightHandEvents,
          rightHandLastEventTime,
          channel,
        );
        leftHandLastEventTime = pushEventWithDeltaTime(
          event,
          leftHandEvents,
          leftHandLastEventTime,
          leftHandChannel,
        );
      }
    });

    // Clean up events and ensure track endings
    const cleanedRightHandEvents = rightHandEvents.map(
      ({ absoluteTime, originalTrack, ...event }) => event,
    );
    const cleanedLeftHandEvents = leftHandEvents.map(
      ({ absoluteTime, originalTrack, ...event }) => event,
    );

    newTracks.push(
      ensureTrackEnding(cleanedRightHandEvents),
      ensureTrackEnding(cleanedLeftHandEvents),
    );
  }

  // Add remaining tracks unchanged, ensuring they have end markers
  midi.tracks.forEach((track, trackIndex) => {
    const hasProcessedChannel = track.some(
      (event) => "channel" in event && processedChannels.has(event.channel),
    );
    if (!hasProcessedChannel) {
      newTracks.push(ensureTrackEnding(track));
    }
  });

  // Create new MIDI file
  const newMidiData: MidiData = {
    header: midi.header,
    tracks: newTracks,
  };

  // Write the modified MIDI data
  const outputData = writeMidi(newMidiData);
  return new Uint8Array(outputData);
}

export default transformMidi;
