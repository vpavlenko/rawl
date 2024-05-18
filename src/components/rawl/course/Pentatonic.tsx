import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter } from "./Course";

const TheRest: Chapter = ({ analyses }) => {
  return (
    <>
      <ChordClouds chords={["bVII", "V", "I"]} />
      <TagSearch tag="chord:bVII" analyses={analyses} />
      <TagSearch tag="stability:bVII-V" analyses={analyses} />

      <ChordClouds chords={["bVI", "bVII", "I"]} />
      <TagSearch tag="stability:bVI-bVII-I" analyses={analyses} />

      <TagSearch tag="stability:bIII" analyses={analyses} />
      <ChordClouds chords={["I", "bIII"]} />
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
