import * as React from "react";
import { S } from "./Course";

const Texture = ({ sequencer }) => {
  return (
    <>
      <h3>Texture - arpeggio</h3>
      <ul>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S artist="MIDI/White Lion" song="When the Children Cry.mid" />
        </li>
      </ul>
      <h3>Texture - guitar strumming</h3>
      <ul></ul>
      <h3>Melody in thirds</h3>
      <ul>
        <li>
          <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S
            artist="MIDI/Vince Guaraldi"
            song="Les Peanuts   Charly Brown   Snoopy.mid"
          />
        </li>
        <li>
          <S artist="MIDI/White Lion" song="When the Children Cry.mid" />
        </li>
        <li>
          <S artist="MIDI/Whigfield" song="Another Day.mid" />
        </li>
        <li>
          <S artist="MIDI/Weezer" song="Buddy Holly.mid" />
        </li>
        <li>
          <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" />
        </li>
      </ul>

      <h3>Arrangement - counterpoint</h3>
      <ul>
        <li>
          <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
        </li>
        <li>
          <S artist="MIDI/Westlife" song="Fool Again.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
    </>
  );
};

export default Texture;
