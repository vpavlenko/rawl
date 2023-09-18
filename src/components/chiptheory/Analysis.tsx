import * as React from "react";
import styled, { CSSProperties } from "styled-components";
import { Note, secondsToX } from "./Chiptheory";

// Analysis is done in steps.
// The meaning of a click/hover at each step is different.

export const RESOLUTION_DUMPS_PER_SECOND = 100;
export const RESOLUTION_MS = 1 / RESOLUTION_DUMPS_PER_SECOND;

export const STEPS = [
  "first measure",
  "second measure",
  "tonic",
  "mode",
  "end",
] as const;
export type Step = (typeof STEPS)[number];

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type ScaleDegree = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PitchClassToScaleDegree = [
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
  ScaleDegree | null,
];

// const MODES = [null, 'phrygian', null, 'minor', 'major', 'minor pentatonic', 'blues', null, null, 'dorian', 'mixolydian', null] as const
const MODES = [
  null,
  "phrygian",
  null,
  "minor",
  "major",
  null,
  null,
  null,
  null,
  "dorian",
  "mixolydian",
  null,
] as const;
export type Mode = (typeof MODES)[number];

const RAINBOW_COLORS = [
  "red",
  "#cc7700",
  "#C1C100",
  "green",
  "blue",
  "#9400D3",
  "#FF1493",
];

// if we have a note, it's color is mapped into degree, then mapped into colors

export type PitchClassToScaleDegreeViaMode = {
  [K in Mode]: K extends string ? PitchClassToScaleDegree : never;
};

const MIDI_NOTE_TO_SCALE_DEGREE: PitchClassToScaleDegreeViaMode = {
  phrygian: [1, 2, null, 3, null, 4, null, 5, 6, null, 7, null],
  minor: [1, null, 2, 3, null, 4, null, 5, 6, null, 7, null],
  dorian: [1, null, 2, 3, null, 4, null, 5, null, 6, 7, null],
  mixolydian: [1, null, 2, null, 3, 4, null, 5, null, 6, 7, null],
  major: [1, null, 2, null, 3, 4, null, 5, null, 6, null, 7],
};

export type Analysis = {
  clickResolutionMs: number;
  step: Step;
  firstMeasure: number;
  secondMeasure: number;
  loop: number | null;
  tonic: PitchClass | null;
  mode: Mode;
};

export const getTransparencyGradient = (color) => ({
  background: `linear-gradient(to right, ${color} 0px, ${color} 10px, ${color} 50%, transparent 100%)`, // 1000px disables gradient
});

export const getNoteColor = (
  defaultColor: string,
  midiNumber,
  analysis,
): CSSProperties => {
  if (defaultColor === "white") {
    return {
      // boxShadow: "gray 0px 1px, white 0px 1.5px",
      boxShadow: "white 0px 1px",
      boxSizing: "border-box",
      backgroundColor: "transparent",
    };
  }
  if (
    defaultColor === "black" ||
    analysis.tonic === null ||
    analysis.mode === null
  ) {
    return getTransparencyGradient(defaultColor);
  }

  const mapping = MIDI_NOTE_TO_SCALE_DEGREE[analysis.mode];
  let pointer = (midiNumber - analysis.tonic) % 12;
  if (mapping[pointer] === null) {
    return getTransparencyGradient("#bbb");
  }

  return getTransparencyGradient(RAINBOW_COLORS[mapping[pointer] - 1]);
};

export const ANALYSIS_STUB = {
  clickResolutionMs: RESOLUTION_MS,
  step: STEPS[0],
  firstMeasure: null,
  secondMeasure: null,
  loop: null,
  tonic: null, // 0..11 in midi notes
  mode: null,
};

export const STEP_CALL_TO_ACTION: Record<Step, string> = {
  "first measure":
    "Step 1. Click on a note at the start of the first measure of the main section. Skip the intro",
  "second measure":
    "Step 2. Click on a note at the start of the second measure of the main section",
  tonic: "Step 3. Click on a tonic of the main section",
  mode: "Step 4. Click on a characteristic note of the main section. Minor: b3, major: 3, phrygian: b2, dorian: #6, mixolydian: b7, blues: #4, pentatonic: 4",
  end: "Analysis completed, thank you!",
};

