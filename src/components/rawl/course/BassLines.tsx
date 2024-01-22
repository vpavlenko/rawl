import * as React from "react";
import { S } from "./Course";

const BassLines = ({ sequencer }) => {
  return (
    <>
      <h3>Bass: root, root-fifth, diatonic approaches</h3>
      <ul>
        <li>
          <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" /> -
          in minor, so early
        </li>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> - diatonic
          approaches
        </li>
        <li>
          <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
        </li>
        <li>
          <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
          root
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" />
        </li>
        <li>
          <S artist="MIDI/Whigfield" song="Another Day.mid" />
        </li>
      </ul>
      <ul>
        <li>
          <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
          root metal - hard to give since it's dorian
        </li>
      </ul>
      <h3>Bass - riff</h3>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" /> - with progression
        </li>
        <li>
          <S
            artist="MIDI/Vince Guaraldi"
            song="Les Peanuts   Charly Brown   Snoopy.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Violent Femmes" song="Blister in the Sun.mid" />
        </li>
        <li>
          <S artist="MIDI/War" song="Low Rider.mid" />
        </li>
      </ul>
      <h3>Bass - diatonic line</h3>
      <ul>
        <li>
          <S artist="MIDI/Twila Paris" song="How Beautiful.mid" /> - diatonic
          bass line
        </li>
        <li>
          <S
            artist="MIDI/UB40"
            song="(I Can't Help) Falling In Love With You.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" />
        </li>
        <li>
          <S artist="MIDI/White Lion" song="When the Children Cry.mid" />
        </li>
      </ul>
      <h3>Bass - developed</h3>
      <ul>
        <li>
          <S artist="MIDI/Westlife" song="Fool Again.mid" />
        </li>
      </ul>
    </>
  );
};

export default BassLines;
