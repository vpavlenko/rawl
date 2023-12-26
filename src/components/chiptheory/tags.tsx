import * as React from "react";
import { secondsToX } from "./Chiptheory";
import { Analysis, TagSpan } from "./analysis";
import { MeasuresAndBeats } from "./measures";
import { Note, NotesInVoices } from "./noteParsers";

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
  "scale:mixed_b2",
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
  "harmony:harmonic_rhythm_acceleration",
  "harmony:weird_dominant",
  "harmony:I_in_minor",
  "harmony:non-functional_maj7s",
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
  "form:ABAB",
  "form:B_part_triple_shuttle",
  "form:12-bar_blues",
  "form:16-bar_blues",
  "form:basso_ostinato",
  "form:fermata_between_sections",
  "form:extra_measure",
  "form:stasis_vs_progression", // contrast between A and B
  "form:period",
  "form:period_without_melodic_repetition",
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
  "form:modulation",
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
  "timbre:siren",
  "timbre:melody_echo",
  "melody:riff",
  "melody:transposed_riff",
  "melody:chromatic_embellishments",
  "melody:basic_idea_x3",
  "melody:basic_idea_x4",
  "melody:basic_idea_x2_and_fragmentation",
  "melody:x2_vs_new_x2",
  "melody:x2",
  "melody:fills_at_rests",
  "melody:fill_after_cadence",
  "melody:stepwise",
  "melody:chord_tones",
  "melody:development_via_rhythmic_shift",
  "melody:development_via_embellishments",
  "melody:chord_tones_as_motive",
  "melody:arc",
  "melody:inversion",
  "melody:ascending_chromatic",
  "melody:higher_pitch_on_repeat",
  "melody:starts_later_than_beat_one",
  "melody:song-like",
  "bass:drone",
  "bass:transposed_riff",
  "bass:riff",
  "bass:walking",
  "bass:melody",
  "bass:alberti",
  "bass:pedal_point", // should I rename to "harmony:pedal_point"?
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
  "bass:chromatic_approach",
  "bass:parallel_thirds_with_melody",
  "bass:scale",
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
  "style:math-rock",
  "style:big_band",
  "style:reggae",
  "style:static_power_chord_riff",
  "other:wrong_author",
  "middle_voice:doubles_bass",
  "middle_voice:parallel_octaves",
  "middle_voice:parallel_fourths",
  "middle_voice:parallel_fifths",
  "middle_voice:parallel_thirds",
  "middle_voice:parallel_thirds_with_bass",
  "middle_voice:mixed_parallel", // this is probably the same as "counterpoint"
  "middle_voice:parallel_thirds_and_sixths",
  "middle_voice:parallel_sixths",
  "middle_voice:parallel_thirds_and_chord_tones",
  "middle_voice:lower_chord_tones",
  "middle_voice:any_chord_tones",
  "middle_voice:creative_chord_tones", // TODO: check that it's not used for bass
  "middle_voice:root",
  "middle_voice:static_chord_tones",
  "middle_voice:drone",
  "middle_voice:riff",
  "middle_voice:riffy_complex",
  "middle_voice:transposed_riff",
  // four most typical cases:
  "middle_voice:absent",
  "middle_voice:melody_below_arpeggio",
  "middle_voice:arpeggio", // that implicitly means "upper_voice:melody"
  "middle_voice:root_octaves",
  "melody:arpeggio", // that implicitly means "no melody anywhere"
  "melody:reharmonization",
  "reference:previous_subtune",
  "reference:copy_of_previous_subtune",
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
  "bass:two_notes",
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
  "midi:no_beat_grid",
  "midi:extra_half_measure",
  "midi:time_signature_bugs",
  "bassist:James_Jamerson",
];

export const getAnalysisTags = (analysis: Analysis): string[] =>
  Array.from(
    new Set([
      ...(analysis.tags ?? []),
      ...(analysis.tagSpans?.map(({ tag }) => tag) ?? []),
    ]),
  );

