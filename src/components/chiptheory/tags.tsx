import * as React from "react";
import { Analysis, TagSpan } from "./Analysis";
import { secondsToX } from "./Chiptheory";
import { MeasuresAndBeats } from "./measures";

export const TAGS = [
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
  "scale:harmonic_major",
  "scale:hexatonic_minor_no6",
  "scale:whole-tone",
  "scale:nikriz",
  "scale:saba",
  "scale:mixed_minor",
  "scale:hemitonic_pentatonic",
  "scale:demo",
  "scale:dorian_over_pentatonic",
  "scale:mixed_major",
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
  "harmony:lydian_shuttle", // all ambiguous cases are marked as mixolydian shuttle
  "harmony:plagal_shuttle",
  "harmony:phrygian_shuttle",
  "harmony:dorian_shuttle",
  "harmony:blues_shuttle",
  "harmony:I-vi shuttle",
  "harmony:i-VI shuttle",
  "harmony:i-VII shuttle",
  "harmony:I-III shuttle",
  "harmony:i-bvii shuttle",
  "harmony:diminished_chord_modulation",
  "harmony:weird",
  "harmony:weird_alterations",
  "harmony:pure_I-V",
  "harmony:pure_i-V",
  "harmony:57_chord_no3",
  "harmony:parallel",
  "harmony:tonic_added-sixth_chord",
  "harmony:unison",
  "harmony:rich_common_practice",
  "harmony:far-out_point",
  "harmony:weird_chord",
  "harmony:turnaround_coda",
  "harmony:picardy_third",
  "harmony:rich",
  "harmony:upper_structure",
  "harmony:I-IV-V",
  "harmony:V7b9",
  "harmony:Vsus4",
  "harmony:implied",
  "rhythm:syncopation",
  "rhythm:interesting",
  "rhythm:swing",
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
  "voice_leading:Isus4",
  "voice_leading:Cad64",
  "voice_leading:Ger+6",
  "voice_leading:triple_suspension",
  "voice_leading:W-arpeggio",
  "voice_leading:rich_ornamentation",
  "voice_leading:three_parallel_voices",
  "voice_leading:three_independent_voices",
  "non-chord_tones:neighbor",
  "non-chord_tones:double_neighbor",
  "non-chord_tones:chromatic_passing",
  "non-chord_tones:mordent",
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
  "form:not_looped", // this tag is needed because sometimes annotation lacks looping even when it's present. jingles aren't annotated, only long forms
  "form:progression",
  "form:EDM",
  "form:complex",
  "form:binary",
  "form:binary_with_intro",
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
  "timbre:minor_seconds",
  "timbre:chorus",
  "timbre:tremolo",
  "timbre:many_instruments_same_oscillator",
  "timbre:variable_duty_cycle",
  "melody:riff",
  "melody:transposed_riff",
  "melody:chromatic_embellishments",
  "melody:basic_idea_x3",
  "melody:basic_idea_x4",
  "melody:fills_at_rests",
  "melody:fill_after_cadence",
  "melody:stepwise",
  "melody:chord_tones",
  "melody:development_via_rhythmic_shift",
  "melody:chord_tones_as_motive",
  "bass:drone",
  "bass:transposed_riff",
  "bass:riff",
  "bass:walking",
  "bass:melody",
  "bass:alberti",
  "bass:pedal_point",
  "bass:counterpoint",
  "bass:root_octaves",
  "bass:mixed_octaves",
  "bass:root",
  "bass:root_third",
  "bass:root_fifth",
  "bass:root_third_fifth",
  "bass:root_third_fifth_seventh",
  "bass:creative_chord_tones",
  "bass:absent",
  "bass:inversions",
  "bass:different_strategies",
  "bass:smooth_chord_tones",
  "bass:doubles_melody",
  "bass:diatonic_approach",
  "style:common_practice",
  "style:ragtime",
  "style:waltz",
  "style:arabic",
  "style:functional_blues",
  "style:chinese",
  "style:major_chord_jingle",
  "style:single_chord_jingle",
  "style:bagpipe",
  "style:bossa_nova",
  "style:boogie-woogie",
  "style:banjo",
  "middle_voice:melody_echo",
  "middle_voice:doubles_bass",
  "middle_voice:parallel_octaves",
  "middle_voice:parallel_fourths",
  "middle_voice:parallel_fifths",
  "middle_voice:parallel_thirds",
  "middle_voice:parallel_thirds_with_bass",
  "middle_voice:mixed_parallel", // this is probably the same as "counterpoint"
  "middle_voice:thirds_and_sixths",
  "middle_voice:parallel_sixths",
  "middle_voice:thirds_and_chord_tones",
  "middle_voice:lower_chord_tones",
  "middle_voice:creative_chord_tones", // TODO: check that it's not used for bass
  "middle_voice:root",
  "middle_voice:static_chord_tones",
  "middle_voice:drone",
  "middle_voice:riff",
  "middle_voice:transposed_riff",
  // four most typical cases:
  "middle_voice:absent",
  "middle_voice:melody_below_arpeggio",
  "middle_voice:arpeggio", // that implicitly means "upper_voice:melody"
  "melody:arpeggio", // that implicitly means "no melody anywhere"
  "melody:reharmonization",
  "reference:previous_subtune",
  "motive:natural_horn_call",
  "motive:telephone_call",
  "motive:cadential",
  "middle_voice:counterpoint",
  "middle_voice:counterpoint_and_drone",
  "upper_voices:arpeggio",
  "upper_voices:absent",
  "upper_voices:legato_melody",
  "upper_voices:different_strategies",
  "upper_voices:same_range",
  "middle_voice:two_notes",
  "upper_voice:riff", // when melody is in middle_voice
  "percussion:layered",
  "analyzed_in:hopkins",
  "analyzed_in:the common cold",
  "anomaly:strange_offset",
  "lower_voices:double_parallel",
  "lower_voices:same_range",
  "origin:demoscene",
  "origin:russia",
  "game_genre:baseball",
  "lego:pullback",
];

