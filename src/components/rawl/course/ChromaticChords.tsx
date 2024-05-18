import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const ChromaticChords: Chapter = ({ analyses }) => {
  return (
    <>
      <ChordClouds chords={["bII", "V+"]} />
      <TagSearch tag="chord:bII" analyses={analyses} />
      <TagSearch tag="chord:V+" analyses={analyses} />
      <ul>
        <li>
          <S artist="MIDI/The Charmaines" song="Eternally.mid" /> - here both
          viio/ii and V+ result from chromatic voice-leading, so should we even
          talk about these as about separate chords? Yes, they do sound, but are
          they structurally as meaningful as pure V+ and viio/ii?
        </li>
      </ul>
      <TagSearch tag="chord:iv_in_major" analyses={analyses} />
      <ChordClouds chords={["I", "iv"]} />
      <TagSearch tag="chord:viio" analyses={analyses} />
      <TagSearch tag="chord:io7" analyses={analyses} />
      <TagSearch tag="chord:viø" analyses={analyses} />
      <TagSearch tag="predominant:dissonant" analyses={analyses} />
      <TagSearch tag="dominant:very_dissonant" analyses={analyses} />
    </>
  );
};

export default ChromaticChords;
