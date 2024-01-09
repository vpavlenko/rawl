import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Analysis } from "./analysis";

const TAGS = [
  "rhythm:swing",

  "modulation:parallel_keys",

  "arrangement:counterpoint",
  "arrangement:developed_piano",
  "arrangement:piano_trio",

  "bass:diatonic_line",
  "bass:walking",

  "applied:V/V",

  "time:3/4",

  "style:jazz",
];

const FORM_SECTIONS = ["intro", "verse", "chorus", "bridge", "outro", "solo"];

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
      initialValue: string | number,
      analysisFieldName: string | null,
      label: string,
      width: string = "95%",
      createAnalysisUpdate: (
        analysis: Analysis,
        value: string,
      ) => Partial<Analysis> = null,
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
    const movePhraseStart = useInputField(
      1,
      null,
      "Diff",
      "20%",
      (analysis, stringValue) => {
        const value = parseInt(stringValue, 10);
        debugger;
        selectMeasure(null);
        return {
          phrasePatch:
            analysis.phrasePatch.filter(
              ({ measure }) => measure === selectedMeasure,
            ).length === 0
              ? [
                  ...analysis.phrasePatch,
                  { measure: selectedMeasure, diff: value },
                ]
              : analysis.phrasePatch.map(({ measure, diff }) => ({
                  measure,
                  diff: measure === selectedMeasure ? value : diff,
                })),
        };
      },
    );

    return (
      <div key="menu" style={{ marginTop: "20px" }}>
        {selectedMeasure !== null ? (
          <div>
            <div>What to do with measure {selectedMeasure}?</div>
            <ul className="vertical-list-of-buttons">
              <li>Enter modulation: alt+click on a new tonic</li>
              <li>
                Move phrase start
                {movePhraseStart}
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
          </div>
        )}
      </div>
    );
  },
);
