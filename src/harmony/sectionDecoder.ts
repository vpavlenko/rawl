import { SECTION_LENGTHS } from "./sectionFeatures";
export type SectionTreeModel = { bias: number; trees: number[][][] };
export type SectionDecoder = { sectionBias: number; lengthWeight: number };
export type SectionScore = { start: number; end: number; score: number };
export function sectionTreeScore(features: number[], model: SectionTreeModel) {
  let score = model.bias;
  for (const tree of model.trees) {
    let node = tree[0];
    while (!node[5])
      node = tree[features[node[0]] <= node[1] ? node[2] : node[3]];
    score += node[4];
  }
  return Math.max(-8, Math.min(8, score));
}
export function candidateSections(count: number): [number, number][] {
  const result: [number, number][] = [];
  for (let end = 1; end <= count; end++) {
    for (const length of SECTION_LENGTHS)
      if (length <= end) result.push([end - length, end]);
    // The last row may include a long coda/tail. Never force artificial cuts
    // solely because it exceeds the internal candidate-length limit.
    if (end === count)
      for (let start = 0; start < count; start++)
        if (!SECTION_LENGTHS.includes(count - start)) result.push([start, end]);
  }
  return result;
}
export function decodeSectionBoundaries(
  scores: SectionScore[],
  count: number,
  decoder: SectionDecoder,
  lengthCounts: Record<string, number>,
): number[] {
  if (!count) return [];
  const maximum = Math.max(1, ...Object.values(lengthCounts));
  const costs = Array(count + 1).fill(-Infinity),
    back = Array(count + 1).fill(-1);
  costs[0] = 0;
  // Scorer rows are sorted by end. DP selects a complete, non-overlapping
  // partition; probabilities are candidate-span scores, not calibrated
  // probabilities of the globally selected boundaries.
  for (const row of scores) {
    const length = row.end - row.start;
    const prior = Math.log(0.002 + (lengthCounts[length] || 0) / maximum);
    const score =
      costs[row.start] +
      row.score -
      decoder.sectionBias +
      decoder.lengthWeight * prior * (row.end === count ? 0.25 : 1);
    if (score > costs[row.end]) {
      costs[row.end] = score;
      back[row.end] = row.start;
    }
  }
  const starts = [1];
  for (let end = count; end > 0; ) {
    const start = back[end];
    if (start < 0) throw new Error("Section decoder has no complete partition");
    if (start) starts.push(start + 1);
    end = start;
  }
  return starts.sort((a, b) => a - b);
}
