import { Analysis, PitchClass } from "./Analysis";
import { Note, Span } from "./Chiptheory";

const getIntersectionTime = (i: Span, j: Span): number => {
  const [iStart, iEnd] = i;
  const [jStart, jEnd] = j;

  if (iEnd < jStart || jEnd < iStart) {
    return 0;
  }

  const startOverlap = Math.max(iStart, jStart);
  const endOverlap = Math.min(iEnd, jEnd);

  return endOverlap - startOverlap;
};

const sumPitchClassTimeInSpan = (
  pitchClass: PitchClass,
  span: Span,
  notes: Note[],
) => {
  let sum = 0;
  for (const note of notes) {
    if (note.note.midiNumber % 12 === pitchClass) {
      sum += getIntersectionTime(span, note.span);
    }
  }
  return sum;
};

const MINOR_CHORDS = [
  "i",
  "viio/ii",
  "ii",
  "biii",
  "iii",
  "iv",
  "viio/V",
  "v",
  "bvi",
  "vi",
  "vii",
  "viio",
];
const MAJOR_CHORDS = [
  "I",
  "bII",
  "V/V",
  "III",
  "V/vi",
  "IV",
  "#IV",
  "V",
  "VI",
  "V/ii",
  "VII",
  "#VII",
];

export const updateRomanNumerals = (
  analysis: Analysis,
  note: Note,
  notes: Note[],
  measures: number[],
) => {
  const noteMiddle = (note.span[0] + note.span[1]) / 2;
  const measureIndex = measures.findIndex((time) => time >= noteMiddle) - 1;
  const measureSpan: Span = [
    measures[measureIndex],
    measures[measureIndex + 1],
  ];

  const noteDegree = (note.note.midiNumber - analysis.tonic) % 12;
  const minorThirdWeight = sumPitchClassTimeInSpan(
    ((note.note.midiNumber + 3) % 12) as PitchClass,
    measureSpan,
    notes,
  );
  const majorThirdWeight = sumPitchClassTimeInSpan(
    ((note.note.midiNumber + 4) % 12) as PitchClass,
    measureSpan,
    notes,
  );
  const newRomanNumeral = (
    minorThirdWeight > majorThirdWeight ? MINOR_CHORDS : MAJOR_CHORDS
  )[noteDegree];

  const rnArray = (analysis.romanNumerals || "")
    .split(" ")
    .filter((s) => s !== "");
  if (rnArray.length > measureIndex) {
    rnArray[measureIndex] = newRomanNumeral;
  } else {
    while (rnArray.length < measureIndex) {
      rnArray.push("-");
    }
    rnArray.push(newRomanNumeral);
  }
  return rnArray.join(" ");
};
