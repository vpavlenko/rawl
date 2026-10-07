import model from "./versionModel.json";
import type { VersionSummary } from "./versionFeatures";
export type VersionRanker = {
  featureNames: string[];
  means?: number[];
  scales?: number[];
  weights?: number[];
  clip?: number;
  model?: { bias: number; trees: number[][][] };
};
export function scoreVersionFeatures(features: number[], model: VersionRanker) {
  if (
    features.length !== model.featureNames.length ||
    !features.every(Number.isFinite)
  )
    throw new Error("Invalid version feature vector");
  if (model.model) {
    let score = model.model.bias;
    for (const tree of model.model.trees) {
      let node = tree[0];
      while (!node[5])
        node = tree[features[node[0]] <= node[1] ? node[2] : node[3]];
      score += node[4];
    }
    return score;
  }
  return features.reduce(
    (score, x, i) =>
      score +
      model.weights[i] *
        Math.max(
          -model.clip,
          Math.min(model.clip, (x - model.means[i]) / model.scales[i]),
        ),
    0,
  );
}
export type VersionRankings = {
  modelVersion: string;
  byKey: Record<
    string,
    { score: number; midiHash: string; summary: VersionSummary }
  >;
};

// Manual choices lead. Rank the remaining readable files by the model, keeping
// catalog order for exact ties and putting files without scores at the end.
export function orderVersionKeys(
  keys: string[],
  rankings: VersionRankings | null,
  isAnnotated: (key: string) => boolean = () => false,
) {
  const positions = new Map(keys.map((key, i) => [key, i]));
  const score = (key: string) => rankings?.byKey[key]?.score;
  return [...keys].sort((a, b) => {
    const manual = Number(isAnnotated(b)) - Number(isAnnotated(a));
    if (manual) return manual;
    if (isAnnotated(a)) return positions.get(a)! - positions.get(b)!;
    const aScore = score(a),
      bScore = score(b);
    const aKnown = Number.isFinite(aScore),
      bKnown = Number.isFinite(bScore);
    return (
      Number(bKnown) - Number(aKnown) ||
      (aKnown && bKnown ? bScore! - aScore! : 0) ||
      positions.get(a)! - positions.get(b)!
    );
  });
}
let pending: Promise<VersionRankings> | undefined;
export function loadVersionRankings() {
  if (!pending)
    pending = fetch(`${process.env.PUBLIC_URL}/lakh-version-rankings.json.gz`)
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Version suggestions are unavailable.");
        const buffer = await response.arrayBuffer(),
          bytes = new Uint8Array(buffer);
        const rankings =
          bytes[0] === 31 && bytes[1] === 139
            ? await new Response(
                new Blob([buffer])
                  .stream()
                  .pipeThrough(new DecompressionStream("gzip")),
              ).json()
            : JSON.parse(new TextDecoder().decode(buffer));
        if (rankings.modelVersion !== model.version)
          throw new Error("Version suggestions need refreshing.");
        return rankings as VersionRankings;
      })
      .catch((error) => {
        pending = undefined;
        throw error;
      });
  return pending;
}
export function suggestedVersion(
  keys: string[],
  rankings: VersionRankings | null,
) {
  if (!rankings || keys.length < 2 || keys.some((key) => !rankings.byKey[key]))
    return undefined;
  const sorted = [...keys].sort(
    (a, b) =>
      rankings.byKey[b].score - rankings.byKey[a].score || a.localeCompare(b),
  );
  // Identical descriptions provide no evidence for choosing either file.
  if (
    Math.abs(
      rankings.byKey[sorted[0]].score - rankings.byKey[sorted[1]].score,
    ) < 1e-9
  )
    return undefined;
  return sorted[0];
}
export function versionSuggestionDescription(
  key: string,
  rankings: VersionRankings | null,
) {
  const summary = rankings?.byKey[key]?.summary;
  if (!summary) return "Estimated version preference";
  const vocal = {
    named: "Vocal part named in MIDI",
    lyrics: "Lyrics present in MIDI",
    melody: "Melodic part detected; vocal unverified",
    unverified: "Vocal part unverified",
  }[summary.vocal];
  return `${vocal} · ${
    summary.voices
  } voices · ${summary.notes.toLocaleString()} notes · ${Math.round(
    summary.quantizedShare * 100,
  )}% of pitched onsets near beat subdivisions. Automatic ranking; vocal identity, bar alignment and timbre are not verified.`;
}
