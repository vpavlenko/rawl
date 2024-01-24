import * as React from "react";
import styled from "styled-components";
import { useColorScheme } from "./ColorScheme";

const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 30;
const KEY_HEIGHT = 60;
const PADDING = 3;
const ROW_DISTANCE = 40;

interface PianoKeyProps {
  width: number;
  height: number;
}

export const BasePianoKey = styled.div<PianoKeyProps>`
  user-select: none;
  width: ${(props) => props.width}px;
  height: ${(props) => props.height}px;
  font-size: 16px;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0px 0px 5px black,
    0px 0px 3px black;
  display: grid;
  align-content: end;
  border-radius: 5px;
  box-sizing: border-box;
  border-width: 5px;
`;

const PianoKey = styled(BasePianoKey)`
  width: ${KEY_WIDTH}px;
  height: ${KEY_HEIGHT}px;
  position: absolute;
`;

export const PianoLegend: React.FC = () => {
  const { colorScheme, setColorScheme } = useColorScheme();

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
              className={`noteColor_${[WHITE_KEYS[i]]}_${colorScheme}`}
              style={{
                top: ROW_DISTANCE,
                left: (KEY_WIDTH + PADDING) * i,
              }}
            >
              {i + 1}
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                className={`noteColor_${[BLACK_KEYS[i]]}_${colorScheme}`}
                style={{
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
      <div>
        <label key={"merged"} className="inline">
          <input
            onClick={() => setColorScheme("colors")}
            type="radio"
            name="color-scheme"
            defaultChecked={colorScheme === "colors"}
            value={"colors"}
          />
          rainbow
        </label>{" "}
        <label key={"split"} className="inline">
          <input
            onClick={() => setColorScheme("shapes")}
            type="radio"
            name="color-scheme"
            defaultChecked={colorScheme === "shapes"}
            value={"shapes"}
          />
          neon
        </label>
      </div>
    </div>
  );
};
