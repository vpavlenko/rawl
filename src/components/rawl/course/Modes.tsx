import * as React from "react";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Chapter, S } from "./Course";

const Modes: Chapter = ({ sequencer, analyses }) => {
  return (
    <>
      <ChordClouds chords={["i", "IV"]} />
      <h3>Dorian</h3>
      <div>
        The most popular rendition of dorian is a i-IV shuttle. Why? Well, once
        you've played i-IV, you realize two things:
        <ul>
          <li>
            What you've done is already unusual enough to pause the development
            and stand there for a while
          </li>
          <li>
            Being rare, a dorian mode doesn't care a lot of functional
            expectations, so nothing dictates you what chord chunks and paths to
            weave
          </li>
        </ul>
      </div>
      <TagSearch tag="scale:dorian" analyses={analyses} />
      <TagSearch tag="chord:iadd6" analyses={analyses} />
      <h3>iadd6</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
        </li>
      </ul>
      <h3>Hexatonic minor</h3>
      <TagSearch tag="scale:hexatonic_minor" analyses={analyses} />

      <h3>Mixolydian shuttle</h3>
      <ul>
        <li>
          <S
            artist="MIDI/Village People"
            song="Five O'clock in the Morning.mid"
          />
        </li>
        <li>
          <S artist="MIDI/Talk Talk" song="It's My Life.mid" />
        </li>
        <li>
          <S artist="MIDI/Technohead" song="I Wanna Be a Hippy.mid" />
        </li>
        <li>
          <S artist="MIDI/Terence Trent D'Arby" song="Wishing Well.mid" />
        </li>
      </ul>
      <TagSearch tag="chord:bVII" analyses={analyses} />
    </>
  );
};

export default Modes;
