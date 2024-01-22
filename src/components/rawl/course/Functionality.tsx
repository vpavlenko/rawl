import * as React from "react";
import { S } from "./Course";

const Functionality = ({ sequencer }) => {
  return (
    <>
      <h3>Functionality - progression</h3>
      Cite Hearing Harmony
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" /> - three chords
        </li>
        <li>
          <S artist="MIDI/Usher" song="My Way.mid" />
        </li>
      </ul>
      <h3>Functionality - functional</h3>
      <ul>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
        </li>
        <li>
          <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
        </li>
        <li>
          <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" />
        </li>
        <li>
          <S artist="MIDI/Ventures" song="Walk Don't Run.mid" />
        </li>
        <li>
          <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
      <h3>Functionality - mixed</h3>
      <ul>
        <li>
          <S
            artist="MIDI/White Barry"
            song="Can't Get Enough of Your Love, Babe.mid"
          />
        </li>
      </ul>
      <h3>Deceptive cadence</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
      </ul>
      <h3>Functionality - stasis, non-transposed riff, pedal</h3>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" />- middle part, sort of
        </li>
        <li>
          <S
            artist="MIDI/Venditti Antonello"
            song="Benvenuti in paradiso.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Whigfield" song="Another Day.mid" />
        </li>
        <li>
          <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
        </li>
      </ul>
    </>
  );
};

export default Functionality;
