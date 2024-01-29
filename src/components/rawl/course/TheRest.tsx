import * as React from "react";
import TagSearch from "../TagSearch";
import { S } from "./Course";

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
      <h3>Prog rock</h3>
      Two examples from{" "}
      <a
        href="https://www.mtosmt.org/issues/mto.15.21.1/mto.15.21.1.clement.html"
        target="_blank"
      >
        "Brett G. Clement. Scale Systems and Large-Scale Form in the Music of
        Yes"
      </a>
      :
      <li>
        <S artist="MIDI/Yes" song="And You and I.1.mid" />
      </li>
    </>
  );
};

export default TheRest;
