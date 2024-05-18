import minBy from "lodash/minBy";
import { MeasuresAndBeats } from "./SystemLayout";
import { ManualMeasures } from "./analysis";
import { Note } from "./parseMidi";

const snap = (time: number, notes: Note[]) =>
  minBy(notes, ({ span: [start] }) => Math.abs(time - start)).span[0];

export const buildManualMeasuresAndBeats = (
  manualMeasures: ManualMeasures,
  notes: Note[],
): MeasuresAndBeats => {
  const { measureStarts, beatsPerMeasure } = manualMeasures;
  const measures = [measureStarts[1] ?? 0];
  const beats = [];
  let currentBeatsPerMeasure = beatsPerMeasure[1] ?? 4;
  let previousBeatsPerMeasure = currentBeatsPerMeasure;
  let measureIndex = 1;
  let currentMeasureLength = 1.0;
  while (true) {
    measureIndex++;
    let newMeasure =
      measureStarts[measureIndex] ??
      snap(
        measures.at(-1) +
          (currentMeasureLength * currentBeatsPerMeasure) /
            previousBeatsPerMeasure,
        notes,
      );
    if (newMeasure - measures.at(-1) < 0.01) {
      newMeasure = measures.at(-1) + 2;
    }
    for (let i = 1; i < currentBeatsPerMeasure; ++i) {
      beats.push(
        (measures.at(-1) * (currentBeatsPerMeasure - i)) /
          currentBeatsPerMeasure +
          (newMeasure * i) / currentBeatsPerMeasure,
      );
    }
    previousBeatsPerMeasure = currentBeatsPerMeasure;
    currentBeatsPerMeasure =
      beatsPerMeasure[measureIndex] ?? currentBeatsPerMeasure;
    currentMeasureLength = newMeasure - measures.at(-1);
    measures.push(newMeasure);
    if (notes.every((note) => note.span[1] < newMeasure)) {
      break;
    }
  }
  return { measures, beats };
};
