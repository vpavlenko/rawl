import cloneDeep from "lodash/cloneDeep";
import { Note } from "./parseMidi";
import { SecondsSpan } from "./Rawl";

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
