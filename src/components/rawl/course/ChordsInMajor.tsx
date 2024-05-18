import * as React from "react";
import { NoteSnippet } from "../Axes";
import TagSearch from "../TagSearch";
import ChordClouds from "./ChordClouds";
import { Row, S } from "./Course";

const ChordsInMajor = ({ sequencer, analyses }) => (
  <>
    <h3>I-V</h3>
    <ChordClouds chords={["I", "V"]} />
    <div>
      We're gonna analyze songs in major. We'll color any of the twelve major
      keys in the same seven colors starting from the red note:
    </div>
    <div>
      <Row>
        <div>
          C major:
          <NoteSnippet notes="0,4,C3 D3 E3 F3 G3 A3 B3 C4" />
          <span style={{ color: "white" }}>click to play 👆🏻👆🏼👆🏽👆🏾👆🏿</span>
        </div>
        <div>
          Eb-major:
          <NoteSnippet notes="3,4,D#3 F3 G3 G#3 A#3 C4 D4 D#4" />
        </div>
        <div>
          A major:
          <NoteSnippet notes="9,4,A2 B2 C#3 D3 E3 F#3 G#3 A3" />
        </div>
      </Row>
    </div>
    <div>
      A fundamental structure used everywhere in Western music is chords built
      in thirds. A chord is several notes that sound together. "Built in thirds"
      simply means that as you start with a root note, you go up and skip one -
      add one - skip one - add one the from the scale. Let's see how all six
      most popular chords are built from the major scale:
      <NoteSnippet notes="0,4,C3 E3 G3 r4 C3-E3-G3 r4 D3 F3 A3 r4 D3-F3-A3 r4 E3 G3 B3 r4 E3-G3-B3 r4 F3 A3 C4 r4 F3-A3-C4 r4 G3 B3 D4 r4 G3-B3-D4 r4 A3 C4 E4 r4 A3-C4-E4" />
    </div>
    <div>
      In the simplest case, a song in major uses only two chords, I and V, named
      so because of root notes they're built on:
      <NoteSnippet notes="0,1,C3-E3-G3 G3-B3-D4" />
    </div>
    <div>
      In Western music a bass usually plays the root, and some other instrument
      - a piano or a guitar - plays all notes of the chord. So we'll call it the
      same chords - I and V - even if they are <i>inverted</i>, like this:
      <NoteSnippet notes="0,2,C3-E3-G3 E3-G3-C4 G3-C4-E4 C4-E4-G4 G2-B2-D3 B2-D3-G3 D3-G3-B3 G3-B3-D4" />
    </div>
    <div>
      These two chords can be arranged by doubling some notes in other octaves:
      <NoteSnippet notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-B3 C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4" />
    </div>
    <div>
      Find chords I and V in two songs below. Try to remember a chord as a
      visual picture bundle of three specific colors. This will help you to
      rapidly recognize the chords everywhere.
      <ul>
        <li>
          <S artist="MIDI/Chris Andrews" song="Pretty Belinda.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Carpenters" song="Jambalaya (On the Bayou).mid" />
        </li>
      </ul>
    </div>
    <div>
      Look again at those two songs. What does every instrument play,
      structurally:
      <ul>
        <li>a melody?</li>
        <li>a chord?</li>
        <li>notes somehow related to a chord?</li>
      </ul>
    </div>
    <h3>I-IV-V</h3>
    <ChordClouds chords={["I", "IV"]} />
    <div>
      Let's grow our vocabulary and add a IV chord to it. I-IV-V-I:
      <NoteSnippet notes="0,1,C3-E3-G3 F3-A3-C4 G3-B3-D4 C3-E3-G3" />
    </div>
    <div>
      Let's take our major scale:
      <NoteSnippet notes="0,4,C3 D3 E3 F3 G3 A3 B3 C4" />
    </div>
    <div>
      Using these three chords we can smoothly <i>harmonize</i> the whole scale
      as a melody - we can add chords beneath it so that every chord has a note
      of this melody:
      <NoteSnippet notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4 F1-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 F1-A2-C3-F3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5" />
    </div>
    <div>
      Find chords in three arrangements below. Can you "hear" these chords? What
      does a melody usually do - does it play the notes of the current chord,
      mostly?
    </div>
    <ul>
      <li>
        <S artist="MIDI/Bob Marley" song="Three Little Birds.mid" />
      </li>
      <li>
        <S artist="MIDI/Chocolate" song="Everybody Salsa.mid" /> – Skip the part
        after measure 83. It modulates to parallel minor. We'll talk about
        minors and modulation in later chapters.
      </li>
      <li>
        <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" />
      </li>
    </ul>
    <h3>vi</h3>
    <ChordClouds chords={["I", "vi"]} />
    <div>
      If we add one more chord - the vi chord - then we cover{" "}
      <a
        href="https://en.wikipedia.org/wiki/I%E2%80%93V%E2%80%93vi%E2%80%93IV_progression"
        target="_blank"
      >
        way
      </a>{" "}
      <a
        href="https://en.wikipedia.org/wiki/%2750s_progression"
        target="_blank"
      >
        more
      </a>{" "}
      <a
        href="https://www.hooktheory.com/theorytab/difficulties/beginner"
        target="_blank"
      >
        songs
      </a>
      .
    </div>
    <div>
      I-vi-IV-V-I:
      <NoteSnippet notes="0,1,C3-E3-G3 A3-C4-E4 F3-A3-C4 G3-B3-D4 C3-E3-G3" />
    </div>
    <div>
      <NoteSnippet notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 A1-A2-C3-E3-A3-E4 F1-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 A1-A2-C3-E3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5" />
    </div>
    <div>Analyze these songs:</div>
    <ul>
      <li>
        <S artist="MIDI/The Beatles" song="Misery.2.mid" />
      </li>
      <li>
        <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
      </li>
    </ul>
    <h3>ii and iii</h3>
    <ChordClouds chords={["ii", "iii"]} />
    <div>
      Last two chords, which are more rare in use in major, are ii and iii.
    </div>
    <div>
      I-ii-iii-ii-I:
      <NoteSnippet notes="C3-E3-G3 D3-F3-A3 E3-G3-B3 D3-F3-A3 C3-E3-G3" />
    </div>
    <div>
      <NoteSnippet notes="0,1,C2-G2-C3-E3-G3-C4 D2-A2-D2-F3-A3-D4 E2-B2-E3-G3-B3-E4 F2-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 A1-A2-C3-E3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5" />
    </div>
    <div>Find chords in arrangements below:</div>
    <ul>
      <li>
        <S artist="MIDI/The Bluebells" song="Young At Heart.mid" />
      </li>
      <li>
        <S artist="MIDI/Terry Jacks" song="Seasons in the Sun.2.mid" />
      </li>
      <li>
        <S artist="MIDI/Westlife" song="Fool Again.mid" />
      </li>
      <li>
        <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
      </li>
      <li>
        <S artist="MIDI/Taja Sevelle" song="Take Me for a Ride.mid" />
      </li>
      <li>
        <S artist="MIDI/Take That" song="Back For Good.mid" />
      </li>
      <li>
        <S artist="MIDI/The Boomtown Rats" song="I Don't Like Monday's.mid" />
      </li>
      <li>
        <S artist="MIDI/The Byrds" song="Turn! Turn! Turn!.1.mid" />
      </li>
    </ul>
    <h3>V and V7</h3>
    <ChordClouds chords={["V", "V7"]} />
    <div>
      A fourth note is often added to the V chord making it a V7 chord. It's
      also added in thirds from the scale: skip one - add one:
      <NoteSnippet notes="0,4,G3 B3 D4 r4 G3-B3-D4 r4 G3 B3 D4 F4 r4 G3-B3-D4-F4" />
    </div>
    <h3>More examples</h3>
    <div>
      Here are all tracks in my database that have parts in a mostly stable
      major key. Not all of them, however, use just the six chords above - which
      will be covered in later chapters.
    </div>
    <TagSearch tag="scale:major" analyses={analyses} />
  </>
);

export default ChordsInMajor;
