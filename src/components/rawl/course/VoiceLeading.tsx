import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const VoiceLeading: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="voice-leading:Vsus4" analyses={analyses} />
      <TagSearch tag="chord:Vsus4" analyses={analyses} />
      <TagSearch tag="voice-leading:chromatic" analyses={analyses} />
      <TagSearch tag="voice-leading:triple_chromatic" analyses={analyses} />
      <TagSearch tag="voice-leading:triple_diatonic" analyses={analyses} />
      <TagSearch tag="voice-leading:in_chords" analyses={analyses} />
      <TagSearch tag="voice-leading:Vsus4" analyses={analyses} />
    </>
  );
};

export default VoiceLeading;
