import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter } from "./Course";

const ChordScaleTheory: Chapter = ({ analyses }) => {
  return (
    <>
      <h3>Iadd6</h3>
      Paper:{" "}
      <a href="https://www.mtosmt.org/issues/mto.23.29.2/mto.23.29.2.martin.html">
        Henry Martin. On the Tonic Added-Sixth Chord in Jazz
      </a>
      <TagSearch tag="chord:Iadd6" analyses={analyses} />
      <h3>V9, V11, V13, V7b9</h3>
      <TagSearch tag="chord:V9" analyses={analyses} />
      <TagSearch tag="chord:V13" analyses={analyses} />
      <TagSearch tag="chord:V7b9" analyses={analyses} />
      <h3>Alterations (9th, 13th)</h3>
      <TagSearch tag="voicing:alterations" analyses={analyses} />
      <TagSearch tag="form:alterations_on_last_chord" analyses={analyses} />
      <h3>Chord scale</h3>
      <TagSearch tag="chord-scale:phrygian_dominant" analyses={analyses} />
      <TagSearch tag="chord-scale:melodic_minor_V" analyses={analyses} />
      <TagSearch tag="chord-scale:ionian_IV" analyses={analyses} />
    </>
  );
};

export default ChordScaleTheory;
