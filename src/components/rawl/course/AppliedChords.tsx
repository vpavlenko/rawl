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
          <S artist="MIDI/The Beautiful South" song="Don't Marry Her.mid" /> -
          pure I-IV-V and V7/V. Allow a user to change the tonic and recolor.
        </li>
      </ul>
      <TagSearch tag="applied:V/V" analyses={analyses} />

      <h3>Applied chords - V/ii</h3>
      <TagSearch tag="applied:V/ii" analyses={analyses} />

      <h3>Applied chords - V/iii</h3>
      <TagSearch tag="applied:V/iii" analyses={analyses} />

      <h3>Applied chords - V/vi</h3>
      <TagSearch tag="applied:V/vi" analyses={analyses} />

      <h3>Vsus4 in applied chords</h3>
      <TagSearch tag="applied:Vsus4_in_applied" analyses={analyses} />

      <h3>Applied chords - V7/IV</h3>
      <div>Hypothesis: V7/IV always implies V7 instead of V?</div>
      <TagSearch tag="applied:V7/IV" analyses={analyses} />

      <h3>Applied chords - V/iv</h3>
      <TagSearch tag="applied:V/iv" analyses={analyses} />

      <ChordClouds chords={["V/V/V", "V/V"]} />
      <h3>V/V/V</h3>
      <ul>
        <li>
          <S artist="MIDI/The Bluegrass Cardinals" song="Pretty Red Wing.mid" />{" "}
          - pure I-IV-V7-I, V/V and V/V/V
        </li>
      </ul>
      <TagSearch tag="applied:V/V/V" analyses={analyses} />

      <h3>Applied chords to IV</h3>
      <ul>
        <li>
          <S artist="MIDI/The Blue Diamonds" song="Ramona.mid" /> - VI leading
          to IV
        </li>
      </ul>
      <TagSearch tag="chord:III" analyses={analyses} />
    </>
  );
};

export default AppliedChords;
