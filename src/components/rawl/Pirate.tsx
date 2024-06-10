import * as React from "react";

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

const Pirate = () => {
  return (
    <div>
      {TOC.map(({ slug, link }) => (
        <div>
          {slug}:{" "}
          <a href={link} target="_blank">
            {link}
          </a>
        </div>
      ))}
    </div>
  );
};

export default Pirate;
