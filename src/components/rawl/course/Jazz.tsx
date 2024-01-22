import * as React from "react";
import { S } from "./Course";

const Jazz = ({ sequencer }) => {
  return (
    <>
      <h3>Swing</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
        </li>
        <li>
          <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
        </li>
      </ul>
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
      <h3>Stride</h3>
      <ul>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>
      <h3>Jazz solo</h3>
      <ul>
        <li>
          <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
        </li>
        <li>
          <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
        </li>
      </ul>
      <h3>Jazz fusion</h3>
      <ul>
        <li>
          <S artist="MIDI/UZEB" song="New Hit.mid" />
        </li>
      </ul>
      <h3>Form - AABA</h3>
      <ul>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
        <li>
          <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
        </li>
      </ul>
    </>
  );
};

export default Jazz;
