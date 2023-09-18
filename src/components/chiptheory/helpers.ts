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

  if (analysis.firstMeasure) {
    measures.push(analysis.firstMeasure);
  }
  if (analysis.secondMeasure) {
    let previousMeasure = analysis.firstMeasure;
    let measureLength = analysis.secondMeasure - analysis.firstMeasure;

    for (let i = 2; i < 400; i++) {
      let newMeasure = null;
      if (
        analysis.correctedMeasures &&
        analysis.correctedMeasures[i]
      ) {
        newMeasure = analysis.correctedMeasures[i];
      } else {
        newMeasure = snapToSomeNoteOnset(
          previousMeasure + measureLength,
          notes,
        );
      }
      if (previousMeasure === newMeasure) break;
      measures.push(newMeasure);
      beats.push(previousMeasure * 0.75 + newMeasure * 0.25);
      beats.push(previousMeasure * 0.5 + newMeasure * 0.5);
      beats.push(previousMeasure * 0.25 + newMeasure * 0.75);
      // measureLength = newMeasure - previousMeasure // I'm not sure it improves anything
      previousMeasure = newMeasure;
      if (i === analysis.loop) {
        //   loopLeft = secondsToX(newMeasure);
        break;
      }
    }
  }
  return { measures, beats };
};
