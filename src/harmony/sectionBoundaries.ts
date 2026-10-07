import modelData from "./sectionModel.json";
import type {
  Boundary,
  HarmonyGrid,
  HarmonyNote,
  HarmonyResult,
} from "./harmony";
import {
  sectionFeatureContext,
  SECTION_FEATURE_NAMES,
  SECTION_FEATURE_VERSION,
} from "./sectionFeatures";
import {
  candidateSections,
  decodeSectionBoundaries,
  sectionTreeScore,
} from "./sectionDecoder";
import { refreshPhraseAnalysis } from "./phraseBoundaries";

export const SECTION_MODEL_VERSION = modelData.version;
export function inferLearnedSections(
  notes: HarmonyNote[],
  grid: HarmonyGrid,
): Boundary[] {
  if (
    modelData.featureVersion !== SECTION_FEATURE_VERSION ||
    modelData.featureNames.join("|") !== SECTION_FEATURE_NAMES.join("|")
  )
    throw new Error("Section model feature schema mismatch.");
  const count = grid.measures.length - 1;
  if (
    count <= 0 ||
    grid.measures.some(
      (t, i) => !Number.isFinite(t) || (i && t <= grid.measures[i - 1]),
    )
  )
    return [];
  const context = sectionFeatureContext(notes, grid);
  const scores = candidateSections(count).map(([start, end]) => ({
    start,
    end,
    score: sectionTreeScore(context.features(start, end), modelData.model),
  }));
  const starts = decodeSectionBoundaries(
    scores,
    count,
    modelData.decoder,
    modelData.lengthCounts,
  );
  const bySpan = new Map(scores.map((s) => [`${s.start}:${s.end}`, s.score]));
  return starts.map((measure, i) => ({
    measure,
    time: grid.measures[measure - 1],
    strength: i
      ? 1 / (1 + Math.exp(-bySpan.get(`${starts[i - 1] - 1}:${measure - 1}`)!))
      : 1,
    evidence: i
      ? "learned section span: note overlap, length and first/last-bar events (score, not calibrated boundary probability)"
      : "start",
  }));
}
// Upgrade old harmonic sidecars on opening a MIDI. Keep chord/key inference
// and manual annotations separate from the structural model versions.
export function refreshStructuralAnalysis(
  result: HarmonyResult,
  notes: HarmonyNote[],
  grid: HarmonyGrid,
): HarmonyResult {
  const phrases = refreshPhraseAnalysis(result, notes, grid);
  if (phrases.sectionModelVersion === SECTION_MODEL_VERSION) return phrases;
  return {
    ...phrases,
    sections: inferLearnedSections(notes, grid),
    sectionModelVersion: SECTION_MODEL_VERSION,
  };
}
