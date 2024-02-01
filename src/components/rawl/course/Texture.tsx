import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const Texture: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <TagSearch tag="texture:arpeggio" analyses={analyses} />
      <TagSearch tag="texture:guitar_strumming" analyses={analyses} />
      <TagSearch tag="melody:in_thirds" analyses={analyses} />
      <TagSearch tag="arrangement:pad_chord_tones" analyses={analyses} />
      <TagSearch tag="arrangement:piano_glissando" analyses={analyses} />
      <TagSearch tag="arrangement:fills_at_rests" analyses={analyses} />
      <TagSearch tag="arrangement:silent_break" analyses={analyses} />
      <TagSearch tag="arrangement:chordal_riff" analyses={analyses} />
      <TagSearch tag="arrangement:ornamental_riff" analyses={analyses} />
      <TagSearch tag="arrangement:harmonic_embellishment" analyses={analyses} />
      <TagSearch tag="arrangement:simple_second_line" analyses={analyses} />
      <TagSearch tag="arrangement:counterpoint" analyses={analyses} />
      <TagSearch tag="arrangement:orchestra" analyses={analyses} />
    </>
  );
};

export default Texture;
