import * as React from "react";
import { Link } from "react-router-dom";

// Link structure:
// /book/textures/1
//

// /Nintendo/All-Pro%20Basketball?subtune=3 - a great starting example

// How do we make it open via our link?

const PlayContext = React.createContext(null);

const P: React.FC<{
  span: [number, number];
  mask: string;
  children?: React.ReactNode;
}> = ({ span, mask, children }) => {
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
  children?: React.ReactNode;
}> = ({ r, children }) => {
  return <>{children}</>;
};

const BOOK = {
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
      segment: [1, 8],
    },
  ],
  two_chords: [
    {
      path: "Nintendo/Arch Rivals - A Basketbrawl!",
      subtune: "5",
      text: "How these two chords are built?",
    },
  ],
  chinese_traditional_music: [
    {
      path: "Nintendo/3-in-1 - Lion King 5",
      subtune: "3",
      text: "Guzheng solo",
    },
  ],
  mixolydian_shuttle: [
    { path: "Nintendo/Battle Rush - Build Up Robot Tournament", subtune: "1" },
  ],
};

export const parseBookPath = (bookPath) => {
  return BOOK[bookPath.split("/")[0]][Number(bookPath.split("/")[1]) - 1];
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
  const { text } = parseBookPath(path);
  const [previous, next] = getAdjacentExamples(path);
  return (
    <div className="App-main-content-area settings" key="BookExample">
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
            </Link>
          </div>
        </div>
      </div>
      <PlayContext.Provider value={playSegment}>
        <div>{text(playSegment)}</div>{" "}
      </PlayContext.Provider>
      <div>
        Tags:
        {tags.map((tag) => (
          <div>
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
    </div>
  );
};
