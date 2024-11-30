import * as React from "react";
import styled from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import ChordStairs, { MODES } from "./ChordStairs";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 40;
const KEY_HEIGHT = 80;
const ROW_DISTANCE = 50;
const PADDING = 5;
const INLINE_KEY_WIDTH = 10;
const INLINE_KEY_HEIGHT = 24;
const INLINE_ROW_DISTANCE = 15;
const INLINE_PADDING = 2;

const PianoKey = styled.div`
  position: absolute;
  user-select: none;
  font-size: 20px;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0px 0px 5px black,
    0px 0px 3px black;
  display: grid;
  align-content: end;
  box-sizing: border-box;
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

const FoldButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px 15px;
`;

export const FoldablePianoLegend: React.FC<{ slug?: string }> = ({ slug }) => {
  const [showLegend, setShowLegend] = useLocalStorage("showLegend", true);

  return (
    <div
      key="piano-legend"
      style={{ position: "fixed", bottom: 90, right: 70, zIndex: 100000 }}
    >
      {slug}
      {showLegend ? (
        <div>
          <FoldButton onClick={() => setShowLegend(false)}>X</FoldButton>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 50,
              backgroundColor: "black",
              padding: 10,
              border: "1px solid #666",
              zIndex: 100000,
            }}
          >
            <ChordStairs mode={MODES[1]} />
            <ChordStairs mode={MODES[0]} />
            <ChordStairs mode={MODES[2]} />
            <div
              style={{ margin: "auto" }}
              onClick={() => setShowLegend(false)}
            >
              <PianoLegend />
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowLegend(true)}
          style={{ background: "none" }}
        >
          <InlinePianoLegend />
        </button>
      )}
    </div>
  );
};
