import * as React from "react";
import ChordClouds from "./ChordClouds";
import { S } from "./Course";

const ChordsInMinor = ({ sequencer }) => {
  return (
    <>
      <h3>Natural minor</h3>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" /> - main tonic
        </li>
        <li>
          <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
        </li>
        <li>
          <S artist="MIDI/Vanilla Ice" song="Ice Ice Baby.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Vertical Horizon" song="Everything You Want.mid" /> -
          drone
        </li>
        <li>
          <S artist="MIDI/Visage" song="Fade to Grey.mid" />
        </li>
        <li>
          <S artist="MIDI/Warren G" song="Regulate.mid" />
        </li>
        <li>
          <S artist="MIDI/Bob Marley" song="I shot the Sheriff.mid" />
        </li>
      </ul>
      <ChordClouds chords={["i", "iv"]} />
      <h3>i-iv-V-i</h3>
      <ul>
        <li>
          <S artist="MIDI/Tanita Tikaram" song="Twist In My Sobriety.mid" />
        </li>
      </ul>
      <h3>VI-VII-i</h3>
      <ul>
        <li>
          <S artist="MIDI/Talking Heads" song="Psycho Killer.mid" />
        </li>
      </ul>
      <h3>Minor before V7</h3>
      <ul>
        <li>
          <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
        </li>
      </ul>
      <h3>i-iv-v-i</h3>
      <ul>
        <li>
          <S artist="MIDI/Technotronic" song="Pump Up the Jam.mid" /> - also III
        </li>
      </ul>
      <h3>minor with V7</h3>
      <ul>
        <li>
          <S artist="MIDI/Ventures" song="Walk Don't Run.mid" /> - has entire
          scale
        </li>
        <li>
          <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" /> - no
          V7, complex
        </li>
        <li>
          <S artist="MIDI/Usher" song="My Way.mid" /> - Andalusian R&B
        </li>
      </ul>
      <ChordClouds chords={["Vsus4", "V"]} />
      <h3>Vsus4-V</h3>
      <ul>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" /> -
          mixed, also bVII-v7
        </li>
      </ul>
    </>
  );
};

export default ChordsInMinor;
