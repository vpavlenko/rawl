import * as React from "react";
import { Link } from "react-router-dom";
import { SecondsSpan } from "./Chiptheory";
import { Analysis, MeasuresSpan, PitchClass } from "./analysis";
import { getPhrasingMeasures } from "./measures";
import { Note } from "./noteParsers";

const getIntersectionTime = (i: SecondsSpan, j: SecondsSpan): number => {
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
  span: SecondsSpan,
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
  "bvii",
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
const POWER_CHORDS = [
  "I5",
  "bII5",
  "II5",
  "III5",
  "#III5",
  "IV5",
  "#IV5",
  "V5",
  "VI5",
  "#VI5",
  "VII5",
  "#VII5",
];
export const TWELVE_CHORD_TONES = [
  "•",
  "♭",
  "2",
  "Ⅲ",
  "3",
  "4",
  "T",
  "5",
  "+",
  "6",
  "7",
  "▵",
];

export const updateRomanNumerals = (
  analysis: Analysis,
  note: Note,
  notes: Note[],
  measures: number[],
  isHalfMeasure: boolean,
) => {
  const noteMiddle = (note.span[0] + note.span[1]) / 2;
  const measureIndex = measures.findIndex((time) => time >= noteMiddle) - 1;
  const measureSpan: SecondsSpan = [
    measures[measureIndex],
    measures[measureIndex + 1],
  ];
  const measureMiddle = measureSpan[0] * 0.5 + measureSpan[1] * 0.5;
  const span: SecondsSpan = isHalfMeasure
    ? noteMiddle < measureMiddle
      ? [measureSpan[0], measureMiddle]
      : [measureMiddle, measureSpan[1]]
    : measureSpan;

  const tonic = getTonic(measureIndex, analysis);
  const noteDegree = (note.note.midiNumber - tonic) % 12;
  const minorThirdWeight = sumPitchClassTimeInSpan(
    ((note.note.midiNumber + 3) % 12) as PitchClass,
    span,
    notes,
  );
  const majorThirdWeight = sumPitchClassTimeInSpan(
    ((note.note.midiNumber + 4) % 12) as PitchClass,
    span,
    notes,
  );
  const newRomanNumeral = (
    minorThirdWeight > majorThirdWeight
      ? MINOR_CHORDS
      : majorThirdWeight === 0
      ? POWER_CHORDS
      : MAJOR_CHORDS
  )[noteDegree];

  const rnArray = romanNumeralsToArray(analysis.romanNumerals);

  while (rnArray.length <= measureIndex) {
    rnArray.push("_");
  }
  if (isHalfMeasure) {
    const dashedRN = dashedRnToArray(rnArray[measureIndex]);
    if (dashedRN.length < 2) {
      dashedRN.push(dashedRN[0]);
    }
    dashedRN[noteMiddle < measureMiddle ? 0 : 1] = newRomanNumeral;
    rnArray[measureIndex] = dashedRN.join("-");
  } else {
    rnArray[measureIndex] = newRomanNumeral;
  }

  return rnArray.join(" ");
};

const SIMPLE_RN_TO_CHROMATIC_DEGREE = {
  I: 0,
  bII: 1,
  II: 2,
  "#III": 4,
  III: 3,
  IV: 5,
  V: 7,
  VI: 8,
  VII: 10,
  i: 0,
  ii: 2,
  iii: 4,
  iv: 5,
  v: 7,
  vi: 9,
  vii: 11,
  "-": 12,
  bvi: 8,
  "#IV": 6,
  "#iv": 6,
  biii: 3,
  "#VII": 11,
  bii: 1,
  "#VI": 9,
  bvii: 10,
};

const split = (s: string, delimiter: string) =>
  (s || "").split(delimiter).filter((s) => s !== "");

export const romanNumeralsToArray = (romanNumerals: string): string[] =>
  split(romanNumerals, " ");

const dashedRnToArray = (dashedRN: string): string[] => split(dashedRN, "-");

const cleanupRn = (rn: string): string => rn.replace(/\d|o|ø|\^|\+/g, "");

export const romanNumeralToChromaticDegree = (romanNumeral: string): number => {
  if (typeof romanNumeral !== "string" || romanNumeral.length === 0) return 12; // wtf

  romanNumeral = cleanupRn(romanNumeral);
  const [applied, to] = romanNumeral.split("/");
  if (to) {
    return (
      (SIMPLE_RN_TO_CHROMATIC_DEGREE[applied] +
        SIMPLE_RN_TO_CHROMATIC_DEGREE[to]) %
      12
    );
  }
  return SIMPLE_RN_TO_CHROMATIC_DEGREE[romanNumeral];
};

const RAINBOW_ORDER = [
  "red",
  "brown",
  "#FF8C00",
  "#e8e800",
  "green",
  "#0EFFD0",
  "#787276",
  "blue",
  "#9F9FFF",
  "#9400D3",
  "#ff14c4",
  "#ffaacc",
  "black",
];

const TONIC_DOMINANT_ORDER = [
  "red",
  "darkkhaki", // coral, darkgoldenrod, khaki, sandybrown
  "#8f00ff",
  "#ffff00",
  "#60ff00",
  "#60ffFF",
  "gray",
  "blue",
  "#ff7000",
  "green",
  "#735832", // "#ff00ff", #FF007F
  "#ff60d0", // "#e39ff6", "FF6EC7"
];

export const TWELVE_TONE_COLORS = TONIC_DOMINANT_ORDER;

const makeArrowIfAppliedTo = (first: string, second?: string): string => {
  // won't work if modulation happens in between
  if (
    second &&
    first.indexOf("/") !== -1 &&
    SIMPLE_RN_TO_CHROMATIC_DEGREE[cleanupRn(first.split("/")[1])] ===
      SIMPLE_RN_TO_CHROMATIC_DEGREE[cleanupRn(second)]
  ) {
    return first.split("/")[0] + "→";
  }
  return first;
};

export const RomanNumeral: React.FC<{
  romanNumeral: string;
  nextNumeral?: string;
  styleProps?: any;
}> = ({ romanNumeral, styleProps = {}, nextNumeral = undefined }) => {
  const backgroundColor =
    TWELVE_TONE_COLORS[romanNumeralToChromaticDegree(romanNumeral)] ?? "black";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor,
        display: "grid",
        placeItems: "center",
        userSelect: "none",
      }}
    >
      <span
        style={{
          color:
            ["#e8e800", "#9F9FFF", "#0EFFD0"].indexOf(backgroundColor) !== -1
              ? "black"
              : "white",
          ...styleProps,
        }}
      >
        {
          makeArrowIfAppliedTo(romanNumeral, nextNumeral)
            .replace("9", "⁹")
            .replace("7", "⁷")
            .replace("6", "⁶")
            .replace("5", "⁵")
            .replace("4", "⁴")
            .replace("3", "³")
            .replace("2", "²")
            .replace("1", "¹")
            .replace("b", "♭")
            .replace("#", "♯")
            .replace("o", "ᵒ")
            .replace("+", "⁺")
          // .replace("^", "▵")
        }
      </span>
    </div>
  );
};

