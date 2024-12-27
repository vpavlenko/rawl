import { faGuitar, faUserGraduate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { playArpeggiatedChord } from "../../../sampler/sampler";
import { PITCH_CLASS_TO_LETTER } from "../AnalysisGrid";
import { TOP_100_COMPOSERS } from "../top100Composers";
import ChordStairs from "./ChordStairs";
import { CHROMATIC_CHORDS, MAJOR_MODE, MINOR_MODE, Mode } from "./chords";
const BLACK_KEYS = [1, 3, -1, 6, 8, 10, -1];
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];

const BLACK_KEY_LABELS = ["b2", "b3", -1, "#4", "b6", "b7", -1];

const KEY_WIDTH = 26;
const KEY_HEIGHT = 70;
const ROW_DISTANCE = 40;
const PADDING = 2.5;
const INLINE_KEY_WIDTH = 10;
const INLINE_KEY_HEIGHT = 24;
const INLINE_ROW_DISTANCE = 15;
const INLINE_PADDING = 2;

const keyPress = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(0.95);
  }
  100% {
    transform: scale(1);
  }
`;

const PianoKey = styled.div<{ isPlaying?: boolean; isEnabled?: boolean }>`
  position: absolute;
  user-select: none;
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0.5px 0.5px 0px black,
    -0.5px 0.5px 0px black,
    0.5px -0.5px 0px black,
    -0.5px -0.5px 0px black;
  display: grid;
  align-content: end;
  box-sizing: border-box;
  transform-origin: top;
  opacity: ${(props) => (props.isEnabled ? 1 : 0)};
  ${(props) =>
    props.isPlaying &&
    css`
      animation: ${keyPress} 0.2s ease-out;
    `}
`;

const FoldButton = styled.button`
  position: absolute;
  bottom: 0px;
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

const ScaleLabel = styled.span`
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
  color: gray;

  &:hover {
    color: white;
  }
`;

const ToggleContainer = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 3;
  padding: 2px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
`;

const ToggleIcon = styled.div<{ active: boolean }>`
  color: ${(props) => (props.active ? "white" : "#666")};
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ToggleSlider = styled.div`
  width: 32px;
  height: 16px;
  background: #444;
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #555;
  }
`;

const SliderKnob = styled.div<{ isRight: boolean }>`
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform 0.2s;
  transform: translateX(${(props) => (props.isRight ? "16px" : "0")});
`;

