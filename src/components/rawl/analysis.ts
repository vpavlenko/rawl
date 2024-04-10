import { Note } from "./parseMidi";

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MeasuresSpan = [number, number]; // one-based numbering, last measure inclusive. [1, 8] is the first eight measures
export type TagSpan = {
  tag: string;
  span: MeasuresSpan;
  voices?: number[];
};

export type Modulations = { [oneIndexedMeasureStart: number]: PitchClass };

// TODO: refactor to move tonic into modulations[0]
export type Analysis = {
  tonic: PitchClass | null;
  modulations: Modulations;
  comment: string;
  tags: string[];
  form: { [oneIndexedMeasureStart: number]: string };
  phrasePatch: { measure: number; diff: number }[];
  sections?: number[];
};

export type Corpus = {
  [artist: string]: {
    [song: string]: {
      [zeroLiteral: string]: Analysis;
    };
  };
};

export const ANALYSIS_STUB: Analysis = {
  modulations: {},
  tonic: null,
  comment: "",
  tags: [],
  form: [],
  phrasePatch: [],
  sections: [0], // in phrases
};

const removeIdleModulations = (
  tonic: PitchClass,
  modulations: Modulations,
): Modulations => {
  const result: Modulations = {};
  let lastValue = tonic;

  const sortedMeasures = Object.keys(modulations)
    .map(Number)
    .sort((a, b) => a - b);

  for (const measure of sortedMeasures) {
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
  analysis: Analysis,
): Analysis => {
  let update: Partial<Analysis> = {};

  if (selectedMeasure !== null) {
    if (note) {
      let newModulations = {
        ...(analysis.modulations || []),
        [selectedMeasure]: (note.note.midiNumber % 12) as PitchClass,
      };
      update.modulations = removeIdleModulations(
        analysis.tonic,
        newModulations,
      );
    }
  } else {
    update.tonic = (note.note.midiNumber % 12) as PitchClass;
  }

  return { ...analysis, ...update };
};

export const advanceAnalysis = (
  note: Note | null,
  selectedMeasure: number | null,
  selectMeasure: (_: null) => void,
  analysis: Analysis,
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void,
) => {
  const newAnalysis = getNewAnalysis(note, selectedMeasure, analysis);

  selectMeasure(null);
  commitAnalysisUpdate(newAnalysis);
};
