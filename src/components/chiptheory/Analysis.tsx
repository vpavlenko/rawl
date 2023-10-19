import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import styled from "styled-components";
import { Note, secondsToX } from "./Chiptheory";
import { MeasuresAndBeats, getPhrasingMeasures } from "./measures";
import {
  MeasureOfRomanNumerals,
  getModulations,
  getRelativeModulations,
  romanNumeralsToArray,
  updateRomanNumerals,
} from "./romanNumerals";

export const RESOLUTION_DUMPS_PER_SECOND = 100;
export const RESOLUTION_MS = 1 / RESOLUTION_DUMPS_PER_SECOND;

const TAGS = [
  "scale:blues",
  "scale:pentatonic",
  "scale:major_pentatonic",
  "scale:tetratonic",
  "scale:chromatic",
  "scale:phrygian",
  "scale:dorian",
  "scale:mixolydian",
  "scale:lydian",
  "scale:hijaz",
  "scale:atonal",
  "scale:octatonic",
  "scale:natural_minor",
  "scale:melodic_minor",
  "scale:harmonic_minor",
  "scale:hexatonic_minor_no6",
  "scale:whole-tone",
  "scale:nikriz",
  "scale:saba",
  "scale:mixed_minor",
  "scale:hemitonic_pentatonic",
  "scale:demo",
  "harmony:stasis",
  "harmony:parallel_keys",
  "harmony:power_chords",
  "harmony:diatonic_seventh_chords",
  "harmony:blues_seventh_chords",
  "harmony:constant_structures",
  "harmony:quartal",
  "harmony:neo-riemannian",
  "harmony:diminished_seventh_chords",
  "harmony:shuttle",
  "harmony:mixolydian_shuttle",
  "harmony:lydian_shuttle",
  "harmony:plagal_shuttle",
  "harmony:phrygian_shuttle",
  "harmony:dorian_shuttle",
  "harmony:blues_shuttle",
  "harmony:I-vi shuttle",
  "harmony:i-VI shuttle",
  "harmony:i-VII shuttle",
  "harmony:I-III shuttle",
  "harmony:diminished_chord_modulation",
  "harmony:weird",
  "harmony:pure_I-V",
  "harmony:57_chord_no3",
  "harmony:parallel",
  "harmony:tonic_added-sixth_chord",
  "harmony:unison",
  "rhythm:syncopation",
  "rhythm:interesting",
  "rhythm:swing",
  "rhythm:clave",
  "rhythm:latin",
  "rhythm:3+3+2",
  "rhythm:1+2+2+2",
  "rhythm:3+3+3+3+2+2",
  "rhythm:4 against 3",
  "rhythm:3 against 2",
  "tempo:accelerando",
  "tempo:ritardando",
  "tempo:uneven",
  "tempo:twice_as_fast",
  "beats:unclear_measure_onsets",
  "beats:incomplete_measure_on_transition",
  "beats:extra_beat", // these two tags are probably the same
  "beats:division_change",
  "tonic:ambiguous", // when pitch class set is uniform 7 notes, but no certain tonic
  "location:scary",
  "location:launch_screen",
  "location:menu",
  "location:intro", // it's a story film
  "location:level_start",
  "location:level",
  "location:boss",
  "location:final_boss",
  "location:level_completed",
  "location:lost",
  "location:game_won",
  "location:credits",
  "location:after_credits",
  "location:jingle",
  "location:shop",
  "location:password",
  "location:sport_level",
  "location:sport_half_time",
  "location:sport_points_scored",
  "location:pause",
  "chip:extensions",
  "chip:tonal_DMC",
  "chip:toms_DMC",
  "chip:vocal_DMC",
  "voice_leading:descending_chromatic_bass",
  "voice_leading:descending_diatonic_bass",
  "voice_leading:ascending_bass",
  "voice_leading:descending_chromatic_melody",
  "voice_leading:ascending_chromatic",
  "voice_leading:Vsus4",
  "voice_leading:Isus4",
  "voice_leading:Cad64",
  "voice_leading:Ger+6",
  "voice_leading:triple_suspension",
  "voice_leading:W-arpeggio",
  "voice_leading:rich_ornamentation",
  "voice_leading:three_parallel_voices",
  "non-chord tones:neighbor",
  "chord:N6",
  "chord:Aug6",
  "motive:4 repetitions",
  "motive:3 repetitions",
  "form:ABA",
  "form:AABA",
  "form:ABABC",
  "form:ABAC",
  "form:ABACA",
  "form:B_part_triple_shuttle",
  "form:12-bar_blues",
  "form:16-bar_blues",
  "form:basso_ostinato",
  "form:fermata_between_sections",
  "form:extra_measure",
  "form:stasis_vs_progression", // contrast between A and B
  "form:period",
  "form:uniform_period",
  "form:reversed_period",
  "form:tag",
  "form:accumulative",
  "form:solo",
  "form:abrupt_ending",
  "form:verse-chorus",
  "form:development_through_timbre",
  "form:sentence",
  "form:not_looped",
  "form:progression",
  "timbre:ultra_fast_notes",
  "timbre:rich",
  "timbre:layered",
  "timbre:wide_vibrato",
  "timbre:oscillator_as_percussion",
  "timbre:unexpected_detune",
  "timbre:silence",
  "timbre:chirp",
  "timbre:portamento",
  "timbre:one-channel delay",
  "melody:riff",
  "melody:transposed_riff",
  "melody:chromatic_embellishments",
  "melody:basic_idea_x3",
  "melody:fills_at_rests",
  "bass:transposed_riff",
  "bass:riff",
  "bass:walking",
  "bass:melody",
  "bass:alberti",
  "bass:pedal_point",
  "bass:counterpoint",
  "bass:octaves",
  "bass:root",
  "bass:root_fifth",
  "bass:root_third_fifth",
  "bass:absent",
  "bass:inversions",
  "bass:different_strategies",
  "style:common_practice",
  "style:ragtime",
  "style:waltz",
  "style:arabic",
  "style:functional_blues",
  "style:chinese",
  "style:major_chord_jingle",
  "style:bagpipe",
  "style:bossa_nova",
  "style:boogie-woogie",
  "middle_voice:melody_echo",
  "middle_voice:doubles_bass",
  "middle_voice:parallel_octaves",
  "middle_voice:parallel_fourths",
  "middle_voice:parallel_fifths",
  "middle_voice:parallel_thirds",
  "middle_voice:parallel_thirds_with_bass",
  "middle_voice:mixed_parallel",
  "middle_voice:thirds_and_sixths",
  "middle_voice:parallel_sixths",
  "middle_voice:lower_chord_tones",
  "middle_voice:creative_chord_tones",
  "middle_voice:root",
  "middle_voice:static_chord_tones",
  "middle_voice:drone",
  "middle_voice:riff",
  // four most typical cases:
  "middle_voice:absent",
  "middle_voice:melody", // that implicitly means "upper_voice:arpeggio"
  "middle_voice:arpeggio", // that implicitly means "upper_voice:melody"
  "melody:arpeggio", // that implicitly means "no melody anywhere"
  "melody:reharmonization",
  "reference:previous_subtune",
  "motive:natural_horn_call",
  "motive:cadential",
  "upper_voices:polyphony",
  "upper_voices:arpeggio",
  "upper_voices:absent",
  "upper_voices:legato_melody",
  "upper_voices:different_strategies",
  "percussion:layered",
  "analyzed_in:hopkins",
  "analyzed_in:the common cold",
];

