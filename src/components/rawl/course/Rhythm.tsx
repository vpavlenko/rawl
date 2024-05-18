import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const Rhythm: Chapter = ({ analyses }) => {
  return (
    <>
      <TagSearch tag="rhythm:swing" analyses={analyses} />

      <TagSearch tag="rhythm:3+3+2" analyses={analyses} />

      <TagSearch tag="rhythm:syncopation" analyses={analyses} />

      <TagSearch tag="rhythm:anticipation" analyses={analyses} />

      <TagSearch tag="rhythm:triplet" analyses={analyses} />

      <TagSearch tag="rhythm:2_against_3" analyses={analyses} />
    </>
  );
};

export default Rhythm;
