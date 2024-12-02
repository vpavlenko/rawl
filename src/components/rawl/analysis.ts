import cloneDeep from "lodash/cloneDeep";
import { Note } from "./parseMidi";
import { SecondsSpan } from "./Rawl";
import { MeasuresAndBeats } from "./SystemLayout";

export const TIME_SCALE_FACTOR = 100;

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MeasuresSpan = [number, number]; // one-based numbering, last measure inclusive. [1, 8] is the first eight measures

export type Modulations = { [oneIndexedMeasureStart: number]: PitchClass };

export type MeasureRenumbering = {
  [oneIndexedMeasureStart: number]: PitchClass;
};

export type ManualMeasures = {
  measureStarts: { [oneIndexedMeasureStart: number]: number };
  beatsPerMeasure: { [oneIndexedMeasureStart: number]: number };
};

// Add this new type for delta-coded arrays
export type DeltaCoded<T extends number> = [T, ...number[]];

export interface CompressedNotes {
  [length: number]: {
    [midiNumber: number]: DeltaCoded<number>;
  };
}

export interface FrozenNotesType {
  notesInVoices: CompressedNotes[];
  analysis: FrozenAnalysis;
}

export interface Snippet {
  tag: string;
  frozenNotes: FrozenNotesType;
  measuresSpan: [number, number];
  secondsSpan?: SecondsSpan;
}

export type MidiNumberToNoteSpans = {
  [midiNumber: number]: SecondsSpan[];
};

export type FrozenAnalysis = {
  modulations: Modulations;
  measuresAndBeats: {
    measures: DeltaCoded<number>;
    beats: DeltaCoded<number>;
  };
};

export type FrozenNotes = {
  notesInVoices: MidiNumberToNoteSpans[]; // first dimension is voice
  analysis: FrozenAnalysis;
};

export type Analysis = {
  modulations: Modulations;
  phrasePatch?: { measure: number; diff: number }[];
  sections?: number[];
  measureRenumbering?: MeasureRenumbering;
  measures?: ManualMeasures;
  snippets?: Snippet[];

  // outdated, was used in winter 2023..24 for rock prototype
  comment: string;
  tags: string[];
  form: { [oneIndexedMeasureStart: number]: string };
};

export type Analyses = {
  [path: string]: Analysis;
};

export const ANALYSIS_STUB: Analysis = {
  modulations: { 1: null },
  comment: "",
  tags: [],
  form: [],
  phrasePatch: [],
  sections: [0], // in phrases
};

const removeIdleModulations = (modulations: Modulations): Modulations => {
  const sortedMeasures = Object.keys(modulations)
    .map(Number)
    .sort((a, b) => a - b);

  let lastValue = modulations[sortedMeasures[0]];
  const result: Modulations = { 1: lastValue };

  for (const measure of sortedMeasures.slice(1)) {
    const currentValue = modulations[measure];
    if (currentValue !== lastValue) {
      result[measure] = currentValue;
      lastValue = currentValue;
    }
  }

  return result;
};

export const getNewAnalysis = (
  note: Note | null,
  selectedMeasure: number | null,
  enableManualRemeasuring: boolean,
  analysis: Analysis,
): Analysis => {
  let update: Partial<Analysis> = {};

  if (note) {
    if (enableManualRemeasuring) {
      if (selectedMeasure) {
        update.measures = cloneDeep(analysis.measures) ?? {
          measureStarts: {},
          beatsPerMeasure: {},
        };
        update.measures.measureStarts[selectedMeasure] = note.span[0];
      }
    } else {
      // TODO: if !selectedMeasure, then only apply modulation if we're inside
      // the very first modulatory region (if there's already two)
      // This probably has a circular dependency since we probably need to
      // build measures to know where exactly our note falls.
      if (!selectedMeasure) {
        return analysis;
      }
      let newModulations = {
        ...(analysis.modulations || []),
        [selectedMeasure]: (note.note.midiNumber % 12) as PitchClass,
      };
      update.modulations = removeIdleModulations(newModulations);
    }
  }

  return { ...analysis, ...update };
};

export const advanceAnalysis = (
  note: Note | null,
  selectedMeasure: number | null,
  enableManualRemeasuring: boolean,
  selectMeasure: (_: null) => void,
  analysis: Analysis,
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void,
) => {
  const newAnalysis = getNewAnalysis(
    note,
    selectedMeasure,
    enableManualRemeasuring,
    analysis,
  );

  selectMeasure(null);
  commitAnalysisUpdate(newAnalysis);
};

