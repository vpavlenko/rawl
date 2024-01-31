import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const BassLines: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Bass: root, root-fifth, diatonic approaches</h3>
      <ul>
        <li>
          <S
            artist="MIDI/The Animals"
            song="The House of the Rising Sun.5.mid"
          />{" "}
          - good example on "just" root
        </li>
        <li>
          <S artist="MIDI/Taylor Dayne" song="Tell It to My Heart.mid" /> - root
          with embellishments
        </li>
        <li>
          <S artist="MIDI/The Bluegrass Cardinals" song="Pretty Red Wing.mid" />{" "}
          - see bass on ii7
        </li>
      </ul>
      <TagSearch tag="bass:root" analyses={analyses} />
      <TagSearch tag="bass:root_fifth" analyses={analyses} />
      <TagSearch tag="bass:root_third_fifth" analyses={analyses} />
      <TagSearch tag="bass:diatonic_approaches" analyses={analyses} />
      <TagSearch tag="bass:simple" analyses={analyses} />

      <h3>Bass - riff</h3>
      <TagSearch tag="bass:riff" analyses={analyses} />
      <TagSearch tag="bass:transposed_riff" analyses={analyses} />

      <h3>Bass - diatonic line</h3>
      <TagSearch tag="bass:diatonic_line" analyses={analyses} />

      <h3>Bass - developed</h3>
      <TagSearch tag="bass:developed" analyses={analyses} />
      <TagSearch tag="bass:walking" analyses={analyses} />
      <TagSearch tag="bass:melody" analyses={analyses} />
      <TagSearch tag="bass:idk" analyses={analyses} />
    </>
  );
};

export default BassLines;
