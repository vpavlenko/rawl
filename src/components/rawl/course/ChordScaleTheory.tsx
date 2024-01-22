import * as React from "react";
import { S } from "./Course";

const ChordScaleTheory = ({ sequencer }) => {
  return (
    <>
      <h3>Iadd6</h3>
      <ul>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>
      <h3>V9, V13</h3>
      <ul>
        <li>
          <S
            artist="MIDI/UB40"
            song="(I Can't Help) Falling In Love With You.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
        <li>
          <S artist="MIDI/Vera" song="At This Moment.mid" />
        </li>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>

      <h3>Alterations (9th, 13th)</h3>
      <ul>
        <li>
          <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
        </li>
        <li>
          <S
            artist="MIDI/White Barry"
            song="Can't Get Enough of Your Love, Babe.mid"
          />
        </li>
      </ul>
      <h3>Chord scale</h3>
      <ul>
        <li>
          <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
        </li>
      </ul>
    </>
  );
};

export default ChordScaleTheory;
