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
        <li>
          <S artist="MIDI/Bob Marley" song="Jammin'.mid" />
        </li>
      </ul>
      <h3>Short progression</h3>
      <ul>
        <li>
          <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" />
        </li>
        <li>
          <S artist="MIDI/Tavares" song="Heaven Must Be Missing an Angel.mid" />
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
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" /> -
          mostly natural minor functional
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
        <li>
          <S artist="MIDI/Tasmin Archer" song="Sleeping Satellite.mid" /> -
          pedal in the intro, 1 and 5 in pedal
        </li>
        <li>
          <S artist="MIDI/Ted Nugent" song="Cat Scratch Fever.mid" /> - riff,
          vocals absent
        </li>
        <li>
          <S artist="MIDI/Television Theme Songs" song="X-Files.mid" />
        </li>
      </ul>
      <h3>Shuttle</h3>
      <ul>
        <li>The Beatles - Eleanor Rigby VI-i</li>
        <li>
          <S artist="MIDI/Traffic" song="Feelin' All Right.mid" />
        </li>
        <li>
          <S artist="MIDI/America" song="A Horse With No Name.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Bob Marley" song="Waiting In Vain.mid" />
        </li>
        <li>
          <S artist="MIDI/Tatyana Ali" song="Daydreamin'.mid" />
        </li>
      </ul>
    </>
  );
};

export default Functionality;
