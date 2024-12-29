import * as React from "react";
import { CorpusLink } from "../corpora/CorpusLink";
import { Chord } from "../legends/chords";
import { A, c, Mode, P, rnc, s, UL } from "./chapters";

export const BEYOND_CHAPTER_GROUPS: Record<string, [number, number]> = {
  intro: [1, 10],
};

export const BEYOND_CHAPTERS: Array<{
  title: string;
  titleChords?: Chord[];
  mode?: Mode | Mode[];
  pretext?: () => React.JSX.Element;
  composers: string[];
}> = [
  {
    title: "Blues",
    titleChords: ["I7"],
    composers: [],
    pretext: () => (
      <>
        <h2>Blues</h2>
        <P>
          Surprisingly, there is no instance of {s`form:12-bar_blues`} inside
          the top 100.
        </P>
        <P>
          The main harmonic ideas in the blues is the usage of three main
          dominant seventh chords: {rnc`I7`}, {rnc`IV7`}, and {rnc`V7`}.
        </P>
        <P>There are several forms of a 12-bar blues progression:</P>
        <P>
          <UL>
            <li>
              {c`I7 I7 I7 I7 IV7 IV7 I7 I7 V7 V7 I7 I7`} - simple, ancient
            </li>
            <li>{c`I7 I7 I7 I7 IV7 IV7 I7 I7 V7 IV7 I7 I7`} - most common</li>
            <li>
              {c`Imaj7 Imaj7 Imaj7 I7 IV7 IV7 Imaj7 V7/ii ii7 V7 Imaj7 V7`} - a
              possible blues in jazz
            </li>
            <li>{c`i7 i7 i7 i7 iv7 iv7 i7 i7 v7 iv7 i7 i7`} - a minor blues</li>
          </UL>
        </P>
        <P>
          <CorpusLink slug={"boogie_woogie"} />
        </P>
      </>
    ),
  },
  {
    title: "Constant structures",
    titleChords: ["I", "bII", "II", "bIII", "III"],
    composers: [],
    pretext: () => (
      <>
        <h2>Constant structures</h2>
        <P>{s`constant_structures:major_chords`}</P>
      </>
    ),
  },
  {
    title: "Neo-Riemannian",
    titleChords: ["i", "bvi"],
    composers: [],
    pretext: () => (
      <>
        <h2>Two minor triads</h2>
        <P></P>
        <P>
          There are 11 ways to follow a minor triad with a minor triad. Some of
          these ways have a diatonic interpretation, some others - sorta tonal
          interpretation, yet another ones are picant, modern, VGMy.
        </P>
        <P>
          <UL>
            <li>{c`i bii`}</li>
            <li>{c`i ii`}</li>
            <li>{c`i biii`}</li>
            <li>{c`i iii`}</li>
            <li>
              {c`i iv`} is native to natural minor,{" "}
              {A("still-dre---variation-composition")}
            </li>
            <li>{c`i #iv`}</li>
            <li>{c`i v`}</li>
            <li>
              {c`i bvi`} {s`chromatic_chords:minor_bvi`}
            </li>
            <li>{c`i vi`}</li>
            <li>{c`i bvii`}</li>
            <li>{c`i vii`}</li>
          </UL>
        </P>
      </>
    ),
  },
];
