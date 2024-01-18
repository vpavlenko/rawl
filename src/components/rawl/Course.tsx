import * as React from "react";

const S = ({ artist, song, exercise = null }) => {
  return (
    <>
      <a href={`/browse/${artist}?song=${song}`} target="_blank">
        {artist.slice(5)} - {song.slice(0, -4)}
      </a>
      {exercise && (
        <>
          {" --- "}
          <a
            href={`/browse/${artist}?song=${song}&exercise=${exercise}`}
            target="_blank"
          >
            Exercise "{exercise}"
          </a>
        </>
      )}
    </>
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
            <S
              artist="MIDI/Vengaboys"
              song="Boom Boom Boom.mid"
              exercise="tonic"
            />
          </li>
          <li>
            <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
          </li>
          <li>
            <S artist="MIDI/The Beatles" song="Misery.2.mid" />
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            exercise, find main tonic
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" /> -
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
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
          </li>
          <li>
            <S artist="MIDI/Vasco" song="Albachiara.mid" />
          </li>
          <li>
            <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
          </li>
        </ul>
        <h3>Phrases</h3>
        Fix non-squared phrases
        <ul>
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" /> -
            hard, since no drums
          </li>
        </ul>
        <h3>Power chords</h3>
        <ul>
          <li>
            <S artist="MIDI/Van McCoy" song="The Hustle.mid" />
            root
          </li>
          <li>
            <S artist="MIDI/Vengaboys" song="Boom Boom Boom.mid" />
          </li>
        </ul>
        <h3>Bass: root, root-fifth, diatonic approaches</h3>
        <ul>
          <li>
            <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" /> -
            in minor, so early
          </li>
          <li>
            <S artist="MIDI/Typically Tropical" song="Barbados.mid" /> -
            diatonic approaches
          </li>
          <li>
            <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
            root
          </li>
          <li>
            <S artist="MIDI/Vasco" song="Albachiara.mid" />
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
          <li>
            <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
          </li>
          <li>
            <S artist="MIDI/Vanilla Ice" song="Ice Ice Baby.1.mid" />
          </li>
          <li>
            <S artist="MIDI/Vertical Horizon" song="Everything You Want.mid" />{" "}
            - drone
          </li>
          <li>
            <S artist="MIDI/Visage" song="Fade to Grey.mid" />
          </li>
          <li>
            <S artist="MIDI/Warren G" song="Regulate.mid" />
          </li>
        </ul>
        <h3>Minor before V7</h3>
        <ul>
          <li>
            <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
          </li>
        </ul>
        <h3>V7 in major</h3>
        <ul>
          <li>
            <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
          </li>
        </ul>
        <h3>minor with V7</h3>
        <ul>
          <li>
            <S artist="MIDI/Ventures" song="Walk Don't Run.mid" /> - has entire
            scale
          </li>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" /> -
            no V7, complex
          </li>
          <li>
            <S artist="MIDI/Usher" song="My Way.mid" />
            Andalusian R&B
          </li>
        </ul>
        <h3>ii7 chord</h3>
        <ul></ul>
        <h3>Diatonic seventh chords</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" />
          </li>
          <li>
            <S artist="MIDI/Vera" song="At This Moment.mid" />
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
          <li>
            <S artist="MIDI/Vasco" song="Albachiara.mid" />
          </li>
          <li>
            <S artist="MIDI/Ventures" song="Walk Don't Run.mid" />
          </li>
        </ul>
        <h3>Deceptive cadence</h3>
        <ul>
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
          </li>
        </ul>
        <h3>Functionality - stasis, non-transposed riff, pedal</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" />- middle part, sort
            of
          </li>
          <li>
            <S
              artist="MIDI/Venditti Antonello"
              song="Benvenuti in paradiso.mid"
            />
          </li>
        </ul>
        <h3>Bass - riff</h3>
        <ul>
          <li>
            <S artist="MIDI/U96" song="Club Bizarre.mid" /> - with progression
          </li>
          <li>
            <S
              artist="MIDI/Vince Guaraldi"
              song="Les Peanuts   Charly Brown   Snoopy.mid"
            />
          </li>
          <li>
            <S artist="MIDI/Violent Femmes" song="Blister in the Sun.mid" />
          </li>
          <li>
            <S artist="MIDI/War" song="Low Rider.mid" />
          </li>
        </ul>
        <h3>Texture - arpeggio</h3>
        <ul>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
        </ul>
        <h3>Texture - guitar strumming</h3>
        <ul></ul>
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
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
          <li>
            <S
              artist="MIDI/Vince Guaraldi"
              song="Les Peanuts   Charly Brown   Snoopy.mid"
            />
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
          <li>
            <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
          </li>
        </ul>
        <h3>Picardy third</h3>
        <ul>
          <li>
            <S artist="MIDI/Vangelis" song="1492: Conquest of Paradise.mid" />
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
          <li>
            <S artist="MIDI/Vasco" song="Albachiara.mid" />
          </li>
        </ul>
        <h3>Chromatic voice-leading</h3>
        <ul>
          <li>
            <S artist="MIDI/Vanessa Paradis" song="Be My Baby.mid" />
          </li>
          <li>
            <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
          </li>
          <li>
            <S artist="MIDI/Vera" song="At This Moment.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
          <li>
            <S
              artist="MIDI/Village People"
              song="Five O'clock in the Morning.mid"
            />
          </li>
          <li>
            <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
          </li>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
          <li>
            <S artist="MIDI/Wang Chung" song="Dance Hall Days.mid" />
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
        <h3>iadd6</h3>
        <ul>
          <li>
            <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
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
        <h3>Mixolydian shuttle</h3>
        <ul>
          <li>
            <S
              artist="MIDI/Village People"
              song="Five O'clock in the Morning.mid"
            />
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
          <li>
            <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
        </ul>
        <h3>Applied chords - V/V</h3>
        <ul>
          <li>
            <S artist="MIDI/Umberto Tozzi" song="Gloria.mid" />
          </li>
          <li>
            <S artist="MIDI/Vasco" song="Albachiara.mid" />
          </li>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
        </ul>
        <h3>Applied chords - V/ii</h3>
        <ul>
          <li>
            <S artist="MIDI/Vanessa Paradis" song="Be My Baby.mid" />
          </li>
          <li>
            <S artist="MIDI/Vera" song="At This Moment.mid" />
          </li>
        </ul>
        <h3>Applied chords - V/iii</h3>
        <ul>
          <li>
            <S artist="MIDI/VOF de Kunst" song="Een kopje koffie.mid" />
          </li>
        </ul>
        <h3>Applied chords - V/vi</h3>
        <ul>
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
          </li>
        </ul>
        <h3>Applied chords - V7/IV</h3>
        <ul>
          <li>
            <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
          </li>
        </ul>
        <h3>Applied chords - V/iv</h3>
        <ul>
          <li>
            <S artist="MIDI/Vanilla Fudge" song="You Keep Me Hangin' On.mid" />
          </li>
        </ul>
        <h3>bII</h3>
        <ul>
          <li>
            <S artist="MIDI/Vaughn" song="Blue Tango.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
        </ul>
        <h3>Chromatic chords - V+</h3>
        <h3>Chromatic chords - iv</h3>
        <h3>Chromatic chords - viio</h3>
        <h3>Chromatic chords - io7</h3>
        <ul>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
        </ul>
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
          <li>
            <S artist="MIDI/Vertical Horizon" song="Everything You Want.mid" />
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
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
          </li>
          <li>
            <S artist="MIDI/Wang Chung" song="Dance Hall Days.mid" /> -
            bVII-IV-I
          </li>
        </ul>
        <h3>bVI-bVII-I in major - Mario cadence</h3>
        <ul>
          <li>
            <S artist="MIDI/U.S.A. for Africa" song="We Are the World.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
        </ul>
        <h3>Blues</h3>
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
            <S artist="MIDI/Vincent Gene" song="Be Bob A-Lula.mid" /> -
            rockabilly
          </li>
          <li>
            <S artist="MIDI/VOF de Kunst" song="Een kopje koffie.mid" />
          </li>
        </ul>
        <h3>Pentatonics</h3>
        <ul>
          <li>
            <S artist="MIDI/Ugly Kid Joe" song="Neighbor.mid" />
          </li>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
        </ul>
        <h3>Pentatonic languages, bIII</h3>
        <ul>
          <li>
            <S artist="MIDI/Veruca Salt" song="Seether.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vince Guaraldi"
              song="Les Peanuts   Charly Brown   Snoopy.mid"
            />
          </li>
        </ul>
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
          <li>
            <S artist="MIDI/Vanessa Williams" song="Colors of the Wind.mid" />
          </li>
          <li>
            <S artist="MIDI/Vera" song="At This Moment.mid" />
          </li>
        </ul>
        <h3>Iadd6</h3>
        <ul>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
        </ul>
        <h3>Alterations (9th, 13th)</h3>
        <ul>
          <li>
            <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
          </li>
          <li>
            <S
              artist="MIDI/Vicki Sue Robinson"
              song="Never Gonna Let You Go.mid"
            />
          </li>
          <li>
            <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
          </li>
        </ul>
        <h3>Chord scale</h3>
        <ul>
          <li>
            <S artist="MIDI/Van Morrison" song="Brown Eyed Girl.mid" />
          </li>
        </ul>
        <h3>Swing</h3>
        <ul>
          <li>
            <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
          </li>
          <li>
            <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
          </li>
        </ul>
        <h3>Jazz</h3>
        <ul>
          <li>
            <S artist="MIDI/Tyner Mccoy" song="Old Devil Moon.mid" /> - piano
            trio, walking bass
          </li>
          <li>
            <S artist="MIDI/Vaughan Sarah" song="Fever.mid" />
          </li>
        </ul>
        <h3>Stride</h3>
        <ul>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
        </ul>
        <h3>Jazz solo</h3>
        <ul>
          <li>
            <S artist="MIDI/Vega" song="Tom's Diner (reprise).2.mid" />
          </li>
          <li>
            <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
          </li>
        </ul>
        <h3>Jazz fusion</h3>
        <ul>
          <li>
            <S artist="MIDI/UZEB" song="New Hit.mid" />
          </li>
        </ul>
        <h3>Form - AABA</h3>
        <ul>
          <li>
            <S artist="MIDI/Walter Donaldson" song="My Blue Heaven.mid" />
          </li>
          <li>
            <S artist="MIDI/Waller Fats" song="Lonesome Road.mid" />
          </li>
        </ul>
        <h3>Latin</h3>
        <ul>
          <li>
            <S artist="MIDI/War" song="Low Rider.mid" />
          </li>
        </ul>
      </div>
      <div></div>
    </div>
  );
};

export default Course;
