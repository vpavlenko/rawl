import * as React from "react";
import { S } from "./Course";

const ChromaticChords = ({ sequencer }) => {
  return (
    <>
      <h3>bII</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
      </ul>
      <h3>Chromatic chords - V+</h3>
      <h3>Chromatic chords - iv</h3>
      <ul>
        <li>
          <S artist="MIDI/Weezer" song="Buddy Holly.mid" />
        </li>
      </ul>
      <h3>Chromatic chords - viio</h3>
      <ul>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <h3>Chromatic chords - io7</h3>
      <ul>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>
      <ul>
        <li>
          <S artist="MIDI/Ultravox" song="Vienna.mid" />
        </li>
      </ul>
    </>
  );
};

export default ChromaticChords;