const STRIPE_HEIGHT = 20;
export const CATEGORIES_IN_STRIPES = [
  "melody",
  "middle_voice",
  "bass",
  "harmony",
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

export const getAverageMidiNumber = (notes: Note[]) =>
  notes.length > 0
    ? notes[0].isDrum
      ? 0
      : notes.reduce((sum, note) => sum + note.note.midiNumber, 0) /
        notes.length
    : Infinity;

const EPSILON = 0.05; // 50 ms

type SemanticVoices = {
  bass: number;
  middle?: number;
  high?: number;
};

const getSemanticVoicesForSpan = (
  voices: NotesInVoices,
  startSecond: number,
  endSecond: number,
): SemanticVoices => {
  const sortedVoices = voices
    .map((voice, index) => [
      getAverageMidiNumber(
        voice.filter(
          (note) =>
            note.span[0] + EPSILON >= startSecond &&
            note.span[1] - EPSILON <= endSecond,
        ),
      ),
      index,
    ])
    .sort((a, b) => a[0] - b[0]);
  if (sortedVoices[1][0] === Infinity) {
    return { bass: sortedVoices[0][1] };
  }
  if (sortedVoices[2][0] === Infinity) {
    return { bass: sortedVoices[0][1], high: sortedVoices[1][1] };
  }
  return {
    bass: sortedVoices[0][1],
    middle: sortedVoices[1][1],
    high: sortedVoices[2][1],
  };
};

const StripeTag: React.FC<{
  startSecond: number;
  endSecond: number;
  widthInMeasures: number;
  tag: string;
  tagVoices: number[];
  removeTag: () => void;
  setVoiceMask: (voiceMask: boolean[]) => void;
  seek: (ms: number) => void;
  attachVoices: () => void;
  setShowIntervals: (yes: boolean) => void;
}> = ({
  startSecond,
  endSecond,
  widthInMeasures,
  tag,
  tagVoices,
  setVoiceMask,
  seek,
  removeTag,
  attachVoices,
  setShowIntervals,
}) => {
  const [category, value] = tag.split(":");
  const dummyPickVoices = pickSemanticVoicesForTag(
    { bass: -1, middle: -1, high: -1 },
    category,
    value,
  );
  return (
    <div
      className={"stripeTag"}
      style={{
        position: "absolute",
        left: secondsToX(startSecond),
        width: secondsToX(endSecond) - secondsToX(startSecond),
        backgroundColor: tagToColor(tag),
        color: "white",
        padding: "0 5px 0 5px",
        boxSizing: "border-box",
        height: STRIPE_HEIGHT,
        zIndex: 4000 - widthInMeasures,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: "20px",
        borderRight: "1px solid black",
        overflow: "hidden",
      }}
      onClick={(e) => e.stopPropagation()}
    >
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
      <a
        href={`/chiptheory/search/${category}/${value}`}
        target="_blank"
        onClick={(e) => e.stopPropagation()}
      >
        <span style={{ fontSize: STRIPE_HEIGHT }}>
          {value.replace(/_/g, " ")}
        </span>
      </a>
      {attachVoices && !tagVoices && dummyPickVoices && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            attachVoices();
          }}
          style={{
            backgroundColor: "transparent",
            color: "white",
            fontSize: STRIPE_HEIGHT,
          }}
        >
          [attach {dummyPickVoices.length === 1 ? "a voice" : "voices"}]
        </button>
      )}
      <span>
        {tagVoices?.map((voice) => (
          <span
            onClick={() => {
              const mask = [false, false, false, false, false];
              mask[voice] = true;
              setVoiceMask(mask);
              setShowIntervals(false);
              seek(startSecond * 1000);
            }}
            style={{
              fontSize: STRIPE_HEIGHT,
              marginRight: "10px",
              cursor: "pointer",
            }}
          >
            #{voice}
          </span>
        ))}
        {(!tagVoices || tagVoices.length > 1) && (
          <span
            onClick={() => {
              if (tagVoices) {
                const mask = [false, false, false, false, false];
                tagVoices.forEach((voice) => (mask[voice] = true));
                setVoiceMask(mask);
              } else {
                setVoiceMask([true, true, true, true, true]);
              }
              seek(startSecond * 1000);
              setShowIntervals(value.startsWith("parallel"));
            }}
            style={{ fontSize: STRIPE_HEIGHT, cursor: "pointer" }}
          >
            {tagVoices ? "mix" : "play"}
          </span>
        )}
      </span>
    </div>
  );
};

