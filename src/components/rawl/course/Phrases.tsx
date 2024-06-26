import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const Phrases: Chapter = ({ analyses }) => {
  return (
    <>
      <div>
        By default, measures can be grouped into 4-measure phrases. There's a
        certain feel for "a first measure in a phrase", "a last measure in a
        phrase". It's reached both by different distributions of chord
        probabilities for each position inside a phrase or by drumming accents.
      </div>
      <div>
        There are common deformations that lenghten or shorten a phrase.
      </div>

      <h3>Dominant prolongation</h3>
      <TagSearch tag="phrasing:dominant_prolongation" analyses={analyses} />
      <ul>
        <li>
          <S artist="MIDI/The Association" song="Never My Love.mid" /> - here a
          prolongation on IV chord votes for it to be{" "}
          <a href="https://mtosmt.org/issues/mto.11.17.1/mto.11.17.1.temperley.html">
            a dominant
          </a>
        </li>
        <li>
          <S artist="MIDI/The Boomtown Rats" song="I Don't Like Monday's.mid" />{" "}
          - both IV and V are prolonged
        </li>
      </ul>

      <TagSearch tag="phrasing:tonic_prolongation" analyses={analyses} />
      <TagSearch
        tag="phrasing:silent_break_extra_measure"
        analyses={analyses}
      />
      <TagSearch tag="phrasing:fusion" analyses={analyses} />
      <TagSearch tag="phrasing:third_repetition" analyses={analyses} />

      <h3>Unsorted</h3>
      <ul>
        <li>
          <S artist="MIDI/The Alan Parsons Project" song="Eye In The Sky.mid" />{" "}
          - Sudden abrupt on repeat
        </li>
        <li>
          <S artist="MIDI/Terry Stafford" song="Suspicion.mid" /> - contraction
        </li>
        <li>
          <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
        </li>
        <li>
          <S artist="MIDI/Terry Jacks" song="Seasons in the Sun.2.mid" />
        </li>
      </ul>
    </>
  );
};

export default Phrases;
