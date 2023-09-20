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

const SIMPLE_RN_TO_CHROMATIC_DEGREE = {
  I: 0,
  bII: 1,
  II: 2,
  III: 3, // obviously will fail in minor mode
  IV: 5,
  V: 7,
  VI: 8,
  VII: 10,
  i: 0,
  ii: 2,
  iii: 4, // obviously will fail in minor mode
  iv: 5,
  v: 7,
  vi: 9,
  vii: 11,
};

export const romanNumeralToChromaticDegree = (romanNumeral: string): number => {
  if (typeof romanNumeral !== "string" || romanNumeral.length === 0) return -1;
  if (romanNumeral[romanNumeral.length - 1].match(/\d|o|ø/)) {
    romanNumeral = romanNumeral.slice(0, -1);
  }
  const [applied, to] = romanNumeral.split("/");
  if (to) {
    if (applied.startsWith("V")) {
      return (SIMPLE_RN_TO_CHROMATIC_DEGREE[to] + 7) % 12;
    }
    // viio/
    return (SIMPLE_RN_TO_CHROMATIC_DEGREE[to] + 11) % 12;
  }
  return SIMPLE_RN_TO_CHROMATIC_DEGREE[romanNumeral];
};
