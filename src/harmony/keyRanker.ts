import model from "./keyModel.json";
import type { HarmonyChord, HarmonyNote } from "./harmony";
const mod = (n: number) => ((n % 12) + 12) % 12;
export function tonalFeatures(
  notes: HarmonyNote[],
  chords: HarmonyChord[],
  start: number,
  end: number,
) {
  const groups = Array.from({ length: 5 }, () => Array(12).fill(0));
  for (const n of notes)
    if (!n.isDrum)
      groups[0][mod(n.pitch)] += Math.max(
        0,
        Math.min(end, n.end) - Math.max(start, n.start),
      );
  let last: HarmonyChord;
  for (const c of chords) {
    const duration = Math.max(
      0,
      Math.min(end, c.end) - Math.max(start, c.start),
    );
    if (!duration || c.root == null) continue;
    if (c.bass != null) groups[1][c.bass] += duration * c.confidence;
    const minor = ["min", "min7"].includes(c.quality),
      major = ["maj", "7", "maj7"].includes(c.quality);
    groups[minor ? 3 : 2][c.root] +=
      duration * c.confidence * (major || minor ? 1 : 0.35);
    last = c;
  }
  if (last) groups[4][last.root] = last.confidence;
  return groups.map((g) => {
    const total = g.reduce((a, b) => a + b, 0);
    return g.map((v) => v / Math.max(total, 1e-8));
  });
}
export function rotatedFeatures(groups: number[][], tonic: number) {
  return groups.flatMap((g) =>
    Array.from({ length: 12 }, (_, p) => g[mod(p + tonic)]),
  );
}
const profiles = [
  [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88],
  [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17],
];
export function profileScores(groups: number[][]) {
  const weights = groups[0],
    mean = weights.reduce((a, b) => a + b, 0) / 12,
    norm = Math.sqrt(weights.reduce((s, x) => s + (x - mean) ** 2, 0));
  return Array.from({ length: 24 }, (_, k) => {
    const profile = profiles[Math.floor(k / 12)],
      pm = profile.reduce((a, b) => a + b, 0) / 12;
    let dot = 0,
      pn = 0;
    for (let p = 0; p < 12; p++) {
      const value = profile[mod(p - k)] - pm;
      dot += (weights[p] - mean) * value;
      pn += value * value;
    }
    return (
      dot / Math.max(norm * Math.sqrt(pn), 1e-8) + 0.22 * groups[1][k % 12]
    );
  });
}
export function rankedTonics(groups: number[][]) {
  const scores = Array.from({ length: 12 }, (_, tonic) =>
    rotatedFeatures(groups, tonic).reduce(
      (s, x, i) => s + x * (model.weights[i] || 0),
      0,
    ),
  );
  const base = profileScores(groups);
  const combined = scores.map(
    (s, t) => Math.max(base[t], base[t + 12]) + (model.blend ?? 0.2) * s,
  );
  const peak = Math.max(...combined),
    weights = combined.map((s) => Math.exp((s - peak) / model.temperature)),
    sum = weights.reduce((a, b) => a + b, 0);
  return combined
    .map((score, tonic) => ({ tonic, score, confidence: weights[tonic] / sum }))
    .sort((a, b) => b.score - a.score);
}
export const hasKeyModel = model.weights.length === 60;