const Modulation: React.FC<{ semitones: PitchClass; isCompact?: boolean }> = ({
  semitones,
  isCompact = false,
}) => {
  const zeroCenteredSemitones = semitones > 6 ? -12 + semitones : semitones;

  return (
    <div
      className="modulation"
      style={{
        position: "absolute",
        left: 0,
        backgroundColor: "black",
        color: "white",
        padding: 0,
        margin: 0,
        height: "100%",
        top: 0,
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {zeroCenteredSemitones > 0 ? (
        <div>▲</div>
      ) : (
        !isCompact && <div style={{ opacity: 0 }}>▲</div>
      )}

      <div>{Math.abs(zeroCenteredSemitones)}</div>

      {zeroCenteredSemitones < 0 ? (
        <div>▼</div>
      ) : (
        !isCompact && <div style={{ opacity: 0 }}>▼</div>
      )}
    </div>
  );
};

export const RowOfRomanNumerals: React.FC<{
  rnArray: string[];
  modulations?: RelativeModulations;
  isSearch?: boolean;
}> = ({ rnArray, modulations = {}, isSearch = false }) => {
  let row = [];
  rnArray.map((measure, i) => {
    const chords = measure.split("-");
    chords.forEach((chord, j) => {
      return row.push(
        <div
          style={{
            width: isSearch ? 70 : 120 / chords.length,
            height: isSearch ? 30 : 30,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            position: "relative",
            backgroundColor:
              TWELVE_TONE_COLORS[romanNumeralToChromaticDegree(chord)],
          }}
        >
          {i in modulations && j === 0 && (
            <Modulation semitones={modulations[i]} />
          )}
          <RomanNumeral
            romanNumeral={chord.replace("_", " ")}
            nextNumeral={
              j + 1 < chords.length
                ? chords[j + 1]
                : (rnArray[i + 1] || "").split("-")[0]
            }
            styleProps={{
              fontFamily: "sans-serif",
              fontSize: isSearch
                ? "18px"
                : chords.length >= 3
                ? "12px"
                : chords.length == 2
                ? "16px"
                : "18px",
            }}
          />
        </div>,
      );
    });
  });
  return <div style={{ display: "flex", flexDirection: "row" }}>{row}</div>;
};

export const MeasureOfRomanNumerals: React.FC<{
  dashedRN: string;
  modulation?: PitchClass | null;
  fontSize?: string;
}> = ({ dashedRN, modulation = null, fontSize }) => {
  const chords = dashedRnToArray(dashedRN);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "100%",
      }}
    >
      {modulation !== null && (
        <Modulation semitones={modulation} isCompact={true} />
      )}
      {chords.map((chord) => (
        <RomanNumeral
          romanNumeral={chord}
          styleProps={fontSize ? { fontSize } : {}}
        />
      ))}
    </div>
  );
};

