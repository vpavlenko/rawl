import * as React from "react";
import { S } from "./Course";

const AppliedChords = ({ sequencer }) => {
  return (
    <>
      <h3>Applied chords - V/V</h3>
      <ul>
        <li>
          <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" />
        </li>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/ii</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Paradis" song="Be My Baby.mid" />
        </li>
        <li>
          <S artist="MIDI/Vera" song="At This Moment.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/iii</h3>
      <ul>
        <li>
          <S artist="MIDI/VOF de Kunst" song="Een kopje koffie.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/vi</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
      </ul>
      <h3>Applied chords - V7/IV</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/iv</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
        </li>
      </ul>
    </>
  );
};

export default AppliedChords;