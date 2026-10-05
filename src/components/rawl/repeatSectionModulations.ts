import {
  Analysis,
  getPhraseStarts,
  ModulationOnset,
  Modulations,
} from "./analysis";

// Each section starts a fresh cycle. Short sections clip it without shifting later sections.
export function repeatSectionModulations(
  analysis: Analysis,
  measures: number[],
  selectedMeasure: number | null,
): Pick<Analysis, "modulations" | "modulationOnset"> | null {
  const phrases = getPhraseStarts(analysis, measures.length);
  const starts = (analysis.sections ?? [0])
    .map((phrase) => phrases[phrase])
    .filter((start) => start >= 1 && start < measures.length)
    .sort((a, b) => a - b);
  const section = starts.indexOf(selectedMeasure);
  if (section < 0 || section + 1 >= starts.length) return null;
  const start = starts[section];
  const end = starts[section + 1];
  const length = end - start;
  const entries = Object.entries(analysis.modulations)
    .map(([measure, tonic]) => ({ measure: Number(measure), tonic }))
    .filter(({ tonic }) => tonic != null)
    .sort((a, b) => a.measure - b.measure);
  const initialTonic = entries.filter(({ measure }) => measure <= start).at(-1)
    ?.tonic;
  if (initialTonic == null) return null;
  const pattern = [
    { measure: start, tonic: initialTonic },
    ...entries.filter(({ measure }) => measure > start && measure < end),
  ];
  const modulations: Modulations = Object.fromEntries(
    Object.entries(analysis.modulations).filter(
      ([measure]) => Number(measure) < end,
    ),
  );
  const modulationOnset: ModulationOnset = Object.fromEntries(
    Object.entries(analysis.modulationOnset ?? {}).filter(
      ([measure]) => Number(measure) < end,
    ),
  );
  for (
    let destination = section + 1;
    destination < starts.length;
    destination++
  ) {
    const destinationEnd = starts[destination + 1] ?? measures.length;
    for (
      let cycle = starts[destination];
      cycle < destinationEnd;
      cycle += length
    ) {
      for (const event of pattern) {
        const target = cycle + event.measure - start;
        if (target >= destinationEnd) break;
        modulations[target] = event.tonic;
        const onset = analysis.modulationOnset?.[event.measure];
        if (onset == null) continue;
        // Preserve the onset's fraction of its bar, including anticipations in the previous bar.
        const sourceIndex = event.measure - 1;
        const targetIndex = target - 1;
        const anticipation = onset < measures[sourceIndex];
        const sourceBar = anticipation ? sourceIndex - 1 : sourceIndex;
        const targetBar = anticipation ? targetIndex - 1 : targetIndex;
        const sourceDuration = measures[sourceBar + 1] - measures[sourceBar];
        if (sourceBar < 0 || targetBar < 0 || sourceDuration <= 0) continue;
        const fraction = (onset - measures[sourceBar]) / sourceDuration;
        modulationOnset[target] =
          measures[targetBar] +
          fraction * (measures[targetBar + 1] - measures[targetBar]);
      }
    }
  }
  return { modulations, modulationOnset };
}
