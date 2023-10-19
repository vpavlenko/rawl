import * as React from "react";
import { Link } from "react-router-dom";

// Link structure:
// /book/textures/1
//

// /Nintendo/All-Pro%20Basketball?subtune=3 - a great starting example

// How do we make it open via our link?

const BOOK = {
  textures: [
    {
      path: "Nintendo/Adventures of Lolo 2",
      subtune: "7",
      text: "A unison texture, no chords",
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
};

export const parseBookPath = (bookPath) => {
  return BOOK[bookPath.split("/")[0]][Number(bookPath.split("/")[1]) - 1];
};

// Book component should live on the right side, replacing the AnalysisBox.
// Navigation always displays exactly the book link.
//

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
