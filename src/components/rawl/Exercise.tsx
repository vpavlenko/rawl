import * as React from "react";

export type ExerciseType = "tonic";

const Exercise = ({ type, artist, song, analysis, savedAnalysis }) => {
  return (
    <div>
      <div>
        {type} - {artist} - {song}
      </div>
      <div>
        <h3>Find a main note for the first part of the song (a tonic).</h3>
        <button
          onClick={() => {
            if (analysis.tonic === savedAnalysis.tonic) {
              alert("correct");
            } else {
              alert("wrong");
            }
          }}
        >
          Check the answer
        </button>
      </div>
    </div>
  );
};

export default Exercise;
