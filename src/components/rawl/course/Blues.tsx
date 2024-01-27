import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Blues: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Blues</h3>
      <ul>
        <li>
          <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" /> - scale used
          as ornamentation
        </li>
        <li>
          <a href="https://chiptune.app/?q=blues">
            https://chiptune.app/?q=blues
          </a>
        </li>
      </ul>
      <TagSearch tag="voicing:blues" analyses={analyses} />
      <TagSearch tag="style:blues" analyses={analyses} />
      <TagSearch tag="style:boogie" analyses={analyses} />
      <TagSearch tag="genre:rockabilly" analyses={analyses} />
    </>
  );
};

export default Blues;
