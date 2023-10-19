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

  return <button onClick={() => playSegment(span, mask)}>{children}</button>;
};

const BOOK = {
  textures: [
    {
      path: "Nintendo/Adventures of Lolo 2",
      subtune: "7",
      text: () => (
        <>
          <div>A unison texture, no chords</div>
          <div>
            <P span={[1, 8]} mask="11000">
              Upper voice
            </P>
          </div>
          <div>
            <P span={[1, 8]} mask="00100">
              Lower voice
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

export const BookChapter: React.FC<{
  path: string;
  playSegment: (span: [number, number], mask: string) => void;
}> = ({ path, playSegment }) => {
  const { text } = parseBookPath(path);
  return (
    <div className="App-main-content-area settings" key="BookChapter">
      <div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginBottom: "10px" }}>
            <button className="box-button">&lt;</button>{" "}
            <button className="box-button">&gt;</button>
          </div>
        </div>
      </div>
      <div>I'm a chapter {path}</div>
      <PlayContext.Provider value={playSegment}>
        <div>{text(playSegment)}</div>{" "}
      </PlayContext.Provider>
    </div>
  );
};
