import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const Blues: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      Where to get more:{" "}
      <a href="https://chiptune.app/?q=blues">https://chiptune.app/?q=blues</a>
      <TagSearch tag="scale:blues" analyses={analyses} />
      <TagSearch tag="voicing:blues" analyses={analyses} />
      <TagSearch tag="style:blues" analyses={analyses} />
      <TagSearch tag="style:boogie" analyses={analyses} />
      <TagSearch tag="style:bluegrass" analyses={analyses} />
      <TagSearch tag="style:rockabilly" analyses={analyses} />
    </>
  );
};

export default Blues;
