import * as React from "react";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { Analysis, MeasuresSpan, STEPS, Step } from "./Analysis";
import { CATEGORIES_IN_STRIPES, TAGS } from "./tags";

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
  "C:antecedent",
  "C:consequent",
  "antecedent",
  "consequent",
  "sentence. basic idea",
  "basic idea repeated",
  "fragmentation",
  "cadence",
  "extra measure",
];

const prevStep = (analysis, commitAnalysisUpdate) =>
  commitAnalysisUpdate({
    step: STEPS[STEPS.indexOf(analysis.step) - 1],
  });

const nextStep = (analysis, commitAnalysisUpdate) =>
  commitAnalysisUpdate({
    step: STEPS[STEPS.indexOf(analysis.step) + 1],
  });

const STEP_FONT_COLOR: {
  [key in Step]: string;
} = {
  "first measure": "#ffaaaa",
  "second measure": "#ffffaa",
  tonic: "#aaffaa",
  end: "white",
};

const STEP_CALL_TO_ACTION: Record<Step, string> = {
  "first measure": "Click on a note at the start of the first measure",
  "second measure": "Click on a note at the start of the second measure",
  tonic: "Click on a main tonic",
  end: "Click on root notes to enter chords. Alt+click for half duration",
};

export const AnalysisBox: React.FC<{
  analysis: Analysis;
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void;
  previouslySelectedMeasure: number;
  selectedMeasure: number;
  selectMeasure: (measure: number | null) => void;
}> = React.memo(
  ({
    analysis,
    commitAnalysisUpdate,
    previouslySelectedMeasure,
    selectedMeasure,
    selectMeasure,
  }) => {
    const useInputField = (
      initialValue,
      analysisFieldName,
      label,
      width = "95%",
      createAnalysisUpdate = null,
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
          commitAnalysisUpdate(
            createAnalysisUpdate
              ? createAnalysisUpdate(analysis, value)
              : {
                  [analysisFieldName]:
                    typeof initialValue === "number"
                      ? parseInt(value, 10)
                      : value,
                },
          );
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

    const tagSpanSelectRef = useRef(null);

    useEffect(() => {
      if (selectedMeasure !== null) {
        tagSpanSelectRef.current.focus();
      }
    }, [selectedMeasure]);

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
        selectMeasure(null);
        return {
          form: { ...analysis.form, [selectedMeasure]: value },
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
                onClick={() => prevStep(analysis, commitAnalysisUpdate)}
              >
                &lt;
              </button>{" "}
              <button
                className="box-button"
                disabled={analysis.step === STEPS[STEPS.length - 1]}
                onClick={() => nextStep(analysis, commitAnalysisUpdate)}
              >
                &gt;
              </button>
            </div>
          </div>
          {"  "}
          {selectedMeasure === null && (
            <div style={{ color: STEP_FONT_COLOR[analysis.step] }}>
              {STEP_CALL_TO_ACTION[analysis.step]}
            </div>
          )}
        </div>
        <div key="menu" style={{ marginTop: "20px" }}>
          {selectedMeasure !== null ? (
            <div>
              <div>What to do with measure {selectedMeasure}?</div>
              <ul className="vertical-list-of-buttons">
                <li>
                  <button
                    className="box-button"
                    onClick={() => {
                      selectMeasure(null);
                      commitAnalysisUpdate({
                        loop: selectedMeasure,
                      });
                    }}
                  >
                    Mark loop start
                  </button>
                </li>
                <li>
                  <button
                    className="box-button"
                    onClick={() => {
                      selectMeasure(null);
                      commitAnalysisUpdate({
                        fourMeasurePhrasingReferences: [selectedMeasure],
                      });
                    }}
                  >
                    Mark start of 4-measure phrasing
                  </button>
                </li>
                <li>
                  <button
                    className="box-button"
                    onClick={() => {
                      selectMeasure(null);
                      commitAnalysisUpdate({
                        fourMeasurePhrasingReferences: [
                          ...(analysis.fourMeasurePhrasingReferences || []),
                          selectedMeasure,
                        ].sort((a, b) => a - b),
                      });
                    }}
                  >
                    Add custom phrasing measure (manual mode)
                  </button>
                </li>
                <li>Adjust position: click anywhere</li>
                <li>Enter modulation: alt+click on a new tonic</li>
                <li>
                  <div>
                    Add tag to span: [
                    {previouslySelectedMeasure ?? selectedMeasure}-
                    {selectedMeasure}]
                    <Select
                      ref={tagSpanSelectRef}
                      options={TAGS.map((tag) => ({ value: tag, label: tag }))}
                      onChange={(tag) => {
                        selectMeasure(null);
                        commitAnalysisUpdate({
                          tagSpans: [
                            ...(analysis.tagSpans ?? []),
                            {
                              tag: tag.value,
                              span: [
                                previouslySelectedMeasure ?? selectedMeasure,
                                selectedMeasure,
                              ] as MeasuresSpan,
                            },
                          ],
                          tags: (analysis.tags ?? []).filter(
                            (item) => item !== tag.value,
                          ),
                        });
                      }}
                    />
                  </div>
                </li>
                <li>
                  {formSection}
                  <div>
                    {FORM_SECTIONS.map((formSection) => (
                      <button
                        style={{ marginRight: "10px", marginTop: "10px" }}
                        className="box-button"
                        onClick={() => {
                          selectMeasure(null);
                          commitAnalysisUpdate({
                            form: {
                              ...analysis.form,
                              [selectedMeasure]: formSection,
                            },
                          });
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
                      commitAnalysisUpdate({
                        disableSnapToNotes: !analysis.disableSnapToNotes,
                      });
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
                    commitAnalysisUpdate({
                      tags: tags.map((tag) => tag.value),
                    });
                  }}
                />
              </div>
              {analysis.tagSpans && (
                <div key="tagSpans" style={{ marginTop: "10px" }}>
                  Tag spans:
                  {analysis.tagSpans
                    .filter(
                      ({ tag }) =>
                        CATEGORIES_IN_STRIPES.indexOf(tag.split(":")[0]) === -1,
                    )
                    .map(({ tag, span }, index) => (
                      <div>
                        {tag}: [{span[0]}, {span[1]}]{" "}
                        <button
                          style={{ marginRight: "10px", marginTop: "10px" }}
                          className="box-button"
                          onClick={() => {
                            // const newTagSpans = [...analysis.tagSpans];
                            // newTagSpans.splice(index, 1);

                            // const newAnalysis = {
                            //   ...analysis,
                            //   tagSpans: newTagSpans,
                            // };

                            // saveAnalysis(newAnalysis);
                            // setAnalysis(newAnalysis);
                            alert("broken, fix");
                          }}
                        >
                          x
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
