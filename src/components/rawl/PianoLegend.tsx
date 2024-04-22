import * as React from "react";
import styled from "styled-components";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 30;
const KEY_HEIGHT = 60;
const ROW_DISTANCE = 40;
const PADDING = 3;
const INLINE_KEY_WIDTH = 10;
const INLINE_KEY_HEIGHT = 24;
const INLINE_ROW_DISTANCE = 15;
const INLINE_PADDING = 2;

const PianoKey = styled.div`
  position: absolute;
  user-select: none;
  font-size: 16px;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0px 0px 5px black,
    0px 0px 3px black;
  display: grid;
  align-content: end;
  box-sizing: border-box;
  border-width: 10px;
`;

export const PianoLegend: React.FC = () => {
  return (
    <div style={{ backgroundColor: "black", padding: "10px", zIndex: 100000 }}>
      <div
        style={{
          position: "relative",
          width: WHITE_KEYS.length * (KEY_WIDTH + PADDING),
          height: KEY_HEIGHT + ROW_DISTANCE,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <React.Fragment key={i}>
            <PianoKey
              key={`w_${i}`}
              className={`noteColor_${[WHITE_KEYS[i]]}_colors`}
              style={{
                top: ROW_DISTANCE,
                left: (KEY_WIDTH + PADDING) * i,
                width: KEY_WIDTH,
                height: KEY_HEIGHT,
                borderRadius: "5px",
              }}
            >
              {i + 1}
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                className={`noteColor_${[BLACK_KEYS[i]]}_colors`}
                style={{
                  top: 0,
                  left: (KEY_WIDTH + PADDING) * (i + 0.5),
                  zIndex: 2,
                  width: KEY_WIDTH,
                  height: KEY_HEIGHT,
                  borderRadius: "5px",
                }}
              >
                {BLACK_KEY_LABELS[i]
                  .toString()
                  .replace("b", "♭")
                  .replace("#", "♯")}
              </PianoKey>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export const InlinePianoLegend: React.FC<{ enabledPitches?: number[] }> = ({
  enabledPitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}) => {
  return (
    <div
      style={{
        backgroundColor: "black",
        zIndex: 100000,
        display: "inline-block",
        position: "relative",
        marginLeft: 10,
        marginRight: 10,
        width: WHITE_KEYS.length * (INLINE_KEY_WIDTH + INLINE_PADDING),
        height: INLINE_KEY_HEIGHT + INLINE_ROW_DISTANCE,
      }}
    >
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <React.Fragment key={i}>
          <PianoKey
            key={`w_${i}`}
            className={
              enabledPitches.includes(WHITE_KEYS[i])
                ? `noteColor_${[WHITE_KEYS[i]]}_colors`
                : `noteColor_disabled`
            }
            style={{
              top: INLINE_ROW_DISTANCE,
              left: (INLINE_KEY_WIDTH + INLINE_PADDING) * i,
              width: INLINE_KEY_WIDTH,
              height: INLINE_KEY_HEIGHT,
              borderRadius: "3px",
            }}
          />
          {BLACK_KEYS[i] !== -1 && (
            <PianoKey
              key={`b_${i}`}
              className={
                enabledPitches.includes(BLACK_KEYS[i])
                  ? `noteColor_${[BLACK_KEYS[i]]}_colors`
                  : `noteColor_disabled`
              }
              style={{
                top: 0,
                left: (INLINE_KEY_WIDTH + INLINE_PADDING) * (i + 0.5),
                zIndex: 2,
                width: INLINE_KEY_WIDTH,
                height: INLINE_KEY_HEIGHT,
                borderRadius: "3px",
              }}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