// Used in the Book
export const RN: React.FC<{ rn: string; searchable?: boolean }> = ({
  rn,
  searchable = false,
}) => {
  const ui = (
    <div
      style={{
        width: 45 * rn.split("-").length,
        marginTop: "1px",
        display: "inline-block",
      }}
    >
      <MeasureOfRomanNumerals dashedRN={rn} />
    </div>
  );
  if (searchable) {
    return <Link to={{ pathname: `/search/chords/${rn}` }}>{ui}</Link>;
  }
  return ui;
};

export const getModulations = (analysis: Analysis) =>
  [
    { measure: -1, tonic: analysis.tonic },
    ...Object.entries(analysis.modulations || []).map((entry) => ({
      measure: parseInt(entry[0], 10) - 1,
      tonic: entry[1],
    })),
  ].sort((a, b) => a.measure - b.measure);

export const getTonic = (measure: number, analysis: Analysis): PitchClass => {
  const modulations = getModulations(analysis);
  let i = 0;
  while (i + 1 < modulations.length && modulations[i + 1].measure <= measure) {
    i++;
  }
  return modulations[i].tonic as PitchClass;
};

export const getNoteMeasure = (
  note: Note,
  measures: number[] | null,
): number => {
  if (!measures) {
    return -1;
  }
  const noteMiddle = (note.span[0] + note.span[1]) / 2;
  return measures.findIndex((time) => time >= noteMiddle) - 1;
};

