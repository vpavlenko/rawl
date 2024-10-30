import * as React from "react";
import { corpora } from "../corpora/corpora";

const MusescoreHarmonyIntro = () => {
  return (
    <div>
      <h1>Musescore Harmony Intro</h1>
      We're gonna analyze the harmony of the top 100 songs on MuseScore.
      <br />
      <br />
      {corpora
        .filter((corpus) => corpus.slug.startsWith("musescore_top100"))
        .map((corpus) => (
          <div key={corpus.slug}>
            <a href={`/corpus/${corpus.slug}`}>
              {corpus.slug.replace(/_/g, " ")}{" "}
              <span style={{ color: "white", fontSize: 10 }}>
                {corpus.midis.length}
              </span>
            </a>
            <br />
          </div>
        ))}
    </div>
  );
};

export default MusescoreHarmonyIntro;
