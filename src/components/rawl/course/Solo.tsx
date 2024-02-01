import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const Solo: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="form:rock_solo" analyses={analyses} />

      <TagSearch tag="form:jazz_solo" analyses={analyses} />

      <TagSearch tag="form:drum_solo" analyses={analyses} />

      <TagSearch tag="form:other_solo" analyses={analyses} />

      <TagSearch tag="form:solo_piano_intro" analyses={analyses} />

      <TagSearch tag="form:solo_piano" analyses={analyses} />

      <TagSearch tag="form:solo_guitar" analyses={analyses} />
    </>
  );
};

export default Solo;
