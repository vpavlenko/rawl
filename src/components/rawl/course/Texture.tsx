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
      <ul>
        <li>
          <S
            artist="MIDI/Telly Savalas"
            song="Some Broken Hearts Never Mend.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Take That" song="Back For Good.mid" />
        </li>
        <li>
          <S artist="MIDI/Tammy Wynette" song="Stand By Your Man.1.mid" />
        </li>
      </ul>
      <h3>Doubling in thirds</h3>
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
        <li>
          <S artist="MIDI/Tavares" song="Heaven Must Be Missing an Angel.mid" />
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
      <h3>Pads</h3>
      <ul>
        <li>
          <S artist="MIDI/Talk Talk" song="It's My Life.mid" />
        </li>
        <li>
          <S artist="MIDI/Tasmin Archer" song="Sleeping Satellite.mid" />
        </li>
      </ul>
      <h3>Piano glissando</h3>
      <ul>
        <li>
          <S artist="MIDI/Tavares" song="Heaven Must Be Missing an Angel.mid" />
        </li>
      </ul>
      <h3>Fills at rests</h3>
      <ul>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" />
        </li>
      </ul>
    </>
  );
};

export default Texture;
