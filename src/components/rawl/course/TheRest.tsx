import * as React from "react";
import TagSearch from "../TagSearch";
import { S } from "./Course";

const TheRest = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Chromatic voice-leading</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Paradis" song="Be My Baby.mid" />
        </li>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S artist="MIDI/Vera" song="At This Moment.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Vicki Sue Robinson"
            song="Never Gonna Let You Go.mid"
          />
        </li>
        <li>
          <S
            artist="MIDI/Village People"
            song="Five O'clock in the Morning.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
        </li>
        <li>
          <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
        </li>
        <li>
          <S artist="MIDI/Wang Chung" song="Dance Hall Days.mid" />
        </li>
        <li>
          <S artist="MIDI/Whigfield" song="Another Day.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <h3>Style - reggae</h3>
      <TagSearch tag="style:reggae" analyses={analyses} />
      <h3>Vsus4</h3>
      <TagSearch tag="chord:Vsus4" analyses={analyses} />
      <h3>Latin</h3>
      <TagSearch tag="style:latin" analyses={analyses} />
      <h3>Rock solo</h3>
      <TagSearch tag="form:rock_solo" analyses={analyses} />
      <h3>Silent break</h3>
      <TagSearch tag="arrangement:silent_break" analyses={analyses} />
      <h3>Delay effect</h3>
      <div>
        There's no way to encode a delay via standard MIDI commands, so
        arrangers doubled tracks with a small time shift.
      </div>
      <TagSearch tag="fx:delay" analyses={analyses} />
    </>
  );
};

export default TheRest;
