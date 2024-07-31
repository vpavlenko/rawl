import {
  MidiData,
  MidiEvent,
  MidiNoteOffEvent,
  MidiNoteOnEvent,
  parseMidi,
  writeMidi,
} from "midi-file";
import * as React from "react";
import { useEffect } from "react";
import { gladiolusRagS, mapleLeafRagS } from "./slicerFiles";

function adjustDeltaTimes(
  events: MidiEvent[],
  offsetTicks: number,
): MidiEvent[] {
  let accumulatedDeltaTime = offsetTicks;
  return events.map((event) => {
    let newEvent = { ...event };
    newEvent.deltaTime += accumulatedDeltaTime;
    accumulatedDeltaTime = 0; // subsequent events keep their deltaTime
    return newEvent;
  });
}

function mergeMidiFiles(midiDatas: MidiData[]): Uint8Array {
  const ppqn = midiDatas[0].header.ticksPerBeat;
  const barOffset = ppqn * 2; // Assuming 4/4 time signature for simplicity

  let mergedTracks = midiDatas[0].tracks.map((track) => [...track]);
  let lastTick = mergedTracks.map((track) =>
    track.reduce((acc, event) => acc + event.deltaTime, 0),
  );
  let currentBarOffset = barOffset;

  for (let i = 1; i < midiDatas.length; i++) {
    const adjustedTracks = midiDatas[i].tracks.map((track, trackIndex) => {
      const adjustedTrack = adjustDeltaTimes(
        track,
        lastTick[trackIndex] + currentBarOffset,
      );

      // Remove endOfTrack events from the current track before merging
      const filteredTrack = adjustedTrack.filter(
        (event) => event.type !== "endOfTrack",
      );

      // Append the endOfTrack event of the current track to the end
      const endOfTrackEvent = adjustedTrack.find(
        (event) => event.type === "endOfTrack",
      );
      if (endOfTrackEvent) {
        filteredTrack.push({ ...endOfTrackEvent, deltaTime: 0 });
      }

      return filteredTrack;
    });

    mergedTracks = mergedTracks.map((track, trackIndex) => [
      ...track,
      ...adjustedTracks[trackIndex],
    ]);
    lastTick = mergedTracks.map((track) =>
      track.reduce((acc, event) => acc + event.deltaTime, 0),
    );
    currentBarOffset += barOffset;
  }

  const mergedMidiData: MidiData = {
    header: midiDatas[0].header,
    tracks: mergedTracks,
  };

  return new Uint8Array(writeMidi(mergedMidiData));
}

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

const mapleLeafRag: Uint8Array = base64ToUint8Array(mapleLeafRagS);
const gladiolusRag: Uint8Array = base64ToUint8Array(gladiolusRagS);

// Function to truncate the MIDI tracks
function truncateMidi(midiData: MidiData, truncateTick: number): MidiData {
  midiData.tracks = midiData.tracks.map((track) => {
    let truncatedTrack: MidiEvent[] = [];
    let noteOnEvents: Map<number, MidiNoteOnEvent> = new Map();
    let accumulatedDeltaTime = 0;

    for (let event of track) {
      accumulatedDeltaTime += event.deltaTime;
      if (accumulatedDeltaTime >= truncateTick) {
        // If the event is beyond the truncate tick, we stop processing
        break;
      }

      // Keep track of NoteOn events to match with NoteOff
      if (event.type === "noteOn" && event.velocity > 0) {
        noteOnEvents.set(event.noteNumber, event as MidiNoteOnEvent);
      }

      // If NoteOff event is found, remove the matching NoteOn from the map
      if (
        event.type === "noteOff" ||
        (event.type === "noteOn" && event.velocity === 0)
      ) {
        noteOnEvents.delete(event.noteNumber);
      }

      truncatedTrack.push(event);
    }

    // Ensure all unclosed notes are turned off by the truncate tick
    for (let [noteNumber, noteOnEvent] of noteOnEvents) {
      let noteOffEvent: MidiNoteOffEvent = {
        type: "noteOff",
        channel: noteOnEvent.channel,
        deltaTime: truncateTick - accumulatedDeltaTime,
        noteNumber: noteNumber,
        velocity: 0,
      };
      accumulatedDeltaTime = truncateTick;
      truncatedTrack.push(noteOffEvent);
    }

    // Add an end-of-track event
    truncatedTrack.push({
      deltaTime: 0,
      type: "endOfTrack",
    });

    return truncatedTrack;
  });

  return midiData;
}

const truncateTick = 4800;
const truncatedMapleLeafRag = truncateMidi(
  parseMidi(mapleLeafRag),
  truncateTick,
);

const truncatedGladiolusRag = truncateMidi(
  parseMidi(gladiolusRag),
  truncateTick,
);

// Write the truncated MIDI data back to a file or Uint8Array
// const outputMidi: Uint8Array = new Uint8Array(writeMidi(truncatedMidiData));

// Usage example
const midiFileArray: MidiData[] = [
  truncatedMapleLeafRag,
  truncatedGladiolusRag,
  // Add more MIDI files as needed
];

const outputMidi = mergeMidiFiles(midiFileArray);
// Use the mergedMidiFile Uint8Array as needed

console.log("MIDI file truncated successfully.");

const Slicer: React.FC<{
  playSongBuffer: (filepath: string, buffer: ArrayBuffer | Uint8Array) => void;
}> = ({ playSongBuffer }) => {
  useEffect(() => {
    //initChipCore races
    setTimeout(() => playSongBuffer("slicer", outputMidi), 1000);
  }, []);

  // call
  // this.playSongBuffer(file.name, result);
  // as soon as midi file is ready

  // task one: play from base64
  // task two: play only till tick 4800

  return (
    <div>
      Slicer
      {/* <ReactJson src={midi} theme="monokai" style={{ fontSize: "12px" }} /> */}
    </div>
  );
};

export default Slicer;
