import * as React from "react";
import { S } from "./Course";

const ThicknessOfVoicing = ({ sequencer }) => {
  return (
    <>
      <h3>Just the bass</h3>
      <ul>
        <li>
          <S artist="MIDI/Zhi-Vago" song="Celebrate (The Love).mid" />
        </li>
        <li>
          <S artist="MIDI/Tears for Fears" song="Shout.5.mid" />
        </li>
      </ul>
      <h3>Power chords</h3>
      <ul>
        <li>
          <S artist="MIDI/Tal Bachman" song="She's So High.mid" />
        </li>
        <li>
          <S artist="MIDI/Vengaboys" song="Boom Boom Boom.mid" />
        </li>
        <li>
          <S artist="MIDI/Weezer" song="Buddy Holly.mid" />
        </li>
        <li>
          <S artist="MIDI/Violent Femmes" song="Blister in the Sun.mid" />
        </li>
        <li>
          <S artist="MIDI/ZZ Top" song="Sharp Dressed Man.3.mid" />
        </li>
      </ul>
      <h3>Diatonic seventh chords</h3>
      <ul>
        <li>
          <S artist="MIDI/U96" song="Club Bizarre.mid" />
        </li>
        <li>
          <S artist="MIDI/Vera" song="At This Moment.mid" />
        </li>
        <li>
          <S artist="MIDI/Bob Marley" song="Waiting In Vain.mid" />
        </li>
        <li>
          <S artist="MIDI/Take That" song="Back For Good.mid" />
        </li>
      </ul>
      <h3>Blues seventh chords</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
        <li>
          <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" />
          scale used as ornamentation
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
      <h3>ii7 chord</h3>
      <ul></ul>
    </>
  );
};

export default ThicknessOfVoicing;
