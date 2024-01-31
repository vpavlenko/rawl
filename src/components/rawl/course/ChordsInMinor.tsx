import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const ChordsInMinor: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <ChordClouds chords={["i", "iv"]} />
      <h3>Natural minor</h3>
      <TagSearch tag="scale:natural_minor" analyses={analyses} />

      <h3>General minor with V</h3>
      <TagSearch tag="scale:minor" analyses={analyses} />

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