// These two don't propagate to Firestore because they tweak transient state.
export const prevStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) - 1] });

export const nextStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) + 1] });

export const advanceAnalysis = (note, analysis, saveAnalysis, setAnalysis) => {
  const { step } = analysis;
  if (step === "end") return;

  const nextStep = STEPS[STEPS.indexOf(step) + 1];
  let update: Partial<Analysis> = {};

  if (step === "first measure") {
    update.firstMeasure = note.span[0];
  } else if (step === "second measure") {
    update.secondMeasure = note.span[0];
  } else if (step === "tonic") {
    update.tonic = (note.note.midiNumber % 12) as PitchClass;
  } else if (step === "mode") {
    update.mode = MODES[(note.note.midiNumber - analysis.tonic) % 12];
  }

  const newAnalysis = { ...analysis, ...update, step: nextStep };

  saveAnalysis(newAnalysis);
  setAnalysis(newAnalysis);
};

const VerticalBar = styled.div`
  width: 1px;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 2;
`;

export const Cursor = styled(VerticalBar)`
  background-color: pink;
`;

const Downbeat = styled(VerticalBar)`
  background-color: #444;
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #222;
`;

const Measure = ({ second, number, selectedDownbeat, selectDownbeat }) => {
  const left = secondsToX(second);
  return (
    <>
      <Downbeat
        style={{
          left,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 10,
          left: `${left + 5}px`,
          color: selectedDownbeat === number ? "red" : "white",
          zIndex: 2,
          cursor: "pointer",
        }}
        onClick={() => selectDownbeat(number)}
      >
        {number}
      </div>
    </>
  );
};

const Beat = ({ second }) => <BeatBar style={{ left: secondsToX(second) }} />;

const snapToSomeNoteOnset = (second, allNotes) => {
  let closestDiff = Infinity;
  let closestNoteOn = null;
  for (const note of allNotes) {
    const currentDiff = Math.abs(second - note.span[0]);
    if (currentDiff < closestDiff) {
      closestNoteOn = note.span[0];
      closestDiff = currentDiff;
    }
  }
  return closestNoteOn;
};

const TonalGrid = ({ tonic, width, midiNumberToY, noteHeight }) => {
  if (tonic === null) {
    return [];
  }
  const result = [];
  for (let octave = 2; octave <= 7; ++octave) {
    result.push(
      <div
        style={{
          position: "absolute",
          width: `${width}px`,
          height: noteHeight,
          left: 0,
          top: midiNumberToY(tonic + octave * 12),
          backgroundColor: "#222",
          zIndex: 1,
        }}
      />,
    );
  }
  return result;
};

