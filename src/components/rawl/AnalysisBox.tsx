import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { getPhraseStarts } from "./SystemLayout";
import { Analysis } from "./analysis";

const TAGS = [
  "rhythm:swing",
  "rhythm:3+3+2",
  "rhythm:syncopation",

  "modulation:parallel_keys",
  "modulation:up_at_the_end",
  "modulation:contrast",
  "modulation:relative_major",
  "modulation:often",

  "arrangement:counterpoint",
  "arrangement:developed_piano",
  "arrangement:piano_trio",
  "arrangement:guitar_trio",
  "arrangement:fills_at_rests",
  "arrangement:ornamental_riff",

  "bass:diatonic_line",
  "bass:walking",
  "bass:diatonic_approaches",
  "bass:root",
  "bass:simple",
  "bass:riff",
  "bass:root_fifth",
  "bass:root_third_fifth",
  "bass:melody",
  "bass:developed",

  "applied:V/V",
  "applied:V/vi",
  "applied:V/iv",
  "applied:V7/IV",
  "applied:V/ii",

  "chord:ii7",
  "chord:m7s",
  "chord:V7",
  "chord:viio",
  "chord:bVII", // in major
  "chord:I_in_minor",
  "chord:Vsus4",
  "chord:Cad64",
  "chord:Picardy_third",
  "chord:i7",
  "chord:iadd6",
  "chord:iv_in_major",
  "chord:io7",
  "chord:bVI_in_major",
  "chord:Iadd6",
  "chord:bII",
  "chord:IVadd9",

  "voice-leading:Vsus4",
  "voice-leading:in_chords",
  "voice-leading:chromatic",
  "voice-leading:entire_scale",
  "voice-leading:pedal",
  "voice-leading:triple_chromatic_up",

  "chunks:V-IV",
  "chunks:V-vi_deceptive",
  "chunks:i-VII-VI-V",
  "chunks:circle_of_fifths",

  "stability:bVII-V",
  "stability:bVI-bVII-I",
  "stability:bIII",

  "time:3/4",

  "style:jazz",
  "style:reggae",
  "style:latin",
  "style:hip-hop_no_vocal",
  "style:boogie",

  "functionality:shuttle",
  "functionality:functional",
  "functionality:progression",
  "functionality:stasis",
  "functionality:drone",

  "harmony:pure_I-IV-V",

  "voicing:root",
  "voicing:power_chords",
  "voicing:triads",
  "voicing:minor_sevenths",
  "voicing:diatonic_sevenths",
  "voicing:transposed_riff",
  "voicing:alterations",
  "voicing:blues",

  "scale:dorian",
  "scale:major",
  "scale:natural_minor",
  "scale:minor",
  "scale:pentatonics",
  "scale:transposed_pentatonics",
  "scale:blues",

  "tempo:accelerando",
  "tempo:ritardando",

  "dominant:IV",
  "dominant:very_dissonant",

  "issues:merge_voices",
  "issues:mute_voices",
  "issues:manual_remeasuring_needed",
  "issues:R=1/2N",

  "form:development_through_instrumentation",
  "form:solo_piano_intro",
  "form:jazz_solo",
  "form:rock_solo",
  "form:drum_solo",
  "form:period",

  "melody:non-transposed_riff",
  "melody:in_thirds",

  "percussion:tonal",

  "texture:arpeggio",
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
        selectMeasure(null);
        return {
          phrasePatch:
            analysis.phrasePatch.at(-1).measure +
              analysis.phrasePatch.at(-1).diff ===
            selectedMeasure
              ? [
                  ...analysis.phrasePatch.slice(0, -1),
                  {
                    measure: analysis.phrasePatch.at(-1).measure,
                    diff: analysis.phrasePatch.at(-1).diff + value,
                  },
                ]
              : [
                  ...analysis.phrasePatch,
                  { measure: selectedMeasure, diff: value },
                ],
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
              {getPhraseStarts(analysis, 400).indexOf(selectedMeasure) !==
                -1 && (
                <li>
                  Move phrase start
                  {movePhraseStart}
                </li>
              )}
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
            <ul>
              <li>Click on the note to set global tonic</li>
              <li>Alt+click to manually shift onset of measure 2</li>
            </ul>
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
