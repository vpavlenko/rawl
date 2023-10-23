import * as React from "react";
import { Link } from "react-router-dom";

// Link structure:
// /book/textures/1
//

// /Nintendo/All-Pro%20Basketball?subtune=3 - a great starting example

// How do we make it open via our link?

const PlayContext = React.createContext(null);

const P: React.FC<{
  span?: [number, number];
  mask: string;
  children?: React.ReactNode;
}> = ({ span = null, mask, children }) => {
  const playSegment = React.useContext(PlayContext);
  return (
    <button
      className="box-button"
      style={{ margin: "0 10px 10px 0" }}
      onClick={() => playSegment(span, mask)}
    >
      {children}
    </button>
  );
};

const R: React.FC<{
  r: string;
}> = ({ r }) => {
  return <>{r}</>;
};

const BOOK = {
  diversity: [
    {
      path: "Nintendo/Armadillo",
      subtune: "1",
      title: "functional",
      text: () => (
        <>
          <div>
            Music for NES/Famicom is very diverse in its structure. I invite you
            to the journey on discovering it. It can be functional and complex
            in chords.{" "}
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bao Xiao Tien Guo (Explosion Sangokushi) - Bao Xiao San Guo (SFX)",
      subtune: "2",
      title: "static",
      text: () => (
        <>
          It can be static in harmony, it can have riffs and have a dorian feel.
          What's a dorian feel? Click on the tags below to see other examples
          which I tagged this way. Maybe you can feel it too.
        </>
      ),
    },
    {
      path: "Nintendo/Astyanax",
      subtune: "8",
      title: "chromatic",
      text: () => (
        <>
          It can be chromatic, with no reuse of a standard tonal theory, yet
          rhythmically very clear and even.
        </>
      ),
    },
    {
      path: "Nintendo/Bakushou! Star Monomane Shitennou",
      subtune: "20",
      title: "rock-n-roll",
      text: () => (
        <>It can employ the language of rock-n-roll and solo-like elements.</>
      ),
    },
    {
      path: "Nintendo/Barcode World",
      subtune: "6",
      title: "lost",
      text: () => (
        <>
          It may have short tracks for certain cases - eg. when a player has
          lost.
        </>
      ),
    },
    {
      path: "Nintendo/Bad Dudes  [Bad Dudes vs. Dragon Ninja]",
      subtune: "6",
      title: "classic",
      text: () => (
        <>
          It can sound very classic. How is this sound achieved? And how to
          break outside of it?
        </>
      ),
    },
    {
      path: "Nintendo/Bucky O'Hare",
      subtune: "18",
      title: "80s",
      text: () => (
        <>
          It can sound like 80s. Or maybe it sounds completely different for
          you.
        </>
      ),
    },
    {
      path: "Nintendo/Alfred Chicken",
      subtune: "1",
      title: "cool timbres",
      text: () => (
        <>Composers were searching for cool timbres and witty sound effects.</>
      ),
    },
    {
      path: "Nintendo/Alien 3",
      subtune: "1",
      title: "vibes",
      text: () => <>Sometimes you just vibe.</>,
    },
    {
      path: "Nintendo/Bucky O'Hare",
      subtune: "19",
      title: "boss",
      text: () => <>Sometimes you fight a boss.</>,
    },
    {
      path: "Nintendo/Adventures of Lolo 3",
      subtune: "19",
      title: "victory",
      text: () => <>And then, maybe, at some point you celebrate victory.</>,
    },
  ],
  notation: [
    {
      path: "Nintendo/1943 - The Battle of Midway",
      subtune: "10",
      title: "12 colors",
      text: () => (
        <>
          <div>
            I visualize the notes via a piano roll. The notes are painted in 12
            rainbow colors. Same notes in different octaves have the same color.
            A red note is a tonic. I choose it manually for every piece.
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Exodus - Journey to the Promised Land",
      subtune: "10",
      title: "major scale",
      text: () => (
        <>
          <div>
            Most pieces choose several notes out of these 12 as main ones and
            use others rarely. A major scale will always have the same seven
            colors. What is a major scale? It's seven notes with certain
            intervals chosen from a tonic. A major scale will always have its
            third note in green.
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Alien Syndrome",
      subtune: "1",
      title: "minor scale",
      text: () => (
        <>
          <div>
            A minor scale will have that third note one semitone closer to the
            tonic - and thus it will always be yellow. The fifth note is blue in
            both scales.
          </div>
          <div>
            Oh and there isn't a single thing like a "minor scale". Instead,
            there are many, depending on which color are second, sixth, seventh
            notes. Here you see a natural minor scale.
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Alfred Chicken",
      subtune: "2",
      title: "major chord",
      text: () => (
        <>
          <div>A chord is three notes chosen from the scale.</div>
        </>
      ),
    },
  ],
  textures: [
    {
      path: "Nintendo/Adventures of Lolo 2",
      subtune: "7",
      title: "unison",
      text: () => (
        <>
          <div>
            A unison texture, a single melodic line doubled in an octaves, with
            no bass, no chords. A rare beast in NES. The usage of an unusual
            scale give it another flavor of "not from here".
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[1, 8]} mask="11000">
              Upper voice
            </P>

            <P span={[1, 8]} mask="00100">
              Lower voice
            </P>

            <P span={[1, 8]} mask="11100">
              Two voices
            </P>

            <P span={[1, 8]} mask="11111">
              Two voices + percussion
            </P>
          </div>
        </>
      ),
      segment: [1, 8],
    },
    {
      path: "Nintendo/Exodus - Journey to the Promised Land",
      subtune: "1",
      title: "parallel harmony",
      text: () => (
        <>
          <div>
            Western music language dominates in NES. It favors several
            simultaneous voices. One of the simplest way to add a second voice
            is to use parallel harmony. That is, to add notes from the scale at
            a chosen interval below. Thirds and sixths work perfectly for that,
            since they are consonant enough and help a listener follow two
            voices independently. Fourths and fifths are "banned" historically
            since they can blend together indistinguishably. See{" "}
            <R r="Huron, 2016" />
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[1, 8]} mask="10000">
              Melody
            </P>
            <P span={[1, 8]} mask="01000">
              Lower voice
            </P>
            <P span={[1, 8]} mask="11111">
              Both voices
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/8 Eyes",
      subtune: "4",
      title: "Celtic drone",
      text: () => (
        <>
          <div>
            The other way to add two more voices is to make them static.
            Historically, this is used in some traditional cultures - here most
            likely it resembles Celtic music, although the drone is also used
            eg. in Indian music (played by{" "}
            <a href="https://en.wikipedia.org/wiki/Tanpura" target="_blank">
              tanpura
            </a>
            ).
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Tonic</P>
            <P mask="01000">Fifth</P>
            <P mask="01100">Tonic + fifth</P>
            <P mask="10000">Melody</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Battle Fleet",
      subtune: "4 ",
      title: "static riff",
      text: () => (
        <>
          <div>
            Here the bass always plays the same 1-measure riff in a pentatonic
            scale. Above it, the scale is expanded to dorian. Almost everywhere,
            except for m.28, m.32 and m.33 the middle voice plays exactly the
            third below the melody. This third is drawn from the scale - two
            notes below it on the scale - so acoustically it can either be a
            minor third (narrower) or a minor third (wider). You can check all
            intervals by hovering over the middle voice.
          </div>
        </>
      ),
    },
  ],
  // common_practice_harmony: [{ path: "Nintendo/Banana Prince", subtune: "1" }],
  // melody: [{ path: "Nintendo/Banana Prince", subtune: "1" }],
  // two_chords: [
  //   {
  //     path: "Nintendo/Arch Rivals - A Basketbrawl!",
  //     subtune: "5",
  //     text: "How these two chords are built?",
  //   },
  // ],
  // chinese_traditional_music: [
  //   {
  //     path: "Nintendo/3-in-1 - Lion King 5",
  //     subtune: "3",
  //     text: "Guzheng solo",
  //   },
  // ],
  // mixolydian_shuttle: [
  //   { path: "Nintendo/Adventure Island", subtune: "8" },
  //   { path: "Nintendo/Banana", subtune: "8" },
  //   { path: "Nintendo/Battle Rush - Build Up Robot Tournament", subtune: "1" },
  // ],
  bass_line: [
    {
      path: "Nintendo/All-Pro Basketball",
      subtune: "3",
      title: "chord tones",
      text: () => (
        <>
          <div>
            The structure of the bass line can either outline the current chord
            or draw/emphasize certain notes from it. In its clearest form, the
            bass line plays all notes of the chord and no other notes. Here in
            mm. 1-32 every chord is major, and every chord is outlined via its
            notes root (.), major third (3) and perfect fifth (5) in a 3+3+2
            rhythm. In the part A there melody doubles this bass line in octave,
            and in the part B there's a separate melody on top of this bass
            line. Finally, in the Mario cadence (mm. 33-35) the bass line plays
            mostly the root in octaves. (Why then we see chords VI-VII-I in
            those measures?)
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="01000">First bass voice</P>
            <P mask="00100">Second bass voice</P>
            <P mask="01100">Two layered bass voices</P>
            <P mask="10000">Melody</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Arkanoid",
      subtune: "6",
      title: "root in octaves",
      text: () => (
        <>
          <div>
            The bass line can play just the root of the chords in octaves. We
            still speak of chords in measures where no voice plays just the
            chord tones, because the upper voices emphasize chord tones by
            either using them on strong metrical positions or by using them at
            turn points of the contours.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="11000">Upper voices</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bubble Bobble",
      subtune: "2",
      title: "root without chords",
      text: () => (
        <>
          <div>
            Even if there's no middle voice, and the melody isn't clearly
            outlining the chord tones, the logic and the effect of changes in
            the bass is similar to the chord changes, especially if the melody
            doesn't contradict it too much. Here in the part B the bass mostly
            repeats the melody notes, yet the 2-5-1 cadence in m.23-24 makes it
            functional and makes the whole period work.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="01000">Melody</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Barcode World",
      subtune: "2",
      title: "root and fifth",
      text: () => (
        <>
          <div>
            Usually in Western harmony all three chord tones are emphasized in
            some voice. So, if a melody takes care of the third, the bass can
            play just root and fifth. It can employ a certain rhythmical figure
            in which to play these two notes (a riff). Here the riff is{" "}
            <pre>(.) .--5 5--. .--5 5--</pre>
            The fifth can be either above or below the root to make a smoother
            voice-leading.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="00111">Bass + percussion</P>
            <P mask="11000">Upper voices</P>
            <P mask="11011">Upper voices + percussion</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bugs Bunny Birthday Blowout, The",
      subtune: "1",
      title: "Alberti bass",
      text: () => (
        <>
          <div>
            <a
              href="https://en.wikipedia.org/wiki/Alberti_bass"
              target="_blank"
            >
              Alberti bass
            </a>{" "}
            is a certain riff that can be traced back to at least 18th century.
            The order of notes is: lowest, highest, middle, highest. Here in m.3
            the fifth is omitted in favor of the seventh.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="00111">Bass + percussion</P>
            <P mask="10000">Melody</P>
            <P mask="01000">Echo</P>
            <P mask="11000">Melody + echo</P>
            <P mask="11011">Melody + echo + percussion</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bubble Bobble",
      subtune: "29",
      title: "Alberti bass and chromatic melody",
      text: () => (
        <>
          <div>
            Even though Alberti bass is classic, the melody shouldn't
            necessarily stay within the standard scale. Here a chromatic melody
            resembles "Flight of the Bumblebee".
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[3, 10]} mask="00100">
              Alberti bass
            </P>
            <P span={[3, 10]} mask="01000">
              Chromatic melody
            </P>
            <P span={[3, 10]} mask="11111">
              Mix
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/1943 - The Battle of Midway",
      subtune: "3",
      title: "smooth",
      text: () => (
        <>
          <div>
            To make a static and smooth bass line that moves by step, a composer
            can choose the next chord tone that's closest to the previous note.
            This wording implies that a chain of chords was designed first, and
            the bass line was inferred from it.
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[1, 27]} mask="00100">
              Bass
            </P>
            <P span={[1, 27]} mask="00111">
              Bass + percussion
            </P>
            <P span={[1, 27]} mask="10000">
              Melody
            </P>
            <P span={[1, 27]} mask="01000">
              Middle voice
            </P>
            <P span={[1, 27]} mask="11000">
              Upper voices
            </P>
            <P span={[1, 27]} mask="11111">
              Mix
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Adventures of Lolo 2",
      subtune: "10",
      title: "descending diatonic",
      text: () => (
        <>
          <div>
            It's possible to build long step-wise descending bass lines by
            choosing proper chord tones for each chord. This example starts with
            five descending notes. The middle voice here plays arpeggiated
            chords.
          </div>
          <div>&nbsp;</div>
          <div>
            However, just the arpeggio isn't enough. Sometimes the bass here
            plays the note of the next chord faster than the arpeggio: m.7,
            m.15, resulting in a richer harmony. In m.8 the bass is
            indispensable to make it a deceptive cadence: the arpeggio on top
            simply plays I. Hover the red note in m.8 to see that.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="00111">Bass + percussion</P>
            <P mask="01000">Arpeggio</P>
            <P mask="01100">Bass + chords</P>
            <P mask="10000">Melody</P>
            <P mask="11000">Melody + chords</P>
            <P mask="10100">Melody + bass</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Burai Fighter",
      subtune: "8",
      title: "ascending diatonic",
      text: () => (
        <>
          <div>
            The bass line can also go up, although it happens less frequently.
            Rhythmically a bass line in the part A uses a riff on two notes.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="01000">Bass</P>
            <P mask="01011">Bass + percussion</P>
            <P mask="00100">Melody</P>
            <P mask="10000">Middle voice</P>
            <P mask="10100">Upper voices</P>
            <P mask="11000">Lower voices</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/'89 Dennou Kyuusei Uranai",
      subtune: "16",
      title: "descending chromatic",
      text: () => (
        <>
          <div>
            The bass line can go down chromatically, which in the absence of
            clearly arpeggiated chords makes Roman numeral analysis less clear
            and less helpful. Sometimes the voice-leading is more important than
            the storyline of implied chords.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="00100">Bass</P>
            <P mask="10000">Melody</P>
            <P mask="10100">Bass + melody</P>
            <P mask="11000">Melody + parallel thirds below</P>
            <P mask="01000">Middle voice</P>
            <P mask="11111">Mix</P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Banana",
      subtune: "1",
      title: "transposed riff",
      text: () => (
        <>
          <div>
            A bass riff can include non-chord tones as well. Here, as the riff
            is transposed from a different root, the relative distances from the
            root are calculated according to a scale (here mixolydian), not
            chromatically. This isn't universal, and even in this example green
            and yellow notes are both used on VII chords.
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[2, 9]} mask="00100">
              Bass
            </P>
            <P span={[2, 9]} mask="11000">
              Upper voices
            </P>
            <P span={[2, 9]} mask="11111">
              Mix
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Faxanadu",
      subtune: "11",
      title: "static riff and pedal point",
      text: () => (
        <>
          <div>
            Previous strategies were used when chords are changing often.
            Another way of structuring a piece is to use static harmony and
            employ a static bass riff. A bass in part A here repeats a minor
            major seventh chord, and a bass in part B plays a static note (a
            pedal point).
          </div>
          <div>&nbsp;</div>
          <div>
            A:{" "}
            <P span={[5, 21]} mask="10000">
              Bass
            </P>
            <P span={[5, 21]} mask="01000">
              Its echo
            </P>
            <P span={[5, 21]} mask="11000">
              Bass + echo
            </P>
            <P span={[5, 21]} mask="00100">
              Melody
            </P>
            <P span={[5, 21]} mask="11111">
              Mix
            </P>
          </div>
          <div>&nbsp;</div>
          <div>
            B:{" "}
            <P span={[21, 37]} mask="00100">
              Bass pedal point
            </P>
            <P span={[21, 37]} mask="01000">
              Arpeggio
            </P>
            <P span={[21, 37]} mask="10000">
              Melody
            </P>
            <P span={[21, 37]} mask="11111">
              Mix
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bubble Bath Babes",
      subtune: "1",
      title: "static functional riff",
      text: () => (
        <>
          <div>
            A static riff doesn't necessarily lead to rare harmonies. Here a
            riff on four notes 1-6-2-5 reminds of a standard major pop/jazz
            progression I-vi-ii-V, yet no chords are present, and the notes go
            too fast in a 3+3+2{" "}
            <a
              href="https://en.wikipedia.org/wiki/Tresillo_(rhythm)"
              target="_blank"
            >
              tresillo
            </a>{" "}
            rhythm.
          </div>
          <div>&nbsp;</div>
          <div>
            <P span={[5, 71]} mask="00100">
              Bass
            </P>
            <P span={[4, 21]} mask="10000">
              Melody
            </P>
            <P span={[4, 21]} mask="01000">
              Middle voice counterpoint
            </P>
            <P span={[4, 21]} mask="11000">
              Upper voices
            </P>
            <P span={[4, 21]} mask="11111">
              Mix
            </P>
          </div>
        </>
      ),
    },
    {
      path: "Nintendo/Bubble Bath Babes",
      subtune: "3",
      title: "exercise 1",
      text: () => (
        <>
          <div>
            How is the bass structured here in A+B vs. in A'? Feel free to solo
            or mute voices via controls in the lower right corner.
          </div>
        </>
      ),
    },
  ],
  // modulation:
  // Nintendo/Bandit Kings of Ancient China - 7
};

export const parseBookPath = (bookPath) => {
  return {
    ...BOOK[bookPath.split("/")[0]][Number(bookPath.split("/")[1]) - 1],
    index: Number(bookPath.split("/")[1]),
  };
};

const getAdjacentExamples = (bookPath) => {
  let [topic, exampleIndex] = bookPath.split("/");
  exampleIndex = Number(exampleIndex) - 1;
  let previous = null;
  let next = null;
  if (exampleIndex > 0) {
    previous = `/book/${topic}/${exampleIndex}`;
  }
  if (exampleIndex + 1 < BOOK[topic].length) {
    next = `/book/${topic}/${exampleIndex + 2}`;
  }
  return [previous, next];
};

export const BookTOC: React.FC = () => {
  return (
    <div>
      <span style={{ color: "white" }}>
        The Structure of Music through NES Soundtracks
      </span>
      <div>&nbsp;</div>
      <ol style={{ margin: "0 0 100px 0" }}>
        {Object.keys(BOOK).map((key) => (
          <li>
            <Link to={{ pathname: `/book/${key}/1` }}>
              {key.replace(/_/g, " ")}
            </Link>
            <ol>
              {BOOK[key].map(({ title }, index) => (
                <li>
                  <Link to={{ pathname: `/book/${key}/${index + 1}` }}>
                    {title ?? index}
                  </Link>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
      <span style={{ color: "white" }}>Games</span>
      <div>&nbsp;</div>
    </div>
  );
};

export const BookExample: React.FC<{
  path: string;
  playSegment: (span: [number, number], mask: string) => void;
  tags: string[];
}> = ({ path, playSegment, tags }) => {
  const { title, text, index } = parseBookPath(path);
  const [previous, next] = getAdjacentExamples(path);
  return (
    <div
      className="App-main-content-area settings book-chapter"
      key="BookExample"
    >
      <div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginBottom: "10px" }}>
            <Link to={{ pathname: previous }}>
              <button className="box-button" disabled={!previous}>
                &lt;
              </button>
            </Link>{" "}
            <Link to={{ pathname: next }}>
              <button className="box-button" disabled={!next}>
                &gt;
              </button>
            </Link>{" "}
            <span style={{ color: "white" }}>
              {index}. {title}
            </span>
          </div>
        </div>
      </div>

      <PlayContext.Provider value={playSegment}>
        <div>{text && text(playSegment)}</div>{" "}
      </PlayContext.Provider>
      {tags && (!title || !title.startsWith("exercise")) && (
        <div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>&nbsp;</div>
          <div>Tags:</div>
          {tags.map((tag) => (
            <div key={tag}>
              <a
                href={`https://vpavlenko.github.io/chiptheory/search/${tag.replace(
                  ":",
                  "/",
                )}`}
                target="_blank"
              >
                {tag}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
