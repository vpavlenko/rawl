import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const ChromaticChords: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="chord:bII" analyses={analyses} />
      <TagSearch tag="chord:V+" analyses={analyses} />
      <TagSearch tag="chord:iv_in_major" analyses={analyses} />
      <TagSearch tag="chord:viio" analyses={analyses} />
      <TagSearch tag="chord:io7" analyses={analyses} />
      <TagSearch tag="chord:viø" analyses={analyses} />
      <TagSearch tag="chord:III" analyses={analyses} />
      <TagSearch tag="predominant:dissonant" analyses={analyses} />
      <TagSearch tag="dominant:very_dissonant" analyses={analyses} />
    </>
  );
};

export default ChromaticChords;