const STRIPE_HEIGHT = 20;
export const CATEGORIES_IN_STRIPES = [
  "melody",
  "middle_voice",
  "bass",
  "form",
  "other",
];
export const STRIPES_HEIGHT = STRIPE_HEIGHT * CATEGORIES_IN_STRIPES.length;
export const ANALYSIS_HEIGHT = STRIPES_HEIGHT + 70;

function stringToHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

function hashToColor(hash) {
  // Mask the hash to get a 6 digit hexadecimal number (for a color)
  const color = (hash & 0xffffff).toString(16).toUpperCase();

  // Ensure it's 6 digits
  return "000000".substr(0, 6 - color.length) + color;
}

function luminosityFromRGB(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ensureLowLuminosity(color) {
  const r = parseInt(color.slice(0, 2), 16) / 255;
  const g = parseInt(color.slice(2, 4), 16) / 255;
  const b = parseInt(color.slice(4, 6), 16) / 255;

  const lum = luminosityFromRGB(r, g, b);

  if (lum > 0.5) {
    // 0.5 is a mid-point, you can adjust for your needs
    // Invert the color if luminosity is too high
    const invertedR = (255 - r * 255).toString(16).padStart(2, "0");
    const invertedG = (255 - g * 255).toString(16).padStart(2, "0");
    const invertedB = (255 - b * 255).toString(16).padStart(2, "0");

    return invertedR + invertedG + invertedB;
  }

  return color;
}

export function tagToColor(str) {
  return "#" + ensureLowLuminosity(hashToColor(stringToHash(str)));
}

const StripeTag = ({
  left,
  width,
  widthInMeasures,
  tag,
  removeTag,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    style={{
      position: "absolute",
      left,
      width,
      backgroundColor: tagToColor(tag),
      color: "white",
      padding: "0 5px 0 5px",
      boxSizing: "border-box",
      height: STRIPE_HEIGHT,
      zIndex: 400 - widthInMeasures,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      borderRight: "1px solid black",
    }}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <span style={{ overflow: "hidden", fontSize: STRIPE_HEIGHT }}>
      {(CATEGORIES_IN_STRIPES.indexOf(tag.split(":")[0]) === -1
        ? tag.replace(":", ": ")
        : tag.split(":")[1]
      ).replace(/_/g, " ")}
    </span>
    {removeTag && (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          removeTag();
        }}
        style={{
          backgroundColor: "transparent",
          color: "white",
          fontSize: STRIPE_HEIGHT,
        }}
      >
        [x]
      </button>
    )}
  </div>
);

