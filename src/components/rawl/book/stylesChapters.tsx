import React from "react";
import { CorpusLink } from "../corpora/CorpusLink";
import { Chord } from "../legends/chords";
import ChordStairs from "../legends/ChordStairs";
import { A, c, Mode, P, s } from "./chapters";

// Define the e() custom tag for scores
export const e = (slug: string) => (
  <a
    href={`/e/${slug}`}
    target="_blank"
    rel="noopener noreferrer"
    style={{
      display: "inline-block",
      color: "cyan",
      whiteSpace: "nowrap",
    }}
  >
    {slug}
  </a>
);

// Define the corpus() custom tag for corpus links
export const corpus = (slug: string) => <CorpusLink slug={slug} />;

// Define the chapter groups (how they're organized in the UI)
export const STYLES_CHAPTER_GROUPS: Record<string, [number, number]> = {
  all: [1, 3], // All 3 chapters are in a single group
};

// Define the editor chapters
export const STYLES_CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode | Mode[];
  pretext?: () => React.JSX.Element;
}> = [
  {
    title: "Introduction",
    titleChords: ["I"],
    pretext: () => (
      <>
        <P>
          I'll teach you composition by pastiche. In each chapter I'm gonna show
          you several pieces in a similar style and ask you to compose something
          of the same vibe.
        </P>
        <P>
          You won't need any previous knowledge of music theory or sheet music
          reading. However, right from the beginning we're going to analyze
          scores of real composers, classical and modern - Schubert, Gibran
          Alcocer, TheFatRat etc. And we'll build our path towards more
          sophisticated styles like that of Koji Kondo, Joe Hisaishi, Scott
          Joplin etc.
        </P>
        <P>
          I'll show you all scores in my 12-colored piano-roll-based relative
          notation. I'll teach you how to see chords and how to see patterns in
          melodies. We're going to extract the relevant music theory right from
          the scores and reuse it.
        </P>
        <P>
          Check out this example:
          <ul>
            <li>{e("wima.e480-schubert_de.-tanz-d.365.25")}</li>
          </ul>
        </P>
      </>
    ),
  },
  {
    title: "Schubert, Two chords in major",
    titleChords: ["V7", "I"],
    pretext: () => (
      <>
        <P>
          In 1821, when Schubert was 24, he published a set of 36 waltzes known
          as Originaltänze op. 9 (D 365). Most of them are here:{" "}
          {corpus("schubert_op9_d365")}
        </P>
        <P>
          I've hand-picked four of them which have the simplest organization:
          they consist of just two chords: {c`I`} and {c`V7`}.
        </P>
        <P>
          Here they are:
          <ul>
            <li>{e("schubert_d365_09")}</li>
            <li>{e("wima.e480-schubert_de.-tanz-d.365.25")}</li>
            <li>{e("wima.1124-schubert_de.-tanz-d.365.26")}</li>
            <li>{e("wima.4be9-schubert_de.-tanz-d.365.28")}</li>
          </ul>
        </P>
        <h2>Task</h2>
        <P>
          Start with waltz #25 {e("wima.e480-schubert_de.-tanz-d.365.25")},
          leave the left hand intact and compose a new melody. You may either
          aim for it to be Schubert-like or of your own style.
        </P>
      </>
    ),
  },
  {
    title: "Gibran Alcocer, Four-chord Loops of Triads in Natural Minor",
    titleChords: ["bVI", "iv", "i", "bVII"],
    pretext: () => (
      <>
        <P>
          {corpus("gibran_alcocer")}'s compositions sound modern. They sound
          like late 20th or early 21st century. Like {corpus("yann_tiersen")}'s
          music to Amélie. {corpus("evgeny_grinko")} also writes in a similar
          style. But how is that? Which structures are a core of that modern
          style?
        </P>
        <P>
          Explore these pieces:
          <ul>
            <li>{e("idea-15---gibran-alcocer")}</li>
            <li>{e("idea-n.10---gibran-alcocer")}</li>
          </ul>
        </P>
        <P>
          <ChordStairs
            mode={{
              title: "",
              chords: ["i", "iio", "bIII", "iv", "v", "bVI", "bVII"],
            }}
          />
        </P>
        <P>
          <ChordStairs
            mode={{
              title: "",
              chords: ["iio", "iv", "bVI", "i", "bIII", "v", "bVII"],
            }}
          />
        </P>
        <P>
          {s`progression:four_chords`} is a popular way of organizing chords in
          modern music.
        </P>
        <P>
          Gibran Alcocer uses {s`hypermeter:extra_bar_last_chord_in_loop`} in
          every piece. This is a mark of his particular style: other composers
          writing music in four-chord loops don't use it as often.
        </P>
        <h2>Task</h2>
        <P>
          Compose a composition by reusing the style of ideas 15 and 10.
          Restricted your vocabulary of chords to these five:
        </P>
        <P>
          <ChordStairs
            mode={{
              title: "",
              chords: ["i", "iv", "v", "bVI", "bVII"],
            }}
          />
        </P>
        <P>{A("i-wanted-to-leave---syml")}</P>
      </>
    ),
  },
  {
    title: "Triadic minor with V",
    titleChords: ["V", "i"],
    pretext: () => (
      <>
        <P>
          <ChordStairs
            mode={{
              title: "",
              chords: ["V", "i"],
            }}
          />
        </P>
        <P>
          <ul>
            <li>{e("papers-please")}</li>
          </ul>
        </P>
      </>
    ),
  },
  {
    title: "Miscellaneous",
    titleChords: ["Imaj7", "i7"],
    pretext: () => (
      <>
        <P>A collection of various musical pieces</P>
        <P>
          Check out these examples:
          <ul>
            <li>{e("der-flohwalzer")}</li>
            <li>{e("Gravity_Falls_Opening")}</li>
            <li>
              {e(
                "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
              )}
            </li>
            <li>{e("chopsticks")}</li>
            <li>{e("the-two-happy-coons---theodore-h.-northrup-1891")}</li>
            <li>{e("passacaglia---handel-halvorsen")}</li>
            <li>{e("boogie-woogie-jump---pete-johnson")}</li>
          </ul>
        </P>
      </>
    ),
  },
];