// Add these utility functions for delta coding and decoding
export function deltaCoding(arr: number[]): DeltaCoded<number> {
  if (arr.length === 0) return [0];
  const result: DeltaCoded<number> = [arr[0]];
  for (let i = 1; i < arr.length; i++) {
    result.push(arr[i] - arr[i - 1]);
  }
  return result;
}

export function deltaDecoding(encoded: DeltaCoded<number>): number[] {
  const result: number[] = [encoded[0]];
  for (let i = 1; i < encoded.length; i++) {
    result.push(result[i - 1] + encoded[i]);
  }
  return result;
}

export function undeltaCoding(encoded: DeltaCoded<number>): number[] {
  return deltaDecoding(encoded);
}

export function adjustModulations(
  modulations: Modulations,
  measureStart: number,
): Modulations {
  return Object.fromEntries(
    Object.entries(modulations).map(([measure, tonic]) => [
      parseInt(measure) + measureStart - 1,
      tonic,
    ]),
  );
}

export const rehydrateNotes = (snippet: Snippet): Note[][] => {
  const { frozenNotes } = snippet;

  return frozenNotes.notesInVoices.map((voice, voiceIndex) => {
    const notes: Note[] = [];
    Object.entries(voice).forEach(([length, midiNumbers]) => {
      Object.entries(midiNumbers).forEach(([midiNumber, starts]) => {
        const decodedStarts = deltaDecoding(starts as DeltaCoded<number>);
        decodedStarts.forEach((start) => {
          const startTime = start / TIME_SCALE_FACTOR;
          const lengthTime = parseInt(length) / TIME_SCALE_FACTOR;
          const absoluteSpan: [number, number] = [
            startTime,
            startTime + lengthTime,
          ];
          notes.push({
            note: { midiNumber: parseInt(midiNumber) },
            id: notes.length + 1, // Unique ID for each note
            isDrum: false,
            span: absoluteSpan,
            voiceIndex,
          });
        });
      });
    });
    return notes;
  });
};

export function rehydrateAnalysis(
  frozenAnalysis: FrozenNotesType["analysis"],
  measureStart: number = 1,
): {
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
} {
  return {
    analysis: {
      modulations: adjustModulations(frozenAnalysis.modulations, measureStart),
      comment: "",
      tags: [],
      form: {},
    },
    measuresAndBeats: {
      measures: undeltaCoding(frozenAnalysis.measuresAndBeats.measures).map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
      beats: undeltaCoding(frozenAnalysis.measuresAndBeats.beats).map(
        (time) => time / TIME_SCALE_FACTOR,
      ),
    },
  };
}

export function rehydrateSnippet(snippet: Snippet): {
  rehydratedNotes: Note[][];
  rehydratedAnalysis: Analysis;
  rehydratedMeasuresAndBeats: MeasuresAndBeats;
} {
  const rehydratedNotes = rehydrateNotes(snippet);
  const {
    analysis: rehydratedAnalysis,
    measuresAndBeats: rehydratedMeasuresAndBeats,
  } = rehydrateAnalysis(snippet.frozenNotes.analysis, snippet.measuresSpan[0]);

  // Ensure modulations are properly adjusted
  rehydratedAnalysis.modulations = adjustModulations(
    snippet.frozenNotes.analysis.modulations,
    snippet.measuresSpan[0],
  );

  return {
    rehydratedNotes,
    rehydratedAnalysis,
    rehydratedMeasuresAndBeats,
  };
}

export function getSnippetTags(analysis: Analysis): string[] {
  return analysis.snippets?.flatMap((snippet) => snippet.tag.split(" ")) || [];
}

export const getPhraseStarts = (
  analysis: Analysis,
  numMeasures: number,
): number[] => {
  const result = [];
  let i;
  for (i = 1; i < numMeasures; i += 4) {
    result.push(i);
  }
  result.push(i);
  for (const { measure, diff } of analysis.phrasePatch || []) {
    if (result.indexOf(measure) === -1) {
      console.log(`bad phrasePatch, measure ${measure} not found`);
      break;
    }
    for (let j = result.indexOf(measure); j < result.length; ++j) {
      result[j] += diff;
    }
    while (result.at(-1) + 4 < numMeasures) {
      result.push(result.at(-1) + 4);
    }
    if (result[0] !== 1) {
      result.unshift(1);
    }
  }

  return result;
};

export function getSnippetsStartingAtMeasure(
  snippets: Snippet[],
  measure: number,
): string[] {
  return snippets
    .filter((snippet) => snippet.measuresSpan[0] === measure)
    .map((snippet) => snippet.tag);
}
