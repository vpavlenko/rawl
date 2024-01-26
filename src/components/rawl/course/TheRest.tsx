import * as React from "react";
import { S } from "./Course";

const TheRest = ({ sequencer }) => {
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
      <ul>
        <li>
          <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
        </li>
      </ul>
      <h3>Vsus4</h3>
      <h3>Latin</h3>
      <ul>
        <li>
          <S artist="MIDI/War" song="Low Rider.mid" />
        </li>
      </ul>
      <h3>Rock solo</h3>
      <ul>
        <li>
          <S artist="MIDI/Zucchero" song="Senza Una Donna.7.mid" />
        </li>
        <li>
          <S artist="MIDI/Marx Richard" song="Hazard.mid" />
        </li>
        <li>
          <S artist="MIDI/Tasmin Archer" song="Sleeping Satellite.mid" />
        </li>
      </ul>
    </>
  );
};

export default TheRest;