export const getChordNote = (
  note: Note,
  analysis: Analysis,
  measures: number[] | null,
  romanNumerals?: string,
): string => {
  if (note.span[1] - note.span[0] < 0.08) return "";
  if (!measures) return "";

  const measure = getNoteMeasure(note, measures);
  if (measure < 0 || measure + 1 >= measures.length) return ""; // anacrusis can't have RN

  const dashedRnArray = dashedRnToArray(
    romanNumeralsToArray(romanNumerals)[measure],
  );
  const l = measures[measure];
  const r = measures[measure + 1];
  const n = dashedRnArray.length;
  let i = 0;
  const noteMiddle = (note.span[0] + note.span[1]) / 2;

  // TODO: this assumes all beats are evenly distributed
  // This is only valid for nes. In midi the beats can be more precisely positioned, see midi.ts.
  while (i < n && noteMiddle > l + ((r - l) * (i + 1)) / n) {
    i++;
  }
  const romanNumeral = dashedRnArray[i];

  if (!romanNumeral) return "";
  const rootChromaticScaleDegree = romanNumeralToChromaticDegree(romanNumeral);
  if (rootChromaticScaleDegree === -1) return "";

  return TWELVE_CHORD_TONES[
    (((note.note.midiNumber - getTonic(measure, analysis)) % 12) +
      12 -
      rootChromaticScaleDegree) %
      12
  ];
};

type RelativeModulations = { [key: number]: PitchClass };

export const getRelativeModulations = (
  tonic: PitchClass | null,
  modulations: { [key: number]: PitchClass },
): RelativeModulations => {
  if (tonic === null) {
    return {};
  }

  const modulationsCopy = { ...modulations, 0: tonic };

  const sortedKeys = Object.keys(modulationsCopy)
    .map(Number)
    .sort((a, b) => a - b);

  let relativeModulations: RelativeModulations = {};

  for (let i = 1; i < sortedKeys.length; i++) {
    const prev = modulationsCopy[sortedKeys[i - 1]];
    const current = modulationsCopy[sortedKeys[i]];

    relativeModulations[sortedKeys[i]] = ((current - prev + 12) %
      12) as PitchClass;
  }

  return relativeModulations;
};

// In Card
const FormSection: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      textAlign: "start",
      fontFamily: "sans-serif",
      fontSize: "15px",
      padding: "3px",
      color: "white",
      backgroundColor: "#333",
    }}
  >
    {label}
  </div>
);

export const FormAndHarmony: React.FC<{ analysis: Analysis }> = ({
  analysis,
}) => {
  const { romanNumerals, form } = analysis;
  const array = romanNumeralsToArray(romanNumerals);
  const phrasingMeasures = getPhrasingMeasures(
    analysis,
    Math.max(4, array.length),
  );
  if (phrasingMeasures?.[0] !== 1) {
    phrasingMeasures.unshift(1);
  }
  const relativeModulations = getRelativeModulations(
    analysis.tonic,
    analysis.modulations,
  );
  const result = [];
  // Let's calculate all modulations and convert them to relative form: ±X st
  for (let i = 0; i + 1 < phrasingMeasures.length; i++) {
    const formSection = form?.[phrasingMeasures[i]];
    if (formSection) {
      result.push(<FormSection label={formSection} />);
    }
    const relevantModulations = Object.keys(relativeModulations)
      .filter((key) => {
        const measureIndex = Number(key);
        return (
          measureIndex >= phrasingMeasures[i] &&
          measureIndex < phrasingMeasures[i + 1]
        );
      })
      .reduce((obj, key) => {
        obj[Number(key) - phrasingMeasures[i]] = relativeModulations[key];
        return obj;
      }, {});

    result.push(
      <RowOfRomanNumerals
        rnArray={array.slice(
          phrasingMeasures[i] - 1,
          phrasingMeasures[i + 1] - 1,
        )}
        modulations={relevantModulations}
      />,
    );
  }
  return (
    <div style={{ display: "inline-block" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {result}
      </div>
    </div>
  );
};

export const hasRomanNumeralInMeasuresSpan = (
  romanNumerals: string,
  measuresSpan: MeasuresSpan,
): boolean =>
  romanNumeralsToArray(romanNumerals)
    .slice(measuresSpan[0] - 1, measuresSpan[1])
    .some((rn) => rn && rn !== "_");
