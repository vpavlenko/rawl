import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const TheRest: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="chord:bVII" analyses={analyses} />
      <TagSearch tag="stability:bVII-V" analyses={analyses} />

      <TagSearch tag="stability:bVI-bVII-I" analyses={analyses} />

      <TagSearch tag="stability:bIII" analyses={analyses} />
      <TagSearch tag="scale:pentatonic" analyses={analyses} />
      <TagSearch tag="scale:transposed_pentatonic" analyses={analyses} />

      <h3>References</h3>
      <div>
        Biamonte, Nicole. 2010. “Triadic Modal and Pentatonic Patterns in Rock
        Music.” Music Theory Spectrum 32, no. 2: 95–110.
      </div>
    </>
  );
};

export default TheRest;
