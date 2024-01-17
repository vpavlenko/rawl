import * as React from "react";

const S = ({ artist, song }) => {
  return (
    <a href={`/browse/${artist}?song=${song}`} target="_blank">
      {artist.slice(5)} - {song.slice(0, -4)}
    </a>
  );
};

const Course = () => {
  return (
    <div className="course" style={{ display: "flex", padding: "50px" }}>
      <div style={{ maxWidth: "600px", width: "100%" }}>
        <h2>Study music theory by analyzing MIDI files</h2>
        <h3>Major tonic</h3>
        <ul>
          <li>
            <S artist="MIDI/Chris Andrews" song="Pretty Belinda.1.mid" /> - pure
            I V. Play scale, play chords
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            exercise, find main tonic
          </li>
        </ul>
        <h3>Phrases</h3>
        Fix non-squared phrases
        <h3>Power chords</h3>
        <h3>Bass: root, root-fifth, diatonic approaches</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            diatonic approaches
          </li>
        </ul>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            root metal - hard to give since it's dorian
          </li>
        </ul>
        <h3>Natural minor</h3>
        <ul></ul>
        <h3>V7</h3>
        <h3>Diatonic seventh chords</h3>
        <h3>Functionality - shuttle</h3>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            dorian shuttle
          </li>
        </ul>
        <h3>Functionality - four-chord progression</h3>
        <h3>Functionality - stasis</h3>
        <h3>Functionality - functional</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
        </ul>
        <h3>Modulation up at the end</h3>
        <ul>
          <li>
            <S artist="MIDI/Twila Paris" song="How Beautiful.mid" /> - up at the
            end
          </li>
        </ul>
        <ul>
          <li>Show transposition of the entire track</li>
        </ul>
        <h3>Parallel keys</h3>
        <h3>Bass - diatonic line</h3>
        <ul>
          <li>
            <S artist="MIDI/Twila Paris" song="How Beautiful.mid" /> - diatonic
            bass line
          </li>
        </ul>
        <h3>Dorian</h3>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            dorian
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> dorian
            relative shuttle after modulation
          </li>
        </ul>
        <h3>Applied chords</h3>
        <h3>Chromatic chords - bVII</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> - kind of
            like pivot bII = bVII
          </li>
        </ul>
        <h3>Chromatic chords - V+</h3>
        <h3>Chromatic chords - iv</h3>
        <h3>Relative key</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
        </ul>
        <h3>Pentatonic languages, bIII</h3>
        <h3>Style - reggae</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
        </ul>
        <h3>Jazz</h3>
        <ul>
          <li>
            <S artist="MIDI/Tyner Mccoy" song="Old Devil Moon.mid" /> - piano
            trio, walking bass
          </li>
        </ul>
      </div>
      <div></div>
    </div>
  );
};

export default Course;
