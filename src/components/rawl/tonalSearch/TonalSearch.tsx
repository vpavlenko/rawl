import { Analysis } from "../analysis";
import { Note } from "../parseMidi";
import { getTonic } from "../Rawl";

export type TonalHistogram = number[];

export const calculateTonalHistograms = (
  notes: Note[],
  measures: number[],
  analysis: Analysis,
): TonalHistogram[] => {
  const histograms: TonalHistogram[] = [];

  for (let i = 0; i < measures.length - 1; i++) {
    const measureStart = measures[i];
    const measureEnd = measures[i + 1];
    const histogram = new Array(12).fill(0);

    notes.forEach((note) => {
      const [noteStart, noteEnd] = note.span;
      const overlapStart = Math.max(noteStart, measureStart);
      const overlapEnd = Math.min(noteEnd, measureEnd);

      if (overlapStart < overlapEnd) {
        const overlapDuration = overlapEnd - overlapStart;
        const tonic = getTonic(i, analysis);
        const pitchClass = (note.note.midiNumber - tonic + 12) % 12;
        histogram[pitchClass] += overlapDuration;
      }
    });

    // Normalize the histogram
    const total = histogram.reduce((sum, value) => sum + value, 0);
    const normalizedHistogram =
      total > 0
        ? histogram.map((value) => value / total)
        : new Array(12).fill(1 / 12);

    histograms.push(normalizedHistogram);
  }

  return histograms;
};