export const Stripes: React.FC<{
  tagSpans: TagSpan[];
  measuresAndBeats: MeasuresAndBeats;
  analysis: Analysis;
  saveAnalysis: (analysis: Analysis) => void;
  setAnalysis: (analysis: Analysis) => void;
  // voiceMask: boolean[];
  setVoiceMask: (voiceMask: boolean[]) => void;
  loggedIn: boolean;
}> = React.memo(
  ({
    tagSpans,
    measuresAndBeats,
    analysis,
    saveAnalysis,
    setAnalysis,
    // voiceMask,
    setVoiceMask,
    loggedIn,
  }) => {
    const stripeTags = new Array(CATEGORIES_IN_STRIPES.length)
      .fill(null)
      .map(() => []);
    tagSpans.map(({ tag, span }, tagIndex) => {
      const [category, content] = tag.split(":");
      let categoryIndex = CATEGORIES_IN_STRIPES.indexOf(category);
      if (categoryIndex === -1) {
        categoryIndex = CATEGORIES_IN_STRIPES.length - 1;
      }
      const stripeTagNode = (
        <StripeTag
          left={secondsToX(measuresAndBeats.measures[span[0] - 1])}
          width={
            secondsToX(
              measuresAndBeats.measures[
                Math.min(span[1], measuresAndBeats.measures.length - 1)
              ],
            ) - secondsToX(measuresAndBeats.measures[span[0] - 1])
          }
          widthInMeasures={span[1] - span[0]}
          tag={tag}
          removeTag={
            loggedIn &&
            (() => {
              const newTagSpans = [...tagSpans];
              newTagSpans.splice(tagIndex, 1);

              const newAnalysis = {
                ...analysis,
                tagSpans: newTagSpans,
              };

              saveAnalysis(newAnalysis);
              setAnalysis(newAnalysis);
            })
          }
          onMouseEnter={() => {
            // if (category === "bass") {
            //   // TODO: actually store the bass voice in tagSpan object in the DB
            //   const newVoiceMask = [false, false, true, false, false];
            //   setVoiceMask(newVoiceMask);
            // }
          }}
          onMouseLeave={() => {
            // if (category === "bass") {
            //   setVoiceMask([true, true, true, true, true]);
            // }
          }}
        />
      );
      stripeTags[categoryIndex].push(
        <a
          href={`/search/${category}/${content}`}
          target="_blank"
          onClick={(e) => e.stopPropagation()}
        >
          {stripeTagNode}
        </a>,
      );
    });

    return (
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: CATEGORIES_IN_STRIPES.length * STRIPE_HEIGHT,
          zIndex: 1000,
        }}
      >
        {stripeTags.map((bucket, index) => (
          <div
            style={{
              height: STRIPE_HEIGHT,
              position: "absolute",
              top: index * STRIPE_HEIGHT,
              left: 0,
              width: "100%",
            }}
          >
            <div
              style={{
                position: "absolute",
                fontSize: STRIPE_HEIGHT,
                padding: "0 5px 0 5px",
              }}
            >
              {CATEGORIES_IN_STRIPES[index].replace("middle_voice", "middle")}
            </div>
            {bucket}
          </div>
        ))}
      </div>
    );
  },
);
