import * as React from "react";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Analysis } from "./analysis";

export const TAGS = [
  "rhythm:swing",
  "rhythm:3+3+2",
  "rhythm:syncopation",
  "rhythm:triplet",
  "rhythm:2_against_3",
  "rhythm:anticipation",

  "modulation:parallel_keys",
  "modulation:up_at_the_end",
  "modulation:contrast",
  "modulation:relative_major",
  "modulation:often",
  "modulation:back_down",

  "arrangement:counterpoint",
  "arrangement:developed_piano",
  "arrangement:piano_trio",
  "arrangement:guitar_trio",
  "arrangement:fills_at_rests",
  "arrangement:ornamental_riff",
  "arrangement:chordal_riff",
  "arrangement:no_chords",
  "arrangement:simple_second_line",
  "arrangement:harmonic_embellishment", // TODO: merge in pad_chord_tones
  "arrangement:pad_chord_tones",
  "arrangement:piano_glissando",
  "arrangement:silent_break",
  "arrangement:karaoke",
  "arrangement:orchestra",
  "arrangement:several_vocal_lines",

  "bass:diatonic_line",
  "bass:walking",
  "bass:diatonic_approaches",
  "bass:root",
  "bass:simple",
  "bass:riff",
  "bass:transposed_riff",
  "bass:root_fifth",
  "bass:root_third_fifth",
  "bass:melody",
  "bass:developed",
  "bass:idk",

  "applied:V/V",
  "applied:V/V/V",
  "applied:V/vi",
  "applied:V/iv",
  "applied:V7/IV",
  "applied:V/ii",
  "applied:V/iii",
  "applied:viio/",

  "inversion:IV64",

  "chord:ii7",
  "chord:ii6",
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
  "chord:V+",
  "chord:V13",
  "chord:V9",
  "chord:IaddS9",
  "chord:viø",
  "chord:III",
  "chord:ii_in_minor",
  "chord:iiadd6",

  "chord-scale:phrygian_dominant",
  "chord-scale:melodic_minor_V",
  "chord-scale:ionian_IV",

  "voice-leading:Vsus4",
  "voice-leading:Vsus4_in_applied",
  "voice-leading:in_chords",
  "voice-leading:chromatic",
  "voice-leading:entire_scale",
  "voice-leading:pedal",
  "voice-leading:triple_chromatic",
  "voice-leading:triple_diatonic",

  "chunks:V-IV",
  "chunks:V-vi_deceptive",
  "chunks:i-VII-VI-V",
  "chunks:circle_of_fifths",
  "chunks:bVII-IV-I",
  "chunks:III-IV",
  "chunk:ii-V-iii-VI",
  "chunks:I-vi-ii-V",

  "stability:bVII-V",
  "stability:bVI-bVII-I",
  "stability:bIII",
  "stability:unstable",
  "stability:rapid_circle_of_fifths",

  "time:3/4",

  "style:jazz",
  "style:modal_jazz",
  "style:jazz_fusion",
  "style:reggae",
  "style:latin",
  "style:hip-hop",
  "style:boogie",
  "style:blues",
  "style:stride",
  "style:bossa_nova",
  "style:funk",
  "style:soul_ballad",
  "style:soul",
  "style:EDM",
  "style:eurodance",
  "style:metal",
  "style:RnB",
  "style:disco",
  "style:grunge",
  "style:dance_pop",
  "style:techno",
  "style:bluegrass",
  "style:prog_rock",
  "style:rockabilly",

  "functionality:shuttle",
  "functionality:functional",
  "functionality:progression",
  "functionality:stasis",
  "functionality:drone",
  "functionality:riff",
  "functionality:short_progression",

  "harmony:pure_I-IV-V",
  "harmony:pure_I-V",
  "harmony:pure_I-ii-IV-V",
  "harmony:quartal",

  "voicing:root",
  "voicing:power_chords",
  "voicing:triads",
  "voicing:diatonic_sevenths",
  "voicing:only_minor_sevenths_in_major",
  "voicing:transposed_riff",
  "voicing:alterations",
  "voicing:blues",

  "scale:dorian",
  "scale:major",
  "scale:natural_minor",
  "scale:minor",
  "scale:pentatonic",
  "scale:transposed_pentatonic",
  "scale:blues",
  "scale:mixolydian",
  "scale:major_b6",
  "scale:hexatonic_minor",
  "scale:b3_in_major",

  "tempo:accelerando",
  "tempo:ritardando",

  "dominant:IV",
  "dominant:very_dissonant",
  "predominant:dissonant",

  "issues:merge_voices",
  "issues:mute_voices",
  "issues:manual_remeasuring_needed",
  "issues:R=1/2N",
  "issues:seek_breaks_instrument",
  "issues:noteY_mismatch",

  "form:development_through_instrumentation",
  "form:solo_piano_intro",
  "form:jazz_solo",
  "form:rock_solo",
  "form:drum_solo",
  "form:other_solo",
  "form:period",
  "form:AABA",
  "form:solo_piano",
  "form:solo_guitar",
  "form:alterations_on_last_chord",

  "melody:non-transposed_riff",
  "doubling:in_thirds",
  "melody:doubled",

  "percussion:tonal",

  "texture:arpeggio",
  "texture:rich_piano_arpeggio",
  "texture:guitar_strumming",
  "texture:strumming_riff",

  "harmony:ambiguous_tonic",

  "fx:delay",

  "phrasing:dominant_prolongation",
  "phrasing:tonic_prolongation",
  "phrasing:fusion",
  "phrasing:third_repetition",
  "phrasing:silent_break_extra_measure",

  "instrument:banjo",
];

const FORM_SECTIONS = ["intro", "verse", "chorus", "bridge", "outro", "solo"];

export const AnalysisBox: React.FC<{
  analysis: Analysis;
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void;
  selectedMeasure: number;
  selectMeasure: (measure: number | null) => void;
  artist: string;
  song: string;
}> = React.memo(
  ({
    analysis,
    commitAnalysisUpdate,
    selectedMeasure,
    selectMeasure,
    artist,
    song,
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
      autofocus: boolean = false,
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
            autoFocus={autofocus}
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

    return (
      <div key="menu" style={{ marginTop: "100px" }}>
        {selectedMeasure !== null ? (
          <div>
            <div>What to do with measure {selectedMeasure}?</div>
            <ul className="vertical-list-of-buttons">
              <li>Enter modulation: alt+click on a new tonic</li>
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
              <div style={{ color: "black" }}>
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
          </div>
        )}

        <div
          style={{ marginTop: "200px", cursor: "pointer" }}
          onClick={() => {
            navigator.clipboard.writeText(
              `<li><S artist="${artist}" song="${song}" /></li>`,
            );
          }}
        >
          {`<li><S artist="${artist}" song="${song}" /></li>`}
        </div>
      </div>
    );
  },
);
