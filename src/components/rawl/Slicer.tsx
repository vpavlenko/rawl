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
import { Link } from "react-router-dom";
import MIDIPlayer from "../../players/MIDIFilePlayer";
import { MeasuresAndBeats } from "./SystemLayout";
import { Analyses, getPhraseStarts } from "./analysis";
import { loadMidiFromSlug } from "./slicerFiles";
import transformMidi from "./transformMidi";

type SliceMeasureSpan = { type: "measureSpan"; measureSpan: [number, number] };
type SliceSingleSection = { type: "singleSection"; section: number };
type SliceSpan = SliceMeasureSpan | SliceSingleSection;

const M = (start: number, end: number): SliceMeasureSpan => ({
  type: "measureSpan",
  measureSpan: [start, end],
});

const S = (section: number): SliceSingleSection => ({
  type: "singleSection",
  section,
});

type Slice = {
  slug: string;
  sliceSpan: SliceSpan;
};

type SliceStack = {
  slug: string;
  slices: Slice[];
  corpus: string;
};

const SLICE_STACKS: SliceStack[] = [
  {
    slug: "maple_like_themes",
    slices: [
      { slug: "Maple_Leaf_Rag_Scott_Joplin", sliceSpan: M(2, 18) },
      { slug: "gladiolus-rag---scott-joplin---1907", sliceSpan: M(2, 18) },
      { slug: "the-cascades---scott-joplin---1904", sliceSpan: S(2) },
      { slug: "sugar-cane---scott-joplin---1908", sliceSpan: M(2, 18) },
      { slug: "leola-two-step---scott-joplin---1905", sliceSpan: M(2, 18) },
      { slug: "the-sycamore---scott-joplin---1904", sliceSpan: S(2) },
    ],
    corpus: "scott_joplin",
  },
  {
    slug: "second_sections_in_minor",
    slices: [
      {
        slug: "silver-swan-rag---scott-joplin---1914---transcribed-by-richard-zimmerman",
        sliceSpan: S(4),
      },
      { slug: "reflection-rag---scott-joplin---1917", sliceSpan: S(4) },
      // in 4/4, doesn't allow to slice correctly
      //   { slug: "magnetic-rag---scott-joplin---1914", sliceSpan: S(4) },
      {
        slug: "scott-joplin-s-new-rag---original-edition---1912",
        sliceSpan: S(4),
      },
    ],
    corpus: "scott_joplin",
  },
  {
    slug: "first_sections_as_periods_starting_on_I",
    slices: [
      {
        slug: "silver-swan-rag---scott-joplin---1914---transcribed-by-richard-zimmerman",
        sliceSpan: S(2),
      },
      {
        slug: "elite-syncopations---scott-joplin---1902",
        sliceSpan: S(2),
      },
      {
        slug: "weeping-willow---scott-joplin---1903",
        sliceSpan: S(2),
      },
      {
        slug: "country_club_ragtime_two_step_scott_joplin_1909",
        sliceSpan: S(2),
      },
      {
        slug: "the_ragtime_dance_scott_joplin_1906_arrangement",
        sliceSpan: S(2),
      },
      {
        slug: "Pine_Apple_Rag_-_Scott_Joplin_-_1908.mscz",
        sliceSpan: S(2),
      },
      {
        slug: "the_entertainer_scott_joplin",
        sliceSpan: S(2),
      },
      {
        slug: "sunflower-slow-drag---joplin-and-hayden---1901",
        sliceSpan: S(2),
      },
      {
        slug: "reflection-rag---scott-joplin---1917",
        sliceSpan: S(2),
      },
      {
        slug: "rose-leaf-rag---scott-joplin---1907",
        sliceSpan: S(2),
      },
      {
        slug: "search-light-rag---scott-joplin---c1907",
        sliceSpan: S(2),
      },
      {
        slug: "the-strenuous-life---scott-joplin---1902",
        sliceSpan: S(2),
      },
      {
        slug: "wall-street-rag---scott-joplin---1909",
        sliceSpan: S(2),
      },
      {
        slug: "peacherine-rag---scott-joplin---1901",
        sliceSpan: S(2),
      },
      {
        slug: "fig-leaf-rag---scott-joplin---1908",
        sliceSpan: S(2),
      },
      {
        slug: "original-rags---scott-joplin---1899",
        sliceSpan: S(2),
      },
      {
        slug: "paragon-rag---scott-joplin---1909",
        sliceSpan: S(2),
      },
      {
        slug: "euphonic-sounds---scott-joplin---1909",
        sliceSpan: S(2),
      },
      {
        slug: "scott-joplin-s-new-rag---original-edition---1912",
        sliceSpan: S(2),
      },
      {
        slug: "kismet-rag---joplin-and-hayden---1913",
        sliceSpan: S(2),
      },
      // incomplete
    ],
    corpus: "scott_joplin",
  },
  {
    slug: "cadences_in_first_periods_starting_on_I",
    slices: [
      {
        slug: "silver-swan-rag---scott-joplin---1914---transcribed-by-richard-zimmerman",
        sliceSpan: M(17, 21),
      },
      {
        slug: "elite-syncopations---scott-joplin---1902",
        sliceSpan: M(17, 21),
      },
      {
        slug: "weeping-willow---scott-joplin---1903",
        sliceSpan: M(17, 21),
      },
      {
        slug: "country_club_ragtime_two_step_scott_joplin_1909",
        sliceSpan: M(17, 21),
      },
      {
        slug: "the_ragtime_dance_scott_joplin_1906_arrangement",
        sliceSpan: M(17, 21),
      },
      {
        slug: "Pine_Apple_Rag_-_Scott_Joplin_-_1908.mscz",
        sliceSpan: M(17, 21),
      },
      {
        slug: "the_entertainer_scott_joplin",
        sliceSpan: M(17, 21),
      },
      {
        slug: "sunflower-slow-drag---joplin-and-hayden---1901",
        sliceSpan: M(17, 21),
      },
      {
        slug: "reflection-rag---scott-joplin---1917",
        sliceSpan: M(17, 21),
      },
      {
        slug: "rose-leaf-rag---scott-joplin---1907",
        sliceSpan: M(17, 21),
      },
      {
        slug: "search-light-rag---scott-joplin---c1907",
        sliceSpan: M(17, 21),
      },
      {
        slug: "the-strenuous-life---scott-joplin---1902",
        sliceSpan: M(17, 21),
      },
      {
        slug: "wall-street-rag---scott-joplin---1909",
        sliceSpan: M(17, 21),
      },
      {
        slug: "peacherine-rag---scott-joplin---1901",
        sliceSpan: M(17, 21),
      },
      {
        slug: "fig-leaf-rag---scott-joplin---1908",
        sliceSpan: M(17, 21),
      },
      {
        slug: "original-rags---scott-joplin---1899",
        sliceSpan: M(21, 25),
      },
      {
        slug: "paragon-rag---scott-joplin---1909",
        sliceSpan: M(17, 21),
      },
      {
        slug: "euphonic-sounds---scott-joplin---1909",
        sliceSpan: M(17, 21),
      },
      {
        slug: "scott-joplin-s-new-rag---original-edition---1912",
        sliceSpan: M(18, 22),
      },
    ],
    corpus: "scott_joplin",
  },
];

