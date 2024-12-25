import React, { ReactNode, useState } from "react";
import styled from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { a, c, k, q } from "./book/chapters";

const Label = styled.span`
  font-weight: bold;
  color: #666;
`;

const FoldButton = styled.button`
  position: absolute;
  top: 0px;
  right: 0px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  width: 25px;
  height: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100001;
  background: #ccc;
  color: black;
  &:hover {
    background: #444;
  }
`;

type QAPair = {
  q: string | ReactNode;
  a?: ReactNode;
};

export const NARRATIVES: Record<string, { qa: QAPair[] }> = {
  "happy-birthday": {
    qa: [
      {
        q: "How many colors are in this score?",
        a: (
          <>
            Seven colors. This is an C major scale starting from a white note (a{" "}
            <i>tonic</i>). Play with this scale: {k("white-keys")}
          </>
        ),
      },
      {
        q: 'Click on the "melody" in the top right panel to solo the melody. Listen to it separately. What repeats four times in it?',
        a: "A motive starting with two short notes is repeated four times, starting at the ends of measures 1, 3, 5, and 7.",
      },
      // {
      //   q: (
      //     <>
      //       If you have stereo sound output now, enable the{" "}
      //       {FORCED_PANNING_LABEL} mode (the page will refresh). Now listen to
      //       the song again. What do you hear?
      //     </>
      //   ),
      //   a: "The melody is now in the right ear and the accompaniment in the left one.",
      // },
    ],
  },
  Someone_Like_You_easy_piano: {
    qa: [
      {
        q: (
          <>
            Which section of a song happens in mm. 5-16? Which loop does it
            have? Also see{" "}
            {a("https://www.youtube.com/watch?v=hLQl3WQQoQ0", "YouTube")} and{" "}
            {a("https://genius.com/Adele-someone-like-you-lyrics", "Genius")}.
          </>
        ),
        a: <>It's a verse built on a loop {c`I iii vi IV`}</>,
      },
    ],
  },
  "despacito-piano-cover-peter-bence": {
    qa: [
      {
        q: (
          <>
            People argue about the tonic here. {q("vice_despacito")} I'll teach
            you how to recolor. Select the measure number 1. Then, hover any
            note to make it a white tonic note. To apply the coloring, click on
            the desired tonic.
          </>
        ),
      },
    ],
  },
};

export const SongNarrative: React.FC<{ slug: string }> = ({ slug }) => {
  const [lastOpenedIndex, setLastOpenedIndex] = useState(0);
  const [showNarrative, setShowNarrative] = useLocalStorage(
    "showNarrative",
    true,
  );

  const narrative = NARRATIVES[slug as keyof typeof NARRATIVES];

  if (!narrative) {
    return null;
  }

  const content = (
    <div
      style={{
        position: "absolute",
        top: 20,
        right: 10,
        width: "30em",
        zIndex: 100000,
      }}
    >
      {showNarrative ? (
        <div>
          <FoldButton onClick={() => setShowNarrative(false)}>x</FoldButton>
          <div
            style={{
              backgroundColor: "black",
              padding: 10,
              border: "1px solid #666",
              zIndex: 100000,
              maxWidth: "40em",
            }}
          >
            {narrative.qa.map((qa, index) => {
              if (index > lastOpenedIndex) {
                return null;
              }

              return (
                <div key={index} style={{ marginBottom: "2.5rem" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <Label>Q:</Label>{" "}
                    <span style={{ color: "#aaa" }}>{qa.q}</span>
                  </div>

                  {index < lastOpenedIndex ? (
                    qa.a && (
                      <div style={{ paddingTop: "10px" }}>
                        <Label>A:</Label>{" "}
                        <span style={{ color: "#aaa" }}>{qa.a}</span>
                      </div>
                    )
                  ) : (
                    <button
                      style={{
                        padding: "10px",
                        marginTop: "10px",
                        backgroundColor: "#4a90e2",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => setLastOpenedIndex(index + 1)}
                    >
                      {qa.a ? "Show answer" : "Show next question"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowNarrative(true)}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "24px",
            padding: 0,
          }}
        >
          💬
        </button>
      )}
    </div>
  );

  return content;
};
