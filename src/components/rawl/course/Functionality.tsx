import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Functionality: Chapter = ({ analyses }) => {
  return (
    <>
      <h3>Functionality - progression</h3>
      Cite Hearing Harmony
      <TagSearch tag="functionality:short_progression" analyses={analyses} />
      <TagSearch tag="functionality:progression" analyses={analyses} />
      <h3>Functionality - functional</h3>
      <div>
        The best intro into this is Chapter 1 of Drew Nobile's "Form as Harmony
        in Rock Music"
      </div>
      <ul>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" /> -
          mostly natural minor functional
        </li>
      </ul>
      <TagSearch tag="functionality:functional" analyses={analyses} />
      <h3>Deceptive cadence</h3>
      <ul>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
      </ul>
      <TagSearch tag="chunks:V-vi_deceptive" analyses={analyses} />
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
      <TagSearch tag="functionality:stasis" analyses={analyses} />
      <TagSearch tag="functionality:drone" analyses={analyses} />
      <TagSearch tag="functionality:riff" analyses={analyses} />
      <TagSearch tag="voice-leading:pedal" analyses={analyses} />
      <h3>Shuttle</h3>
      <ul>
        <li>The Beatles - Eleanor Rigby VI-i</li>
      </ul>
      <TagSearch tag="functionality:shuttle" analyses={analyses} />
      <h3>Mixed</h3>
      <div>Some tracks have parts of different functionalities.</div>
      <ul>
        <li>
          <S
            artist="MIDI/White Barry"
            song="Can't Get Enough of Your Love, Babe.mid"
          />
        </li>
        <li>
          <S artist="MIDI/The Cars" song="Drive.1.mid" />
        </li>
      </ul>
    </>
  );
};

export default Functionality;
