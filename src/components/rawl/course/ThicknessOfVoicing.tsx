import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const ThicknessOfVoicing: Chapter = ({ analyses }) => {
  return (
    <>
      <ChordClouds chords={["I5", "IV5", "V5"]} />
      <div>
        Basic Western harmony builds chords on scale degrees, three notes in a
        chord. Since the notes of a chord in simple cases are drawn from the
        major scale (i.e. they are diatonic) - the root itself completely
        defines the chord. So harmony can be given using just the roots or via a
        root+fifth combination.
      </div>
      <TagSearch tag="voicing:root" analyses={analyses} />
      <TagSearch tag="arrangement:no_chords" analyses={analyses} />
      <TagSearch tag="voicing:power_chords" analyses={analyses} />

      <ChordClouds chords={["ii7"]} />
      <h3>ii7</h3>
      <div>
        Even if most of the arrangement goes in thirds, two chords most often
        get one more note - the seventh tone - are V7 and ii7. ii7 is a fusion
        of ii and IV, syntactically.
      </div>

      <TagSearch tag="chord:ii7" analyses={analyses} />
      <div>
        The ii+IV fusion can also be seen in a ii6 inversion - a ii chord on a 4
        bass, where it's the only inverted chord in a song. This pattern is more
        common in common practice music than in the 20th century, though.
      </div>
      <TagSearch tag="chord:ii6" analyses={analyses} />

      <h3>Diatonic seventh chords</h3>
      <ChordClouds chords={["I△", "iii7", "IV△", "vi7"]} />

      <TagSearch tag="voicing:diatonic_sevenths" analyses={analyses} />
      <TagSearch tag="chord:i7" analyses={analyses} />
      <TagSearch
        tag="voicing:only_minor_sevenths_in_major"
        analyses={analyses}
      />

      <h3>Blues seventh chords</h3>
      <ChordClouds chords={["I7", "IV7", "V7"]} />
      <div>
        Previous chords all drew notes from a single scale - a major scale. A
        different thing happens in blues - here a scale changes with each chord
        change. A mixolydian scale is built starting from the root of each of
        the chords I7, IV7 and V7.
      </div>
      <TagSearch tag="voicing:blues" analyses={analyses} />
      <ul>
        <li>
          <S artist="MIDI/The Chaplin Band" song="Let's Have a Party.mid" /> -
          here chords are mostly built in triads, but the b7 mixolydian note is
          played over some I7's and IV7's, as well as b3 over I7.
        </li>
      </ul>
    </>
  );
};

export default ThicknessOfVoicing;
