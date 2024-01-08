import * as React from "react";
import styled from "styled-components";
import {
  MeasuresAndBeats,
  MidiRange,
  SystemLayout,
  getModulations,
} from "./SystemLayout";
import { Analysis, PitchClass } from "./analysis";

type RelativeModulations = { [key: number]: PitchClass };

const getRelativeModulations = (
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

export const STACKED_RN_HEIGHT = 20;

const VerticalBar = styled.div`
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
  pointer-events: none;
`;

export const Cursor = styled(VerticalBar)`
  background-color: #ff6666;
  pointer-events: none;
`;

const MeasureBar = styled(VerticalBar)`
  background-color: #444;
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #262626;
`;

export type MeasureSelection = {
  previouslySelectedMeasure: number;
  selectedMeasure: number;
  selectMeasure: (number) => void;
};

const Measure: React.FC<{
  span: [number, number];
  number: number;
  isFourMeasureMark: boolean;
  formSection: string;
  modulation: PitchClass | null;
  secondsToX: (number) => number;
  systemLayout: SystemLayout;
  measureSelection: MeasureSelection;
  showHeader: boolean;
}> = ({
  span,
  number,
  isFourMeasureMark,
  formSection,
  modulation,
  secondsToX,
  systemLayout,
  measureSelection,
  showHeader,
}) => {
  const { previouslySelectedMeasure, selectedMeasure, selectMeasure } =
    measureSelection;

  const left = secondsToX(span[0]) - 1;
  const width = secondsToX(span[1]) - left - 1;

  return (
    <>
      <MeasureBar
        key={`db_${number}`}
        style={{
          left,
          ...(isFourMeasureMark && { backgroundColor: "#aaa" }),
        }}
      />
      {width && showHeader ? (
        <>
          <div
            key={`db_n_${number}`}
            style={{
              position: "absolute",
              top: 0,
              left: `${left + 7}px`,
              color:
                selectedMeasure === number
                  ? "red"
                  : previouslySelectedMeasure === number
                  ? "green"
                  : "white",
              zIndex: 1000,
              cursor: "pointer",
              userSelect: "none",
              ...(systemLayout === "merged" ? { width } : {}), // enlarges seek area for stacked
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectMeasure(number);
            }}
          >
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
                top: 55,
                zIndex: 5,
                backgroundColor: "#333",
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
  secondsToX: (number) => number;
  noteHeight: number;
  firstMeasureNumber: number;
  midiRange: MidiRange;
}> = React.memo(
  ({
    analysis,
    measures,
    midiNumberToY,
    secondsToX,
    noteHeight,
    firstMeasureNumber,
    midiRange,
  }) => {
    const modulations = getModulations(analysis);
    if (!modulations || !measures) return;
    modulations.push({
      measure: measures.length + firstMeasureNumber - 1,
      tonic: modulations[0].tonic,
    });

    const result = [];
    for (let i = 0; i + 1 < modulations.length; ++i) {
      // TODO: this logic should be corrected for case when firstMeasureNumber !== 1
      const fromIndex = modulations[i].measure - firstMeasureNumber + 1;
      const toIndex = modulations[i + 1].measure - firstMeasureNumber + 1;
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
                height: 12 * noteHeight,
                left: secondsToX(from),
                top: midiNumberToY(midiNumber - 1),
                pointerEvents: "none",
                background: `linear-gradient(to top, #222, transparent)`,
                zIndex: 1,
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
  firstMeasureNumber: number;
  secondsToX: (number) => number;
  phraseStarts: number[];
  systemLayout: SystemLayout;
  midiRange: MidiRange;
  measureSelection: MeasureSelection;
  showHeader?: boolean;
  showTonalGrid?: boolean;
}> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    measureSelection,
    firstMeasureNumber,
    secondsToX,
    phraseStarts,
    systemLayout,
    midiRange,
    showHeader = true,
    showTonalGrid = true,
  }) => {
    const { measures, beats } = measuresAndBeats;
    const relativeModulations = getRelativeModulations(
      analysis.tonic,
      analysis.modulations,
    );
    return (
      <>
        {measures.map((time, i) => {
          const number = i + firstMeasureNumber; // 1-indexed
          return (
            <Measure
              key={i}
              showHeader={showHeader}
              span={[time, measures[i + 1] ?? time]}
              isFourMeasureMark={phraseStarts.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              measureSelection={measureSelection}
              modulation={
                number in relativeModulations
                  ? relativeModulations[number]
                  : null
              }
              secondsToX={secondsToX}
              systemLayout={systemLayout}
            />
          );
        })}
        {beats.map((time) => (
          <Beat key={time} second={time} secondsToX={secondsToX} />
        ))}
        {showTonalGrid && analysis.tonic !== null && (
          <TonalGrid
            analysis={analysis}
            measures={measures}
            secondsToX={secondsToX}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
            firstMeasureNumber={firstMeasureNumber}
            midiRange={midiRange}
          />
        )}
        {systemLayout === "merged" && analysis.loop && (
          <div
            key="loop"
            style={{
              boxShadow: "inset 0px -5px 10px white",
              pointerEvents: "none",
              position: "absolute",
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0,0,0,0.9) 300px)",
              left: secondsToX(measures[analysis.loop - 1]),
              height: "100%",
              right: 0,
              zIndex: 1000,
              width: "5000px",
            }}
          >
            <div style={{ margin: "200px 50px 50px 20px", color: "white" }}>
              Loop
            </div>
          </div>
        )}
      </>
    );
  },
);
