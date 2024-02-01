import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const ChordsInMinor: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <ChordClouds chords={["i", "iv", "V"]} />
      <div>
        In the 1960s..1980s a minor key was less popular that a major one.
      </div>

      <h3>Minor with V</h3>
      <ul>
        <li>
          <S artist="MIDI/Tanita Tikaram" song="Twist In My Sobriety.mid" /> -
          i-iv-V-i (need to fix phrasing)
        </li>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" /> -
          bVI-bVII-v-i with V
        </li>
        <li>
          <S artist="MIDI/The Cardigans" song="My Favorite Game.mid" /> -
          similar
        </li>
        <li>
          <S artist="MIDI/Ventures" song="Walk Don't Run.mid" /> - i-bVII-bVI-V
          with a major bIII-bVI part
        </li>
        <li>
          <S artist="MIDI/Wayne Jeff" song="The Eve of the War.mid" /> - i-V7
          with bVI-bVII-i
        </li>
        <li>
          <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" /> -
          minor, requires muting a trumpet
        </li>
        <li>
          <S artist="MIDI/Usher" song="My Way.mid" /> - i-bVII-bVI-V RnB
        </li>
      </ul>

      <h3>Natural minor</h3>
      <div>
        Tracks that are built around natural minor often have other
        complications: diatonic seventh chords or other alterations, dance-like
        progression style, pedals. There wasn't a simple functional natural
        minor language in the 1960s in the classical pop/rock time - it's more
        modern and more diverse.
      </div>
      <ChordClouds chords={["i", "iv", "v"]} />

      <TagSearch tag="scale:natural_minor" analyses={analyses} />
      <ChordClouds chords={["bVI", "bVII", "i", "bIII"]} />
    </>
  );
};

export default ChordsInMinor;
