import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Styles: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="style:reggae" analyses={analyses} />
      <TagSearch tag="style:latin" analyses={analyses} />
      <TagSearch tag="style:funk" analyses={analyses} />
      <TagSearch tag="style:soul" analyses={analyses} />
      <TagSearch tag="style:soul_ballad" analyses={analyses} />
      <TagSearch tag="style:hip-hop" analyses={analyses} />
      <TagSearch tag="style:RnB" analyses={analyses} />
      <TagSearch tag="style:EDM" analyses={analyses} />
      <TagSearch tag="style:techno" analyses={analyses} />
      <TagSearch tag="style:eurodance" analyses={analyses} />
      <TagSearch tag="style:dance_pop" analyses={analyses} />
      <TagSearch tag="style:disco" analyses={analyses} />
      <TagSearch tag="style:metal" analyses={analyses} />
      <TagSearch tag="style:grunge" analyses={analyses} />
      <TagSearch tag="style:prog_rock" analyses={analyses} />
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
      <ul>
        <li>
          <S artist="MIDI/Yes" song="And You and I.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Yes" song="Roundabout.1.mid" />
        </li>
      </ul>
      <h3>Unsorted</h3>
      <h4>Delay effect</h4>
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

export default Styles;
