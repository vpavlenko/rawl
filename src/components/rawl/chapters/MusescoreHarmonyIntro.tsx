import * as React from "react";
import { corpora } from "../corpora/corpora";

const MusescoreHarmonyIntro = () => {
  const missingSlugs =
    corpora
      .find((corpus) => corpus.slug === "musescore_top100")
      ?.midis.filter(
        (midi) =>
          !corpora.some(
            (c) => c.slug.startsWith("chapters") && c.midis.includes(midi),
          ),
      ) || [];

  return (
    <div>
      <h1>Musescore Harmony Intro</h1>
      We're gonna analyze the harmony of the top 100 songs on MuseScore.
      <br />
      <br />
      {corpora
        .filter((corpus) => corpus.slug.startsWith("chapters"))
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
      <br />
      <br />
      <br />
      <h2>Missing Slugs in Chapters*</h2>
      {missingSlugs.length > 0 ? (
        missingSlugs.map((slug) => (
          <div key={slug}>
            <a href={`/f/${slug}`} target="_blank" rel="noopener noreferrer">
              {slug.replace(/_/g, " ")}
            </a>
          </div>
        ))
      ) : (
        <p>No missing slugs found.</p>
      )}
    </div>
  );
};

export default MusescoreHarmonyIntro;
