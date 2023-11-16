import * as React from "react";
import styled from "styled-components";
import { MidiRange, SystemLayout } from "./SystemLayout";
import { Analysis, PitchClass } from "./analysis";
import { MeasuresAndBeats } from "./measures";
import {
  MeasureOfRomanNumerals,
  getModulations,
  getRelativeModulations,
  romanNumeralsToArray,
} from "./romanNumerals";
import { STRIPES_HEIGHT, Stripes, StripesSpecificProps } from "./tags";

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

const Measure: React.FC<
  {
    span: [number, number];
    number: number;
    isFourMeasureMark: boolean;
    romanNumeral: string;
    formSection: string;
    modulation: PitchClass | null;
    stripesHeight: number;
    secondsToX: (number) => number;
    systemLayout: SystemLayout;
    hasRomanNumerals: boolean;
  } & MeasureSelection
> = ({
  span,
  number,
  isFourMeasureMark,
  previouslySelectedMeasure,
  selectedMeasure,
  selectMeasure,
  romanNumeral,
  formSection,
  modulation,
  stripesHeight,
  secondsToX,
  systemLayout,
  hasRomanNumerals,
}) => {
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
      {width ? (
        <>
          <div
            key={`db_n_${number}`}
            style={{
              position: "absolute",
              top: stripesHeight + (hasRomanNumerals ? 25 : 0),
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
              ...(systemLayout === "horizontal" ? { width } : {}), // enlarges seek area for stacked
            }}
            onClick={(e) => {
              e.stopPropagation();
              selectMeasure(number);
            }}
          >
            <span
              style={{
                ...(systemLayout === "stacked"
                  ? { fontSize: "12px" }
                  : { fontSize: "12px" }),
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
                left: `${left + 1}px`,
                top: 55 + stripesHeight,
                zIndex: 10,
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
      {hasRomanNumerals ? (
        <div
          key={`db_rn_${number}`}
          style={{
            position: "absolute",
            left: `${left}px`,
            width,
            top: stripesHeight,
            height: systemLayout === "horizontal" ? 25 : STACKED_RN_HEIGHT,
            display: "grid",
            placeItems: "center",
            zIndex: 5,
            borderLeft: "1px solid black",
          }}
        >
          {(romanNumeral &&
            romanNumeral !== "_" &&
            (systemLayout === "horizontal" || width) && (
              <MeasureOfRomanNumerals
                dashedRN={romanNumeral}
                modulation={modulation}
                fontSize={systemLayout === "stacked" && "16px"}
              />
            )) ||
            null}
        </div>
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
        if (midiNumber - 12 <= midiRange[1])
          // TODO: display a note like C4 gracefully at each gradient start
          result.push(
            <div
              key={`gradient_${midiNumber}`}
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

export const AnalysisGrid: React.FC<
  {
    analysis: Analysis;
    measuresAndBeats: MeasuresAndBeats;
    midiNumberToY: (number: number) => number;
    noteHeight: number;
    firstMeasureNumber: number;
    secondsToX: (number) => number;
    stripeSpecificProps?: StripesSpecificProps;
    phraseStarts: number[];
    systemLayout: SystemLayout;
    midiRange: MidiRange;
    hasRomanNumerals: boolean;
  } & MeasureSelection
> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    previouslySelectedMeasure,
    selectedMeasure,
    selectMeasure,
    stripeSpecificProps,
    firstMeasureNumber,
    secondsToX,
    phraseStarts,
    systemLayout,
    midiRange,
    hasRomanNumerals = true,
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
              span={[time, measures[i + 1] ?? time]}
              isFourMeasureMark={phraseStarts.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              previouslySelectedMeasure={previouslySelectedMeasure}
              selectedMeasure={selectedMeasure}
              selectMeasure={selectMeasure}
              romanNumeral={
                romanNumeralsToArray(analysis?.romanNumerals)[number - 1]
              }
              hasRomanNumerals={hasRomanNumerals}
              modulation={
                number in relativeModulations
                  ? relativeModulations[number]
                  : null
              }
              stripesHeight={stripeSpecificProps ? STRIPES_HEIGHT : 0}
              secondsToX={secondsToX}
              systemLayout={systemLayout}
            />
          );
        })}
        {beats.map((time) => (
          <Beat key={time} second={time} secondsToX={secondsToX} />
        ))}
        {analysis.tonic !== null && (
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
        {stripeSpecificProps && (
          <Stripes
            tagSpans={analysis.tagSpans || []}
            measuresAndBeats={measuresAndBeats}
            analysis={analysis}
            {...stripeSpecificProps}
          />
        )}
        {systemLayout === "horizontal" && analysis.loop && (
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
