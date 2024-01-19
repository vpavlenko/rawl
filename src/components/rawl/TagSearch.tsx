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

  for (const artist of Object.keys(analyses).sort()) {
    for (const song of Object.keys(analyses[artist]).sort()) {
      for (const subtune in analyses[artist][song]) {
        if (analyses[artist][song][subtune].tags.indexOf(tag) !== -1) {
          result.push(
            <li>
              <a href={`/browse/${artist}?song=${song}`} target="_blank">
                {artist.slice(5)} - {song.slice(0, -4)}
              </a>
            </li>,
          );
        }
      }
    }
  }
  return (
    <div>
      <div>
        These songs are marked with <strong>{tag}</strong> tag:
      </div>
      <ul>{result}</ul>
    </div>
  );
};

export default TagSearch;
