import type { Analysis, ManualMeasures } from "../analysis";
import type { RhythmGrouping } from "../rhythmGrouping";
import groupingData from "./grouping.json";

type CatalogGrouping = {
  measures: number;
  groups: RhythmGrouping;
  manual?: ManualMeasures;
};

const catalog: Record<string, CatalogGrouping> = groupingData;

const sameGrid = (actual?: ManualMeasures, reference?: ManualMeasures) =>
  actual === reference ||
  (actual &&
    reference &&
    JSON.stringify(actual.measureStarts) ===
      JSON.stringify(reference.measureStarts) &&
    JSON.stringify(actual.beatsPerMeasure) ===
      JSON.stringify(reference.beatsPerMeasure));

export function getCatalogGrouping(slug: string): RhythmGrouping | undefined {
  return catalog[slug]?.groups;
}

export function applyHoroGrouping(
  analysis: Analysis,
  slug: string,
  measureCount: number,
  embedded: RhythmGrouping | undefined,
): Analysis {
  if (analysis.rhythmGrouping !== undefined) return analysis;
  const entry = catalog[slug];
  const fallback =
    embedded && !analysis.measures
      ? embedded
      : entry &&
        sameGrid(analysis.measures, entry.manual) &&
        (entry.manual || entry.measures === measureCount)
      ? entry.groups
      : undefined;
  return fallback ? { ...analysis, rhythmGrouping: fallback } : analysis;
}
