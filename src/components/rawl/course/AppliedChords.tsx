import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter } from "./Course";

const AppliedChords: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <ChordClouds chords={["V/V", "V"]} />
      <h3>Applied chords - V/V</h3>
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
      <TagSearch tag="applied:V/V/V" analyses={analyses} />
    </>
  );
};

export default AppliedChords;
