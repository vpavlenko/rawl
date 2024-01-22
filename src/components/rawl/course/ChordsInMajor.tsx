import * as React from "react";
import { NoteSnippet } from "../Axes";
import { Row, S } from "./Course";

const Arrow = () => (
  <div
    style={{
      width: "30px",
      textAlign: "center",
      fontSize: "48px",
      fontWeight: 700,
      color: "white",
    }}
  >
    →
  </div>
);

const ChordsInMajor = ({ sequencer }) => {
  return (
    <>
      <h2>Chords in a major key</h2>
      <h3>I-V</h3>
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
            <span style={{ color: "white" }}>↑ ↑ ↑ click to play ↑ ↑ ↑ </span>
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
        In the simplest case, a song in major uses only two chords, I and V:
        <NoteSnippet notes="0,1,C3-E3-G3 G3-B3-D4" sequencer={sequencer} />
      </div>
      <div>
        These chords can be arranged by doubling some notes in other octaves:
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-B3 C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4"
          sequencer={sequencer}
        />
      </div>
      <div>
        Find these chords in two songs below. What does every instrument play,
        structurally:
        <ul>
          <li>a melody?</li>
          <li>a chord?</li>
          <li>a lowest note of a chord?</li>
          <li>any ornamentations to them?</li>
        </ul>
      </div>
      <ol>
        <li>
          <S artist="MIDI/Chris Andrews" song="Pretty Belinda.1.mid" />
        </li>
        <li>
          <S artist="MIDI/Wet Willie" song="Keep on Smiling.mid" />
        </li>
      </ol>
      <h3>I-IV-V</h3>
      <div>
        Let's grow our vocabulary and add a IV chord to it. I-IV-V-I:
        <NoteSnippet
          notes="0,1,C3-E3-G3 F3-A3-C4 G3-B3-D4 C3-E3-G3"
          sequencer={sequencer}
        />
      </div>
      <div>
        Using these three chords we can smoothly harmonize the whole scale:
        <NoteSnippet
          notes="0,1,C2-G2-C3-E3-G3-C4 G1-G2-B2-D3-G3-D4 C2-G2-C3-E3-G3-E4 F1-A2-C3-F3-A3-F4 C2-G2-C3-E3-G3-G4 F1-A2-C3-F3-A3-A4 G1-G2-B2-D3-G3-B4 C2-G2-C3-E3-G3-C5"
          sequencer={sequencer}
        />
      </div>
      <div>Find chords in two arrangements below:</div>
      <ul>
        <li>
          <S artist="MIDI/Chocolate" song="Everybody Salsa.mid" /> – This one
          modulates to parallel minor in measure 83. We'll talk about both minor
          and this type of modulation later on.
        </li>

        <li>
          <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" />
        </li>
      </ul>
      <h3>vi</h3>
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
      <h3>V7 in major</h3>
      <ul>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
        </li>
      </ul>
    </>
  );
};

export default ChordsInMajor;
