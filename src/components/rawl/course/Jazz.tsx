import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Jazz: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="style:stride" analyses={analyses} />

      <TagSearch tag="style:jazz_fusion" analyses={analyses} />
      <TagSearch tag="style:modal_jazz" analyses={analyses} />
      <TagSearch tag="style:bossa_nova" analyses={analyses} />

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
