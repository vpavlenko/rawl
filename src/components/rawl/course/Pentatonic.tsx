import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const TheRest: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Chromatic chords - bVII</h3>
      <TagSearch tag="chord:bVII" analyses={analyses} />
      <TagSearch tag="stability:bVII-V" analyses={analyses} />

      <h3>bVI-bVII-I in major - Mario cadence</h3>
      <TagSearch tag="stability:bVI-bVII-I" analyses={analyses} />

      <h3>Pentatonic languages, bIII</h3>
      <TagSearch tag="stability:bIII" analyses={analyses} />

      <h3>Pentatonics</h3>
      <ul>
        <li>
          <S artist="MIDI/Ugly Kid Joe" song="Neighbor.mid" />
        </li>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>

      <h3>References</h3>
      <div>
        Biamonte, Nicole. 2010. “Triadic Modal and Pentatonic Patterns in Rock
        Music.” Music Theory Spectrum 32, no. 2: 95–110.
      </div>
    </>
  );
};

export default TheRest;
