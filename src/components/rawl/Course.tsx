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
            <S artist="MIDI/Valens Ritchie" song="La Bamba.mid" /> - complex
            arrangement: solo/mute voices, hidden chords
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            exercise, find main tonic
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
            exercise
          </li>
          <li>
            <S
              artist="MIDI/UB40"
              song="(I Can't Help) Falling In Love With You.mid"
            />{" "}
            - exercise, also melody is stepwise
          </li>
          <li>
            <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
          </li>
          <li>
            <S artist="MIDI/Van Halen" song="316.mid" />
          </li>
        </ul>
        <h3>Phrases</h3>
        Fix non-squared phrases
        <h3>Power chords</h3>
        <ul>
          <li>
            <S artist="MIDI/Van McCoy" song="The Hustle.mid" />
            root
          </li>
        </ul>
        <h3>Bass: root, root-fifth, diatonic approaches</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            diatonic approaches
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
            root
          </li>
        </ul>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            root metal - hard to give since it's dorian
          </li>
        </ul>
        <h3>Natural minor</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" /> - main tonic
          </li>
        </ul>
        <h3>V7, minor</h3>
        <ul>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" /> -
            no V7, complex
          </li>
          <li>
            <S artist="MIDI/Usher" song="My Way.mid" />
            Andalusian R&B
          </li>
        </ul>
        <h3>Diatonic seventh chords</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" />
          </li>
        </ul>
        <h3>Functionality - progression</h3>
        Cite Hearing Harmony
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" /> - three chords
          </li>

          <li>
            <S artist="MIDI/Usher" song="My Way.mid" />
          </li>
        </ul>
        <h3>Functionality - stasis</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" />- middle part, sort
            of
          </li>
        </ul>
        <h3>Functionality - functional</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
          </li>
          <li>
            <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
          </li>
        </ul>
        <h3>Style - eurodance</h3>
        <h3>Bass - riff</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" /> - with progression
          </li>
        </ul>
        <h3>Modulation up at the end</h3>
        <ul>
          <li>
            <S artist="MIDI/Twila Paris" song="How Beautiful.mid" /> - up at the
            end
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
          </li>
        </ul>
        <ul>
          <li>Show transposition of the entire track</li>
        </ul>
        <h3>Melody in thirds</h3>
        <ul>
          <li>
            <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" />
          </li>
        </ul>
        <h3>Parallel keys</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" />
          </li>
          <li>
            <S artist="MIDI/Van McCoy" song="The Hustle.mid" />
          </li>
        </ul>
        <h3>Bass - diatonic line</h3>
        <ul>
          <li>
            <S artist="MIDI/Twila Paris" song="How Beautiful.mid" /> - diatonic
            bass line
          </li>
          <li>
            <S
              artist="MIDI/UB40"
              song="(I Can't Help) Falling In Love With You.mid"
            />
          </li>
        </ul>
        <h3>Dorian (shuttle?)</h3>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            dorian
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> dorian
            relative shuttle after modulation
          </li>
          <li>
            <S artist="MIDI/U2" song="A Celebration.mid" />
          </li>
          <li>
            <S
              artist="MIDI/UB40"
              song="(I Can't Help) Falling In Love With You.mid"
            />
          </li>
          <li>
            <S artist="MIDI/Us3" song="Cantaloop.mid" />
          </li>
        </ul>
        <h3>Hexatonic minor</h3>
        <ul>
          <li>
            <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" /> - two chords
          </li>
        </ul>
        <h3>Functionality - shuttle</h3>
        <ul>
          <li>
            <S artist="MIDI/Type O Negative" song="Love You to Death.mid" /> -
            dorian shuttle
          </li>
        </ul>
        <h3>Modulation - contrast</h3>
        <ul>
          <li>
            <S
              artist="MIDI/UB40"
              song="(I Can't Help) Falling In Love With You.mid"
            />
          </li>
          <li>
            <S artist="MIDI/Ultravox" song="Vienna.mid" />
          </li>
        </ul>
        <h3>Applied chords - V/V</h3>
        <ul>
          <li>
            <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
          </li>
        </ul>
        <h3>Chromatic chords - V+</h3>
        <h3>Chromatic chords - iv</h3>
        <h3>Chromatic chords - viio</h3>
        <ul>
          <li>
            <S artist="MIDI/Ultravox" song="Vienna.mid" />
          </li>
        </ul>
        <h3>Relative key</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
        </ul>
        <h3>Chromatic chords - bVII</h3>
        <ul>
          <li>
            <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> - kind of
            like pivot bII = bVII
          </li>
        </ul>
        <h3>bVI-bVII-I in major - Mario cadence</h3>
        <ul>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
          </li>
        </ul>
        <h3>Blues</h3>
        <ul>
          <li>
            <S artist="MIDI/Uriah Heep" song="Lady in Black.mid" />
            scale used as ornamentation
          </li>
        </ul>
        <h3>Pentatonics</h3>
        <ul>
          <li>
            <S artist="MIDI/Ugly Kid Joe" song="Neighbor.mid" />
          </li>
        </ul>
        <h3>Pentatonic languages, bIII</h3>
        <h3>Style - reggae</h3>
        <ul>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" />
          </li>
        </ul>
        <h3>Vsus4</h3>
        <h3>V9, V13</h3>
        <ul>
          <li>
            <S
              artist="MIDI/UB40"
              song="(I Can't Help) Falling In Love With You.mid"
            />
          </li>
        </ul>
        <h3>Alterations (9th, 13th)</h3>
        <h3>Jazz</h3>
        <ul>
          <li>
            <S artist="MIDI/Tyner Mccoy" song="Old Devil Moon.mid" /> - piano
            trio, walking bass
          </li>
        </ul>
        <h3>Jazz fusion</h3>
        <ul>
          <li>
            <S artist="MIDI/UZEB" song="New Hit.mid" />
          </li>
        </ul>
      </div>
      <div></div>
    </div>
  );
};

export default Course;
