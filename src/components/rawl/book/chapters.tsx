import { faKeyboard } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import styled from "styled-components";
import { MUSESCORE_TOP_100_SLUG } from "../corpora/corpora";
import { CorpusLink } from "../corpora/CorpusLink";
import { Chord, MODES } from "../legends/chords";
import ChordStairs, { TonicProvider } from "../legends/ChordStairs";
import { PianoLegend } from "../legends/PianoLegend";
import { TOP_100_COMPOSERS } from "../top100Composers";
import { Citation } from "./Citations";
import { CITES } from "./cites";
import { FileDropBox } from "./FileDropBox";
import Metaphors from "./Metaphors";

export const MODULATIONS_CHAPTER_TITLE =
  "Modulations in classical music: endless V7 to I and V7 to i";
export const DOUBLE_TONIC_CHAPTER_TITLE = "Loops in minor / double-tonic";

const P = styled.div`
  margin-bottom: 30px;
  line-height: 1.6;
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

const c = (strings: TemplateStringsArray) => {
  const chordString = strings[0].trim();
  const chords = chordString.split(/\s+/);
  return <C c={chords as Chord[]} title={chordString} />;
};

const a = (href: string, text: string) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    style={{ color: "orange" }}
  >
    {text}
  </a>
);

const s = (tag: TemplateStringsArray) => {
  return a(`/s/${tag[0].replace(":", "/")}`, tag[0]);
};

const n = (text: TemplateStringsArray) => (
  <span style={{ whiteSpace: "nowrap" }}>{text}</span>
);

const k = (layout: string, title?: string) => {
  return (
    <a
      href={`https://vpavlenko.github.io/layouts/${layout}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
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

const q = (citeKey: keyof typeof CITES) => <Citation citeKey={citeKey} />;