const pickSemanticVoicesForTag = (
  semanticVoices: SemanticVoices,
  category: string,
  value: string,
): number[] | null => {
  if (category === "bass") {
    if (value === "parallel_thirds_with_melody") {
      return [semanticVoices.bass, semanticVoices.high];
    }
    return [semanticVoices.bass];
  }
  if (category === "middle_voice") {
    if (value === "absent") {
      return null;
    }
    if (value.startsWith("parallel") || value.endsWith("chord_tones")) {
      return [semanticVoices.middle, semanticVoices.high];
    }
    if (value === "melody_below_arpeggio") {
      return [semanticVoices.high, semanticVoices.middle];
    }
    return [semanticVoices.middle];
  }
  if (category === "melody") {
    if (value === "fills_at_rests") {
      return [semanticVoices.high, semanticVoices.middle];
    }
    // will fail when middle_voice:melody
    return [semanticVoices.high];
  }
  if (category === "timbre") {
    if (value === "oscillator_as_percussion") {
      return [semanticVoices.bass];
    }
    if (value === "ultra_fast_notes") {
      return [semanticVoices.high];
    }
  }
  return null;
};

export type StripesSpecificProps = {
  commitAnalysisUpdate: (analysisUpdate: Partial<Analysis>) => void;
  setVoiceMask: (voiceMask: boolean[]) => void;
  loggedIn: boolean;
  seek: (ms: number) => void;
  setShowIntervals: (yes: boolean) => void;
  voices: NotesInVoices;
};

export const Stripes: React.FC<
  {
    tagSpans: TagSpan[];
    measuresAndBeats: MeasuresAndBeats;
    analysis: Analysis;
  } & StripesSpecificProps
> = React.memo(
  ({
    tagSpans,
    measuresAndBeats,
    analysis,
    commitAnalysisUpdate,
    setVoiceMask,
    loggedIn,
    voices,
    seek,
    setShowIntervals,
  }) => {
    const stripeTags = new Array(CATEGORIES_IN_STRIPES.length)
      .fill(null)
      .map(() => []);
    tagSpans.map(({ tag, span, voices: tagVoices }, tagIndex) => {
      const [category, value] = tag.split(":");
      let categoryIndex = CATEGORIES_IN_STRIPES.indexOf(category);
      if (categoryIndex === -1) {
        if (category === "scale") {
          categoryIndex = CATEGORIES_IN_STRIPES.indexOf("harmony");
        } else {
          categoryIndex = CATEGORIES_IN_STRIPES.length - 1;
        }
      }
      const startSecond = measuresAndBeats.measures[span[0] - 1];
      const endSecond =
        measuresAndBeats.measures[
          Math.min(span[1], measuresAndBeats.measures.length - 1)
        ];
      stripeTags[categoryIndex].push(
        <StripeTag
          startSecond={startSecond}
          endSecond={endSecond}
          widthInMeasures={span[1] - span[0]}
          tag={tag}
          tagVoices={tagVoices}
          setVoiceMask={setVoiceMask}
          seek={seek}
          removeTag={
            loggedIn &&
            (() => {
              const newTagSpans = [...tagSpans];
              newTagSpans.splice(tagIndex, 1);

              commitAnalysisUpdate({
                ...analysis,
                tagSpans: newTagSpans,
              });
            })
          }
          attachVoices={
            loggedIn &&
            (() => {
              const semanticVoices = getSemanticVoicesForSpan(
                voices,
                startSecond,
                endSecond,
              );
              const pickedVoices = pickSemanticVoicesForTag(
                semanticVoices,
                category,
                value,
              );
              if (pickedVoices) {
                commitAnalysisUpdate({
                  ...analysis,
                  tagSpans: [
                    ...tagSpans.slice(0, tagIndex),
                    {
                      tag,
                      span,
                      voices: pickedVoices,
                    },
                    ...tagSpans.slice(tagIndex + 1),
                  ],
                });
              }
            })
          }
          setShowIntervals={setShowIntervals}
        />,
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
        <div
          style={{
            height: STRIPE_HEIGHT,
            position: "absolute",
            top: CATEGORIES_IN_STRIPES.length * STRIPE_HEIGHT,
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
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setVoiceMask([true, true, true, true, true]);
                setShowIntervals(false);
              }}
              style={{
                backgroundColor: "transparent",
                color: "white",
                fontSize: STRIPE_HEIGHT,
              }}
            >
              [mix]
            </button>
          </div>
        </div>
      </div>
    );
  },
);
