import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Phrases: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Unsorted</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
        <li>
          <S artist="MIDI/Terry Jacks" song="Seasons in the Sun.2.mid" />
        </li>
      </ul>
      <h3>Dominant prolongation</h3>
      <TagSearch tag="phrasing:dominant_prolongation" analyses={analyses} />
      <h3>Silent break</h3>
      <TagSearch tag="arrangement:silent_break" analyses={analyses} />
      <h3>Contraction?</h3>
      <ul>
        <li>
          <S artist="MIDI/Terry Stafford" song="Suspicion.mid" />
        </li>
      </ul>
      <h3>Sudden abrupt on repeat</h3>
      <ul>
        <li>
          <S artist="MIDI/The Alan Parsons Project" song="Eye In The Sky.mid" />
        </li>
      </ul>
      <h3>Fusion</h3>
      <ul>
        <li>
          <S
            artist="MIDI/The Animals"
            song="The House of the Rising Sun.5.mid"
          />
        </li>
      </ul>
    </>
  );
};

export default Phrases;