export const CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode;
  pretext?: () => React.JSX.Element;
  composers: (typeof TOP_100_COMPOSERS)[number]["slug"][];
}> = [
  {
    title: "Intro",
    titleChords: ["I"],
    composers: ["happy_birthday_bass_and_chords"],
    mode: {
      title: "",
      chords: ["I", "IV", "V"],
    },
    pretext: () => (
      <>
        <h2>Structures in Western music</h2>
        <P>
          I invite you to my journey through 100 pieces of composers whose music
          is popular nowadays. The full list of pieces that we're gonna look at
          and analyze: <CorpusLink slug={MUSESCORE_TOP_100_SLUG} />
        </P>
        <P>
          I use my own piano-roll-based notation with notes colored into 12
          colors, always starting from the main note (<i>the tonic</i>). This
          simplifies visual analysis: chords and other structures become
          visible, scores become readable and interpretable.
        </P>
        <P>This is the color scheme we'll use through the entire book:</P>
        <P>
          <PianoLegend currentTonic={0} />
        </P>
        <P>
          You don't need any knowledge of standard notation throughout this
          journey.
        </P>
        <P>
          The chapters of this book go through pieces in order of increasing
          harmony. We start from pieces which use only seven notes (pitch
          classes) {c`1 2 3 4 5 6 7`} or {c`1 2 b3 4 5 b6 b7`} and three-four
          chords – like {c`I vi IV V I vi IV V`} or {c`i i bVI V i i bVI V`} –
          the diatonic harmony.
        </P>
        <P>
          Then we progress through chromatic harmony, like{" "}
          {c`i iio7 V43 i6 Ger viio7/V i64 V7b9 i`} and
          {c`Imaj7 V7/IV IVmaj7 iv7 Imaj7 V7/ii V7/V V7 Imaj7`} all the way up
          to the pieces in which harmony is hard to explain.
        </P>

        <P>
          Many things influence each piece: a composer combines ideas of
          harmony, melody, voice-leading, texture, rhythm, form. I picked
          harmony as the main axis of this book. I discuss other aspects of
          music as a set of questions and answers below the scores of each
          piece.
        </P>

        <h2>The alphabet: notes on piano</h2>
        <P>
          There are twelve notes in each octave of a piano:{" "}
          {c`1 b2 2 b3 3 4 #4 5 b6 6 b7 7`}
        </P>
        <P>
          Throughout the book I'll mention keyboard layouts to try out different
          concepts by playing them directly from your computer keyboard. Here
          are three keyboards showcasing all 12 notes:
        </P>
        <P>
          {k("flat-chromatic-layout")} {k("chromatic-sequences")}
          {k("traditional-layout")}
        </P>
        <P>
          The distance between two consecutive keys is called a semitone.{" "}
          {c`1 b2`}, {c`4 #4`}, {c`b6 6`} and {c`6 b7`} are one semitone apart.
          All distances between two consecutive notes on a piano keyboard is the
          same since mid-19th century. {q("rings_tuning")}
        </P>
        <P>
          Some pieces are built entirely on a subset of seven notes called a
          major scale: {c`1 2 3 4 5 6 7 1`}
        </P>
        <P>{k("major-scale")}</P>
        <P>
          Each color is present several times on a piano keyboard – in different
          octaves: {c`1 3 5 1 3 5 1 3 5 1 3 5 1`}
        </P>
        <h2>Chords</h2>
        <P>
          If you play three colors in a certain pattern, it's called a chord.
        </P>
        <P>
          We care about the pattern {n`1-3-5`} {c`1 3 5`} {c`I`}. This way we
          build chords from a scale: take note, skip note, take note, skip note,
          take note. We can start from any note:{" "}
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
          In this intro we'll have a close look at "Happy Birthday". The
          arrangement we're gonna analyze uses three chords played in the left
          hand, underneath the melody: {c`I`}, {c`IV`} and {c`V`}
        </P>
        <P>
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
        </P>
      </>
    ),
  },
  {
    title: "Loops in major",
    titleChords: ["I", "V", "vi", "IV"],
    mode: {
      title: "6 common triads in a major mode",
      chords: ["ii", "IV", "vi", "I", "iii", "V"],
    },
    pretext: () => (
      <>
        <h2>Loops</h2>
        <P>In Western music, chords usually change at regular times.</P>
        <P>
          The easiest way of organizing chords is to put them in a loop. The
          most common length of the loop is four chords.
        </P>
        <P>
          There are six common chords that can be built on a major scale:{" "}
          {c`I ii iii IV V vi`}
        </P>
        <P>
          We have four places to fill in with chords in a loop. If you put{" "}
          {c`I`} on the first place, you can fill in the rest three distinct
          chords in {n`5 × 4 × 3 = 60`} ways.
        </P>
        <P>
          However, historically just a few of these hypothetical loops take up
          the majority of the songs. The most popular loops are:
          <ol>
            <li>
              {c`I vi IV V`} and {c`IV V I vi`} are two rotations of a{" "}
              {a(
                "https://en.wikipedia.org/wiki/%2750s_progression",
                "'50s progression",
              )}
            </li>
            <li>
              {c`I V vi IV`} and {c`vi IV I V`} are two rotations of a{" "}
              {a(
                "https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression",
                "I–V–vi–IV progression",
              )}
            </li>
            <li>{c`I iii vi IV`}</li>
          </ol>
        </P>
        <P>
          Listen to the songs below and analyze the loops they are built upon.
        </P>
        <h2>Historical context</h2>
        <P>
          Making tracks entirely of four-chord loops is a recent innovation – it
          gained popularity in the 1950s. {q("tagg_loops")} Neither Mozart nor
          Chopin did that.
        </P>
        <h2>Other resources</h2>
        <P>
          If you're lost in my narrative, try{" "}
          {a("Lightnote", "https://www.lightnote.co/")} instead. Or{" "}
          {a("Hooktheory", "https://book-one.hooktheory.com/")}
        </P>
        <h2>Drop your MIDI files</h2>
        <P>
          <FileDropBox />
        </P>
      </>
    ),
    composers: [
      "the-office---opening-titles-theme-song-for-piano",
      "runaway---kanye-west-ramin-djawadi-arr.-by-alex-patience",
      "doki-doki-literature-club-ost---your-reality",
      "Viva_La_Vida_Coldplay",
      "Ed_Sheeran_Perfect",
      "dont-stop-believing-piano",
      "Someone_Like_You_easy_piano",
      "Someone_You_Loved",
      "All_Of_Me_-_John_Legend_Piano_Cover_-_ReiK",
    ],
  },
  {
    title: "Natural minor",
    titleChords: ["bVI", "bVII", "i"],
    mode: {
      title: "natural minor",
      chords: ["iv", "bVI", "i", "bIII", "v", "bVII"],
    },
    pretext: () => (
      <>
        <h2>6 chords in natural minor</h2>
        <P>
          Tracks in a natural minor mode also use seven notes. There are six
          common chords that can be built on a natural minor scale:{" "}
          {c`i bIII iv v bVI bVII`}
        </P>
        <P>
          Some of these tracks have four-chord loops, while others have longer
          strings of chords. As you analyze them, try to find the most common
          pair of chords in natural minor that go together. Is there a frequent
          triplet of chords? A frequent four-chord loop/phrase?
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
          This has nothing to do with major/minor modes. A mode is are a
          separate thing – coincidentally also named minor or major, though.
        </P>
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
    composers: [
      "still-dre---variation-composition",
      "Game_of_Thrones_Easy_piano",
      "Lovely_Billie_Eilish",
      "Let_Her_Go_Passenger",
      "Another_Love__-_Tom_Odell_Professional",
      "Im_Blue_Eiffel_65",
      "Never_Gonna_Give_You_Up",
      "sadness-and-sorrow-for-piano-solo",
      "Interstellar",
    ],
  },
  {
    title: DOUBLE_TONIC_CHAPTER_TITLE,
    composers: [
      "despacito-piano-cover-peter-bence",
      "river-flows-in-you",
      "alan-walker---alone-piano",
      "Yann_Tiersen_Amelie",
      "old-town-road---lil-nas-x-ft.-billy-ray-cyrus",
      "Mad_world_Piano",
    ],
  },

  {
    title: "i ♭VI V",
    titleChords: ["i", "i", "bVI", "V"],
    mode: {
      title: "",
      chords: ["i", "bVI", "V"],
    },
    pretext: () => (
      <>
        <P>
          These songs exploit an endless loop of {c`i i bVI V`}. So, they don't
          fit within the natural minor scale {c`1 2 b3 4 5 b6 b7 1`}, since{" "}
          {c`V`} uses a note {c`7`}
        </P>
        <P>
          You might say that these songs are built on an extended minor scale:{" "}
          {c`1 2 b3 4 5 b6 b7 7 1`}
        </P>
        <P>
          Or you might say that the chord {c`V`} is drawn from a harmonic minor
          scale, unlike all other chords: {c`1 2 b3 4 5 b6 7 1`}
        </P>
        <P>
          Also,{" "}
          {a(
            "/f/road-trippin---red-hot-chili-peppers",
            "Red Hot Chili Peppers. Road trippin'",
          )}{" "}
          has the same vibe.
        </P>
        <h2>Historical context</h2>
        <P>
          Until a natural minor mode gained popularity, a minor mode mostly used{" "}
          {c`V`}. However, the examples below are modern, because they are made
          of an endless four-measure loop – which is also a modern thing. The
          truly old examples will appear in the next chapter.
        </P>
      </>
    ),
    composers: [
      "Requiem_for_a_Dream",
      "we-are-number-one-but-it-s-a-piano-transcript",
      "Believer_-_Imagine_Dragons",
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
    title: "Minor with V",
    titleChords: ["V7", "i"],
    pretext: () => (
      <>
        <h2>Chords in a minor with V</h2>
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
      "Carol_of_the_Bells",
      "Hallelujah",
      "Je_Te_Laisserai_Des_Mots_-_Patrick_Watson",
      "gurenge--demon-slayer-kimetsu-no-yaiba-op",
      "Pokemon_Theme_Song",
    ],
  },
  {
    title: "Functional major",
    titleChords: ["V7", "I"],
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
          As you listen to the tracks, pay attention to chord pairs. Do you hear
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
          <ChordStairs mode={MODES[1]} />
        </P>
        <P>
          <ChordStairs mode={MODES[0]} />
        </P>
      </>
    ),
    composers: [
      "Canon_in_D",
      "a-thousand-years",
      "John_Lennon_Imagine",
      "sign-of-the-times---harry-styles",
      "A_Thousand_Miles",
    ],
  },
  {
    title: "Dorian IV in minor",
    titleChords: ["i", "IV"],
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
          progresses according to local transition probabilities up to a
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
        <h2>Dorian IV in minor</h2>
        <P>
          Some pieces use a {c`IV`} chord inside an otherwise minor mode piece:{" "}
          {c`i IV i`}. Therefore the total chord palette in that piece becomes{" "}
          {c`i bIII iv IV v V bVI bVII V7 i`}
        </P>
        <P>Most pieces use this chord only at a single particular place.</P>
        <P>
          Some people say that {c`IV`} in {c`i IV i`} is <i>borrowed</i> from
          major into minor. I'm not sure this is a helpful optics.
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
          {s`dorian`}
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
    ],
  },
  {
    title: "iv in major",
    titleChords: ["I", "iv"],
    composers: [
      "calum-scott---you-are-the-reason-piano-sheet-lyrics-lyrics-version-link-in-description",
      "how-far-i-ll-go-~-moana-ost",
      "la-vie-en-rose-solo-accordion",
    ],
  },
  {
    title: "Seventh chords and extensions",
    titleChords: ["IVmaj7", "Imaj7"],
    mode: {
      title: "seventh chords and extensions in major",
      chords: ["ii7", "IVmaj7", "vi7", "Imaj7", "iii7", "V13"],
    },
    composers: [
      "Golden_Hour__JVKE_Updated_Ver.",
      "Sweden_Minecraft",
      "Gymnopdie_No._1__Satie",
      "yuri-on-ice---piano-theme-full",
    ],
  },
  {
    title: "Applied dominant: V7/V",
    titleChords: ["V7/V", "V"],
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
    title: "Other applied chords",
    titleChords: ["V7/vi", "vi", "V7/ii", "ii"],
    mode: {
      title: "applied chords",
      chords: ["V7/ii", "ii", "V7/iv", "iv", "V7/vi", "vi"],
    },
    composers: [
      "anastasia---once-upon-a-december",
      "Omori_Duet",
      "sia---snowman",
      "Cant_Help_Falling_In_Love",
      "your-song-piano",
      "my-lie-watashi-no-uso---your-lie-in-april",
      "abba--the-winner-takes-it-all",
      "All_I_Want_for_Christmas_is_You",
      "ye-niqu-keru-yoru-ni-kakeru---racing-into-the-night",
      "prelude-i-in-c-major-bwv-846---well-tempered-clavier-first-book",
      "Love_Like_You_Steven_Universe",
      "my-heart-will-go-on",
    ],
  },
  {
    title: MODULATIONS_CHAPTER_TITLE,
    mode: {
      chords: ["V7", "I", "i"],
      title: "",
    },
    composers: [
      "minuet-bwv-anhang-114-in-g-major",
      "flight-of-the-bumblebee",
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "wa-mozart-marche-turque-turkish-march-fingered",
      "theme-from-schindler-s-list---piano-solo",
      "Fr_Elise",
      "the_entertainer_scott_joplin",
    ],
  },
  {
    title: "Blues scale and hexatonic minor",
    titleChords: ["1", "b3", "4", "#4", "5", "b7"],
    pretext: () => (
      <>
        <P>{k("blues-scale")}</P>
      </>
    ),
    mode: {
      title: "blues scale",
      chords: ["1", "b3", "4", "#4", "5", "b7"],
    },
    composers: [
      "Undertale_-_Megalovania_Piano_ver._3",
      "Jojo_s_Bizarre_Adventure_Golden_Wind_Giornos_Theme_Ver_2",
      "fairy-tail-main-theme",
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
      "kimi-no-na-wa---sparkle-theishter-2016",
      "Super_Mario_Bros_Main_Theme",
      "welcome-to-the-black-parade---my-chemical-romance",
    ],
  },
  {
    title: "ii V I jazz",
    titleChords: ["ii7", "V7", "Imaj7"],
    mode: {
      title: "jazz",
      chords: ["ii7", "V7", "Imaj7", "iiø7", "V7b9", "i7"],
    },
    composers: [
      "Fly_Me_to_the_Moon",
      "autumn-leaves-jazz-piano",
      "it-s-been-a-long-long-time---harry-james",
      "Merry_Go_Round_of_Life_Howls_Moving_Castle_Piano_Tutorial_",
    ],
  },
  {
    title: "Complex and diverse harmony",
    titleChords: ["biio7", "io7", "viio7"],
    composers: [
      "Clair_de_Lune__Debussy",
      "Chopin_-_Nocturne_Op_9_No_2_E_Flat_Major",
      "Liebestraum_No._3_in_A_Major",

      "mii-channel-piano",
      "ylang-ylang---fkj-transcribed-by-lilroo",
      "attack-on-titan-theme-guren-no-yumiya",
      "congratulations---mac-miller",
      "isabella-s-lullaby-the-promised-neverland-emotional-anime-on-piano-vol.-2",
      "dance-of-the-sugar-plum-fairy",
      "africa---toto",
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
      "the_entertainer_scott_joplin",
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
