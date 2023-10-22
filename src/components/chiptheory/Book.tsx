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
  debugger;
  return <>{r}</>;
};

const BOOK = {
  diversity: [
    {
      path: "Nintendo/Armadillo",
      subtune: "1",
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
      text: () => (
        <>It can employ the language of rock-n-roll and solo-like elements.</>
      ),
    },
    {
      path: "Nintendo/Barcode World",
      subtune: "6",
      text: () => (
        <>
          It may have short tracks for certain cases - eg. when a player is
          lost.
        </>
      ),
    },
    {
      path: "Nintendo/Bad Dudes  [Bad Dudes vs. Dragon Ninja]",
      subtune: "6",
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
      text: () => (
        <>Composers were searching for cool timbres and witty sound effects.</>
      ),
    },
    {
      path: "Nintendo/Alien 3",
      subtune: "1",
      text: () => <>Sometimes you just vibe.</>,
    },
    {
      path: "Nintendo/Bucky O'Hare",
      subtune: "19",
      text: () => <>Sometimes you fight a boss.</>,
    },
    {
      path: "Nintendo/Adventures of Lolo 3",
      subtune: "19",
      text: () => <>And then, maybe, at some point you celebrate victory.</>,
    },
  ],
  notation: [
    {
      path: "Nintendo/1943 - The Battle of Midway",
      subtune: "10",
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
      text: () => (
        <>
          <div>
            A unison texture, a single melodic line doubled in an octaves, with
            no bass, no chords. A rare beast in NES. The usage of an unusual
            scale give it another flavor of "not from here".
          </div>
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
      text: () => (
        <>
          <div>
            Western music language dominates in NES. It favors several
            simultaneous voices. The simplest way to add a second voice is to
            use parallel harmony. That is, to add notes from the scale at a
            chosen interval below. Thirds and sixths work perfectly for that,
            since they are consonant enough and help a listener follow two
            voices independently. Fourths and fifths are "banned" historically
            since they can blend together indistinguishably. See{" "}
            <R r="Huron, 2016" />
          </div>
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
      path: "Nintendo/Battle Fleet",
      subtune: "4 ",
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
  common_practice_harmony: [{ path: "Nintendo/Banana Prince", subtune: "1" }],
  melody: [{ path: "Nintendo/Banana Prince", subtune: "1" }],
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
  mixolydian_shuttle: [
    { path: "Nintendo/Adventure Island", subtune: "8" },
    { path: "Nintendo/Banana", subtune: "8" },
    { path: "Nintendo/Battle Rush - Build Up Robot Tournament", subtune: "1" },
  ],
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
            <P mask="11111">Mix</P>
            <P mask="01000">First bass voice</P>
            <P mask="00100">Second bass voice</P>
            <P mask="01100">Two layered bass voices</P>
            <P mask="10000">Melody</P>
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
            <P mask="11111">Mix</P>
            <P mask="00100">Bass</P>
            <P mask="11000">Upper voices</P>
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
            in which to play these two notes, which we'll call "a riff". Here
            the riff is <pre>(.) .--5 5--. .--5 5--</pre>
            The fifth can be either above or below the root to make a smoother
            voice-leading.
          </div>
          <div>&nbsp;</div>
          <div>
            <P mask="11111">Mix</P>
            <P mask="00100">Bass</P>
            <P mask="00111">Bass + percussion</P>
            <P mask="11000">Upper voices</P>
            <P mask="11011">Upper voices + percussion</P>
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
      Topics:
      <ul style={{ margin: "0 0 100px 0" }}>
        {Object.keys(BOOK).map((key) => (
          <li>
            <Link to={{ pathname: `/book/${key}/1` }}>{key}</Link>
          </li>
        ))}
      </ul>
      Games:
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
      {tags && (
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
