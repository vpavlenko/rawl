import * as React from "react";
import { Chapter, S } from "./Course";

export const Email = () => (
  <a href="mailto:cxielamiko@gmail.com">cxielamiko@gmail.com</a>
);

const About: Chapter = () => {
  return (
    <>
      <div style={{ position: "relative" }}>
        <div style={{ position: "absolute", left: 700 }}>
          <img
            width="496"
            alt="Screenshot 2024-01-25 at 16 07 22"
            src="https://github.com/vpavlenko/rawl/assets/1491908/9b5e0339-f58b-45ea-99a4-2a919864fa8a"
          />
          <div style={{ marginTop: 25 }}>
            <S artist="MIDI/Take That" song="Back For Good.mid" />
          </div>
        </div>
      </div>
      <h3>12 colors</h3>
      <div>
        You can instantly see and recognize chords if you have right tools. I
        discovered that coloring notes in 12 colors, starting from the tonic,
        works like magic. Once you internalize a particular chord - a harmony, a
        Roman numeral - as a bundle of 3..4 colors, you will see it everywhere.
        After a bit of training you'll be able to instantly analyze chords in
        any new arrangement - way faster than you hear it. (We talk about
        Western tonal harmony hear.)
      </div>
      <div>
        A "neon" color scheme is specifically designed for people with color
        vision deficiencies. It tries to preserve metaphors: notes in I, IV and
        V are designed to look noticeably distinct, and I hope that a minor
        scale has different feel than a major scale. If this doesn't work for
        you, please contact me to brainstorm improvements.
      </div>
      <h3>Philosophy of learning</h3>
      <div>
        Modern music education is skewed towards learning widely recognized
        basic structures distilled in course books. This book uses basic
        structures as a navigation but gives you freedom to see and extract
        actual structures of the musical language directly by analyzing real
        arrangements in all their complexity. No reductionism happens. I give
        you the tools to make rapid and holistic analysis, but the object to
        study is as complex as it is in real life.
      </div>
      <div>
        In annotating MIDI files for the book, I aimed at the largest diversity.
        So I try to go through all artists, alphabetically, and annotate one
        piece of each. I don't believe that we should only study a grammar of
        geniuses. I deeply care about the language of the "ordinary" musician.
      </div>
      <h3>Work in progress</h3>
      <div>
        This interactive book is a work in progress. Most chapters are stubs
        with playable examples. I need to write a narrative and test it on real
        students for clearness and usefulness. I do free Zoom lessons on this
        platform to make it better. If you're interested, reach out: <Email />
      </div>
      <div>
        If you don't understand what I meant in any particular paragraph of this
        book or if you notice something confusing in the UI, please drop me a
        line. It likely means that most readers don't get it either, so I'll try
        to make it better.
      </div>
      <h3>Tech details</h3>
      <div>
        Built on top of{" "}
        <a
          href="https://chiptune.app/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Chip Player JS
        </a>
        , credits to{" "}
        <a
          href="https://github.com/mmontag"
          target="_blank"
          rel="noopener noreferrer"
        >
          Matt Montag
        </a>
      </div>
      <div>
        Following Chip Player JS, I use a "clean" subset of the{" "}
        <a href="https://colinraffel.com/projects/lmd/">Lakh MIDI dataset</a>.
        This has two concerns. I hope that copyright issues waive as this is
        educational tool, so it's "fair use". Another issue is whether a MIDI
        file has anything in common with an actual song it's trying to
        represent. Most of the time, I don't check it and leave upon you.
        Therefore, it's safer to say that we learn a "listener's grammar" of
        arrangers who created those MIDI files after listening original tracks.
        I can't make a stronger claim that we actually study the originals.
        Still, I hope we're close enough. If there are several arrangements
        available, I sometimes try to pick one that's closer to the source in
        that it preserves vocals, ornamentations and harmony.
      </div>
      <h3>Other resources</h3>
      <div>
        I maintain{" "}
        <a href="https://github.com/vpavlenko/study-music">
          a list of resources
        </a>{" "}
        to study music theory.
      </div>
    </>
  );
};

export default About;
