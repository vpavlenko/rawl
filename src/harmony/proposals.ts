import { HarmonyResult } from "./harmony";
import { getPhraseStarts } from "../components/rawl/analysis";

// Convert explicit inferred boundaries to Rawl's cumulative phrasePatch format.
// The final grid point is a sentinel, never a playable section boundary.
export function analysisProposal(result: HarmonyResult, measures: number[]) {
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
  const modulations: Record<number, number> = { 1: null },
    modulationOnset: Record<number, number> = {};
  for (const key of result.inferredKeys)
    if (key.confidence >= 0.6) {
      modulations[key.measure] = key.tonic;
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
