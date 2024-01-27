import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const Texture: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Texture - arpeggio</h3>
      <TagSearch tag="arrangement:pad_chord_tones" analyses={analyses} />
      <h3>Texture - guitar strumming</h3>
      <TagSearch tag="texture:guitar_strumming" analyses={analyses} />
      <h3>Doubling in thirds</h3>
      <TagSearch tag="melody:in_thirds" analyses={analyses} />
      <h3>Arrangement - counterpoint</h3>
      <TagSearch tag="arrangement:counterpoint" analyses={analyses} />
      <h3>Pads</h3>
      <TagSearch tag="arrangement:pad_chord_tones" analyses={analyses} />
      <h3>Piano glissando</h3>
      <TagSearch tag="arrangement:piano_glissando" analyses={analyses} />
      <h3>Fills at rests</h3>
      <TagSearch tag="arrangement:fills_at_rests" analyses={analyses} />
    </>
  );
};

export default Texture;
