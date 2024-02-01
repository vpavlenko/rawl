import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const ChromaticChords: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>bII</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
      </ul>
      <h3>Chromatic chords</h3>
      <TagSearch tag="chord:V+" analyses={analyses} />
      <TagSearch tag="chord:iv_in_major" analyses={analyses} />
      <TagSearch tag="chord:viio" analyses={analyses} />
      <TagSearch tag="chord:io7" analyses={analyses} />
      <TagSearch tag="chord:viø" analyses={analyses} />
      <TagSearch tag="chord:III" analyses={analyses} />

      <h3>Chromatic chords - viio</h3>
      <ul>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <h3>Chromatic chords - io7</h3>
      <ul>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
      </ul>
      <ul>
        <li>
          <S artist="MIDI/Ultravox" song="Vienna.mid" />
        </li>
      </ul>
      <ChordClouds chords={["III", "IV"]} />
      <h3>III-IV</h3>
      <ul>
        <li>
          <S artist="MIDI/Tammy Wynette" song="Stand By Your Man.1.mid" />
        </li>
      </ul>
      <h3>Other</h3>
      <ul>
        <li>
          <S
            artist="MIDI/The Animals"
            song="The House of the Rising Sun.5.mid"
          />{" "}
          - bVI (Ger) after IV in minor as a voice-leading process
        </li>
      </ul>
    </>
  );
};

export default ChromaticChords;
