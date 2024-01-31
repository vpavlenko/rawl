import * as React from "react";
import TagSearch from "../TagSearch";
import { Chapter, S } from "./Course";

const ThicknessOfVoicing: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <h3>Just the bass</h3>
      <TagSearch tag="voicing:root" analyses={analyses} />

      <h3>Power chords</h3>
      <TagSearch tag="voicing:power_chords" analyses={analyses} />

      <h3>ii7</h3>
      <TagSearch tag="chord:ii7" analyses={analyses} />

      <h3>Diatonic seventh chords</h3>
      <TagSearch tag="voicing:diatonic_sevenths" analyses={analyses} />
      <TagSearch
        tag="voicing:only_minor_sevenths_in_major"
        analyses={analyses}
      />

      <h3>Blues seventh chords</h3>
      <TagSearch tag="voicing:blues" analyses={analyses} />

      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" /> - scale used
          as ornamentation
        </li>
        <li>
          <S artist="MIDI/Victoria Williams" song="Boogieman.mid" /> - boogie
        </li>
        <li>
          <S artist="MIDI/Vincent Gene" song="Be Bob A-Lula.mid" /> - rockabilly
        </li>
        <li>
          <S artist="MIDI/VOF de Kunst" song="Een kopje koffie.mid" />
        </li>
        <li>
          <S
            artist="MIDI/Westernhagen"
            song="Mit Pfefferminz bin ich dein Prinz.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Donovan" song="Mellow Yellow.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Tatyana Ali" song="Daydreamin'.mid" />
        </li>
      </ul>
    </>
  );
};

export default ThicknessOfVoicing;
