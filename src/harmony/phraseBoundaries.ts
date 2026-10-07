import modelData from "./phraseModel.json";
import type {
  Boundary,
  HarmonyGrid,
  HarmonyNote,
  HarmonyResult,
} from "./harmony";
import {
  phraseFeatures,
  PHRASE_FEATURE_NAMES,
  PHRASE_FEATURE_VERSION,
  withoutDrumFeatures,
} from "./phraseFeatures";

type TreeModel = { bias: number; trees: number[][][] };
type Decoder = {
  lengthWeight: number;
  boundaryBias: number;
  nonFourBarPenalty?: number;
  probabilityFloor?: number;
};
export const PHRASE_MODEL_VERSION = modelData.version;
export function treeProbability(features: number[], model: TreeModel): number {
  let score = model.bias;
  for (const tree of model.trees) {
    let node = tree[0];
    while (!node[5])
      node = tree[features[node[0]] <= node[1] ? node[2] : node[3]];
    score += node[4];
  }
  return 1 / (1 + Math.exp(-score));
}
export function decodePhraseBoundaries(
  probabilities: number[],
  count: number,
  decoder: Decoder,
  phraseLengths: Record<string, number>,
): number[] {
  const maximum = Math.max(1, ...Object.values(phraseLengths));
  const lengths = Array.from({ length: 33 }, (_, n) =>
    Math.log(0.002 + (phraseLengths[n] || 0) / maximum),
  );
  const costs = Array(count + 1).fill(-Infinity),
    back = Array(count + 1).fill(0);
  const floor = decoder.probabilityFloor ?? 0.001;
  costs[0] = 0;
  for (let end = 1; end <= count; end++) {
    for (let length = 1; length <= Math.min(32, end); length++) {
      const start = end - length;
      const p = Math.max(floor, Math.min(1 - floor, probabilities[start] ?? 0.25));
      const score =
        costs[start] +
        (start ? Math.log(p / (1 - p)) - decoder.boundaryBias : 0) +
        lengths[length] * decoder.lengthWeight -
        (length === 4 ? 0 : decoder.nonFourBarPenalty ?? 0);
      if (score > costs[end]) {
        costs[end] = score;
        back[end] = start;
      }
    }
  }
  const starts = [1];
  for (let end = count; end > 0; ) {
    const start = back[end];
    if (start) starts.push(start + 1);
    end = start;
  }
  return starts.sort((a, b) => a - b);
}
export function inferLearnedPhrases(
  notes: HarmonyNote[],
  grid: HarmonyGrid,
): Boundary[] {
  if (
    modelData.featureVersion !== PHRASE_FEATURE_VERSION ||
    modelData.featureNames.join("|") !== PHRASE_FEATURE_NAMES.join("|")
  )
    throw new Error("Phrase model feature schema mismatch.");
  const count = grid.measures.length - 1;
  if (
    count <= 0 ||
    grid.measures.some(
      (t, i) => !Number.isFinite(t) || (i > 0 && t <= grid.measures[i - 1]),
    )
  )
    return [];
  const hasDrums = notes.some(
    (n) => n.isDrum && Number.isFinite(n.start) && n.end > n.start,
  );
  const branch = hasDrums ? "teacher" : "student";
  const rows = phraseFeatures(notes, grid);
  const probabilities = rows.map((row) =>
    treeProbability(
      hasDrums ? row : withoutDrumFeatures(row),
      modelData[branch],
    ),
  );
  return decodePhraseBoundaries(
    probabilities,
    count,
    modelData.decoder[branch],
    modelData.phraseLengths,
  ).map((measure) => ({
    measure,
    time: grid.measures[measure - 1],
    strength: measure === 1 ? 1 : probabilities[measure - 1],
    evidence:
      measure === 1
        ? "start"
        : hasDrums
        ? "learned drum and pitched-voice phrase boundary"
        : "learned pitched-voice phrase boundary",
  }));
}
// Older chord/key sidecars remain useful. Upgrade only their phrase inference
// using the current MIDI, so a cached heuristic can never bypass the model.
export function refreshPhraseAnalysis(
  result: HarmonyResult,
  notes: HarmonyNote[],
  grid: HarmonyGrid,
): HarmonyResult {
  if (result.phraseModelVersion === PHRASE_MODEL_VERSION) return result;
  return {
    ...result,
    phrases: inferLearnedPhrases(notes, grid),
    phraseModelVersion: PHRASE_MODEL_VERSION,
  };
}
