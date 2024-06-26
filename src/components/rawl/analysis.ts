import cloneDeep from "lodash/cloneDeep";
import { Note } from "./parseMidi";

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MeasuresSpan = [number, number]; // one-based numbering, last measure inclusive. [1, 8] is the first eight measures
export type TagSpan = {
  tag: string;
  span: MeasuresSpan;
  voices?: number[];
};

export type Modulations = { [oneIndexedMeasureStart: number]: PitchClass };
export type MeasureRenumbering = {
  [oneIndexedMeasureStart: number]: PitchClass;
};

export type ManualMeasures = {
  measureStarts: { [oneIndexedMeasureStart: number]: number };
  beatsPerMeasure: { [oneIndexedMeasureStart: number]: number };
};

// TODO: refactor to move tonic into modulations[0]
export type Analysis = {
  modulations: Modulations;
  comment: string;
  tags: string[];
  form: { [oneIndexedMeasureStart: number]: string };
  phrasePatch?: { measure: number; diff: number }[];
  sections?: number[];
  measureRenumbering?: MeasureRenumbering;
  measures?: ManualMeasures;
};

export type Corpus = {
  [path: string]: Analysis;
};

export const ANALYSIS_STUB: Analysis = {
  modulations: { 0: null },
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
  const result: Modulations = { 0: lastValue };

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
      let newModulations = {
        ...(analysis.modulations || []),
        [selectedMeasure ?? 0]: (note.note.midiNumber % 12) as PitchClass,
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
