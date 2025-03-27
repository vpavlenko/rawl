// The simplest possible algorithm:
// Count all pitched midi events, find a fifth where min count of two notes
// will be the highest

import { MeasuresAndBeats } from "./SystemLayout";
import { PitchClass } from "./analysis";
import { Note } from "./parseMidi";

export const findTonic = (notes: Note[]): PitchClass | -1 => {
  const countPitchClasses = [];
  for (let i = 0; i < 12; ++i) {
    countPitchClasses.push(0);
  }
  notes.forEach(
    (note) =>
      (countPitchClasses[note.note.midiNumber % 12] +=
        note.span[1] - note.span[0]),
  );
  let bestTonic = -1;
  let bestValue = -Infinity;
  const scores = [];
  for (let i = 0; i < 12; ++i) {
    const currentValue =
      1.5 * countPitchClasses[i] +
      0.7 * countPitchClasses[(i + 4) % 12] +
      countPitchClasses[(i + 7) % 12] -
      5 *
        Math.min(
          countPitchClasses[(i + 3) % 12],
          countPitchClasses[(i + 4) % 12],
        ) -
      20 * countPitchClasses[(i + 1) % 12] -
      7 * countPitchClasses[(i + 6) % 12];

    scores.push(currentValue);
    if (currentValue > bestValue) {
      bestTonic = i;
      bestValue = currentValue;
    }
  }
  console.log("count", countPitchClasses);
  console.log("scores", scores);
  console.log("bestValue", bestValue);
  console.log("bestTonic", bestTonic);
  return bestTonic as PitchClass | -1;
};

export const findFirstPhraseStart = (
  notes: Note[],
  measuresAndBeats: MeasuresAndBeats,
): number => {
  let result = -1;
  const { measures, beats } = measuresAndBeats;
  // Find left-most note with pitch. If it's on beat 1, that's the measure. Otherwise it's anacrusis.
  let earliestOnset = Math.min(
    ...notes.filter((note) => !note.isDrum).map((note) => note.span[0]),
  );

  while (result + 1 < measures.length) {
    if (earliestOnset < measures[result + 1]) {
      break;
    }
    result++;
  }
  if (
    earliestOnset > measures[result] * 0.75 + measures[result + 1] * 0.25 ||
    beats.filter(
      (beat) => beat > measures[result] && beat < measures[result + 1],
    ).length <
      beats.filter(
        (beat) => beat > measures[result + 1] && beat < measures[result + 2],
      ).length
  ) {
    result++;
  }
  return result;
};
