import * as React from "react";

const MusescoreHarmonyIntro = () => {
  return (
    <div>
      <h1>Musescore Harmony Intro</h1>
      We're gonna analyze the harmony of the top 100 songs on MuseScore.
      <br />
      <br />
      <a href="/corpus/musescore_top100">Top 100 Songs on MuseScore</a>
      We're gonna divide that corpus into several groups to make it easier to
      analyze them one by one.
      <a href="/corpus/musescore_top100_c_major">C Major Songs</a>
      <br />
      <a href="/corpus/musescore_top100_major">Major Key Songs</a>
      <br />
      <a href="/corpus/musescore_top100_minor">Minor Key Songs</a>
      <br />
      <a href="/corpus/musescore_top100_progressions">
        Songs with 4-chord Progressions
      </a>
      <br />
      <a href="/corpus/musescore_top100_modulation">Songs with Modulation</a>
      <br />
      <a href="/corpus/musescore_top100_extensions">
        Songs with Extended Harmonies
      </a>
    </div>
  );
};

export default MusescoreHarmonyIntro;
