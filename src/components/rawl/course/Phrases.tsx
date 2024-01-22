import * as React from "react";
import { S } from "./Course";

const Arrow = () => (
  <div
    style={{
      width: "30px",
      textAlign: "center",
      fontSize: "48px",
      fontWeight: 700,
      color: "white",
    }}
  >
    →
  </div>
);

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
      </ul>
    </>
  );
};

export default Phrases;
