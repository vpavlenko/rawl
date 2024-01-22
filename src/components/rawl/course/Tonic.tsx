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

const Tonic = ({ sequencer }) => {
  return (
    <>
      <div>
        In every octave there are 12 notes. Click on it:
        <NoteSnippet
          notes="0,8,C2 C#2 D2 D#2 E2 F2 r4 F#2 G2 G#2 A2 A#2 B2 r4 C3 C#3 D3 D#3 E3 F3 r4 F#3 G3 G#3 A3 A#3 B3 r4 C4 C#4 D4 D#4 E4 F4 r4 F#4 G4 G#4 A4 A#4 B4"
          sequencer={sequencer}
        />
      </div>
      <div>
        A major scale has seven notes:
        <NoteSnippet
          notes="0,8,C2 D2 E2 F2 G2 A2 B2 r8 C3 D3 E3 F3 G3 A3 B3 r8 C4 D4 E4 F4 G4 A4 B4 C5"
          sequencer={sequencer}
        />
      </div>
      <div>
        A scale is the same no matter which absolute note it starts from. So our
        coloring is always relative to the note we chose as a red one:
        <Row style={{ alignItems: "center" }}>
          <NoteSnippet
            notes="0,4,D#2 F2 G2 G#2 A#2 C3 D3 D#3"
            sequencer={sequencer}
          />
          <Arrow />
          <NoteSnippet
            notes="3,4,D#2 F2 G2 G#2 A#2 C3 D3 D#3"
            sequencer={sequencer}
          />
        </Row>
        <Row style={{ alignItems: "center" }}>
          <NoteSnippet
            notes="0,4,F2 G2 A2 A#2 C3 D3 E3 F3"
            sequencer={sequencer}
          />
          <Arrow />
          <NoteSnippet
            notes="5,4,F2 G2 A2 A#2 C3 D3 E3 F3"
            sequencer={sequencer}
          />
        </Row>
        <Row style={{ alignItems: "center" }}>
          <NoteSnippet
            notes="0,4,A#1 C2 D2 D#2 F2 G2 A2 A#2"
            sequencer={sequencer}
          />
          <Arrow />
          <NoteSnippet
            notes="10,4,A#1 C2 D2 D#2 F2 G2 A2 A#2"
            sequencer={sequencer}
          />
        </Row>
      </div>
      <div>
        Some songs use this scale. That is, they don't play other five notes.
      </div>
      <div>
        A MIDI file doesn't store any analysis information. It only has note
        numbers and duration. To start analyzing anything, we need to decide
        which note out of 12 is a red one - a main one.
      </div>
      <div>
        Try to find a main red note in exercises that use this scale. Use
        "space" to pause. Click on a note to make it a tonic.
      </div>
      <ul>
        <li>
          <S artist="MIDI/Lennon John" song="Imagine.4.mid" exercise="tonic" />
        </li>
        <li>
          <S
            artist="MIDI/Typically Tropical"
            song="Barbados.mid"
            exercise="tonic"
          />
        </li>
      </ul>
      <div>
        Not all arrangements have chords clearly visible. Some of them play just
        two outer notes of the chord - the power chord. Are there chords in the
        next two songs?
        <NoteSnippet
          notes="C3-E3-G3 D3-F3-A3 E3-G3-B3 F3-A3-C4 G3-B3-D4 A3-C4-E4 C3-G3 D3-A3 E3-B3 F3-C4 G3-D4 A3-E4"
          sequencer={sequencer}
        />
      </div>
      <ul>
        <li>
          <S
            artist="MIDI/Vengaboys"
            song="Boom Boom Boom.mid"
            exercise="tonic"
          />
        </li>
        <li>
          <S
            artist="MIDI/Violent Femmes"
            song="Blister in the Sun.mid"
            exercise="tonic"
          />
        </li>
      </ul>
      <div>
        Real songs are more complex than six chords. They can use other chords
        and also the notes outside of the scale. Still, we say that they are in
        major because of the prevalent structure. We'll describe more
        complicated structures in later sections.
      </div>
      <ul>
        <li>
          <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" exercise="tonic" />
        </li>
        <li>
          <S
            artist="MIDI/Warren Zevon"
            song="Lawyers, Guns and Money.mid"
            exercise="tonic"
          />
        </li>
        <li>
          <S
            artist="MIDI/U.S.A. for Africa"
            song="We Are the World.mid"
            exercise="tonic"
          />
        </li>
      </ul>
      <div>
        As you go through the files, try to spot any patterns in the order of
        the chords. Which chord is it the beginning? At the end? Which chord
        usually goes before I? After V? Can you hear different chords?
      </div>
      <ul>
        <li>
          <S artist="MIDI/Whigfield" song="Another Day.mid" exercise="tonic" />
        </li>
        <li>
          <S
            artist="MIDI/UB40"
            song="(I Can't Help) Falling In Love With You.mid"
            exercise="tonic"
          />
        </li>

        <li>
          <S artist="MIDI/Van Halen" song="316.mid" exercise="tonic" />
        </li>
        <li>
          <S
            artist="MIDI/Vanessa Williams"
            song="Colors of the Wind.mid"
            exercise="tonic"
          />
        </li>
        <li>
          <S artist="MIDI/Vasco" song="Albachiara.mid" exercise="tonic" />
        </li>
        <li>
          <S artist="MIDI/Vaughn" song="Blue Tango.mid" exercise="tonic" />
        </li>
      </ul>
      <h3>Modulation up at the end</h3>
      <ul>
        <li>
          <S artist="MIDI/Twila Paris" song="How Beautiful.mid" />
        </li>
        <li>
          <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
        </li>
        <li>
          <S artist="MIDI/Westlife" song="Fool Again.mid" />
        </li>
        <li>
          <S artist="MIDI/Werner" song="So ein Mann.mid" />
        </li>
        <li>
          <S artist="MIDI/Wendy Moten" song="Come in Out of the Rain.mid" />
        </li>
      </ul>
      <ul>
        <li>Show transposition of the entire track</li>
      </ul>
    </>
  );
};

export default Tonic;
