import { Analysis } from "./Analysis";
import { Note } from "./Chiptheory";

export type MeasuresAndBeats = {
  measures: number[];
  beats: number[];
};

const snapToSomeNoteOnset = (second: number, notes: Note[]): number => {
  let closestDiff = Infinity;
  let closestNoteOn = null;
  for (const note of notes) {
    const currentDiff = Math.abs(second - note.span[0]);
    if (currentDiff < closestDiff) {
      closestNoteOn = note.span[0];
      closestDiff = currentDiff;
    }
  }
  return closestNoteOn;
};

export const calculateMeasuresAndBeats = (
  analysis: Analysis,
  notes: Note[],
): MeasuresAndBeats => {
  let measures = [];
  let beats = [];

  if (analysis.firstMeasure !== null) {
    measures.push(analysis.firstMeasure);
  }
  if (analysis.secondMeasure !== null) {
    let previousMeasure = analysis.firstMeasure;
    let measureLength = analysis.secondMeasure - analysis.firstMeasure;

    for (let i = 2; i < 400; i++) {
      let newMeasure = null;
      if (analysis.correctedMeasures && analysis.correctedMeasures[i]) {
        newMeasure = analysis.correctedMeasures[i];
      } else {
        newMeasure = analysis.disableSnapToNotes
          ? previousMeasure + measureLength
          : snapToSomeNoteOnset(previousMeasure + measureLength, notes);
      }
      if (previousMeasure === newMeasure) break;
      measures.push(newMeasure);
      measureLength = newMeasure - previousMeasure;
      previousMeasure = newMeasure;
      if (i === analysis.loop) {
        break;
      }
    }
  }
  if (measures.length > 2) {
    // Fix last measure
    measures.pop();
    const lastLength =
      measures[measures.length - 1] - measures[measures.length - 2];
    measures.push(measures[measures.length - 1] + lastLength);
  }
  const beatsPerMeasure = analysis.beatsPerMeasure || 4;
  for (let i = 0; i < measures.length - 1; ++i) {
    const from = measures[i];
    const to = measures[i + 1];
    for (let j = 1; j < beatsPerMeasure; ++j) {
      beats.push(
        (from * (beatsPerMeasure - j)) / beatsPerMeasure +
          (to * j) / beatsPerMeasure,
      );
    }
  }
  return { measures, beats };
};

export const getPhrasingMeasures = (
  analysis: Analysis,
  numMeasures: number,
): number[] => {
  if ((analysis.fourMeasurePhrasingReferences?.length ?? 0) > 1) {
    return analysis.fourMeasurePhrasingReferences;
  }
  const fourMeasurePhrasingStart =
    analysis.fourMeasurePhrasingReferences?.[0] ?? 1;
  const result = [];
  for (let i = fourMeasurePhrasingStart; i < numMeasures; i += 4) {
    result.push(i);
  }
  return result;
};
