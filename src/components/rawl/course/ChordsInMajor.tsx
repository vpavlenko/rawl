import isEqual from "lodash/isEqual";
import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { NoteSnippet } from "../Axes";
import { ColorScheme, useColorScheme } from "../ColorScheme";
import { SPLIT_NOTE_HEIGHT } from "../SystemLayout";
import { Row, S } from "./Course";

const NOTES = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];
const CLOUD_HEIGHT = 300;
const CLOUD_WIDTH = 200;
const CLOUD_LEGENT_NOTE_HEIGHT = 20;

const CloudPianoKey = styled.div`
  user-select: none;
  width: 100px;
  height: ${CLOUD_LEGENT_NOTE_HEIGHT}px;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0px 0px 5px black,
    0px 0px 3px black;
  display: grid;
  align-content: end;
  border-radius: 5px;
  box-sizing: border-box;
  border-width: 5px;
`;

const ChordCloud: React.FC<{
  notes: number[];
  name: string;
  colorScheme: ColorScheme;
}> = React.memo(({ notes, name, colorScheme }) => {
  const [numRerenders, setNumRerenders] = useState(0);
  const noteDivs = [];
  for (let i = 0; i < 100; ++i) {
    const width = Math.random() * 50;

    noteDivs.push(
      <div
        className={`noteColor_${
          notes[Math.floor(Math.random() * notes.length)]
        }_${colorScheme}`}
        style={{
          position: "absolute",
          top: Math.random() * (CLOUD_HEIGHT - SPLIT_NOTE_HEIGHT),
          left: Math.random() * (CLOUD_WIDTH - width),
          width,
          height: SPLIT_NOTE_HEIGHT,
          boxSizing: "border-box",
          borderRadius: "5px",
        }}
      />,
    );
  }
  const maxNote = Math.max(...notes);

  const legendNotes = [];
  let top = 0;
  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    legendNotes.push(
      <div style={{ position: "absolute", top, left: -50 }}>
        <CloudPianoKey
          className={`noteColor_${note}_${colorScheme}`}
        ></CloudPianoKey>
        <div
          style={{
            backgroundColor: "black",
            borderRadius: "50%",
            fontSize: 14,
            width: 15,
            height: 15,
            position: "absolute",
            left: 42,
            textAlign: "center",
            top: 2,
          }}
        >
          {NOTES[note]}
        </div>
      </div>,
    );
    if (i > 0) {
      top += ((12 + notes[i] - notes[i - 1]) % 12) * CLOUD_LEGENT_NOTE_HEIGHT;
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: CLOUD_WIDTH,
          height: CLOUD_HEIGHT,
          position: "relative",
        }}
        onMouseMove={() => setNumRerenders(numRerenders + 1)}
      >
        {noteDivs}
      </div>
      <span style={{ fontSize: 36, marginBottom: 20 }}>{name}</span>
      <span style={{ fontSize: 20, position: "relative" }}>{legendNotes}</span>
    </div>
  );
}, isEqual);

const ChordClouds = ({ chords, colorScheme }) => (
  <div>
    <div style={{ position: "relative" }}>
      <Row style={{ position: "absolute", left: 800 }}>
        {chords.map((chord) => (
          <>
            <ChordCloud
              notes={chord.notes}
              name={chord.name}
              colorScheme={colorScheme}
            />{" "}
          </>
        ))}
      </Row>
    </div>
  </div>
);

