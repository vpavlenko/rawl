import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Jazz: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Swing (rhythm)</h3>
      <TagSearch tag="rhythm:swing" analyses={analyses} />

      <h3>Jazz</h3>
      <ul>
        <li>
          <S artist="MIDI/Tyner Mccoy" song="Old Devil Moon.mid" /> - piano
          trio, walking bass
        </li>
        <li>
          <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
        </li>
      </ul>
      <TagSearch tag="style:stride" analyses={analyses} />

      <TagSearch tag="form:jazz_solo" analyses={analyses} />

      <TagSearch tag="style:jazz_fusion" analyses={analyses} />

      <TagSearch tag="form:AABA" analyses={analyses} />

      <TagSearch tag="arrangement:piano_trio" analyses={analyses} />

      <h3>Applied harmony</h3>
      <ul>
        <li>
          <S
            artist="MIDI/Television Theme Songs"
            song="Coronation Street.mid"
          />
        </li>
      </ul>
    </>
  );
};

export default Jazz;
