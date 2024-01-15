import * as React from "react";
import { Analysis } from "./analysis";

type Corpus = {
  [artist: string]: {
    [song: string]: {
      [zeroLiteral: string]: Analysis;
    };
  };
};

const TagSearch: React.FC<{ tag: string; analyses: Corpus }> = ({
  tag,
  analyses,
}) => {
  const result = [];

  for (const artist in analyses) {
    for (const song in analyses[artist]) {
      for (const subtune in analyses[artist][song]) {
        if (analyses[artist][song][subtune].tags.indexOf(tag) !== -1) {
          result.push(
            <li>
              <a href={`/browse/${artist}?song=${song}`} target="_blank">
                {artist} - {song}
              </a>
            </li>,
          );
        }
      }
    }
  }
  return (
    <div>
      <div>Search: {tag}</div>
      <ul>{result}</ul>
    </div>
  );
};

export default TagSearch;
