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
      <br />
      <a href="/corpus/musescore_top100_c_major">musescore_top100_c_major</a>
      <br />
      <a href="/corpus/musescore_top100_major">musescore_top100_major</a>
      <br />
      <a href="/corpus/musescore_top100_minor">musescore_top100_minor</a>
      <br />
      <a href="/corpus/musescore_top100_progressions">
        musescore_top100_progressions
      </a>
      <br />
      <a href="/corpus/musescore_top100_double_tonic">
        musescore_top100_double_tonic
      </a>
      <br />
      <a href="/corpus/musescore_top100_modulation">
        musescore_top100_modulation
      </a>
      <br />
      <a href="/corpus/musescore_top100_chromatic_chords">
        musescore_top100_chromatic_chords
      </a>
      <br />
      <a href="/corpus/musescore_top100_chopin">musescore_top100_chopin</a>
      <br />
      <a href="/corpus/musescore_top100_extensions">
        musescore_top100_extensions
      </a>
      <br />
      <a href="/corpus/musescore_top100_something_else">
        musescore_top100_something_else
      </a>
    </div>
  );
};

export default MusescoreHarmonyIntro;
