import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const AppliedChords: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <ChordClouds chords={["V/V", "V"]} />
      <h3>Applied chords - V/V</h3>
      <ul>
        <li>
          <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" />
        </li>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/ii</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Paradis" song="Be My Baby.mid" />
        </li>
        <li>
          <S artist="MIDI/Vera" song="At This Moment.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/iii</h3>
      <ul>
        <li>
          <S artist="MIDI/VOF de Kunst" song="Een kopje koffie.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/vi</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
      </ul>
      <h3>Vsus4 in applied chords</h3>
      <TagSearch tag="voice-leading:Vsus4_in_applied" analyses={analyses} />
      <h3>Applied chords - V7/IV</h3>
      <div>Hypothesis: V7/IV always implies V7 instead of V?</div>
      <ul>
        <li>
          <S
            artist="MIDI/Telly Savalas"
            song="Some Broken Hearts Never Mend.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Talk of the Town" song="The Kwek Kwek Song.mid" />
        </li>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
      </ul>
      <h3>Applied chords - V/iv</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
        </li>
      </ul>
      <ChordClouds chords={["V/V/V", "V/V"]} />
      <h3>V/V/V</h3>
      <ul>
        <li>
          <S artist="MIDI/Tammy Wynette" song="Stand By Your Man.1.mid" /> -
          very functional
        </li>
      </ul>
    </>
  );
};

export default AppliedChords;