const ChordsInMajor = ({ sequencer }) => {
  const { colorScheme } = useColorScheme();
  return (
    <>
      <h3>I-V</h3>
      <ChordClouds
        chords={[
          { notes: [0, 4, 7], name: "I" },
          { notes: [7, 11, 2], name: "V" },
        ]}
        colorScheme={colorScheme}
      />
      <div>
        We're gonna analyze songs in major. We'll color any of the twelve major
        keys in the same seven colors starting from the red note:
      </div>
      <div>
        <Row>
          <div>
            C major:
            <NoteSnippet
              notes="0,4,C3 D3 E3 F3 G3 A3 B3 C4"
              sequencer={sequencer}
            />
            <span style={{ color: "white" }}>click to play 👆🏻👆🏼👆🏽👆🏾👆🏿</span>
          </div>
          <div>
            Eb-major:
            <NoteSnippet
              notes="3,4,D#3 F3 G3 G#3 A#3 C4 D4 D#4"
              sequencer={sequencer}
            />
          </div>
          <div>
            A major:
            <NoteSnippet
              notes="9,4,A2 B2 C#3 D3 E3 F#3 G#3 A3"
              sequencer={sequencer}
            />
          </div>
        </Row>
      </div>
      <div>
        A fundamental structure used everywhere in Western music is chords built
        in thirds. A chord is several notes that sound together. "Built in
        thirds" simply means that as you start with a root note, you go up and
        skip one - add one - skip one - add one the from the scale. Let's see
        how all six most popular chords are built from the major scale:
        <NoteSnippet
          notes="0,4,C3 E3 G3 r4 C3-E3-G3 r4 D3 F3 A3 r4 D3-F3-A3 r4 E3 G3 B3 r4 E3-G3-B3 r4 F3 A3 C4 r4 F3-A3-C4 r4 G3 B3 D4 r4 G3-B3-D4 r4 A3 C4 E4 r4 A3-C4-E4"
          sequencer={sequencer}
        />
      </div>
      <div>
        In the simplest case, a song in major uses only two chords, I and V,
        named so because of root notes they're built on:
        <NoteSnippet notes="0,1,C3-E3-G3 G3-B3-D4" sequencer={sequencer} />
      </div>
      <div>
        In Western music a bass usually plays the root, and some other
        instrument - a piano or a guitar - plays all notes of the chord. So
        we'll call it the same chords - I and V - even if they are{" "}
        <i>inverted</i>, like this:
        <NoteSnippet
          notes="0,2,C3-E3-G3 E3-G3-C4 G3-C4-E4 C4-E4-G4 G2-B2-D3 B2-D3-G3 D3-G3-B3 G3-B3-D4"
          sequencer={sequencer}
        />
      </div>
      <div>
        These two chords can be arranged by doubling some notes in other
        octaves:
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-B3 C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4"
          sequencer={sequencer}
        />
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
      <ChordClouds
        chords={[
          { notes: [0, 4, 7], name: "I" },
          { notes: [5, 9, 0], name: "IV" },
        ]}
        colorScheme={colorScheme}
      />
      <div>
        Let's grow our vocabulary and add a IV chord to it. I-IV-V-I:
        <NoteSnippet
          notes="0,1,C3-E3-G3 F3-A3-C4 G3-B3-D4 C3-E3-G3"
          sequencer={sequencer}
        />
      </div>
      <div>
        Let's take our major scale:
        <NoteSnippet
          notes="0,4,C3 D3 E3 F3 G3 A3 B3 C4"
          sequencer={sequencer}
        />
      </div>
      <div>
        Using these three chords we can smoothly <i>harmonize</i> the whole
        scale as a melody - we can add chords beneath it so that every chord has
        a note of this melody:
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4 F1-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 F1-A2-C3-F3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5"
          sequencer={sequencer}
        />
      </div>
      <div>
        Find chords in three arrangements below. Can you "hear" these chords?
        What does a melody usually do - does it play the notes of the current
        chord, mostly?
      </div>
      <ul>
        <li>
          <S artist="MIDI/Bob Marley" song="Three Little Birds.mid" />
        </li>
        <li>
          <S artist="MIDI/Chocolate" song="Everybody Salsa.mid" /> – Skip the
          part after measure 83. It modulates to parallel minor. We'll talk
          about minors and modulation in later chapters.
        </li>
        <li>
          <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" />
        </li>
      </ul>
      <h3>vi</h3>
      <ChordClouds
        chords={[
          { notes: [0, 4, 7], name: "I" },
          { notes: [9, 0, 4], name: "vi" },
        ]}
        colorScheme={colorScheme}
      />
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
        <NoteSnippet
          notes="0,1,C3-E3-G3 A3-C4-E4 F3-A3-C4 G3-B3-D4 C3-E3-G3"
          sequencer={sequencer}
        />
      </div>
      <div>
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 A1-A2-C3-E3-A3-E4 F1-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 A1-A2-C3-E3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5"
          sequencer={sequencer}
        />
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
      <ChordClouds
        chords={[
          { notes: [2, 5, 9], name: "ii" },
          { notes: [4, 7, 11], name: "iii" },
        ]}
        colorScheme={colorScheme}
      />
      <div>
        Last two chords, which are more rare in use in major, are ii and iii.
      </div>
      <div>
        I-ii-iii-ii-I:
        <NoteSnippet
          notes="C3-E3-G3 D3-F3-A3 E3-G3-B3 D3-F3-A3 C3-E3-G3"
          sequencer={sequencer}
        />
      </div>
      <div>
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 D2-A2-D2-F3-A3-D4 E2-B2-E3-G3-B3-E4 F2-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 A1-A2-C3-E3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5"
          sequencer={sequencer}
        />
      </div>
      <div>Find all six chords in arrangements below:</div>
      <ul>
        <li>
          {" "}
          <S artist="MIDI/Westlife" song="Fool Again.mid" />
        </li>
        <li>
          <S artist="MIDI/Wet Wet Wet" song="Angel Eyes.mid" />
        </li>
      </ul>
      <h3>V and V7</h3>
      <ChordClouds
        chords={[
          { notes: [7, 11, 2], name: "V" },
          { notes: [7, 11, 2, 5], name: "V7" },
        ]}
        colorScheme={colorScheme}
      />
      <div>
        A fourth note is often added to the V chord making it a V7 chord. It's
        also added in thirds from the scale: skip one - add one:
        <NoteSnippet
          notes="0,4,G3 B3 D4 r4 G3-B3-D4 r4 G3 B3 D4 F4 r4 G3-B3-D4-F4"
          sequencer={sequencer}
        />
      </div>
    </>
  );
};

export default ChordsInMajor;
