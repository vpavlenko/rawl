import * as React from "react";
import { S } from "./Course";

const TheRest = ({ sequencer }) => {
  return (
    <>
      <h3>Blues</h3>
      <ul>
        <li>
          <S artist="MIDI/Traffic" song="Feelin' All Right.mid" />
        </li>
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
        <li>https://chiptune.app/?q=blues</li>
      </ul>
    </>
  );
};

export default TheRest;
