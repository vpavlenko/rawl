import { Note } from "./parseMidi";

export const STEPS = [
  "tonic",
  "first measure",
  "second measure",
  "end",
] as const;

export type Step = (typeof STEPS)[number];

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type MeasuresSpan = [number, number]; // one-based numbering, last measure inclusive. [1, 8] is the first eight measures
export type TagSpan = {
  tag: string;
  span: MeasuresSpan;
  voices?: number[];
};

export type Analysis = {
  step: Step;
  firstMeasure: number;
  secondMeasure: number;
  correctedMeasures: { [key: number]: number };
  fourMeasurePhrasingReferences: number[];
  beatsPerMeasure: number;
  loop: number | null;
  tonic: PitchClass | null;
  modulations: { [key: number]: PitchClass };
  basedOn: string;
  romanNumerals?: string;
  comment: string;
  tags: string[];
  disableSnapToNotes: boolean;
  form?: { [key: number]: string };
  tagSpans?: TagSpan[];
};

// export type AnalysisV2 = {
//   beatAdjustments: BeatAdjustments;
//   tonics: Tonics;
// };

export const ANALYSIS_STUB: Analysis = {
  step: STEPS[0],
  firstMeasure: null,
  secondMeasure: null,
  correctedMeasures: [],
  fourMeasurePhrasingReferences: [],
  modulations: {},
  beatsPerMeasure: 4,
  loop: null,
  tonic: null,
  basedOn: null,
  romanNumerals: "",
  comment: "",
  tags: [],
  disableSnapToNotes: false,
  form: [],
};

export const getNewAnalysis = (
  note: Note | null,
  selectedMeasure: number | null,
  analysis: Analysis,
  time: number = null,
  notes: Note[] = [],
  measures: number[] = [],
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
    } else {
      update.correctedMeasures = { ...(analysis.correctedMeasures || []) };
      update.correctedMeasures[selectedMeasure] = note?.span[0] ?? time;
    }
  } else {
    const { step } = analysis;
    if (step !== "end") {
      update.step = "end";
    }

    if (step === "first measure") {
      update.firstMeasure = note.span[0];
    } else if (step === "second measure") {
      update.secondMeasure = note.span[0];
    } else if (step === "tonic") {
      update.tonic = (note.note.midiNumber % 12) as PitchClass;
    } else if (step === "end") {
      //   update.romanNumerals = updateRomanNumerals(
      //     analysis,
      //     note,
      //     notes,
      //     measures,
      //     altKey,
      //   );
    }
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
  notes: Note[] = [],
  measures: number[] = [],
  altKey: boolean = false,
) => {
  const newAnalysis = getNewAnalysis(
    note,
    selectedMeasure,
    analysis,
    time,
    notes,
    measures,
    altKey,
  );

  selectMeasure(null);
  commitAnalysisUpdate(newAnalysis);
};
