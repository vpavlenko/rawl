import React from "react";
import { CorpusLink } from "../corpora/CorpusLink";
import { Chord } from "../legends/chords";
import ChordStairs from "../legends/ChordStairs";
import { Mode, P } from "./chapters";

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
