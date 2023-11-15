import * as React from "react";
import styled from "styled-components";
import { secondsToX } from "./Chiptheory";
import { Analysis, PitchClass } from "./analysis";
import { MeasuresAndBeats, getPhrasingMeasures } from "./measures";
import { FileType, NotesInVoices } from "./noteParsers";
import {
  MeasureOfRomanNumerals,
  getModulations,
  getRelativeModulations,
  romanNumeralsToArray,
} from "./romanNumerals";
import { STRIPES_HEIGHT, Stripes } from "./tags";

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

const Measure: React.FC<{
  span: [number, number];
  number: number;
  isFourMeasureMark: boolean;
  previouslySelectedMeasure: number;
  selectedMeasure: number;
  selectMeasure: (number: number) => void;
  romanNumeral: string;
  formSection: string;
  modulation: PitchClass | null;
  stripesHeight: number;
}> = ({
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
      <div
        key={`db_n_${number}`}
        style={{
          position: "absolute",
          top: 30 + stripesHeight,
          left: `${left + 7}px`,
          color:
            selectedMeasure === number
              ? "red"
              : previouslySelectedMeasure === number
              ? "green"
              : "white",
          zIndex: 5,
          cursor: "pointer",
          userSelect: "none",
          width,
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectMeasure(number);
        }}
      >
        {number}
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
      <div
        key={`db_rn_${number}`}
        style={{
          position: "absolute",
          left: `${left}px`,
          width,
          top: stripesHeight,
          height: "25px",
          display: "grid",
          placeItems: "center",
          fontSize: "25px",
          zIndex: 5,
          borderLeft: "1px solid black",
        }}
      >
        <MeasureOfRomanNumerals
          dashedRN={romanNumeral}
          modulation={modulation}
        />
      </div>
    </>
  );
};

const Beat = ({ second }) => (
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
}> = React.memo(
  ({ analysis, measures, midiNumberToY, secondsToX, noteHeight }) => {
    const modulations = getModulations(analysis);
    if (!modulations || !measures) return;
    modulations.push({ measure: measures.length, tonic: modulations[0].tonic });

    const result = [];
    for (let i = 0; i + 1 < modulations.length; ++i) {
      const from = measures[Math.max(modulations[i].measure, 0)];
      const to =
        measures[Math.min(modulations[i + 1].measure, measures.length - 1)];
      const { tonic } = modulations[i];
      const width = secondsToX(to) - secondsToX(from);
      if (!width) continue;
      for (let octave = 2; octave <= 9; ++octave) {
        const midiNumber = tonic + octave * 12;
        // TODO: display a note like C4 gracefully at each gradient start
        result.push(
          <>
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
            />
          </>,
        );
      }
    }
    return result;
  },
);

export const AnalysisGrid: React.FC<{
  analysis: Analysis;
  voices: NotesInVoices;
  measuresAndBeats: MeasuresAndBeats;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  previouslySelectedMeasure: number;
  selectedMeasure: number;
  selectMeasure: (number: number) => void;
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void;
  setVoiceMask: (voiceMask: boolean[]) => void;
  seek: (ms: number) => void;
  showIntervals: (yes: boolean) => void;
  loggedIn: boolean;
  fileType: FileType;
}> = React.memo(
  ({
    analysis,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    previouslySelectedMeasure,
    selectedMeasure,
    selectMeasure,
    commitAnalysisUpdate,
    setVoiceMask,
    loggedIn,
    voices,
    seek,
    showIntervals,
    fileType,
  }) => {
    const { measures, beats } = measuresAndBeats;
    const phrasingMeasures = getPhrasingMeasures(analysis, measures.length);
    const relativeModulations = getRelativeModulations(
      analysis.tonic,
      analysis.modulations,
    );
    return (
      <>
        {measures.map((time, i) => {
          const number = i + 1; // Caveat: measures are 1-indexed when stored in the DB .__.
          return (
            <Measure
              key={i}
              span={[time, measures[i + 1] ?? time]}
              isFourMeasureMark={phrasingMeasures.indexOf(number) !== -1}
              formSection={(analysis.form ?? {})[number]}
              number={number}
              previouslySelectedMeasure={previouslySelectedMeasure}
              selectedMeasure={selectedMeasure}
              selectMeasure={selectMeasure}
              romanNumeral={romanNumeralsToArray(analysis?.romanNumerals)[i]}
              modulation={
                number in relativeModulations
                  ? relativeModulations[number]
                  : null
              }
              stripesHeight={fileType === "nes" ? STRIPES_HEIGHT : 0}
            />
          );
        })}
        {beats.map((time) => (
          <Beat key={time} second={time} />
        ))}
        {analysis.tonic !== null && (
          <TonalGrid
            analysis={analysis}
            measures={measures}
            secondsToX={secondsToX}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
          />
        )}
        {fileType === "nes" && (
          <Stripes
            tagSpans={analysis.tagSpans || []}
            measuresAndBeats={measuresAndBeats}
            analysis={analysis}
            commitAnalysisUpdate={commitAnalysisUpdate}
            setVoiceMask={setVoiceMask}
            loggedIn={loggedIn}
            voices={voices}
            seek={seek}
            showIntervals={showIntervals}
          />
        )}
        {analysis.loop && (
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
