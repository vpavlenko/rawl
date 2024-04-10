import * as React from "react";
import styled from "styled-components";
import { getModulations } from "./Rawl";
import { MeasuresAndBeats, MidiRange, SystemLayout } from "./SystemLayout";
import { Analysis, MeasuresSpan, PitchClass } from "./analysis";

export const STACKED_RN_HEIGHT = 20;
const MIN_WIDTH_BETWEEN_BEATS = 17;
const MIN_WIDTH_BETWEEN_MEASURES = 25;
const GRADIENT_HEIGHT_IN_NOTES = 3;

const VerticalBar = styled.div`
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: none;
`;

export const Cursor = styled(VerticalBar)`
  background-color: orange;
  pointer-events: none;
`;

const MeasureBar = styled(VerticalBar)`
  background-color: #444;
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #262626;
`;

export type MeasureSelection = {
  selectedMeasure: number;
  selectMeasure: (number) => void;
  splitAtMeasure: () => void;
};

const PITCH_CLASS_TO_LETTER = {
  0: "C",
  1: "Db",
  2: "D",
  3: "Eb",
  4: "E",
  5: "F",
  6: "F#",
  7: "G",
  8: "Ab",
  9: "A",
  10: "Bb",
  11: "B",
};

const Measure: React.FC<{
  span: [number, number];
  number: number;
  isPhraseStart: boolean;
  formSection: string;
  systemLayout: SystemLayout;
  measureSelection: MeasureSelection;
  showHeader: boolean;
  secondsToX: (number) => number;
  showNonPhraseStarts: boolean;
  tonicStart?: PitchClass;
  selectedPhraseStart: number;
}> = ({
  span,
  number,
  isPhraseStart,
  formSection,
  systemLayout,
  measureSelection,
  showHeader,
  secondsToX,
  showNonPhraseStarts,
  tonicStart,
  selectedPhraseStart,
}) => {
  const { selectedMeasure, selectMeasure, splitAtMeasure } = measureSelection;

  const left = secondsToX(span[0]) - 1;
  const width = secondsToX(span[1]) - left - 1;

  return (
    <>
      {showHeader && tonicStart !== undefined && (
        <span
          style={{
            color: "white",
            position: "absolute",
            top: 40,
            left: left + 2,
            fontSize: 12,
            zIndex: 100,
            fontWeight: 700,
            userSelect: "none",
          }}
        >
          {PITCH_CLASS_TO_LETTER[tonicStart]}
        </span>
      )}
      {(showNonPhraseStarts || isPhraseStart) && (
        <>
          <MeasureBar
            key={`db_${number}`}
            style={{
              left,
              ...(showNonPhraseStarts && isPhraseStart
                ? { backgroundColor: "#aaa" }
                : {}),
            }}
          />
          {width && showHeader ? (
            <>
              <div
                key={`db_n_${number}`}
                style={{
                  position: "absolute",
                  top: 0,
                  left: left + 7,
                  color:
                    selectedMeasure === number
                      ? "red"
                      : selectedPhraseStart !== -1 &&
                        Math.abs(number - selectedPhraseStart) <= 3
                      ? "orange"
                      : "white",
                  zIndex: 15,
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: "#0009",
                  ...(systemLayout === "merged" ? { width } : {}), // enlarges seek area for stacked
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  selectMeasure(number);
                }}
              >
                {selectedMeasure === number && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        top: 25,
                        left: 0,
                        color: "gray",
                        fontSize: 12,
                      }}
                      onClick={(e) => {
                        selectMeasure(null);
                        e.stopPropagation();
                      }}
                    >
                      Esc
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: -26,
                        color: "red",
                        fontSize: 14,
                      }}
                      onClick={(e) => {
                        splitAtMeasure();
                        e.stopPropagation();
                      }}
                    >
                      ↵
                    </div>
                  </>
                )}
                <span
                  style={{
                    fontSize: "12px",
                    fontFamily: "sans-serif",
                  }}
                >
                  {number}
                </span>
              </div>
              {formSection && (
                <div
                  key={`form_section_${number}`}
                  style={{
                    position: "absolute",
                    left: left + (systemLayout === "split" ? 23 : 1),
                    top: 0,
                    zIndex: 95,
                    backgroundColor: "#3339",
                    padding: "5px 10px 5px 10px",
                    color: "#ffe",
                    userSelect: "none",
                    pointerEvents: "none",
                  }}
                >
                  {formSection}
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </>
  );
};

const Beat: React.FC<{ second: number; secondsToX: (number) => number }> = ({
  second,
  secondsToX,
}) => (
  <BeatBar
    style={{ left: secondsToX(second), zIndex: 2, pointerEvents: "none" }}
  />
);

const TonalGrid: React.FC<{
  analysis: Analysis;
  measures: number[];
  midiNumberToY: (number) => number;
  noteHeight: number;
  midiRange: MidiRange;
  secondsToX: (number) => number;
}> = React.memo(
  ({
    analysis,
    measures,
    midiNumberToY,
    noteHeight,
    midiRange,
    secondsToX,
  }) => {
    const modulations = getModulations(analysis);
    if (!modulations || !measures) return;
    modulations.push({
      measure: measures.length,
      tonic: modulations[0].tonic,
    });

    const result = [];
    for (let i = 0; i + 1 < modulations.length; ++i) {
      const fromIndex = modulations[i].measure;
      const toIndex = modulations[i + 1].measure;
      if (toIndex < 0 || fromIndex >= measures.length) {
        continue;
      }
      const from = measures[Math.max(fromIndex, 0)];
      const to = measures[Math.min(toIndex, measures.length - 1)];
      const { tonic } = modulations[i];
      const width = secondsToX(to) - secondsToX(from);
      if (!width) continue;
      for (let octave = 2; octave <= 9; ++octave) {
        const midiNumber = tonic + octave * 12;
        if (midiNumber - 12 >= midiRange[0] && midiNumber - 12 <= midiRange[1])
          // TODO: display a note like C4 gracefully at each gradient start
          result.push(
            <div
              key={`tonalgrid_octave_${i}_${midiNumber}`}
              style={{
                position: "absolute",
                width,
                height: GRADIENT_HEIGHT_IN_NOTES * noteHeight,
                left: secondsToX(from),
                top: midiNumberToY(midiNumber - 13 + GRADIENT_HEIGHT_IN_NOTES),
                pointerEvents: "none",
                background: `linear-gradient(to top, #333, transparent)`,
                zIndex: 0,
              }}
            />,
          );
        if (midiNumber - 7 >= midiRange[0] && midiNumber - 7 <= midiRange[1])
          result.push(
            <div
              key={`tonalgrid_octave_${i}_fifth_${midiNumber}`}
              style={{
                position: "absolute",
                width,
                height: 0,
                left: secondsToX(from),
                top: midiNumberToY(midiNumber - 6) - 1,
                pointerEvents: "none",
                borderBottom: "1px solid #222",
                zIndex: 0,
              }}
            />,
          );
      }
    }
    return result;
  },
);

export const AnalysisGrid: React.FC<{
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  phraseStarts: number[];
  systemLayout: SystemLayout;
  midiRange: MidiRange;
  measureSelection: MeasureSelection;
  showHeader?: boolean;
  showTonalGrid?: boolean;
  secondsToX: (number) => number;
  sectionSpan?: MeasuresSpan;
}> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    measureSelection,
    phraseStarts,
    systemLayout,
    midiRange,
    showHeader = true,
    showTonalGrid = true,
    secondsToX,
    sectionSpan = null,
  }) => {
    const { measures, beats } = measuresAndBeats;
    if (sectionSpan == null) {
      sectionSpan = [0, measures.length]; // measures.length - 1 ?
    }
    const modulations = new Map(
      getModulations(analysis).map(({ measure, tonic }) => [measure, tonic]),
    );

    let showBeats = true;
    let showAllMeasureBars = true;

    if (measures.length >= 3) {
      const beatsInThirdMeasure = beats.filter((beat) => beat > measures[2]);
      showBeats =
        beats.length >= 3 &&
        secondsToX(beatsInThirdMeasure[1]) -
          secondsToX(beatsInThirdMeasure[0]) >=
          MIN_WIDTH_BETWEEN_BEATS;
      showAllMeasureBars =
        showBeats ||
        secondsToX(measures[2]) - secondsToX(measures[1]) >=
          MIN_WIDTH_BETWEEN_MEASURES;
    }

    const selectedPhraseStart =
      phraseStarts.indexOf(measureSelection.selectedMeasure) !== -1
        ? measureSelection.selectedMeasure
        : -1;

    return (
      <div style={{ zIndex: 15 }}>
        {measures.map((time, i) => {
          const number = i + 1; // 1-indexed
          return sectionSpan[0] <= i && i <= sectionSpan[1] ? (
            <Measure
              key={i}
              showHeader={showHeader && i < sectionSpan[1]}
              span={[time, measures[number] ?? time]}
              isPhraseStart={phraseStarts.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              measureSelection={measureSelection}
              systemLayout={systemLayout}
              secondsToX={secondsToX}
              showNonPhraseStarts={showAllMeasureBars}
              tonicStart={modulations.get(i)}
              selectedPhraseStart={selectedPhraseStart}
            />
          ) : null;
        })}
        {showBeats &&
          beats.map((time) => (
            <Beat key={time} second={time} secondsToX={secondsToX} />
          ))}
        {showTonalGrid && analysis.tonic !== null && (
          <TonalGrid
            analysis={analysis}
            measures={measures}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
            midiRange={midiRange}
            secondsToX={secondsToX}
          />
        )}
      </div>
    );
  },
);
