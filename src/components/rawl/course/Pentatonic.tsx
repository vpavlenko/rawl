import * as React from "react";
import { S } from "./Course";

const TheRest = ({ sequencer }) => {
  return (
    <>
      {" "}
      <h3>Chromatic chords - bVII</h3>
      <ul>
        <li>
          <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
        </li>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> - kind of
          like pivot bII = bVII
        </li>
        <li>
          <S artist="MIDI/Tal Bachman" song="She's So High.mid" />
        </li>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
        <li>
          <S artist="MIDI/Wang Chung" song="Dance Hall Days.mid" /> - bVII-IV-I
        </li>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <h3>bVI-bVII-I in major - Mario cadence</h3>
      <ul>
        <li>
          <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <h3>Pentatonics</h3>
      <ul>
        <li>
          <S artist="MIDI/Ugly Kid Joe" song="Neighbor.mid" />
        </li>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>
      <h3>Pentatonic languages, bIII</h3>
      <ul>
        <li>
          <S artist="MIDI/Veruca Salt" song="Seether.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vince Guaraldi"
            song="Les Peanuts   Charly Brown   Snoopy.mid"
          />
        </li>
      </ul>
      <h3>References</h3>
      <div>
        Biamonte, Nicole. 2010. “Triadic Modal and Pentatonic Patterns in Rock
        Music.” Music Theory Spectrum 32, no. 2: 95–110.
      </div>
    </>
  );
};

export default TheRest;
