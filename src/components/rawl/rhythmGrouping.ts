import type { MeasuresAndBeats } from "./SystemLayout";

// One-based change points, just like beatsPerMeasure. [] restores every beat.
export type RhythmGrouping = Record<number, number[]>;

export { parseRhythmGrouping } from "librawl/components";

export function getRhythmGrouping(
  changes: RhythmGrouping | undefined,
  measure: number,
): number[] {
  const start = Object.keys(changes ?? {})
    .map(Number)
    .filter((start) => start <= measure)
    .sort((a, b) => b - a)[0];
  return changes?.[start] ?? [];
}

export function getGroupedBeatLines(
  { measures, beats }: MeasuresAndBeats,
  changes: RhythmGrouping | undefined,
): number[] {
  if (!changes || !Object.keys(changes).length) return beats;
  const result: number[] = [];
  let beatIndex = 0;
  for (let measure = 1; measure < measures.length; measure++) {
    const start = measures[measure - 1];
    const end = measures[measure];
    const interior: number[] = [];
    while (beatIndex < beats.length && beats[beatIndex] < end) {
      if (beats[beatIndex] > start) interior.push(beats[beatIndex]);
      beatIndex++;
    }
    const groups = getRhythmGrouping(changes, measure);
    // Grouping is independent of the visible grid: display metadata may hide
    // every beat by setting beatsPerMeasure to 1. Never change playback times.
    if (
      !groups.length ||
      groups.some((group) => !Number.isSafeInteger(group) || group <= 0)
    ) {
      result.push(...interior);
      continue;
    }
    const total = groups.reduce((sum, group) => sum + group, 0);
    if (!Number.isSafeInteger(total)) {
      result.push(...interior);
      continue;
    }
    let offset = 0;
    for (const group of groups.slice(0, -1)) {
      offset += group;
      result.push(
        total === interior.length + 1
          ? interior[offset - 1]
          : start + ((end - start) * offset) / total,
      );
    }
  }
  return result;
}

export function sliceRhythmGrouping(
  changes: RhythmGrouping | undefined,
  start: number,
  end: number,
): RhythmGrouping | undefined {
  if (!changes || !Object.keys(changes).length) return undefined;
  return Object.fromEntries([
    [1, getRhythmGrouping(changes, start)],
    ...Object.entries(changes)
      .filter(([measure]) => Number(measure) > start && Number(measure) <= end)
      .map(([measure, groups]) => [Number(measure) - start + 1, groups]),
  ]);
}
