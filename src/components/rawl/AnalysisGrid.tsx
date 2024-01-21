import * as React from "react";
import styled from "styled-components";
import { secondsToX } from "./Rawl";
import {
  MeasuresAndBeats,
  MidiRange,
  SystemLayout,
  getModulations,
} from "./SystemLayout";
import { Analysis } from "./analysis";

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
  isPhraseStart: boolean;
  formSection: string;
  systemLayout: SystemLayout;
  measureSelection: MeasureSelection;
  showHeader: boolean;
}> = ({
  span,
  number,
  isPhraseStart,
  formSection,
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
          ...(isPhraseStart && { backgroundColor: "#aaa" }),
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
              zIndex: 15,
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

const Beat: React.FC<{ second: number }> = ({ second }) => (
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
}> = React.memo(
  ({ analysis, measures, midiNumberToY, noteHeight, midiRange }) => {
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
    phraseStarts,
    systemLayout,
    midiRange,
    showHeader = true,
    showTonalGrid = true,
  }) => {
    const { measures, beats } = measuresAndBeats;
    return (
      <div style={{ zIndex: 15 }}>
        {measures.map((time, i) => {
          const number = i + 1; // 1-indexed
          return (
            <Measure
              key={i}
              showHeader={showHeader}
              span={[time, measures[i + 1] ?? time]}
              isPhraseStart={phraseStarts.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              measureSelection={measureSelection}
              systemLayout={systemLayout}
            />
          );
        })}
        {beats.map((time) => (
          <Beat key={time} second={time} />
        ))}
        {showTonalGrid && analysis.tonic !== null && (
          <TonalGrid
            analysis={analysis}
            measures={measures}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
            midiRange={midiRange}
          />
        )}
      </div>
    );
  },
);
