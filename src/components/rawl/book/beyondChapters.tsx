import * as React from "react";
import styled from "styled-components";
import { CorpusLink } from "../corpora/CorpusLink";
import { Chord } from "../legends/chords";
import { A, c, ct, Mode, P, rnc, s, UL } from "./chapters";

const H2 = styled.h2`
  color: #fff;
`;

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
        <H2>Blues</H2>
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
          <UL>
            <li>{s`scale:blues`}</li>
            <li>{s`chord_scale:IV7`}</li>
            <li>{s`form:8-bar_blues`}</li>
            <li>
              <CorpusLink slug={"boogie_woogie"} />
            </li>
          </UL>
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
        <H2>Constant structures</H2>
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
        <H2>Two minor triads</H2>
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
  {
    title: "Parallel symmetry",
    titleChords: ["V7", "i", "V7", "I"],
    composers: [],
    pretext: () => (
      <>
        <H2>Parallel symmetry</H2>
        <P>{s`parallel:symmetry`}</P>
        <P>{s`parallel:picardy_third`}</P>
      </>
    ),
  },
  {
    title: "Greek b2 natural 3",
    titleChords: ["bvii", "I"],
    composers: [],
    pretext: () => (
      <>
        <H2>Greek b2</H2>
        <P>
          Let's consider the corpus <CorpusLink slug={"greek_music"} />. Some
          songs in it are quite standard Western. However, there are others
          which exploit a scale specific to the Balkans: {c`1 b2 3 4 5 b6 b7 1`}
          . For a lack of better universal name, let's call it a C phrygian
          dominant.
        </P>
        <P>
          Technically, it's a rotation of a {ct("1 2 b3 4 5 b6 7 1", 5)}:{" "}
          {ct("5 b6 7 1 2 b3 4 5", -7)}. However, due to the positioning of
          chords within the section, due to cadential formulas (like {c`bvii I`}
          ) and the structure of melodies another note is tonicized in it, and
          therefore I recolor. The most common first and last chord in those
          pieces is {c`I`}.
        </P>
        <P>
          {c`iv I bvii I`}, {c`bII I bvii I`}
        </P>
        <P>{s`b2:3`}</P>
        <P>
          {A("a.-kaldaras---nyhtose-horis-feggari---greek-music-037")},{" "}
          {A("s.-xarhakos---stoy-thoma---greek-music-055")},{" "}
          {A("s.-xarhakos---mpoyrnovalia---greek-music-079")}
        </P>
      </>
    ),
  },
];
