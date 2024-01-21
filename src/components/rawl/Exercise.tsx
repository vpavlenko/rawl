import * as React from "react";
import { useState } from "react";

export type ExerciseType = "tonic";

export type Status = "correct" | "wrong" | "not evaluated";

const Exercise = ({
  type,
  artist,
  song,
  analysis,
  savedAnalysis,
  sequencer,
}) => {
  const [status, setStatus] = useState<Status>("not evaluated");
  return (
    <div>
      <div>
        <h4>
          {artist.slice(5)} - {song.slice(0, -4)}
        </h4>
      </div>
      <div>
        <h5>Select a main note for the first part of the song (a tonic).</h5>
        <div>
          <button
            onClick={() => {
              if (analysis.tonic === savedAnalysis.tonic) {
                setStatus("correct");
              } else {
                setStatus("wrong");
              }
            }}
          >
            Check the answer
          </button>
        </div>
        <div>
          {status === "correct" ? (
            <span style={{ fontWeight: 700, color: "green" }}>Correct</span>
          ) : status === "wrong" ? (
            <span style={{ fontWeight: 700, color: "red" }}>Wrong</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Exercise;
