import * as React from "react";
import { S } from "./Course";

const Modulation = ({ sequencer }) => {
  return (
    <>
      <h3>Parallel keys</h3>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" />
        </li>
        <li>
          <S artist="MIDI/Van McCoy" song="The Hustle.mid" />
        </li>
        <li>
          <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
        </li>
        <li>
          <S artist="MIDI/Television Theme Songs" song="ER.mid" />
        </li>
      </ul>
      <h3>Picardy third</h3>
      <ul>
        <li>
          <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
        </li>
      </ul>
      <h3>Modulation - contrast</h3>
      <ul>
        <li>
          <S
            artist="MIDI/UB40"
            song="(I Can't Help) Falling In Love With You.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Ultravox" song="Vienna.mid" />
        </li>
        <li>
          <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
        </li>
      </ul>
      <h3>Relative key</h3>
      <ul>
        <li>
          <S artist="MIDI/Taja Sevelle" song="Take Me for a Ride.mid" />
        </li>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
        </li>
        <li>
          <S artist="MIDI/Vertical Horizon" song="Everything You Want.mid" />
        </li>
        <li>
          <S artist="MIDI/Zucchero" song="Senza Una Donna.7.mid" />
        </li>
      </ul>
    </>
  );
};

export default Modulation;
