import { HarmonyResult, measureAt, romanNumeral } from "./harmony";
import {
  Analysis,
  Modulations,
  PitchClass,
  getPhraseStarts,
} from "../components/rawl/analysis";

// Convert explicit inferred boundaries to Rawl's cumulative phrasePatch format.
// The final grid point is a sentinel, never a playable section boundary.
export function analysisProposal(
  result: HarmonyResult,
  measures: number[],
  minimumKeyConfidence = 0.6,
) {
  const last = measures.length;
  const starts = [
    ...new Set([
      1,
      ...result.phrases.map((b) => b.measure),
      ...result.sections.map((b) => b.measure),
    ]),
  ]
    .filter((m) => m >= 1 && m < last)
    .sort((a, b) => a - b);
  const targets = [...starts, last],
    phrasePatch: { measure: number; diff: number }[] = [];
  for (let i = 1; i < targets.length; i++) {
    const actual = getPhraseStarts({ phrasePatch } as any, last);
    const current = actual[i];
    if (current == null) break;
    const diff = targets[i] - current;
    if (diff) phrasePatch.push({ measure: current, diff });
  }
  const modulations: Modulations = { 1: null },
    modulationOnset: Record<number, number> = {};
  for (const key of result.inferredKeys)
    if (key.confidence >= minimumKeyConfidence) {
      modulations[key.measure] = key.tonic as PitchClass;
      modulationOnset[key.measure] = key.start;
    }
  return {
    modulations,
    modulationOnset,
    phrasePatch,
    sections: result.sections
      .map((b) => starts.indexOf(b.measure))
      .filter((i) => i >= 0),
  };
}

// The provisional score uses independent inference even when saved tonics
// guided a search hit. Keep chord labels and score colors on the same tonic.
export function provisionalHarmony(
  result: HarmonyResult,
  measures: number[],
): HarmonyResult {
  if (!result.inferredKeys.length) return result;
  const keys = result.inferredKeys;
  return {
    ...result,
    keys,
    chords: result.chords.flatMap((chord) => {
      const cuts = [
        chord.start,
        ...keys
          .filter((key) => key.start > chord.start && key.start < chord.end)
          .map((key) => key.start),
        chord.end,
      ];
      return cuts.slice(0, -1).map((start, i) => {
        const key =
          keys.filter((key) => key.start <= start + 1e-8).slice(-1)[0] ||
          keys[0];
        return {
          ...chord,
          start,
          end: cuts[i + 1],
          measure: measureAt(measures, start),
          tonic: key.tonic,
          keyConfidence: key.confidence,
          roman:
            chord.root == null
              ? "?"
              : romanNumeral(chord.root, chord.quality, key.tonic),
        };
      });
    }),
  };
}

export function provisionalScoreAnalysis(
  saved: Analysis,
  result: HarmonyResult,
  measures: number[],
): Analysis {
  if (!result.inferredKeys.length || !result.phrases.length) return saved;
  return {
    ...saved,
    // All estimated regions are visible in a preview, with uncertainty in the
    // ribbon. The downloadable proposal retains its confidence threshold.
    ...analysisProposal(result, measures, 0),
    sectionAnchors: undefined,
    form: {},
  };
}
