import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import { FORCED_PANNING_LABEL } from "./layouts/MergedVoicesLegend";

const Label = styled.span`
  font-weight: bold;
  color: #666;
`;

type QAPair = {
  q: string | ReactNode;
  a?: ReactNode;
};

const NARRATIVES: Record<string, { qa: QAPair[] }> = {
  happy_birthday_bass_and_chords: {
    qa: [
      {
        q: "How many colors are in this score?",
        a: (
          <>
            Seven colors. This is an F major scale starting from a white note (a{" "}
            <i>tonic</i>).{" "}
            <a
              href="https://vpavlenko.github.io/layouts/white-keys"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "orange" }}
            >
              Play with this scale
            </a>{" "}
            – make sure to select the "F" tonic above the keyboard.
          </>
        ),
      },
      {
        q: 'Click on the "right hand" in the top right panel to solo the melody. Listen to it separately. What repeats four times in it?',
        a: "A motive starting with two short notes is repeated four times, starting at the ends of measures 1, 3, 5, and 7.",
      },
      {
        q: (
          <>
            If you have stereo sound output now, enable the{" "}
            {FORCED_PANNING_LABEL} mode (the page will refresh). Now listen to
            the song again. What do you hear?
          </>
        ),
        a: "The melody is now in the right ear and the accompaniment in the left one.",
      },
      {
        q: (
          <>
            In measures 1..9 we have the first way to accompany the melody -
            with long notes changing every measure. An accompaniment in measures
            11..17 can be derived from this simple one - explain how by looking
            at the legend in the bottom right corner.
          </>
        ),
        a: <></>,
      },
    ],
  },
};

export const SongNarrative: React.FC<{ slug: string }> = ({ slug }) => {
  const [lastOpenedIndex, setLastOpenedIndex] = useState(0);

  const narrative = NARRATIVES[slug as keyof typeof NARRATIVES];

  if (!narrative) {
    return null;
  }

  return (
    <div className="mt-4" style={{ maxWidth: "40em" }}>
      {narrative.qa.map((qa, index) => {
        if (index > lastOpenedIndex) {
          return null;
        }

        return (
          <div key={index} className="mb-8" style={{ marginBottom: "2.5rem" }}>
            <div className="mb-2">
              <Label>Q:</Label> <span style={{ color: "#aaa" }}>{qa.q}</span>
            </div>

            {index < lastOpenedIndex ? (
              qa.a && (
                <div className="mt-2" style={{ paddingTop: "10px" }}>
                  <Label>A:</Label> {qa.a}
                </div>
              )
            ) : (
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                style={{ padding: "10px", marginTop: "10px" }}
                onClick={() => setLastOpenedIndex(index + 1)}
              >
                {qa.a ? "Show answer" : "Show next question"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
