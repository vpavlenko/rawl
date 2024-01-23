import * as React from "react";
import { S } from "./Course";

const TheRest = ({ sequencer }) => {
  return (
    <>
      <h3>Dorian (shuttle?)</h3>
      <ul>
        <li>
          <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
          dorian
        </li>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> dorian
          relative shuttle after modulation
        </li>
        <li>
          <S artist="MIDI/U2" song="A Celebration.mid" />
        </li>
        <li>
          <S
            artist="MIDI/UB40"
            song="(I Can't Help) Falling In Love With You.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Us3" song="Cantaloop.mid" />
        </li>
        <li>
          <S artist="MIDI/Bob Marley" song="Jammin'.mid" />
        </li>
        <li>
          <S artist="MIDI/Zucchero" song="Senza Una Donna.7.mid" />
        </li>
      </ul>
      <h3>iadd6</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
        </li>
      </ul>
      <h3>Hexatonic minor</h3>
      <ul>
        <li>
          <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" /> - two chords
        </li>
      </ul>
      <h3>Functionality - shuttle</h3>
      <ul>
        <li>
          <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
          dorian shuttle
        </li>
      </ul>
      <h3>Mixolydian shuttle</h3>
      <ul>
        <li>
          <S
            artist="MIDI/Village People"
            song="Five O'clock in the Morning.mid"
          />
        </li>
      </ul>
    </>
  );
};

export default TheRest;