export const PianoLegend: React.FC<{
  currentTonic?: number;
  inline?: boolean;
  enabledPitches?: number[];
}> = ({
  currentTonic = 0,
  inline = false,
  enabledPitches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
}) => {
  const [playingNotes, setPlayingNotes] = React.useState<Set<number>>(
    new Set(),
  );

  const playNote = (note: number) => {
    if (!inline && enabledPitches.includes(note)) {
      const transposedNote = note + currentTonic;
      playArpeggiatedChord([transposedNote]);
      setPlayingNotes(new Set([...playingNotes, note]));
      setTimeout(() => {
        setPlayingNotes((prev) => {
          const next = new Set(prev);
          next.delete(note);
          return next;
        });
      }, 200);
    }
  };

  const keyWidth = inline ? INLINE_KEY_WIDTH : KEY_WIDTH;
  const keyHeight = inline ? INLINE_KEY_HEIGHT : KEY_HEIGHT;
  const rowDistance = inline ? INLINE_ROW_DISTANCE : ROW_DISTANCE;
  const padding = inline ? INLINE_PADDING : PADDING;

  return (
    <div style={{ backgroundColor: "black", padding: "0", zIndex: 100000 }}>
      <div
        style={{
          position: "relative",
          width: WHITE_KEYS.length * (keyWidth + padding),
          height: keyHeight + rowDistance,
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <React.Fragment key={i}>
            <PianoKey
              key={`w_${i}`}
              className={
                (inline || enabledPitches.includes(WHITE_KEYS[i])) &&
                `noteColor_${[WHITE_KEYS[i]]}_colors`
              }
              isEnabled={inline || enabledPitches.includes(WHITE_KEYS[i])}
              isPlaying={playingNotes.has(WHITE_KEYS[i])}
              style={{
                top: rowDistance,
                left: (keyWidth + padding) * i,
                width: keyWidth,
                height: keyHeight,
                borderRadius: inline ? "3px" : "5px",
                cursor:
                  inline || enabledPitches.includes(WHITE_KEYS[i])
                    ? "pointer"
                    : "default",
              }}
              onClick={() => playNote(WHITE_KEYS[i])}
            >
              <div style={{ position: "relative" }}>
                {!inline && (
                  <>
                    {i === 0 && (
                      <span
                        style={{
                          position: "absolute",
                          bottom: "18px",
                          left: "2px",
                          color: "black",
                          fontWeight: "bold",
                          width: "0",
                          overflow: "visible",
                          textAlign: "center",
                          fontSize: "14px",
                          textShadow: "none",
                          zIndex: 3,
                        }}
                      >
                        {PITCH_CLASS_TO_LETTER[currentTonic]}
                      </span>
                    )}
                    {i + 1}
                  </>
                )}
              </div>
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                className={
                  (inline || enabledPitches.includes(BLACK_KEYS[i])) &&
                  `noteColor_${[BLACK_KEYS[i]]}_colors`
                }
                isEnabled={inline || enabledPitches.includes(BLACK_KEYS[i])}
                isPlaying={playingNotes.has(BLACK_KEYS[i])}
                style={{
                  top: 0,
                  left: (keyWidth + padding) * (i + 0.5),
                  zIndex: 2,
                  width: keyWidth,
                  height: keyHeight,
                  borderRadius: inline ? "3px" : "5px",
                  cursor:
                    inline || enabledPitches.includes(BLACK_KEYS[i])
                      ? "pointer"
                      : "default",
                  backgroundColor: "black",
                }}
                onClick={() => playNote(BLACK_KEYS[i])}
              >
                {!inline &&
                  BLACK_KEY_LABELS[i]
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
  return <PianoLegend inline enabledPitches={enabledPitches} />;
};

export const FoldablePianoLegend: React.FC<{
  slug?: string;
  mode?: Mode | Mode[];
  currentTonic?: number;
  setHoveredColors?: (colors: string[] | null) => void;
}> = ({ slug, mode, currentTonic, setHoveredColors }) => {
  const [showLegend, setShowLegend] = useLocalStorage("showLegend", true);
  const [hoveredScale, setHoveredScale] = React.useState<
    "major" | "minor" | null
  >(null);
  const [showGuitarChords, setShowGuitarChords] = React.useState(false);

  const getEnabledPitches = () => {
    if (hoveredScale === "major") {
      return WHITE_KEYS;
    } else if (hoveredScale === "minor") {
      return [0, 2, 3, 5, 7, 8, 10];
    }
    return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  };

  const chords = TOP_100_COMPOSERS.find(({ slug: _slug }) => slug === _slug)
    ?.chords;

  const content = React.useMemo(() => {
    return (
      <div
        key="piano-legend"
        style={{ position: "fixed", bottom: 51, right: 36, zIndex: 100000 }}
      >
        {showLegend ? (
          <div>
            <ToggleContainer>
              <ToggleIcon active={!showGuitarChords}>
                <FontAwesomeIcon icon={faUserGraduate} />
              </ToggleIcon>
              <ToggleSlider
                onClick={() => {
                  setShowGuitarChords((prev) => !prev);
                }}
                title={
                  showGuitarChords
                    ? "Show Roman numerals"
                    : "Show guitar chords"
                }
              >
                <SliderKnob isRight={showGuitarChords} />
              </ToggleSlider>
              <ToggleIcon active={showGuitarChords}>
                <FontAwesomeIcon icon={faGuitar} />
              </ToggleIcon>
            </ToggleContainer>
            <FoldButton onClick={() => setShowLegend(false)}>x</FoldButton>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 35,
                backgroundColor: "black",
                padding: 10,
                border: "1px solid #666",
                zIndex: 100000,
              }}
            >
              {(Array.isArray(mode)
                ? mode
                : mode
                ? [mode]
                : [MAJOR_MODE, MINOR_MODE]
              ).map((modeItem, index) => (
                <ChordStairs
                  key={`mode-${index}`}
                  mode={modeItem}
                  chapterChords={chords}
                  currentTonic={currentTonic}
                  setHoveredColors={setHoveredColors}
                  showGuitarChords={showGuitarChords}
                />
              ))}
              {chords && (
                <ChordStairs
                  mode={CHROMATIC_CHORDS}
                  chapterChords={chords}
                  currentTonic={currentTonic}
                  setHoveredColors={setHoveredColors}
                  showGuitarChords={showGuitarChords}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    margin: "auto",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <PianoLegend
                    currentTonic={currentTonic ?? 0}
                    enabledPitches={getEnabledPitches()}
                  />
                  <PianoLegend
                    currentTonic={(currentTonic ?? 0) + 12}
                    enabledPitches={getEnabledPitches()}
                  />
                </div>
                <div
                  style={{
                    overflow: "visible",
                    color: "white",
                    display: "flex",
                    gap: "16px",
                    justifyContent: "center",
                    marginTop: "8px",
                  }}
                >
                  <ScaleLabel
                    onMouseEnter={() => setHoveredScale("major")}
                    onMouseLeave={() => setHoveredScale(null)}
                  >
                    major
                  </ScaleLabel>
                  <ScaleLabel
                    onMouseEnter={() => setHoveredScale("minor")}
                    onMouseLeave={() => setHoveredScale(null)}
                  >
                    natural minor
                  </ScaleLabel>
                </div>
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
  }, [
    showLegend,
    slug,
    mode,
    currentTonic,
    chords,
    setShowLegend,
    hoveredScale,
    showGuitarChords,
  ]);

  return content;
};
