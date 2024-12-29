import { faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import {
  Chord,
  MAJOR_MODE,
  MINOR_MODE,
  STRICT_NATURAL_MINOR,
} from "../legends/chords";
import ChordStairs, { TonicProvider } from "../legends/ChordStairs";
import { PianoLegend } from "../legends/PianoLegend";
import { TOP_100_COMPOSERS } from "../top100Composers";
import { Citation } from "./Citations";
import { CITES } from "./cites";
import { FileDropBox } from "./FileDropBox";
import Metaphors from "./Metaphors";

export const MODULATIONS_CHAPTER_TITLE = "Modulations";
export const DOUBLE_TONIC_CHAPTER_TITLE = "Double-tonic";

export const P = styled.div`
  margin-bottom: 30px;
  line-height: 1.6;
`;

export const UL = styled.ul`
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;

  & > li {
    margin-bottom: 30px;
  }
`;

const C = ({ c, title }: { c: Chord[]; title: string }) => (
  <span
    style={{
      display: "inline-block",
      position: "relative",
      top: "5px",
      padding: "3px 3px",
    }}
    title={title.replace(/b/g, "♭").replace(/#/g, "♯")}
  >
    <ChordStairs
      mode={{ title: "", chords: c }}
      scale={0.85}
      playbackMode="together"
    />
  </span>
);

export const rn = (strings: TemplateStringsArray) => (
  <span
    style={{
      fontFamily: "Fira Sans",
      fontWeight: "700",
      fontSize: "1.1em",
    }}
  >
    {strings[0].replace("7", "⁷")}
  </span>
);

export const c = (strings: TemplateStringsArray) => {
  const chordString = strings[0].trim();
  const chords = chordString.split(/\s+/);
  return <C c={chords as Chord[]} title={chordString} />;
};

export const rnc = (strings: TemplateStringsArray) => (
  <>
    <span style={{ whiteSpace: "nowrap" }}>
      {rn(strings)} {c(strings)}
    </span>
  </>
);

const ct = (string: string, tonic: number) => (
  <TonicProvider currentTonic={tonic}>{c([string] as any)}</TonicProvider>
);

export const a = (href: string, text: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "orange", whiteSpace: "nowrap" }}
  >
    {text}
  </a>
);

export const A = (href: string) => (
  <a
    href={`/f/${href}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "orange", whiteSpace: "nowrap" }}
  >
    {href}
  </a>
);

const STag = styled.a`
  cursor: pointer;
  white-space: nowrap;
`;

export const s = (tags: TemplateStringsArray) => {
  const tag = tags[0];
  return (
    <STag
      href={`/s/${tag.replace(":", "/")}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span style={{ fontVariantCaps: "small-caps", fontSize: "0.9em" }}>
        {tag
          .split(":")[0]
          .replace(/_/g, " ")
          .replace(/(?<![A-Za-z])b(?![A-Za-z])/g, "♭")}
      </span>
      <span style={{ color: "#888", fontSize: "0.9em" }}>
        :
        {tag
          .split(":")[1]
          .replace(/_/g, " ")
          .replace(/(?<![A-Za-z])b(?![A-Za-z])/g, "♭")}
      </span>
    </STag>
  );
};

const n = (text: TemplateStringsArray) => (
  <span style={{ whiteSpace: "nowrap" }}>{text}</span>
);

export const k = (layout: string, title?: string) => {
  return (
    <a
      href={`https://vpavlenko.github.io/layouts/${layout}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-block",
        color: "white",
        margin: "10px 20px 10px 0",
        padding: "7px",
        borderRadius: "3px",
        boxShadow: "0 0 2px 2px gray",
      }}
    >
      <FontAwesomeIcon icon={faKeyboard} style={{ marginRight: "10px" }} />
      {title ?? layout.replace(/-/g, " ")}
    </a>
  );
};

export const q = (citeKey: keyof typeof CITES) => (
  <Citation citeKey={citeKey} />
);

export const CHAPTER_GROUPS: Record<string, [number, number]> = {
  intro: [1, 1],
  "loops: four-chord progressions": [2, 6],
  "diatonic functional harmony": [7, 11],
  "borrowed chords": [12, 14],
  "applied chords and modulation": [15, 19],
  scales: [20, 20],
  "seventh and extended chords": [21, 24],
  style: [25, 25],
};

export const CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode | Mode[];
  pretext?: () => React.JSX.Element;
  composers: (typeof TOP_100_COMPOSERS)[number]["slug"][];
}> = [
  {
    title: "Intro",
    titleChords: ["I"],
    composers: ["happy-birthday"],
    pretext: () => (
      <>
        <h2>Structures in Western music</h2>
        <P>
          I invite you to my journey through 100 pieces of composers whose music
          is popular nowadays.
        </P>
        <P>
          I use my own piano-roll-based notation with notes colored into 12
          colors, always starting from the main note – <i>the tonic</i>. This
          simplifies visual analysis: chords like {c`IV V I`} and other
          structures become visible, scores become readable and interpretable.
        </P>
        <P>This is the color scheme we'll use through the entire book:</P>
        <P>
          <PianoLegend />
        </P>
        <P>
          You don't need any knowledge of standard notation throughout this
          journey.
        </P>

        <h2>12 notes</h2>
        <P>
          There are twelve notes in each octave of a piano:{" "}
          {c`1 b2 2 b3 3 4 #4 5 b6 6 b7 7`}
        </P>
        <P>
          Throughout the book I'll mention keyboard layouts to try out different
          concepts by playing them directly from your computer keyboard. Here
          are two keyboards showcasing all 12 notes:
        </P>
        <P>
          {k("traditional-layout")}
          {k("flat-chromatic-layout")}
        </P>
        <P>
          Each color is present several times on a piano keyboard – in different
          octaves: {c`1 3 5 1 3 5 1 3 5 1 3 5 1`}
        </P>
        {/* 
        <P>
          The distance between two consecutive keys is called a semitone.{" "}
          {c`1 b2`}, {c`4 #4`}, {c`b6 6`} and {c`6 b7`} are one semitone apart.
          All distances between two consecutive notes on a piano keyboard is the
          same since mid-19th century. {q("rings_tuning")}
        </P> */}

        <h2>Chords in a major scale</h2>
        <P>
          Some pieces are built entirely on a subset of seven notes called a
          major scale: {c`1 2 3 4 5 6 7 1 2 3 4 5 6 7 1`}
        </P>
        <P>{k("major-scale")}</P>
        <P>
          If you play three colors, it's called <i>a chord</i>. How to draw a
          nice chord from a scale? You pick a <i>root</i> color - eg. {c`1`},
          and then you pick every other note after it: skip {c`2`}, take {c`3`},
          skip {c`4`}, take {c`5`}. This way we get a "one" chord - {n`1-3-5`}{" "}
          {c`1 3 5`} {c`I`}.
        </P>
        <P>
          We can do this from any note of the scale:
          <ul>
            <li>
              {n`2-4-6`} {c`2 4 6`} {c`ii`}
            </li>
            <li>
              {n`3-5-7`} {c`3 5 7`} {c`iii`}
            </li>
            <li>
              {n`4-6-1`} {c`4 6 1`} {c`IV`} – in seven-note scales 8=1, 9=2 etc.
            </li>
            <li>
              {n`5-7-2`} {c`5 7 2`} {c`V`}
            </li>
            <li>
              {n`6-1-3`} {c`6 1 3`} {c`vi`}
            </li>
            <li>
              {n`7-2-4`} {c`7 2 4`} {c`viio`}
            </li>
          </ul>
        </P>
        <P>
          Chords are words in the Western musical language. Western music is
          melody plus chords.
        </P>
        <P>
          Here are all seven chords that we can build on a major scale this way:{" "}
          {c`I ii iii IV V vi viio I`}
        </P>
        <P>
          In this intro we'll have a close look at the song "Happy Birthday".
          The arrangement we're gonna analyze uses three chords played in the
          left hand, underneath the melody: {c`I`}, {c`IV`} and {c`V`}, in this
          order: {c`I V V I I IV V I`}
        </P>
        <P>Click on the link below to open the score:</P>
        {/* <P>
          However, our arrangement builds a major scale starting from the note
          F.
        </P>
        <P>
          <PianoLegend currentTonic={5} />
        </P>
        <P>
          This is legal: all musical structures are relative and can be shifted
          up or down a fixed amount of semitones.
        </P>
        <P>
          For instance, let's consider this string of chords in C major:{" "}
          {c`I V V I I IV V I`}
        </P>
        <P>
          <TonicProvider currentTonic={1}>
            In C# major it looks the same but sounds differently:{" "}
            {c`I V V I I IV V I`}
          </TonicProvider>
        </P>
        <P>
          Now, open the score of "Happy Birthday" and let's start analyzing.
        </P> */}
      </>
    ),
  },
  {
    title: "Single loop in major",
    titleChords: ["I", "iii", "vi", "IV"],
    mode: {
      title: "6 common triads in a major mode",
      chords: ["ii", "IV", "vi", "I", "iii", "V"],
    },
    pretext: () => (
      <>
        <h2>Our path</h2>
        <P>
          The word <i>harmony</i> in music theory means "which colors are
          combined together in a given piece or a style". Usually colors are
          organized in chords, so a talk on harmony starts with "what's the
          order or chords".
        </P>
        <P>
          The chapters of this book go through pieces in order of increasing
          harmonic complexity. We start with pieces which use only seven colors
          (<i>pitch classes</i>):
          <ul>
            <li>major scale: {c`1 2 3 4 5 6 7 1`}</li>
            <li>minor scale: {c`1 2 b3 4 5 b6 b7 1`}</li>
          </ul>
        </P>
        <P>
          We begin with the pieces with simple harmony – like{" "}
          {c`I vi IV V I vi IV V`} or {c`i i bVI V i i bVI V`} – the diatonic
          harmony.
        </P>
        <P>
          Then we progress all the way to complex chromatic harmony, like{" "}
          {c`i iio7 V43 i6 Ger viio7/V i64 V7b9 i`} and{" "}
          {c`Imaj7 V7/IV IVmaj7 iv7 Imaj7 V7/ii V7/V V7 Imaj7`}
        </P>

        <P>
          Many things influence each piece: a composer combines ideas of
          harmony, melody, voice-leading, texture, rhythm, form. I picked
          harmony as the main axis of this book. I discuss other aspects of
          music as a set of questions and answers below the scores of each
          piece.
        </P>

        <h2>Loops</h2>
        <P>In Western music, chords usually change at regular times.</P>
        <P>
          The easiest way of organizing chords is to put them in a loop. The
          most common length of the loop is four chords.
        </P>
        <P>
          There are six common chords that can be built on a major scale:{" "}
          {c`I ii iii IV V vi I`}
        </P>
        <P>
          We have four places to fill in with chords in a loop. If you put{" "}
          {c`I`} on the first place, you can fill in the rest three distinct
          chords in {n`5 × 4 × 3 = 60`} ways:
        </P>
        <P>
          <UL>
            <li>
              {c`I ii iii IV`} {c`I ii iii V`} {c`I ii iii vi`} {c`I ii IV iii`}{" "}
              {c`I ii IV V`} {c`I ii IV vi`}{" "}
            </li>
            <li>
              {c`I ii V iii`} {c`I ii V IV`} {c`I ii V vi`} {c`I ii vi iii`}{" "}
              {c`I ii vi IV`} {c`I ii vi V`}{" "}
            </li>
            <li>
              {c`I iii ii IV`} {c`I iii ii V`} {c`I iii ii vi`} {c`I iii IV ii`}{" "}
              {c`I iii IV V`} {c`I iii IV vi`}{" "}
            </li>
            <li>
              {c`I iii V ii`} {c`I iii V IV`} {c`I iii V vi`} {c`I iii vi ii`}{" "}
              {c`I iii vi IV`} {c`I iii vi V`}{" "}
            </li>
            <li>
              {c`I IV ii iii`} {c`I IV ii V`} {c`I IV ii vi`} {c`I IV iii ii`}{" "}
              {c`I IV iii V`} {c`I IV iii vi`}{" "}
            </li>
            <li>
              {c`I IV V ii`} {c`I IV V iii`} {c`I IV V vi`} {c`I IV vi ii`}{" "}
              {c`I IV vi iii`} {c`I IV vi V`}{" "}
            </li>
            <li>
              {c`I V ii iii`} {c`I V ii IV`} {c`I V ii vi`} {c`I V iii ii`}{" "}
              {c`I V iii IV`} {c`I V iii vi`}{" "}
            </li>
            <li>
              {c`I V IV ii`} {c`I V IV iii`} {c`I V IV vi`} {c`I V vi ii`}{" "}
              {c`I V vi iii`} {c`I V vi IV`}{" "}
            </li>
            <li>
              {c`I vi ii iii`} {c`I vi ii IV`} {c`I vi ii V`} {c`I vi iii ii`}{" "}
              {c`I vi iii IV`} {c`I vi iii V`}{" "}
            </li>
            <li>
              {c`I vi IV ii`} {c`I vi IV iii`} {c`I vi IV V`} {c`I vi V ii`}{" "}
              {c`I vi V iii`} {c`I vi V IV`}{" "}
            </li>
          </UL>
        </P>
        <P>
          However, historically just a few of these hypothetical loops take up
          the majority of the songs. Some popular loops are:
          <ul>
            <li>
              {a(
                "https://en.wikipedia.org/wiki/%2750s_progression",
                "'50s progression",
              )}{" "}
              has two common rotations:
              <ul style={{ marginBottom: "1em" }}>
                <li> {c`I vi IV V I vi IV V`}</li>
                <li>{c`IV V I vi IV V I vi`}</li>
              </ul>
            </li>
            <li>{c`I iii vi IV I iii vi IV`}</li>
          </ul>
        </P>
        <h2>Roman numeral analysis</h2>
        <P>
          Let's notate six chords that we find in pieces built on a major scale
          by using Roman numeral analysis.
        </P>
        <P>
          <ChordStairs
            mode={{
              title: "",
              chords: ["I", "ii", "iii", "IV", "V", "vi"],
            }}
          />
        </P>
        <P>
          Pronounced: "a one chord", "a two chord", "a three chord", "a four
          chord", "a five chord", "a six chord".
        </P>
        <P>
          If we look at the intervals of each chord starting from the root,
          there are two types of chords:
          <ul>
            <li>
              {rn`I`} {c`I`}, {rn`IV`} {c`IV`}, {rn`V`} {c`V`} – intervals 4+3,
              major chords written in uppercase Roman numerals
            </li>
            <li>
              {rn`ii`} {c`ii`}, {rn`iii`} {c`iii`}, {rn`vi`} {c`vi`} – intervals
              3+4, minor chords written in lowercase Roman numeral
            </li>
          </ul>
        </P>

        <P>
          Be careful: the terms "major chord" / "minor chord" are not the same
          thing as "major scale" / "minor scale". As we see, in a major scale we
          have three major chords and three minor chords. We'll clarify this
          when we reach a chapter on pieces in a minor scale.
        </P>
        <P>
          Listen to the songs below and analyze the loops they are built upon.
        </P>
      </>
    ),
    composers: [
      "the-office",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "doki-doki-literature-club-ost---your-reality",
      "Viva_La_Vida_Coldplay",
    ],
  },
  {
    title: "Different loops for verse/chorus",
    titleChords: ["I", "V", "vi", "IV"],
    mode: {
      title: "6 common triads in a major mode",
      chords: ["ii", "IV", "vi", "I", "iii", "V"],
    },
    pretext: () => (
      <>
        <h2>Form</h2>
        <P>
          The word <i>form</i> in music theory means "how parts of a piece are
          organized together". How are they different, and what is common in
          them that holds the whole piece together.
        </P>
        <P>
          A song may have several parts: intro, verse, pre-chorus, chorus,
          bridge. Some songs use different loops for different parts. For
          example, a verse can go like {c`I vi IV V I vi IV V`} and a chorus can
          go like {c`vi IV I V vi IV I V`}
        </P>
        <P>
          Throughout the book you can hover over colorful chords to see their
          Roman numerals.
        </P>
        <P>
          As you analyze pieces in this chapter, listen to them on YouTube and
          read the lyrics to understand which parts they have. Then, as you
          follow the score below, see if different parts use contrasting loops.
        </P>
        <h2>Timeline of loops</h2>
        <P>
          Making pieces entirely of four-chord loops is a recent innovation – it
          gained popularity in the 1950s. {q("tagg_loops")} {q("nobile")}{" "}
          Neither Mozart nor Chopin composed like that.
        </P>
        <P>In the songs below you'll find another popular loop: </P>
        <P>
          {a(
            "https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression",
            "I–V–vi–IV progression",
          )}{" "}
          has two common rotations: {c`I V vi IV I V vi IV`} and{" "}
          {c`vi IV I V vi IV I V`}
        </P>
        <P>
          Unlike the{" "}
          {a(
            "https://en.wikipedia.org/wiki/%2750s_progression",
            "'50s progression",
          )}{" "}
          {c`I vi IV V`}, the {c`I V vi IV`} only started gaining popularity
          after the '70s and peaked in 2000s - as you can check on Wikipedia
          sorting examples by year. This is an arbitrary cultural event - the
          history might as well go the other way around.
        </P>
        <P>
          As you have heard many old songs through radio and films during your
          lifetime, you might have learned their precedence. Do you hear the
          former progression as "older", "more ancient"?
        </P>

        <h2>Intervals</h2>
        <P>
          A smallest interval between the two notes in Western music is called a
          semitone. Here are semitones built up from all notes of a major scale:{" "}
          {c`1 b2`}, {c`2 b3`}, {c`3 4`}, {c`4 #4`}, {c`5 b6`}, {c`6 b7`},{" "}
          {c`7 1`} Physically, all semitones between two consecutive notes are
          the same.
        </P>
        {/* <P>Another two intervals that are important are three semitones and four semitones</P> */}
        <h2>Other resources</h2>
        <P>
          If you're lost in my narrative, try these instead:
          <ul>
            <li>{a("https://www.lightnote.co/", "Lightnote")}</li>
            <li>{a("https://book-one.hooktheory.com/", "Hooktheory")}</li>
            <li>
              {a(
                "https://learningmusic.ableton.com/",
                "Ableton's Guide on Music",
              )}
            </li>
          </ul>
        </P>
        <h2>Drop your MIDI files</h2>
        <P>
          If you have your own MIDI file and you want to see it colored, drag
          and drop it to this website.
        </P>
        <P>
          <FileDropBox />
        </P>
        <P>
          If you want me to color a specific piece, reach out via{" "}
          <a href="mailto:cxielamiko@gmail.com">cxielamiko@gmail.com</a> or{" "}
          <a href="https://t.me/vitalypavlenko">https://t.me/vitalypavlenko</a>
        </P>
      </>
    ),
    composers: [
      "someone-like-you",
      "someone-you-loved-lewis-capaldi",
      "Ed_Sheeran_Perfect",
      "dont-stop-believing-piano",
      "A_Thousand_Miles",
    ],
  },
  {
    title: "Loops in minor",
    titleChords: ["iv", "i"],
    mode: {
      title: "natural minor without bIII",
      chords: ["iv", "v", "bVI", "bVII", "i"],
    },
    pretext: () => (
      <>
        <h2>Chords in natural minor</h2>
        <P>
          Another scale that's widely used in Western music is a natural minor
          scale: {c`1 2 b3 4 5 b6 b7 1 2 b3 4 5 b6 b7 1`}
        </P>
        <P>
          For this scale we can also form chords by taking every other note from
          each root. This way we'll get seven chords:{" "}
          {c`i iio bIII iv v bVI bVII i`}
        </P>
        <P>
          In this chapter we'll look at pieces which have loops made of a subset
          of these chords:
        </P>
        <P>
          <ChordStairs mode={STRICT_NATURAL_MINOR} />
        </P>
        <P>A note on pronunciation: {rn`♭VI`} is a "flat-six major chord"</P>
        <P>
          Some of these pieces have four-chord loops, while others have longer
          strings of chords. As you analyze them, try to find any patterns. Is
          there a pair of chords which often go together? Is there a frequent
          sequence of three chords?
        </P>
        <h2>Major and minor chords</h2>
        <P>
          There are two types of triads commonly used in Western music: major
          chords and minor chords.
        </P>
        <P>
          Here are pairs of minor vs major chords - not in any particular mode,
          just "in the air":
          <ul>
            <li>
              {c`i`} {c`I`}
            </li>
            <li>
              {c`ii`} {c`II`}
            </li>
            <li>
              {c`biii`} {c`bIII`}
            </li>
            <li>
              {c`iii`} {c`III`}
            </li>
            <li>
              {c`iv`} {c`IV`}
            </li>
            <li>
              {c`v`} {c`V`}
            </li>
            <li>
              {c`bvi`} {c`bVI`}
            </li>
            <li>
              {c`vi`} {c`VI`}
            </li>
            <li>
              {c`bvii`} {c`bVII`}
            </li>
          </ul>
        </P>
        <P>
          Minor chords have a smaller interval of three semitones at the bottom
          and a bigger interval of four semitones at the top.
        </P>
        <P>
          Major chords has a smaller interval of three semitones at the top and
          a bigger interval of four semitones at the bottom.
        </P>
        <P>
          One interesting observation is that chords built on roots 1 {c`1`}, 4{" "}
          {c`4`} and 5 {c`5`} are:
          <ul>
            <li>
              major chords {c`I`} {c`IV`} {c`V`} if built on a major scale{" "}
              {c`1 2 3 4 5 6 7 1`}
            </li>
            <li>
              minor chords {c`i`} {c`iv`} {c`v`} if built on a minor scale{" "}
              {c`1 2 b3 4 5 b6 b7 1`}
            </li>
          </ul>
        </P>
        <P>
          So that's the connection between a major scale and major chords, and
          also between a minor scale and minor chords.
        </P>
      </>
    ),
    composers: [
      "still-dre---variation-composition",
      "Im_Blue_Eiffel_65",
      "Never_Gonna_Give_You_Up",
      "Lovely_Billie_Eilish",
      "Interstellar",
    ],
  },

  {
    title: "i i ♭VI V",
    titleChords: ["i", "i", "bVI", "V"],
    mode: {
      title: "",
      chords: ["i", "bVI", "V"],
    },
    pretext: () => (
      <>
        <h2>i i ♭VI V</h2>
        <P>
          These songs exploit an endless loop of {c`i i bVI V i i bVI V`}. So,
          they don't fit within the natural minor scale {c`1 2 b3 4 5 b6 b7 1`},
          since {c`V`} uses a note {c`7`}
        </P>
        <P>
          You might say that these songs are using an extended minor scale:{" "}
          {c`1 2 b3 4 5 b6 b7 7 1`}
        </P>
        <P>
          Or you might say that the chord {c`V`} is drawn from a harmonic minor
          scale, unlike all other chords: {c`1 2 b3 4 5 b6 7 1`}
        </P>
        <P>
          Songs besides the top 100 that have the same pattern:
          <ul>
            <li>
              {a(
                "/f/road-trippin---red-hot-chili-peppers",
                "Red Hot Chili Peppers. Road trippin'",
              )}
            </li>
            <li>
              {a(
                "/f/seven-nation-army-arr.-nikodem-lorenz",
                "The White Stripes. Seven Nations Army",
              )}
            </li>
            <li>
              {a(
                "/f/loonboon---laura-shigihara-arranged-by-piano-keyng",
                "Laura Shigihara. Loonboon",
              )}
            </li>
          </ul>
        </P>
        {/* <h2>Historical context</h2>
        <P>
          Until a natural minor mode gained popularity, a minor mode mostly used{" "}
          {c`V`}. However, the examples below are modern, because they are made
          of an endless four-measure loop – which is also a modern thing. The
          truly old examples will appear in the next chapter.
        </P> */}
      </>
    ),
    composers: [
      "Requiem_for_a_Dream",
      "we-are-number-one-but-it-s-a-piano-transcript",
      "Believer_-_Imagine_Dragons",
    ],
  },

  {
    title: DOUBLE_TONIC_CHAPTER_TITLE,
    pretext: () => (
      <>
        <h2>Natural minor = major</h2>
        <P>Here's a C major scale: {c`1 2 3 4 5 6 7`}</P>
        <P>Here's an A minor scale: {ct(`1 2 b3 4 5 b6 b7`, -3)}</P>
        <P>
          Here's an A minor scale played the note ♭3:
          {ct(`b3 4 5 b6 b7 1 2`, -3)}
        </P>
        <P>
          Notice that C major scale and A minor scale played from {c`b3`} sound
          exactly the same.
        </P>
        <P>
          Therefore, these two sequences of chords sound the same even if they
          look different:
        </P>
        <P>
          <ul>
            <li>{c`I ii iii IV V vi`} - in a C major scale</li>
            <li>{ct(`bIII iv v bVI bVII i`, -3)} - in a A minor scale</li>
          </ul>
        </P>
        <P>
          This is a fundamental relation. Each major scale has a <i>relative</i>{" "}
          minor scale. They both share the exact set of piano notes. What's
          different is the tonic note from which we start to count the scale.
        </P>
        <P>
          So, a scale isn't just a set of notes. What makes a set of notes a
          scale is a sense of tonic. The tonic note {c`1`} should be played
          frequently. Melodies often start with {c`1`} and almost always end on
          it. The <i>tonic chord</i> - {c`I`} or {c`i`} - should be played at
          key moments within the piece. When exactly?
        </P>
        <h2>Double-tonic loops</h2>
        <P>Consider this loop in C major: {c`vi IV I V`}</P>
        <P>
          I can reinterpret the same notes in A minor:{" "}
          {ct(`i bVI bIII bVII`, -3)}
        </P>
        <P>When a piece uses this loop, what's the correct interpretation?</P>
        <P>
          In short, the situation is as complex as it is: there's no single
          correct interpretation. You may hear it one way or the other. The
          other people in the internet may hear it not the same way as you.
          Those people may argue about the correct tonic in a particular song.
          These arguments may or may not make sense to you. Should you even
          bother?
        </P>
        <P>This situation is called "double-tonic". {q("richards")}</P>
        <P>
          Below I present two colorings: major next to minor. I've chosen the
          minor coloring inside the scores. To learn how to change the coloring,
          read instructions inside "Despacito".
        </P>
      </>
    ),
    composers: [
      "despacito-piano-cover-peter-bence",
      "river-flows-in-you",
      "Yann_Tiersen_Amelie",
      "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
      "Let_Her_Go_Passenger",
      "Another_Love__-_Tom_Odell_Professional",
      "alan-walker---alone-piano",
      "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
    ],
  },
  {
    title: "Functional natural minor",
    titleChords: ["bVII", "V", "i"],
    composers: [
      "Game_of_Thrones_Easy_piano",
      "sadness-and-sorrow-for-piano-solo",
      "gurenge--demon-slayer-kimetsu-no-yaiba-op",
      "Hallelujah",
    ],
    pretext: () => (
      <>
        <h2>Major and minor chords in modes</h2>
        <P>
          Recall: six common chords in a natural minor mode are{" "}
          {c`i bIII iv v bVI
        bVII`}
          <ul>
            <li>
              Three minor chords in a minor mode are {c`i`}, {c`iv`} and {c`v`}
            </li>
            <li>
              Three major chords in a minor mode are {c`bIII`}, {c`bVI`} and{" "}
              {c`bVII`}
            </li>
          </ul>
        </P>
        <P>
          Recall: six common chords in a major mode are {c`I ii iii IV V vi`}
          <ul>
            <li>
              Three minor chords: {c`ii`}, {c`iii`} and {c`vi`}
            </li>
            <li>
              Three major chords: {c`I`}, {c`IV`} and {c`V`}
            </li>
          </ul>
        </P>
        <h2>Historical context</h2>
        <P>
          Throughout the 19th century, there was no such thing as a natural
          minor mode with solely {c`v`} chord and without any {c`7`} note in
          minor. No composers wrote that way.
        </P>
        <P>
          A modern natural minor is a recent invention – it gained popularity in
          1970s. {q("alf_aeolian")} So, all examples below are pretty modern.
        </P>
        <P>
          We'll look at the older version of minor in the next few chapters.
        </P>
      </>
    ),
  },
  {
    title: "Triadic minor with V",
    titleChords: ["V", "i"],
    pretext: () => (
      <>
        <h2>Chords in a minor with {rn`V`}</h2>
        <P>
          So, an older version of a minor mode has these chords:{" "}
          {c`i bIII iv v V bVI bVII`}
        </P>
        <P>
          Most sections end with {c`V`} or {c`V i`} chords – you'll see a lot of{" "}
          {c`7`} notes at the right border of the scores.
        </P>
        <P>
          The chord {c`v`} is usually used at the beginning of the section – eg.
          as {c`i v`}. In most pieces it's not used at all.
        </P>
        <P>
          In some pieces a {c`V`} is replaced with its synonym {c`V7`}.
        </P>
        <h2>Functional harmony</h2>
        <P>
          Some musicians call it "functional harmony". What does it mean? It
          implies that chords aren't just being put at completely random orders
          for each new piece.
        </P>
        <P>
          Sections most often start with {c`i`}. They most often end with{" "}
          {c`bVI bVII V i`}, {c`iv V i`}, {c`bVI V i`}.
        </P>
        <P>
          Chord pairs {c`V i`} and {c`V bVI`} are frequent, whereas {c`V iv`} or{" "}
          {c`V bVII`} are rare. {c`V v`} is extremely rare, it almost "makes no
          sense".
        </P>
        <P>
          A {c`i bVII`} will most likely be continued with {c`bVI`}
        </P>
        <P>
          Some chord chunks are also frequent: {c`iv i V i`}, {c`i bVII bVI V`},{" "}
          {c`bVII bIII`}. They are used like formulas.
        </P>
        <P>
          Composers may use them consciously or subconsciously. As they compose,
          they play a draft and discard something that "doesn't sound well". But
          how can anything sound well?
        </P>
        <P>
          We hear something as "nice" because it was very probable in all pieces
          of music that we have been listening to throughout our whole life.
        </P>
        <P>
          And our hearing system constantly tries to predict what will happen
          next. So, if there are rules, probabilities, frequencies or other for
          a brain to memorize pieces faster, then a brain will be constantly
          extracting those rules and updating its model of Western music in
          background - during our entire life.
        </P>
      </>
    ),
    mode: {
      title: "minor with V",
      chords: ["iv", "bVI", "i", "bIII", "v", "Vsus4", "V", "V7", "bVII"],
    },
    composers: [
      "Bella_Ciao",
      "Gravity_Falls_Opening",
      "Pirates_of_the_Caribbean_-_Hes_a_Pirate",
      "Pokemon_Theme_Song",
      "attack-on-titan-theme-guren-no-yumiya",
      "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
    ],
  },
  {
    title: "Functional major",
    titleChords: ["V", "V7", "I"],
    mode: {
      title: "major",
      chords: ["ii", "IV", "vi", "I", "iii", "V", "V7"],
    },
    pretext: () => (
      <>
        <h2>Functional major</h2>
        <P>
          There's a functional harmony for major mode as well. Some chord pairs
          and longer sequences are more probable than other.
        </P>
        <P>
          Interestingly, functional major and functional minor modes have some
          parallels. The most solid ending in them is {c`V I`} or {c`V i`},
          respectively.
        </P>
        <P>
          {k("v7-to-major-i", "V7 to I")} {k("V7-to-minor-i", "V7 to i")}
        </P>
        <P>
          In both of them you can use {c`V7`} as a synonym for {c`V`}. And the
          endings like {c`V7 I`} or {c`V7 i`} are even more solid.
        </P>
        <P>
          {c`IV`} in major has a similar distribution around those two chords as{" "}
          {c`iv`}.
        </P>
        <P>
          As you listen to the pieces, pay attention to chord pairs. Do you hear
          some of them as "very common"?
        </P>
        <h2>Common types of chords</h2>
        <P>
          Most modern Western pieces are built as two parallel streams: chords
          and melody. Chords are "aligned" with the melody. Some notes in melody
          – downbeats, countour turnaround points – usually use one of the notes
          of the current chord.
        </P>
        <P>
          If we look at the intervals between notes of a chord, we'll see that
          there are three types of chords that are used in modern Western music:
          <ul>
            <li>
              Major chords (4 semitones + 3 semitones):{" "}
              {c`I II bIII IV V bVI bVII`} etc. There are 12 different major
              chords – you can build one on any of the twelve notes.
            </li>
            <li>
              Minor chords (3 semitones + 4 semitones): {c`i ii iii iv v vi`}
              etc. Again, there are 12 different minor chords.
            </li>
            <li>
              Dominanth seventh chords (4 semitones + 3 semitones + 3
              semitones): So far we've only seen {c`V7`}. However, there are
              pieces where other chords of the same interval are used:{" "}
              {c`I7 V7/V V7/vi IV7 V7 V7/ii V7/iii`}
            </li>
          </ul>
        </P>
        <h2>Why these colors?</h2>
        <P>
          Previously, people tried to design colored notations by assigning
          colors to notes in a rainbow order. This is an obvious idea. However,
          it doesn't help to highlight the structures that are actually frequent
          in Western music.
        </P>
        <P>
          There are three main groups of chords in functional harmony:
          <ul>
            <li>
              tonic chords begin and end sections: {c`I`} and {c`i`}
            </li>
            <li>
              dominants end sections or precede tonic chords at the end: {c`V`},{" "}
              {c`V7`}, {c`bVII`}
            </li>
            <li>
              predominants preced dominants at the end: {c`IV`}, {c`iv`},{" "}
              {c`ii`} and others
            </li>
          </ul>
        </P>
        <P>
          My coloring makes these three groups as visually distinct as possible.
          And also, it makes colors of common chords to blend together. This is
          because I also follow the rainbow, but in the order of thirds:
          {c`b2 2 4 #4 b6 6 1 b3 3 5 b7 7`}
        </P>
        <P>
          <Metaphors />
        </P>
        <P>
          <ChordStairs mode={MAJOR_MODE} />
        </P>
        <P>
          <ChordStairs mode={MINOR_MODE} />
        </P>
        <P>
          Same vibe: <ul>{A("michishirube---violet-evergarden-ed")}</ul>
        </P>
      </>
    ),
    composers: [
      "Canon_in_D",
      "a-thousand-years",
      "John_Lennon_Imagine",
      "sign-of-the-times---harry-styles",
      "Cant_Help_Falling_In_Love",
    ],
  },
  {
    title: "Classical V7 i",
    titleChords: ["V7", "i"],
    composers: [
      "Carol_of_the_Bells",
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "theme-from-schindler-s-list---piano-solo",
    ],
  },
  {
    title: "Circle of fifths",
    titleChords: ["i", "iv", "bVII", "bIII"],
    pretext: () => (
      <>
        <h2>Circle of fifths in minor</h2>
        <P>
          If four-chord loops didn't quite appear throughout 17..19th centuries,
          eight-chord loops did. The most important loop since Baroque era was
          The Circle of Fifths progression.
        </P>
        <P>The model example: {c`i iv bVII bIII bVI iio V i`}</P>
        <P>
          The idea is to take the next chord's root three notes up from a
          previous chord's root, going around a scale.
        </P>
        <P>Here are the roots of these chords: {c`1 4 b7 b3 b6 2 5 1`}</P>
        <P>
          There are options. A rare {c`iio`} chord may be replaced with {c`iv`},
          which sounds "similar": these chords share two notes. This way we'll
          get {c`i iv bVII bIII bVI iv V i`}
        </P>
      </>
    ),
    mode: {
      title: "circle of fifths",
      chords: ["i", "iv", "bVII", "bIII", "bVI", "iio7", "bII", "V7"],
    },
    composers: [
      "passacaglia---handel-halvorsen",
      "g-minor-bach-original",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "vivaldi---summer---piano",
    ],
  },
  {
    title: "IV in minor",
    titleChords: ["IV", "i"],
    pretext: () => (
      <>
        <h2>Recap with some terminology</h2>
        <P>
          Most modern Western pieces are structured as follows: their entire
          sections are either in a major mode {c`I ii iii IV V vi V7 I`} or in a
          minor mode {c`i bIII iv v V bVI bVII V7 i`}. This is called a{" "}
          <i>diatonic harmony</i> – meaning that we build chords as three notes
          taken <i>in thirds</i> (1-3-5, 2-4-6 etc.) from the mode's scale (with
          the exception of {c`V`}/{c`V7`} in a minor mode).
        </P>
        <P>
          One way of organizing chord changes is a loop or several loops. Loops
          have a length of four measures. The time is therefore divided into
          four-measure phrases which we show with white vertical bars.
        </P>
        <P>
          Another way of organizing chord changes is a functional harmony: a
          string of chords starts with a <i>tonic chord</i> {c`I`} or {c`i`} and
          progresses according to local transition probabilities up to a{" "}
          <i>cadential formula</i> (i.e. a typical ending) – most often ending
          with {c`V I`} in a major mode and with {c`bVI bVII i`} or {c`V i`} in
          minor mode.
        </P>
        <h2>Chromatic chords</h2>
        <P>
          A chromatic chord is a chord used in a mode where there's no way to
          build it in thirds using mode's scale degrees. There are two popular
          extensions of a diatonic harmony with chromatic chords: borrowed
          chords and applied chords.
        </P>
        <P>
          As we'll see further, chromatic chords are most often either major
          chords, minor chords or dominant seventh chords. Therefore, the rule
          "to use common types of chords" is more important for composers than
          the rule "to stick to a certain scale of 7 or 8 notes".
        </P>
        <h2>Dorian {rn`IV`} in minor</h2>
        <P>
          Some pieces use a {c`IV`} chord inside an otherwise minor mode piece:{" "}
          {c`i IV i`}. Therefore the total chord palette in that piece becomes{" "}
          {c`i bIII iv IV v V bVI bVII V7 i`}
        </P>
        <P>Most pieces use this chord only at a single particular place.</P>
        <P>
          Some people say that {c`IV`} in {c`i IV i`} is <i>borrowed</i> from
          major into minor.
        </P>
        <P>
          Some people call this chord a <i>dorian</i>. Here's what they mean:
          there's a concept of a dorian scale {c`1 2 b3 4 5 6 b7 1`}. If a piece
          is using this scale as a primary one, then {c`IV`} is a diatonic to
          it: it's in the scale. This scale yields these chords:{" "}
          {c`i bIII IV v bVI bVII i`}
        </P>
        <P>
          There are no pieces throughout top 100 corpus that are built entirely
          using a dorian mode. There are degrees to which a {c`6`} note is used
          within a minor mode, most often as a {c`IV`} chord. See examples:{" "}
          {s`dorian: episodic`}
        </P>
      </>
    ),
    mode: {
      title: "dorian minor",
      chords: ["iv", "IV", "bVI", "i", "bIII", "v", "bVII"],
    },
    composers: [
      "nothing-else-matters---metallica",
      "dragonborn---skyrim-theme-song-piano-solo",
      "solas---jamie-duffy",
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
      "Mad_world_Piano",
    ],
  },
  {
    title: "iv in major",
    titleChords: ["iv", "I"],
    pretext: () => (
      <>
        <h2>{rn`iv`} in major</h2>
        <P>{s`chromatic_chords:iv`}</P>
      </>
    ),
    composers: [
      "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
      "how-far-i-ll-go-~-moana-ost",
    ],
  },
  {
    title: "♭VII in major",
    titleChords: ["bVII", "I"],
    mode: {
      title: "Mario cadence",
      chords: ["bVI", "bVII", "I"],
    },
    composers: [
      "when-i-was-your-man---bruno-mars-600e3a",
      "Take_on_me",

      "Super_Mario_Bros_Main_Theme",
      "welcome-to-the-black-parade---my-chemical-romance",
    ],
  },
  {
    title: "V7/V",
    titleChords: ["V7/V", "V"],
    pretext: () => (
      <>
        <h2>Applied dominant: {rn`V7/V`}</h2>
        <P>
          There are diatonic major pieces where the only chromatic chord is{" "}
          {c`II7`} or {c`II`} - a major chord built on a {c`2`} root instead of
          a diatonic {c`ii`} chord. How to explain this chord?
        </P>
        <P>
          Most often it's followed by the {c`V`} chord: {c`II7 V`}. Or, as they
          say, {c`II7`} is resolved to {c`V`}.{" "}
        </P>
        <P>
          Let's recolor it: let's treat this {c`V`} as a brief {ct(`I`, -5)}{" "}
          tonic chord. So, a C major's {c`II7 V`} is a G major's{" "}
          {ct(`V7 I`, -5)}. Because of that, the {c`V7/V`} chord is called{" "}
          {rn`V7/V`} (pronounced "five seven of five"), especially when
          preceding the {rn`V`} chord.
        </P>
        <P>
          We briefly <i>tonicize</i> the {rn`V`} chord (or the {c`5`} scale
          degree) - we make it a <i>local tonic</i> just for the duration of
          these two chords. A {rn`V7/V`} chord is also called a{" "}
          <i>secondary dominant</i> or an <i>applied dominant</i>.
        </P>
        <P>
          Sometimes {c`II7`} is on its own, not followed by {c`V`}
        </P>
      </>
    ),
    mode: {
      title: "",
      chords: ["V7/V", "V7", "I"],
    },
    composers: [
      "piano-man-piano",
      "Disney_Pixar_Up_Theme",
      "Test_Drive_How_to_Train_Your_Dragon",
      "Dawn_Pride_and_Prejudice",
    ],
  },
  {
    title: "V7/vi",
    titleChords: ["V7/vi", "vi"],
    mode: {
      title: "major with V/vi",
      chords: ["ii", "IV", "vi", "I", "iii", "V/vi", "Vsus4", "V", "V7"],
    },
    pretext: () => (
      <>
        <h2>{rn`V7/vi`}</h2>
        <P>
          Another applied chord that's common is {c`V/vi`} or {c`V7/vi`}. It's
          usually resolved as {c`V7/vi vi`}, therefore tonicizing a {c`vi`}{" "}
          chord making it a local tonic: {c`V7/vi vi`} in C major equals to{" "}
          {ct(`V7 i`, -3)} in A minor. So, this applied chord tonicizes a
          relative minor. In a context this sounds like{" "}
          {ct(`I V7 I V7/vi vi V7 I`, -12)}
        </P>
      </>
    ),
    composers: [
      "your-song-piano",
      "sia---snowman",
      "my-lie-watashi-no-uso---your-lie-in-april",
      "kimi-no-na-wa---sparkle-theishter-2016",
    ],
  },
  {
    title: "Vsus4",
    titleChords: ["Vsus4", "V"],
    mode: [
      { title: "major", chords: [...MAJOR_MODE.chords, "Vsus4"] },
      { title: "minor", chords: [...MINOR_MODE.chords, "Vsus4"] },
    ],
    pretext: () => (
      <>
        <h2>{rn`Vsus4`}</h2>
        <P>
          There's a frequent diatonic chord that isn't either minor or major
          chord: a {c`Vsus4`} chord. It has intervals of 5+2 semitones. It's
          most commonly resolved as {c`Vsus4 V`}, maybe further as{" "}
          {c`Vsus4 V I`}. Sometimes it's used as {c`Vsus47`}: {c`Vsus47 V7 I`}
        </P>
        <P>
          <i>sus4</i> means that a {ct(`1`, 12)} in it - so called a{" "}
          <i>perfect fourth</i> (i.e. 5 semitones) over the root - is{" "}
          <i>suspended</i> and then resolved into {c`7`}: {c`1 7 Vsus4 V`}.
          Although in modern composition it's not necessarily resolved:{" "}
          {s`V:sus4`}, {s`V:sus4_unresolved`}
        </P>
      </>
    ),
    composers: [
      "Pokemon_Theme_Song",
      "my-heart-will-go-on",
      "Ed_Sheeran_Perfect",
    ],
  },
  {
    title: "V7/ii",
    titleChords: ["V7/ii", "ii"],
    mode: [
      MAJOR_MODE,
      {
        title: "applied chords",
        chords: ["V7/ii", "ii", "V7/V", "V", "V7/vi", "vi"],
      },
    ],
    pretext: () => (
      <>
        <h2>Applied chords in a major mode</h2>
        <P>Let's list all possible applied chords in major.</P>
        <P>
          {rn`V7/I`} is just a {rn`V7`}: {c`V7 I`}
        </P>
        <P>
          {rn`V7/ii`} is a major chord on {c`6`}, so instead of a diatonic{" "}
          {c`vi`} we get a {c`V/ii`} or a {c`V7/ii`}. It's resolved to {c`ii`}.
          I put it in a context to distinguish it from a standard {rn`V7`} in
          another key: {c`I V7 I V7/ii ii V7 I`}
        </P>
        <P>
          {rn`V7/iii`} is a major chord on {c`7`}, so instead of a rarely used
          diminished 3+3 semitones chord {c`viio`} we get a {c`V/iii`} or a{" "}
          {c`V7/iii`}: {c`I V7 I V7/iii iii V7 I`}
        </P>
        <p>
          {rn`V/IV`} is simply {rn`I`} {c`I`}. However, {rn`V7/IV`} {c`V7/IV`}{" "}
          makes sense: it's a non-diatonic chord. {c`I V7 I V7/IV IV V7 I`}
        </p>
      </>
    ),
    composers: [
      "Omori_Duet",
      "abba--the-winner-takes-it-all",
      "All_I_Want_for_Christmas_is_You",
    ],
  },
  {
    title: MODULATIONS_CHAPTER_TITLE,
    mode: {
      chords: ["V7", "I", "i"],
      title: "",
    },
    pretext: () => (
      <>
        <h2>Modulations in classical music: endless V7 to I and V7 to i</h2>
      </>
    ),
    composers: [
      "minuet-bwv-anhang-114-in-g-major",
      "flight-of-the-bumblebee",

      "wa-mozart-marche-turque-turkish-march-fingered",

      "Fr_Elise",
    ],
  },
  {
    title: "blues, penta, hexa",
    titleChords: ["1", "b3", "4", "5", "b7"],
    pretext: () => (
      <>
        <P>
          {k("blues-scale")} {k("minor-pentatonic")}
        </P>
        <P>
          {s`scale:blues`} {s`scale:minor_pentatonic`}{" "}
          {s`scale:major_pentatonic`} {s`scale:hexatonic_minor`}{" "}
          {s`scale:hexatonic_major`}
        </P>
      </>
    ),
    mode: {
      title: "scales of 5 and 6 notes",
      chords: ["1", "b3", "4", "#4", "5", "b7"],
    },
    composers: [
      "Undertale_-_Megalovania_Piano_ver._3",
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
      "fairy-tail-main-theme",
      "africa---toto",
    ],
  },
  {
    title: "maj7",
    titleChords: ["IVmaj7", "Imaj7"],
    mode: {
      title: "",
      chords: ["ii7", "IVmaj7", "vi7", "Imaj7", "iii7", "V13"],
    },
    pretext: () => (
      <>
        <h2>Diatonic seventh chords</h2>
        <P>
          The most frequent chords in Western music are triads. They are built
          on a scale by taking every other note starting from the root.
        </P>
        <P>
          Let's see what we get if we take four notes instead of three using the
          same idea. Here's a major scale: {c`1 2 3 4 5 6 7 1 2 3 4 5 6 7 1`}
        </P>
        <P>
          <ul>
            <li>
              {c`1 3 5 7`} {c`Imaj7`} {rn`Imaj7`} – intervals 4+3+4, a
              combination of {c`I iii`}, a major seventh chord
            </li>
            <li>
              {c`2 4 6 1`} {c`ii7`} {rn`ii7`} – intervals 3+4+3, a combination
              of {c`ii IV`}, a minor seventh chord
            </li>
            <li>
              {c`3 5 7 2`} {c`iii7`} {rn`iii7`} – intervals 3+4+3, a combination
              of {c`iii V`}, a minor seventh chord
            </li>
            <li>
              {c`4 6 1 3`} {c`IVmaj7`} {rn`IVmaj7`} – intervals 4+3+4, a
              combination of {c`IV vi`}
            </li>
            <li>
              {c`5 7 2 4`} {c`V7`} {rn`V7`} – intervals 4+3+3, a combination of{" "}
              {c`V viio`}, a dominant seventh chord
            </li>
            <li>
              {c`6 1 3 5`} {c`vi7`} {rn`vi7`} – intervals 3+4+3, a combination
              of {c`vi I`}, a minor seventh chord
            </li>
          </ul>
        </P>
        <P>
          While it's easy to find minor seventh chords and dominanth seventh
          chords in classical music (Mozart and Chopin), major seventh chords
          emerged as a popular tool only since late 19th century. Erik Satie's
          example below - {ct(`4 IVmaj7 IVmaj7 1 Imaj7 Imaj7`, 2)} - is the
          earliest example I've found that consistently uses it as a main idea
          of a piece.
        </P>
        <P></P>
      </>
    ),
    composers: [
      "Sweden_Minecraft",
      "Golden_Hour__JVKE_Updated_Ver.",
      "Gymnopdie_No._1__Satie",
      "ylang-ylang---fkj-transcribed-by-lilroo",
      "yuri-on-ice---piano-theme-full",
      "congratulations---mac-miller",
      "Clair_de_Lune__Debussy",
    ],
  },
  {
    title: "ii V I jazz",
    titleChords: ["ii7", "V7", "Imaj7"],
    mode: {
      title: "jazz",
      chords: ["ii7", "V7", "Imaj7", "iiø7", "V7b9", "i7"],
    },
    pretext: () => (
      <>
        <P>{s`cycle_root_motion:autumn_leaves`}</P>
      </>
    ),
    composers: [
      "Fly_Me_to_the_Moon",
      "autumn-leaves-jazz-piano",
      "it-s-been-a-long-long-time---harry-james",
      "Love_Like_You_Steven_Universe",
      "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
      "mii-channel-piano",
    ],
  },
  {
    title: "viio7, io7, biio7",
    titleChords: ["viio7", "io7", "biio7"],
    pretext: () => (
      <>
        <h2>Fully diminished seventh chords</h2>
        <P>
          They have an intervalic structure 3+3+3(+3). There are exactly three
          of them on a piano:
        </P>
        <P>
          <ul>
            <li>
              {c`1 b3 #4 6`} {c`io7 biiio7 #ivo7 vio7`}
            </li>
            <li>
              {c`b2 3 5 b7`} {c`biio7 iiio7 vo7 bviio7`}
            </li>
            <li>
              {c`2 4 b6 7`} {c`iio7 ivo7 bvio7 viio7`}
            </li>
          </ul>
        </P>
        <P>
          Or you can play them all together, which is even more fun:{" "}
          {c`io7 biio7 iio7 biiio7 iiio7 ivo7 #ivo7 vo7 bvio7 vio7 bviio7 viio7`}
        </P>
        <P>
          As you can see, they are fully symmetrical, so they don't have any{" "}
          <i>root</i>. This makes them harder to notate.
        </P>
        <P>
          They have many usages: {s`modulation:pivot`} {s`cto7:to_I`}{" "}
          {s`cto7:to_V`} {s`applied:viio7/ii`} {s`applied:viio7/iv`}{" "}
          {s`applied:viio7/V`}
        </P>
      </>
    ),
    composers: [
      "anastasia---once-upon-a-december",
      "la-vie-en-rose-solo-accordion",
      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
      "the_entertainer_scott_joplin",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
    ],
  },
  {
    title: "V/V/V",
    titleChords: ["V7/vi", "V7/ii", "V7/V", "V7"],
    pretext: () => (
      <>
        <h2>Chain of dominants</h2>
      </>
    ),
    composers: [
      "Liebestraum_No._3_in_A_Major",
      "dance-of-the-sugar-plum-fairy",
    ],
  },

  {
    title: "Style",
    pretext: () => (
      <>
        Here we present two most popular pieces by each composers. Can you see
        that pieces of the same composer look more similar to each other than to
        other composers?
      </>
    ),
    composers: [
      "Fr_Elise",
      "Sonate_No._14_Moonlight_1st_Movement",
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
      "One_Summers_Day_Spirited_Away",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "Waltz_in_A_MinorChopin",
      "Liebestraum_No._3_in_A_Major",
      "tude_S._1413_in_G_Minor_La_Campanella__Liszt",
      "river-flows-in-you",
      "Kiss_The_Rain_-_Yiruma_-_10th_Anniversary_Version_Piano_Updated_2019",
      "Sweden_Minecraft",
      "Wet_Hands_Minecraft",
      "Gravity_Falls_Opening",
      "eda-s-requiem---brad-breeck-piano",

      "Maple_Leaf_Rag_Scott_Joplin",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "kanye-west-homecoming-piano-cover",
      "Viva_La_Vida_Coldplay",
      "the-scientist---coldplay-piano-arrangement",
      "mariage-d-amour---paul-de-senneville-marriage-d-amour",
      "ballade-pour-adeline---richard-clayderman",
      "Undertale_-_Megalovania_Piano_ver._3",
      "Fallen_Down_Undertale",
      "Clair_de_Lune__Debussy",
      "arabesque-l.-66-no.-1-in-e-major",
      "Super_Mario_Bros_Main_Theme",
      "Zeldas_Lullaby",
      "Gymnopdie_No._1__Satie",
      "satie-e.---gnossienne-no.-1",
      "wa-mozart-marche-turque-turkish-march-fingered",
      "lacrimosa---requiem",
      "Lovely_Billie_Eilish",
      "Billie_Eilish_Bad_Guy",
      "Ed_Sheeran_Perfect",
      "Ed_Sheeran_Shape_of_you",
      "Golden_Hour__JVKE_Updated_Ver.",
      "what-falling-in-love-feels-like---jake25.17-fanmade-extended-version",
      "dragonborn---skyrim-theme-song-piano-solo",
      "secunda-the-elder-scrolls-v-skyrim",
      "Dawn_Pride_and_Prejudice",
      "liz-on-top-of-the-world",
      "Canon_in_D",
      "pachelbel-chaconne-in-f-minor",
      "mii-channel-piano",
      "wii-sports-theme-piano",
    ],
  },
];

export type Mode = { title: string; chords: Chord[] };
