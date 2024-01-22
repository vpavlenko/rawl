import * as React from "react";
import { S } from "./Course";

const ChordsInMinor = ({ sequencer }) => {
  return (
    <>
      <h2>Natural minor</h2>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" /> - main tonic
        </li>
        <li>
          <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
        </li>
        <li>
          <S artist="MIDI/Vanilla Ice" song="Ice Ice Baby.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Vertical Horizon" song="Everything You Want.mid" /> -
          drone
        </li>
        <li>
          <S artist="MIDI/Visage" song="Fade to Grey.mid" />
        </li>
        <li>
          <S artist="MIDI/Warren G" song="Regulate.mid" />
        </li>
      </ul>
    </>
  );
};

export default ChordsInMinor;