const FORM_SECTIONS = [
  "A",
  "A'",
  "B",
  "B'",
  "C",
  "C'",
  "D",
  "D'",
  "E",
  "E'",
  "intro",
  "intro (looped)",
  "intro (not looped)",
  "bridge",
  "verse",
  "chorus",
  "A:antecedent",
  "A:consequent",
  "B:antecedent",
  "B:consequent",
  "antecedent",
  "consequent",
  "sentence. basic idea",
  "basic idea repeated",
  "fragmentation",
  "cadence",
  "extra measure",
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
  romanNumerals?: string;
  comment: string;
  tags: string[];
  disableSnapToNotes: boolean;
  form?: { [key: number]: string };
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
  form: [],
};

// These two don't propagate to Firestore because they tweak transient state.
export const prevStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) - 1] });

export const nextStep = (analysis, setAnalysis) =>
  setAnalysis({ ...analysis, step: STEPS[STEPS.indexOf(analysis.step) + 1] });

export const getNewAnalysis = (
  note: Note | null,
  selectedDownbeat: number | null,
  analysis: Analysis,
  time: number = null,
  notes: Note[] = [],
  measures: number[] = [],
  altKey: boolean = false,
): Analysis => {
  let update: Partial<Analysis> = {};

  if (selectedDownbeat !== null) {
    if (altKey) {
      if (note) {
        update.modulations = { ...(analysis.modulations || []) };
        update.modulations[selectedDownbeat] = (note.note.midiNumber %
          12) as PitchClass;
      }
    } else {
      update.correctedMeasures = { ...(analysis.correctedMeasures || []) };
      update.correctedMeasures[selectedDownbeat] = note?.span[0] ?? time;
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

  return { ...analysis, ...update };
};

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
  const newAnalysis = getNewAnalysis(
    note,
    selectedDownbeat,
    analysis,
    time,
    notes,
    measures,
    altKey,
  );

  selectDownbeat(null);
  saveAnalysis(newAnalysis);
  setAnalysis(newAnalysis);
};

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

const Downbeat = styled(VerticalBar)`
  background-color: #444;
`;

const BeatBar = styled(VerticalBar)`
  border-left: 1px dashed #262626;
`;

const Measure: React.FC<{
  span: [number, number];
  number: number;
  isFourMeasureMark: boolean;
  selectedDownbeat: number;
  selectDownbeat: (number: number) => void;
  romanNumeral: string;
  formSection: string;
  modulation: PitchClass | null;
}> = ({
  span,
  number,
  isFourMeasureMark,
  selectedDownbeat,
  selectDownbeat,
  romanNumeral,
  formSection,
  modulation,
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
      {formSection && (
        <div
          key={`form_section_${number}`}
          style={{
            position: "absolute",
            left: `${left + 1}px`,
            top: "55px",
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
          top: 0,
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
      const width = secondsToX(to - from);
      if (!width) continue;
      for (let octave = 2; octave <= 9; ++octave) {
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
    measuresAndBeats,
    midiNumberToY,
    noteHeight,
    selectedDownbeat,
    selectDownbeat,
  }) => {
    const { measures, beats } = measuresAndBeats;
    let loopLeft = null;

    if (analysis.loop) {
      loopLeft = secondsToX(measures[analysis.loop - 1]);
    }

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
              selectedDownbeat={selectedDownbeat}
              selectDownbeat={selectDownbeat}
              romanNumeral={romanNumeralsToArray(analysis?.romanNumerals)[i]}
              modulation={
                number in relativeModulations
                  ? relativeModulations[number]
                  : null
              }
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
              background:
                "linear-gradient(to right, rgba(0, 0, 0, 0.5) 0%, rgba(0,0,0,0.9) 300px)",
              left: loopLeft,
              height: "100%",
              right: 0,
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
      mergeValueIntoAnalysis = null,
    ) => {
      const [value, setValue] = useState(initialValue.toString());
      const [isSaved, setIsSaved] = useState(false);

      useEffect(() => {
        setValue(analysis[analysisFieldName] ?? initialValue.toString());
      }, [analysis[analysisFieldName]]); // TODO: doesn't work for formSection

      useEffect(() => {
        if (isSaved) {
          const timer = setTimeout(() => setIsSaved(false), 100);
          return () => clearTimeout(timer);
        }
      }, [isSaved]);

      const handleKeyDown = (e) => {
        if (e.key === "Enter") {
          const newAnalysis = mergeValueIntoAnalysis
            ? mergeValueIntoAnalysis(analysis, value)
            : {
                ...analysis,
                [analysisFieldName]:
                  typeof initialValue === "number"
                    ? parseInt(value, 10)
                    : value,
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
    const formSection = useInputField(
      "",
      null,
      "Form section",
      undefined,
      (analysis, value) => {
        selectDownbeat(null);
        return {
          ...analysis,
          form: { ...analysis.form, [selectedDownbeat]: value },
        };
      },
    );

    return (
      <div className="App-main-content-area settings" key="AnalysisBox">
        <div key="nav-buttons">
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
        <div key="menu" style={{ marginTop: "20px" }}>
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
                        ].sort((a, b) => a - b),
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
                <li>
                  {formSection}
                  <div>
                    {FORM_SECTIONS.map((formSection) => (
                      <button
                        style={{ marginRight: "10px", marginTop: "10px" }}
                        className="box-button"
                        onClick={() => {
                          const newAnalysis = {
                            ...analysis,
                            form: {
                              ...analysis.form,
                              [selectedDownbeat]: formSection,
                            },
                          };

                          selectDownbeat(null);
                          saveAnalysis(newAnalysis);
                          setAnalysis(newAnalysis);
                        }}
                      >
                        {formSection}
                      </button>
                    ))}
                  </div>
                </li>
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
