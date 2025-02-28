import React from "react";
import styled from "styled-components";
import { Mode } from "../book/chapters";
import { Chord } from "../legends/chords";

// Import the P styled component from chapters.tsx
export const P = styled.div`
  margin-bottom: 30px;
  line-height: 1.6;
`;

// Define the chapter groups (how they're organized in the UI)
export const EDITOR_CHAPTER_GROUPS: Record<string, [number, number]> = {
  all: [1, 3], // All 3 chapters are in a single group
};

// Define the editor chapters
export const EDITOR_CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode | Mode[];
  pretext?: () => React.JSX.Element;
  scores: string[];
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
      </>
    ),
    scores: ["wima.e480-schubert_de.-tanz-d.365.25"],
  },
  {
    title: "Schubert Dances",
    titleChords: ["V7", "I"],
    pretext: () => (
      <>
        <P>
          In 1821, when Schubert was 24, he published a set of 46 waltzes known
          as Originaltänze op. 9 (D 365).
        </P>
      </>
    ),
    scores: [
      "schubert_d365_09",
      "wima.e480-schubert_de.-tanz-d.365.25",
      "wima.1124-schubert_de.-tanz-d.365.26",
      "wima.4be9-schubert_de.-tanz-d.365.28",
    ],
  },
  {
    title: "Natural Minor",
    titleChords: ["bVI", "iv", "i", "bVII"],
    pretext: () => (
      <>
        <P>
          Gibran Alcocer's compositions sound modern. They sound like late 20th
          or early 21st century. Like Yann Tiersen's music to Amélie. But how is
          that? Which structures are a core of that modern style?
        </P>
      </>
    ),
    scores: [
      "idea-22---gibran-alcocer",
      "idea-n.10---gibran-alcocer",
      "idea-20---gibran-alcocer",
      "idea-15---gibran-alcocer",
    ],
  },
  {
    title: "Miscellaneous",
    titleChords: ["Imaj7", "i7"],
    pretext: () => (
      <>
        <P>A collection of various musical pieces</P>
      </>
    ),
    scores: [
      "der-flohwalzer",
      "Gravity_Falls_Opening",
      "Waltz_No._2_The_Second_Waltz_by_Dmitri_Shostakovich_for_Piano",
      "chopsticks",
      "the-two-happy-coons---theodore-h.-northrup-1891",
      "passacaglia---handel-halvorsen",
      "boogie-woogie-jump---pete-johnson",
    ],
  },
];
