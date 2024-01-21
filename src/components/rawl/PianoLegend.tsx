import * as React from "react";
import styled from "styled-components";
import { TWELVE_TONE_COLORS } from "./colors";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 10;
const KEY_HEIGHT = 20;
const PADDING = 1;
const ROW_DISTANCE = 15;

const Hoverable = styled.div`
  transition: transform 0.3s ease;
  &:hover {
    transform: scale(3) translateY(-10px) translateX(30px);
  }
`;

const PianoKey = styled.div`
  position: absolute;
  user-select: none;
  width: ${KEY_WIDTH}px;
  height: ${KEY_HEIGHT}px;
  font-size: 8px;
  text-align: center;
  color: white;
  text-shadow: 0px 0px 1px black;
`;

export const PianoLegend: React.FC<{ hoverable?: boolean }> = ({
  hoverable = true,
}) => {
  const content = (
    <div>
      <div
        style={{
          position: "relative",
          width: 100,
          height: KEY_HEIGHT + ROW_DISTANCE,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <React.Fragment key={i}>
            <PianoKey
              key={`w_${i}`}
              style={{
                backgroundColor: TWELVE_TONE_COLORS[WHITE_KEYS[i]],
                top: ROW_DISTANCE,
                left: (KEY_WIDTH + PADDING) * i,
              }}
            >
              {i + 1}
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                style={{
                  backgroundColor: TWELVE_TONE_COLORS[BLACK_KEYS[i]],
                  top: 0,
                  left: (KEY_WIDTH + PADDING) * (i + 0.5),
                  zIndex: 2,
                }}
              >
                {BLACK_KEY_LABELS[i]}
              </PianoKey>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
  if (hoverable) {
    return <Hoverable>{content}</Hoverable>;
  }
  return content;
};