import * as React from "react";
import styled, { css, keyframes } from "styled-components";
import { useLocalStorage } from "usehooks-ts";
import { playArpeggiatedChord } from "../../../sampler/sampler";
import { PITCH_CLASS_TO_LETTER } from "../AnalysisGrid";
import { TOP_100_COMPOSERS } from "../top100Composers";
import ChordStairs from "./ChordStairs";
import { MODES } from "./chords";
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

const PianoKey = styled.div<{ isPlaying?: boolean }>`
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
  transform-origin: top;
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
    if (!inline) {
      console.log("PLAY ", note, currentTonic);
      const transposedNote = note + currentTonic;
      playArpeggiatedChord([transposedNote + 12]);
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
    <div style={{ backgroundColor: "black", padding: "10px", zIndex: 100000 }}>
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
                !inline || enabledPitches.includes(WHITE_KEYS[i])
                  ? `noteColor_${[WHITE_KEYS[i]]}_colors`
                  : `noteColor_disabled`
              }
              isPlaying={playingNotes.has(WHITE_KEYS[i])}
              style={{
                top: rowDistance,
                left: (keyWidth + padding) * i,
                width: keyWidth,
                height: keyHeight,
                borderRadius: inline ? "3px" : "5px",
                cursor:
                  !inline || enabledPitches.includes(WHITE_KEYS[i])
                    ? "pointer"
                    : "default",
              }}
              onClick={() => playNote(WHITE_KEYS[i])}
            >
              {!inline && (
                <>
                  {i === 0 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "25px",
                        left: "13px",
                        color: "black",
                        fontWeight: "bold",
                        fontSize: "16px",
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
            </PianoKey>
            {BLACK_KEYS[i] !== -1 ? (
              <PianoKey
                key={`b_${i}`}
                className={
                  !inline || enabledPitches.includes(BLACK_KEYS[i])
                    ? `noteColor_${[BLACK_KEYS[i]]}_colors`
                    : `noteColor_disabled`
                }
                isPlaying={playingNotes.has(BLACK_KEYS[i])}
                style={{
                  top: 0,
                  left: (keyWidth + padding) * (i + 0.5),
                  zIndex: 2,
                  width: keyWidth,
                  height: keyHeight,
                  borderRadius: inline ? "3px" : "5px",
                  cursor:
                    !inline || enabledPitches.includes(BLACK_KEYS[i])
                      ? "pointer"
                      : "default",
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
  currentTonic?: number;
}> = ({ slug, currentTonic }) => {
  const [showLegend, setShowLegend] = useLocalStorage("showLegend", true);

  const chords = TOP_100_COMPOSERS.find(({ slug: _slug }) => slug === _slug)
    ?.chords;

  return (
    <div
      key="piano-legend"
      style={{ position: "fixed", bottom: 59, right: 36, zIndex: 100000 }}
    >
      {showLegend ? (
        <div>
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
            <ChordStairs
              mode={MODES[1]}
              chapterChords={chords}
              currentTonic={currentTonic}
            />
            <ChordStairs
              mode={MODES[0]}
              chapterChords={chords}
              currentTonic={currentTonic}
            />
            {chords && (
              <ChordStairs
                mode={MODES[2]}
                chapterChords={chords}
                currentTonic={currentTonic}
              />
            )}
            <div style={{ margin: "auto" }}>
              <PianoLegend currentTonic={currentTonic} />
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
