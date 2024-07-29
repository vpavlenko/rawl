import * as React from "react";
import ChordStairs, { Mode } from "./ChordStairs";
import { ChordStairsContainer } from "./LandingPage";

const TOC = [
  {
    slug: "intro",
    link: "f/Pirates_of_the_Caribbean_-_Hes_a_Pirate",
  },
  {
    slug: "melody",
    link: "f/pirates_of_the_caribbean_main_theme",
  },
  {
    slug: "melody",
    link: "f/pirate_melody_16measures",
  },
  // {
  //   slug: "melody",
  //   link: "f/pirate_melody_16measures_transposed_down",
  // },
  {
    slug: "melody_transpositions",
    link: "f/pirate_melody_16measures_transpositions",
  },
  // {
  //   slug: "melody_chromatic",
  //   link: "f/pirate_melody_16measures_chromatic",
  // },
  // {
  //   slug: "melody_whole_tone",
  //   link: "f/pirate_melody_16measures_whole_tone",
  // },
  // {
  //   slug: "melody_major",
  //   link: "f/pirate_melody_16measures_major",
  // },
  {
    slug: "melody_scales",
    link: "f/pirate_melody_16measures_scales",
  },
];

const FUNCTIONS: Mode[] = [
  {
    title: "S1",
    chords: ["V7/vi", "vi"],
  },
  {
    title: "S2",
    chords: ["V7/vi", "V7/ii", "ii", "io7"],
  },
  {
    title: "S3",
    chords: ["V7/IV", "IV", "iv", "io7"],
  },
  {
    title: "S4",
    chords: ["io7"],
  },
  { title: "K", chords: ["I6", "Cad64"] },
  {
    title: "D1",
    chords: ["V7/ii", "V7/V", "V7"],
  },
  {
    title: "D2",
    chords: ["vi", "V7/V", "V7"],
  },
  {
    title: "D3",
    chords: ["V7/ii", "ii", "V7"],
  },
  {
    title: "T",
    chords: ["IPAC"],
  },
];

const Pirate = () => {
  return (
    <div>
      {/* {TOC.map(({ slug, link }) => (
        <div>
          {slug}:{" "}
          <a href={link} target="_blank">
            {link}
          </a>
        </div>
      ))} */}
      <div>Cadences in Scott Joplin: SKDT</div>
      <div>
        <ChordStairsContainer>
          {FUNCTIONS.map((f) => (
            <ChordStairs mode={f} />
          ))}
        </ChordStairsContainer>
      </div>
    </div>
  );
};

export default Pirate;
