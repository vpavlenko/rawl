import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import styled from "styled-components";
import { Note, secondsToX } from "./Chiptheory";
import { MeasuresAndBeats, getPhrasingMeasures } from "./measures";
import {
  MeasureOfRomanNumerals,
  getModulations,
  romanNumeralsToArray,
  updateRomanNumerals,
} from "./romanNumerals";

export const RESOLUTION_DUMPS_PER_SECOND = 100;
export const RESOLUTION_MS = 1 / RESOLUTION_DUMPS_PER_SECOND;

const TAGS = [
  "scale:blues",
  "scale:pentatonic",
  "scale:chromatic",
  "scale:phrygian",
  "scale:dorian",
  "scale:mixolydian",
  "scale:lydian",
  "scale:hijaz",
  "scale:hijazkar",
  "scale:atonal",
  "scale:octatonic",
  "scale:natural_minor",
  "harmony:stasis",
  "harmony:parallel_keys",
  "rhythm:syncopation",
  "rhythm:interesting",
  "rhythm:swing",
  "rhythm:clave",
  "tempo:accelerando",
  "tempo:ritardando",
  "chip:extensions",
  "voice-leading:descending-chromatic-bass",
  "voice-leading:descending-chromatic-melody",
  "voice-leading:Vsus4",
  "voice-leading:Cad64",
  "voice-leading:triple_suspension",
  "chord:N6",
  "chord:Aug6",
  "form:ABA",
  "form:12-bar-blues",
  "bass:walking",
];

export const STEPS = [
  "tonic",
  "first measure",
  "second measure",
  "end",
] as const;

export type Step = (typeof STEPS)[number];

const STEP_FONT_COLOR: {
  [key in Step]: string;
} = {
  "first measure": "#ffaaaa",
  "second measure": "#ffffaa",
  tonic: "#aaffaa",
  end: "white",
};

export const STEP_CALL_TO_ACTION: Record<Step, string> = {
  "first measure": "Click on a note at the start of the first measure",
  "second measure": "Click on a note at the start of the second measure",
  tonic: "Click on a main tonic",
  end: "Click on root notes to enter chords. Alt+click for half duration",
};

export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export type Analysis = {
  clickResolutionMs: number;
  step: Step;
  firstMeasure: number;
  secondMeasure: number;
  correctedMeasures: { [key: number]: number };
  fourMeasurePhrasingReferences: number[];
  beatsPerMeasure: number;
  loop: number | null;
  tonic: PitchClass | null;
  modulations: { [key: number]: PitchClass };
  basedOn: string;
  romanNumerals: string;
  comment: string;
  tags: string[];
  disableSnapToNotes: boolean;
};

export const ANALYSIS_STUB: Analysis = {
  clickResolutionMs: RESOLUTION_MS,
  step: STEPS[0],
  firstMeasure: null,
  secondMeasure: null,
  correctedMeasures: [],
  fourMeasurePhrasingReferences: [],
  modulations: [],
  beatsPerMeasure: 4,
  loop: null,
  tonic: null,
  basedOn: null,
  romanNumerals: "",
  comment: "",
  tags: [],
  disableSnapToNotes: false,
};

// These two don't propagate to Firestore because they tweak transient state.
export const prevStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) - 1] });

export const nextStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) + 1] });

