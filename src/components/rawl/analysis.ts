import { Note } from "./parseMidi";

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MeasuresSpan = [number, number]; // one-based numbering, last measure inclusive. [1, 8] is the first eight measures
export type TagSpan = {
  tag: string;
  span: MeasuresSpan;
  voices?: number[];
};

export type Analysis = {
  tonic: PitchClass | null;
  modulations: { [key: number]: PitchClass };
  comment: string;
  tags: string[];
  form: { [key: number]: string };
  phrasePatch: { measure: number; diff: number }[];
};

export const ANALYSIS_STUB: Analysis = {
  modulations: {},
  tonic: null,
  comment: "",
  tags: [],
  form: [],
  phrasePatch: [],
};

export const getNewAnalysis = (
  note: Note | null,
  selectedMeasure: number | null,
  analysis: Analysis,
  time: number = null,
  altKey: boolean = false,
): Analysis => {
  let update: Partial<Analysis> = {};

  if (selectedMeasure !== null) {
    if (altKey) {
      if (note) {
        update.modulations = { ...(analysis.modulations || []) };
        update.modulations[selectedMeasure] = (note.note.midiNumber %
          12) as PitchClass;
        // TODO: if the next modulation is the same pitch class, we should remove the next one
      }
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
  time: number = null,
  altKey: boolean = false,
) => {
  const newAnalysis = getNewAnalysis(
    note,
    selectedMeasure,
    analysis,
    time,
    altKey,
  );

  selectMeasure(null);
  commitAnalysisUpdate(newAnalysis);
};
