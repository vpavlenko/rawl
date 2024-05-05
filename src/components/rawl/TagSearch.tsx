import * as React from "react";
import { Corpus } from "./analysis";

export const formatTag = (tag: string): string =>
  tag.replace(/:/g, ": ").replace(/_/g, " ");

const TagSearch: React.FC<{ tag: string; analyses: Corpus }> = ({
  tag,
  analyses,
}) => {
  const result = [];

  // for (const artist of Object.keys(analyses).sort()) {
  //   for (const song of Object.keys(analyses[artist]).sort()) {
  //     for (const subtune in analyses[artist][song]) {
  //       if (analyses[artist][song][subtune].tags.indexOf(tag) !== -1) {
  //         result.push(
  //           <li key={`${artist}_${song}`}>
  //             <SongLink artist={artist} song={song} />
  //           </li>,
  //         );
  //       }
  //     }
  //   }
  // }
  return (
    <div style={{ marginTop: "40px" }}>
      <div>
        <strong>{formatTag(tag)}</strong>
      </div>
      <ul>{result}</ul>
    </div>
  );
};

export default TagSearch;
