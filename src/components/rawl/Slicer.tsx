import {
  MidiData,
  MidiEvent,
  MidiMetaEvent,
  MidiNoteOffEvent,
  MidiNoteOnEvent,
  parseMidi,
  writeMidi,
} from "midi-file";
import MIDIFile from "midifile";
import * as React from "react";
import { useEffect } from "react";
import MIDIPlayer from "../../players/MIDIFilePlayer";
import { loadMidiFromSlug } from "./slicerFiles";
import transformMidi from "./transformMidi";

const UNIFIED_BPM = 60;

function adjustDeltaTimes(track: MidiEvent[], offset: number): MidiEvent[] {
  return track.map((event, index) => {
    if (index === 0) {
      return { ...event, deltaTime: event.deltaTime + offset };
    } else {
      return { ...event };
    }
  });
}

function replaceBpmEvents(track: MidiEvent[], bpm: number): MidiEvent[] {
  const microsecondsPerBeat = Math.round(60000000 / bpm);
  return track.map((event) => {
    if (event.type === "setTempo") {
      event.microsecondsPerBeat = microsecondsPerBeat;
    }
    return event;
  });
}

function roundUpToBar(ticks: number, ppqn: number, barLength: number): number {
  return Math.ceil(ticks / barLength) * barLength;
}

function mergeMidiFiles(midiDatas: MidiData[]): Uint8Array {
  const ppqn = midiDatas[0].header.ticksPerBeat;
  const barLength = ppqn * 2; // Assuming 4/4 time signature

  let mergedTracks = midiDatas[0].tracks.map((track) =>
    replaceBpmEvents([...track], UNIFIED_BPM),
  );

  let lastTicks = mergedTracks.map((track) =>
    track.reduce((acc, event) => acc + event.deltaTime, 0),
  );

  for (let i = 1; i < midiDatas.length; i++) {
    const maxLastTick = Math.max(...lastTicks);
    const roundedMaxLastTick = roundUpToBar(maxLastTick, ppqn, barLength);

    const adjustedTracks = midiDatas[i].tracks.map((track, trackIndex) => {
      const offset = roundedMaxLastTick + barLength - lastTicks[trackIndex];
      const adjustedTrack = adjustDeltaTimes(
        replaceBpmEvents(track, UNIFIED_BPM),
        offset,
      );

      // Remove endOfTrack events from the current track before merging
      return adjustedTrack.filter((event) => event.type !== "endOfTrack");
    });

    mergedTracks = mergedTracks.map((track, trackIndex) => [
      ...track,
      ...adjustedTracks[trackIndex],
    ]);

    // Recalculate the last tick for each merged track
    lastTicks = mergedTracks.map((track) =>
      track.reduce((acc, event) => acc + event.deltaTime, 0),
    );
  }

  // Append endOfTrack event to each track at the very end
  mergedTracks = mergedTracks.map((track) => {
    const endOfTrackEvent: MidiEvent = {
      deltaTime: 0,
      type: "endOfTrack",
    } as MidiMetaEvent<"endOfTrack">;
    return [...track, endOfTrackEvent];
  });

  const mergedMidiData: MidiData = {
    header: midiDatas[0].header,
    tracks: mergedTracks,
  };

  return new Uint8Array(writeMidi(mergedMidiData));
}

const getMeasuresAsTicks = (binaryMidi): number[] => {
  const midiFile = new MIDIFile(binaryMidi);
  const midiPlayer = new MIDIPlayer();
  const result = midiPlayer.load(midiFile);
  return result.measuresAndBeats.ticks.measures;
};

async function extractSlice(
  slug: string,
  startMeasure: number,
  endMeasure: number,
): Promise<MidiData> {
  const binaryMidi = await loadMidiFromSlug(slug);
  const ticksMeasures = getMeasuresAsTicks(binaryMidi);

  const startTick = ticksMeasures[startMeasure];
  const endTick = ticksMeasures[endMeasure];

  const midiData = parseMidi(await loadMidiFromSlug(slug));
  midiData.tracks = midiData.tracks.map((track) => {
    let slicedTrack: MidiEvent[] = [];
    let noteOnEvents: Map<number, MidiNoteOnEvent> = new Map();
    let accumulatedDeltaTime = 0;
    let firstEventInSlice = true;

    // Collect metadata events
    let metadataEvents: MidiMetaEvent<any>[] = [];

    for (let event of track) {
      accumulatedDeltaTime += event.deltaTime;

      if (accumulatedDeltaTime < startTick) {
        // Collect metadata events before startTick
        if ((event as MidiMetaEvent<any>).meta) {
          metadataEvents.push(event as MidiMetaEvent<any>);
        }
        continue;
      }

      if (accumulatedDeltaTime >= endTick) {
        // If the event is beyond the end tick, we stop processing
        break;
      }

      if (firstEventInSlice) {
        // Adjust deltaTime for the first event in the slice
        event.deltaTime = accumulatedDeltaTime - startTick;
        firstEventInSlice = false;
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

      slicedTrack.push(event);
    }

    // Ensure all unclosed notes are turned off by the end tick
    for (let [noteNumber, noteOnEvent] of noteOnEvents) {
      let noteOffEvent: MidiNoteOffEvent = {
        type: "noteOff",
        channel: noteOnEvent.channel,
        deltaTime: 0,
        noteNumber: noteNumber,
        velocity: 0,
      };
      accumulatedDeltaTime = endTick;
      slicedTrack.push(noteOffEvent);
    }

    // Adjust all events to start from the new tick 0
    let adjustedTrack: MidiEvent[] = [];

    adjustedTrack = [...slicedTrack];

    // Add all collected metadata events at the beginning
    for (let metaEvent of metadataEvents) {
      metaEvent.deltaTime = 0;
      adjustedTrack.unshift(metaEvent);
    }

    // Add an end-of-track event
    adjustedTrack.push({
      deltaTime: 0,
      type: "endOfTrack",
    });

    return adjustedTrack;
  });

  debugger;
  return midiData;
}

console.log("MIDI file truncated successfully.");

const Slicer: React.FC<{
  playSongBuffer: (filepath: string, buffer: ArrayBuffer | Uint8Array) => void;
}> = ({ playSongBuffer }) => {
  useEffect(() => {
    const asyncFunc = async () => {
      const midiFileArray: MidiData[] = [
        await extractSlice("Maple_Leaf_Rag_Scott_Joplin", 1, 17),
        await extractSlice("gladiolus-rag---scott-joplin---1907", 1, 17),
        await extractSlice("the-cascades---scott-joplin---1904", 4, 20),
        await extractSlice("sugar-cane---scott-joplin---1908", 1, 17),
        await extractSlice("leola-two-step---scott-joplin---1905", 1, 17),
        await extractSlice("the-sycamore---scott-joplin---1904", 4, 20),
      ];

      const outputMidi = mergeMidiFiles(midiFileArray);

      setTimeout(() => playSongBuffer("slicer", transformMidi(outputMidi)), 0);
    };
    asyncFunc();
  }, []);

  return <div>Slicer</div>;
};

export default Slicer;