export const AnalysisGrid: React.FC<{
  analysis: Analysis;
  allNotes: Note[];
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  selectedDownbeat: number;
  selectDownbeat: (number: number) => void;
}> = React.memo(
  ({
    analysis,
    allNotes,
    midiNumberToY,
    noteHeight,
    selectedDownbeat,
    selectDownbeat,
  }) => {
    let measures = [];
    let beats = [];
    const maxRigthSpan = allNotes.reduce(
      (maxValue, note) => Math.max(maxValue, note.span[1]),
      -Infinity,
    );
    let loopLeft = null;

    if (analysis.firstMeasure) {
      measures.push(
        <Measure
          second={analysis.firstMeasure}
          number={1}
          selectedDownbeat={selectedDownbeat}
          selectDownbeat={selectDownbeat}
        />,
      );
    }
    if (analysis.secondMeasure) {
      let previousMeasure = analysis.firstMeasure;
      let measureLength = analysis.secondMeasure - analysis.firstMeasure;
      measures.push(
        <Measure
          second={previousMeasure}
          number={1}
          selectedDownbeat={selectedDownbeat}
          selectDownbeat={selectDownbeat}
        />,
      );
      for (let i = 2; i < 400; i++) {
        const newMeasure = snapToSomeNoteOnset(
          previousMeasure + measureLength,
          allNotes,
        );
        if (previousMeasure === newMeasure) break;
        measures.push(
          <Measure
            key={i}
            second={newMeasure}
            number={i}
            selectedDownbeat={selectedDownbeat}
            selectDownbeat={selectDownbeat}
          />,
        );
        beats.push(
          <Beat
            key={`${i}_1`}
            second={previousMeasure * 0.75 + newMeasure * 0.25}
          />,
        );
        beats.push(
          <Beat
            key={`${i}_2`}
            second={previousMeasure * 0.5 + newMeasure * 0.5}
          />,
        );
        beats.push(
          <Beat
            key={`${i}_3`}
            second={previousMeasure * 0.25 + newMeasure * 0.75}
          />,
        );
        // measureLength = newMeasure - previousMeasure // I'm not sure it improves anything
        previousMeasure = newMeasure;
        if (i === analysis.loop) {
          loopLeft = secondsToX(newMeasure);
          break;
        }
      }
    }
    return (
      <>
        {measures}
        {beats}
        {
          <TonalGrid
            tonic={analysis.tonic}
            width={secondsToX(maxRigthSpan) + 100}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
          />
        }
        {loopLeft && (
          <div
            style={{
              position: "absolute",
              backgroundColor: "#222",
              left: loopLeft,
              height: "100%",
              right: 0,
              opacity: 0.7,
              zIndex: 100,
              width: "3000px",
            }}
          >
            <div style={{ margin: "20px", color: "white" }}>Loop</div>
          </div>
        )}
      </>
    );
  },
);

type AnalysisPart = React.FC<{ analysis: Analysis }>;

const Key: AnalysisPart = React.memo(({ analysis }) => {
  const { tonic, mode } = analysis;
  return <>{tonic !== null && <div>midiNumber: {tonic}</div>}</>;
});

export const AnalysisBox: React.FC<{
  analysis: Analysis;
  saveAnalysis: (analysis: Analysis) => void;
  setAnalysis: (analysis: Analysis) => void;
  selectedDownbeat: number;
  selectDownbeat: (downbeat: number | null) => void;
}> = React.memo(
  ({
    analysis,
    saveAnalysis,
    setAnalysis,
    selectedDownbeat,
    selectDownbeat,
  }) => {
    return (
      <>
        <div className="App-main-content-area settings">
          <div>
            <div style={{ display: "flex", flexDirection: "row" }}>
              <h1>Rapid Analysis</h1>
              <div style={{ marginLeft: "20px" }}>
                <button
                  className="box-button"
                  disabled={analysis.step === STEPS[0]}
                  onClick={() => prevStep(analysis, setAnalysis)}
                >
                  &lt;
                </button>{" "}
                <button
                  className="box-button"
                  disabled={analysis.step === STEPS[STEPS.length - 1]}
                  onClick={() => nextStep(analysis, setAnalysis)}
                >
                  &gt;
                </button>
              </div>
            </div>
            {"  "}
            <div>{STEP_CALL_TO_ACTION[analysis.step]}</div>
          </div>
          <div style={{ marginTop: "20px" }}>
            {selectedDownbeat !== null && (
              <div>
                <div> What happens at measure {selectedDownbeat}?</div>
                <ul>
                  <li>
                    <button
                      className="box-button"
                      onClick={() => {
                        const newAnalysis = {
                          ...analysis,
                          loop: selectedDownbeat,
                        };

                        selectDownbeat(null);
                        saveAnalysis(newAnalysis);
                        setAnalysis(newAnalysis);
                      }}
                    >
                      Loop
                    </button>
                  </li>
                  <li>Chord: click on its root</li>
                </ul>
              </div>
            )}
            Loop starts at: {analysis.loop}
            {/* <h2>Time</h2>
            <h2>Form</h2>
            <div>At which bar does it loop forever?</div> */}
            {/* <h2>Key</h2>
            <Key analysis={analysis}></Key> */}
            {/* <h2>Chords</h2>
            <h2>Harmony</h2>
            <h2>Arrangement</h2> */}
          </div>
        </div>
      </>
    );
  },
);
