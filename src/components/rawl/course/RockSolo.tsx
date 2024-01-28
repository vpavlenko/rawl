import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const RockSolo: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="form:rock_solo" analyses={analyses} />
    </>
  );
};

export default RockSolo;