export const advanceAnalysis = (
  note: Note | null,
  selectedDownbeat: number | null,
  selectDownbeat: (_: null) => void,
  analysis: Analysis,
  saveAnalysis,
  setAnalysis,
  time: number = null,
  notes: Note[] = [],
  measures: number[] = [],
  altKey: boolean = false,
) => {
  let update: Partial<Analysis> = {};

  if (selectedDownbeat !== null) {
    if (altKey) {
      if (note) {
        update.modulations = { ...(analysis.modulations || []) };
        update.modulations[selectedDownbeat] = (note.note.midiNumber %
          12) as PitchClass;
        selectDownbeat(null);
      }
    } else {
      update.correctedMeasures = { ...(analysis.correctedMeasures || []) };
      update.correctedMeasures[selectedDownbeat] = note?.span[0] ?? time;
      selectDownbeat(null);
    }
  } else {
    const { step } = analysis;
    if (step !== "end") {
      update.step = STEPS[STEPS.indexOf(step) + 1];
    }

    if (step === "first measure") {
      update.firstMeasure = note.span[0];
    } else if (step === "second measure") {
      update.secondMeasure = note.span[0];
    } else if (step === "tonic") {
      update.tonic = (note.note.midiNumber % 12) as PitchClass;
    } else if (step === "end") {
      update.romanNumerals = updateRomanNumerals(
        analysis,
        note,
        notes,
        measures,
        altKey,
      );
    }
  }

  const newAnalysis = { ...analysis, ...update };

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
  background-color: #ff6666;
  pointer-events: none;
`;

const Downbeat = styled(VerticalBar)`
  background-color: #444;
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #222;
`;

const Measure: React.FC<{
  span: [number, number];
  number: number;
  isFourMeasureMark: boolean;
  selectedDownbeat: number;
  selectDownbeat: (number: number) => void;
  romanNumeral: string;
}> = ({
  span,
  number,
  isFourMeasureMark,
  selectedDownbeat,
  selectDownbeat,
  romanNumeral,
}) => {
  const left = secondsToX(span[0]) - 1;
  const width = secondsToX(span[1]) - left - 1;
  return (
    <>
      <Downbeat
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
          top: 30,
          left: `${left + 7}px`,
          color: selectedDownbeat === number ? "red" : "white",
          zIndex: 5,
          cursor: "pointer",
          userSelect: "none",
        }}
        onClick={(e) => {
          e.stopPropagation();
          selectDownbeat(number);
        }}
      >
        {number}
      </div>
      <div
        key={`db_rn_${number}`}
        style={{
          position: "absolute",
          left: `${left}px`,
          width,
          top: 0,
          height: "25px",
          display: "grid",
          placeItems: "center",
          fontSize: "25px",
          zIndex: 5,
          borderLeft: "1px solid black",
        }}
      >
        <MeasureOfRomanNumerals dashedRN={romanNumeral} />
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
      const width = secondsToX(to - from);
      if (!width) continue;
      for (let octave = 2; octave <= 7; ++octave) {
        const midiNumber = tonic + octave * 12;
        result.push(
          <>
            {/* <div
              key={`tonic_${midiNumber}`}
              style={{
                position: "absolute",
                width,
                height: noteHeight,
                left: secondsToX(from),
                top: midiNumberToY(midiNumber),
                backgroundColor: "#222",
                zIndex: 1,
              }}
            /> */}
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
  allNotes: Note[];
  measuresAndBeats: MeasuresAndBeats;
  midiNumberToY: (number: number) => number;
  noteHeight: number;
  selectedDownbeat: number;
  selectDownbeat: (number: number) => void;
}> = React.memo(
  ({
    analysis,
    allNotes,
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    selectedDownbeat,
    selectDownbeat,
  }) => {
    const { measures, beats } = measuresAndBeats;
    // const maxRigthSpan = allNotes.reduce(
    //   (maxValue, note) => Math.max(maxValue, note.span[1]),
    //   -Infinity,
    // );
    let loopLeft = null;

    if (analysis.loop) {
      loopLeft = secondsToX(measures[analysis.loop - 1]);
    }

    const phrasingMeasures = getPhrasingMeasures(analysis, measures.length);
    return (
      <>
        {measures.map((time, i) => {
          const number = i + 1; // Caveat: measures are 1-indexed when stored in the DB .__.
          return (
            <Measure
              key={i}
              span={[time, measures[i + 1] ?? time]}
              isFourMeasureMark={phrasingMeasures.indexOf(number) !== -1}
              number={number}
              selectedDownbeat={selectedDownbeat}
              selectDownbeat={selectDownbeat}
              romanNumeral={romanNumeralsToArray(analysis?.romanNumerals)[i]}
            />
          );
        })}
        {beats.map((time) => (
          <Beat key={time} second={time} />
        ))}
        {
          <TonalGrid
            analysis={analysis}
            measures={measures}
            secondsToX={secondsToX}
            midiNumberToY={midiNumberToY}
            noteHeight={noteHeight}
          />
        }
        {loopLeft && (
          <div
            key="loop"
            style={{
              boxShadow: "inset 0px -5px 10px white",
              pointerEvents: "none",
              position: "absolute",
              // backgroundColor: "#222",
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0,0,0,0.9) 300px)",
              left: loopLeft,
              height: "100%",
              right: 0,
              // opacity: 0.8,
              zIndex: 100,
              width: "5000px",
            }}
          >
            <div style={{ margin: "50px", color: "white" }}>Loop</div>
          </div>
        )}
      </>
    );
  },
);

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
    const useInputField = (
      initialValue,
      analysisFieldName,
      label,
      width = "95%",
    ) => {
      const [value, setValue] = useState(initialValue.toString());
      const [isSaved, setIsSaved] = useState(false);

      useEffect(() => {
        setValue(analysis[analysisFieldName] ?? initialValue.toString());
      }, [analysis[analysisFieldName]]);

      useEffect(() => {
        if (isSaved) {
          const timer = setTimeout(() => setIsSaved(false), 100); // adjust timing as desired
          return () => clearTimeout(timer);
        }
      }, [isSaved]);

      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          const newAnalysis = {
            ...analysis,
            [analysisFieldName]:
              typeof initialValue === "number" ? parseInt(value, 10) : value,
          };

          saveAnalysis(newAnalysis);
          setAnalysis(newAnalysis);
          setIsSaved(true);
        }
      };

      return (
        <div key={`if_${analysisFieldName}`} style={{ marginTop: "10px" }}>
          {label}:{" "}
          <input
            type="text"
            value={value}
            style={{
              width,
              backgroundColor: isSaved ? "#66d" : "#aaa",
              transition: "background-color 0.1s",
            }}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
      );
    };

    const basedOn = useInputField("", "basedOn", "Based on");
    const beatsPerMeasure = useInputField(
      4,
      "beatsPerMeasure",
      "Beats per measure",
      "1em",
    );
    const romanNumerals = useInputField("", "romanNumerals", "Roman numerals");
    const comment = useInputField("", "comment", "Comment");

    return (
      <div
        className="App-main-content-area settings"
        key="AnalysisBox"
        // style={{ marginTop: "20px" }}
      >
        <div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ marginBottom: "10px" }}>
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
          {selectedDownbeat === null && (
            <div style={{ color: STEP_FONT_COLOR[analysis.step] }}>
              {STEP_CALL_TO_ACTION[analysis.step]}
            </div>
          )}
        </div>
        <div style={{ marginTop: "20px" }}>
          {selectedDownbeat !== null ? (
            <div>
              <div>What to do with measure {selectedDownbeat}?</div>
              <ul className="vertical-list-of-buttons">
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
                    Mark loop start
                  </button>
                </li>
                <li>
                  <button
                    className="box-button"
                    onClick={() => {
                      const newAnalysis = {
                        ...analysis,
                        fourMeasurePhrasingReferences: [selectedDownbeat],
                      };

                      selectDownbeat(null);
                      saveAnalysis(newAnalysis);
                      setAnalysis(newAnalysis);
                    }}
                  >
                    Mark start of 4-measure phrasing
                  </button>
                </li>
                <li>
                  <button
                    className="box-button"
                    onClick={() => {
                      const newAnalysis = {
                        ...analysis,
                        fourMeasurePhrasingReferences: [
                          ...(analysis.fourMeasurePhrasingReferences || []),
                          selectedDownbeat,
                        ].sort(),
                      };

                      selectDownbeat(null);
                      saveAnalysis(newAnalysis);
                      setAnalysis(newAnalysis);
                    }}
                  >
                    Add custom phrasing measure (manual mode)
                  </button>
                </li>
                <li>Adjust position: click anywhere</li>
                <li>Enter modulation: alt+click on a new tonic</li>
              </ul>
            </div>
          ) : (
            <div>
              {basedOn}
              {beatsPerMeasure}
              <div key="disable_snap" style={{ marginTop: "10px" }}>
                <label>
                  <input
                    type="checkbox"
                    onChange={() => {
                      const newAnalysis = {
                        ...analysis,
                        disableSnapToNotes: !analysis.disableSnapToNotes,
                      };

                      saveAnalysis(newAnalysis);
                      setAnalysis(newAnalysis);
                    }}
                    checked={analysis.disableSnapToNotes}
                  />
                  Disable snap to notes
                </label>
              </div>
              {romanNumerals}
              {comment}
              <div key="tags" style={{ marginTop: "10px" }}>
                Tags:
                <Select
                  isMulti
                  options={TAGS.map((tag) => ({ value: tag, label: tag }))}
                  value={(analysis.tags || []).map((tag) => ({
                    value: tag,
                    label: tag,
                  }))}
                  onChange={(tags) => {
                    const newAnalysis = {
                      ...analysis,
                      tags: tags.map((tag) => tag.value),
                    };

                    saveAnalysis(newAnalysis);
                    setAnalysis(newAnalysis);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  },
);
