import * as React from "react";
import { S } from "./Course";

const Phrases = ({ sequencer }) => {
  return (
    <>
      <h3>Phrases</h3>
      Fix non-squared phrases
      <ul>
        <li>
          <S
            artist="MIDI/White Lion"
            song="When the Children Cry.mid"
            exercise="tonic"
          />
        </li>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
        <li>
          <S artist="MIDI/Bob Marley" song="Redemption Song.mid" />
        </li>
        <li>
          <S artist="MIDI/Zhi-Vago" song="Celebrate (The Love).mid" />
        </li>
      </ul>
      <h3>Dominant prolongation</h3>
      <h3>Silent break</h3>
      <ul>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" />
        </li>
      </ul>
    </>
  );
};

export default Phrases;
