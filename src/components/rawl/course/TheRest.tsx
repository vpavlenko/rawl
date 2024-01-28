import * as React from "react";
import TagSearch from "../TagSearch";

const TheRest = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Style - reggae</h3>
      <TagSearch tag="style:reggae" analyses={analyses} />

      <h3>Latin</h3>
      <TagSearch tag="style:latin" analyses={analyses} />

      <h3>Delay effect</h3>
      <div>
        There's no way to encode a delay via standard MIDI commands, so
        arrangers doubled tracks with a small time shift.
      </div>
      <TagSearch tag="fx:delay" analyses={analyses} />

      <h3>Development through instrumentation</h3>
      <TagSearch
        tag="form:development_through_instrumentation"
        analyses={analyses}
      />
    </>
  );
};

export default TheRest;