const UNIFIED_BPM = 70;

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

const getMeasuresAndBeats = (binaryMidi: Uint8Array): MeasuresAndBeats => {
  const midiFile = new MIDIFile(binaryMidi);
  const midiPlayer = new MIDIPlayer();
  const result = midiPlayer.load(midiFile);
  return result.measuresAndBeats;
};

async function extractSlice(
  slug: string,
  sliceSpan: SliceSpan,
  analyses: Analyses,
): Promise<MidiData> {
  const binaryMidi = await loadMidiFromSlug(slug);
  const analysis = analyses[`f/${slug}`];
  const measuresAndBeats = getMeasuresAndBeats(binaryMidi);
  const ticksMeasures = measuresAndBeats.ticks.measures;
  const phraseStarts = getPhraseStarts(
    analysis,
    measuresAndBeats.measures.length,
  );
  const sections = (analysis.sections ?? [0]).map(
    (sectionStartInPhrases, index) => {
      const { measures } = measuresAndBeats;
      const start = phraseStarts[sectionStartInPhrases] - 1;
      const end =
        (index + 1 < (analysis.sections ?? [0]).length
          ? phraseStarts[(analysis.sections ?? [0])[index + 1]]
          : measures.length) - 1;
      return [start, end];
    },
  );
  const measureSpan =
    sliceSpan.type === "singleSection"
      ? [sections[sliceSpan.section - 1][0], sections[sliceSpan.section - 1][1]]
      : [sliceSpan.measureSpan[0] - 1, sliceSpan.measureSpan[1] - 1];

  // TODO: extract sections , build phrases via getPhraseStarts, review Rawl

  const startTick = ticksMeasures[measureSpan[0]];
  const endTick = ticksMeasures[measureSpan[1]];

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

  return midiData;
}

console.log("MIDI file truncated successfully.");

const SliceStackView: React.FC<{
  playSongBuffer: (filepath: string, buffer: ArrayBuffer | Uint8Array) => void;
  analyses: Analyses;
  slug: string;
}> = ({ playSongBuffer, analyses, slug }) => {
  useEffect(() => {
    const asyncFunc = async () => {
      const midiFileArray: MidiData[] = await Promise.all(
        SLICE_STACKS.filter(
          ({ slug: slug_ }) => slug_ === slug,
        )?.[0].slices.map(({ slug, sliceSpan }) =>
          extractSlice(slug, sliceSpan, analyses),
        ),
      );

      const outputMidi = mergeMidiFiles(midiFileArray);

      setTimeout(() => playSongBuffer("slicer", transformMidi(outputMidi)), 0);
    };
    asyncFunc();
  }, []);
  return <div>SliceStack: {slug}. Save?</div>;
};

const SlicerLanding: React.FC<{}> = () => {
  return (
    <div>
      {SLICE_STACKS.map(({ slug, slices, corpus }) => (
        <div>
          <Link to={`/slicer/${slug}`}>
            {slug}, {slices.length}, for {corpus}
          </Link>
        </div>
      ))}
    </div>
  );
};

const Slicer: React.FC<{
  playSongBuffer: (filepath: string, buffer: ArrayBuffer | Uint8Array) => void;
  analyses: Analyses;
  slug: string;
}> = ({ playSongBuffer, analyses, slug }) => {
  return slug ? (
    <SliceStackView
      playSongBuffer={playSongBuffer}
      analyses={analyses}
      slug={slug}
    />
  ) : (
    <SlicerLanding />
  );
};

export default Slicer;
