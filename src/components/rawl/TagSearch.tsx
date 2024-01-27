import * as React from "react";
import { Corpus } from "./analysis";

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
        <strong>{tag}</strong>:
      </div>
      <ul>{result}</ul>
    </div>
  );
};

export default TagSearch;
