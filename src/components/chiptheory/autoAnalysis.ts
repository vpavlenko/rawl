// The simplest possible algorithm:
// Count all pitched midi events, find a fifth where min count of two notes
// will be the highest

import { PitchClass } from "./analysis";
import { MeasuresAndBeats } from "./measures";
import { Note } from "./noteParsers";

export const findTonic = (notes: Note[]): PitchClass | -1 => {
  const countPitchClasses = [];
  for (let i = 0; i < 12; ++i) {
    countPitchClasses.push(0);
  }
  notes.forEach((note) => countPitchClasses[note.note.midiNumber % 12]++);
  let bestTonic = -1;
  let bestValue = 0;
  for (let i = 0; i < 12; ++i) {
    const currentValue = Math.min(
      countPitchClasses[i],
      countPitchClasses[(i + 7) % 12],
    );
    if (currentValue > bestValue) {
      bestTonic = i;
      bestValue = currentValue;
    }
  }
  console.log("count", countPitchClasses);
  console.log("bestValue", bestValue);
  console.log("bestTonic", bestTonic);
  return bestTonic as PitchClass | -1;
};

export const findPhrasingStart = (
  notes: Note[],
  measuresAndBeats: MeasuresAndBeats,
): number => {
  let result = -1;
  const { measures } = measuresAndBeats;
  // Find left-most note with pitch. If it's on beat 1, that's the measure. Otherwise it's anacrusis.
  let earliestOnset = Math.min(...notes.map((note) => note.span[0]));

  while (result + 1 < measures.length) {
    if (earliestOnset < measures[result + 1]) {
      break;
    }
    result++;
  }
  if (earliestOnset > measures[result] * 0.75 + measures[result + 1] * 0.25) {
    result++;
  }
  return result;
};