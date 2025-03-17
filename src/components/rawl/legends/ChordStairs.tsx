import * as React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import styled, { css, keyframes } from "styled-components";
import {
  ARPEGGIO_DELAY_MS,
  playArpeggiatedChord,
  playArpeggiatedChordSequence,
} from "../../../sampler/sampler";
import { PitchClass } from "../analysis";
import { Mode } from "../book/chapters";
import { Chord, formatChordName, rehydrateChords } from "./chords";
import { convertChordToGuitarChord } from "./guitarChords";

const TITLE_HEIGHT = 27;

const NOTE_HEIGHT = 3;
const NOTE_WIDTH = 30;
const HORIZONTAL_GAP = 7;

const ChordNote = styled.div<{ isPlaying?: boolean; delay?: number }>`
  user-select: none;
  border-radius: 4px;
  width: ${NOTE_WIDTH}px;
  height: ${NOTE_HEIGHT * 2}px;
  transform-origin: center;
  ${(props) =>
    props.isPlaying &&
    css`
      animation: ${scaleOut} 0.6s ease-out;
      animation-delay: ${props.delay}ms;
      animation-fill-mode: forwards;
    `}
`;

const scaleOut = keyframes`
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
`;

const ChordBoundingBox = styled.div<{
  clickable?: boolean;
}>`
  position: absolute;
  cursor: ${(props) => (props.clickable ? "pointer" : "inherit")};
  background: transparent;
  z-index: 1;
  transform-origin: center;
`;

const ChordContent = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const ChordName = styled.div`
  width: ${NOTE_WIDTH}px;
  display: flex;
  justify-content: center;
  text-align: center;
  position: absolute;
`;

// Create the context
const TonicContext = createContext<number>(0);

// Create the provider component
export const TonicProvider: React.FC<{
  currentTonic: number;
  children: React.ReactNode;
}> = ({ currentTonic, children }) => {
  return (
    <TonicContext.Provider value={currentTonic}>
      {children}
    </TonicContext.Provider>
  );
};

// Add a hook to use the context
const useTonicContext = () => {
  const context = useContext(TonicContext);
  return context;
};

const ChordStairs: React.FC<{
  mode: Mode;
  chapterChords?: string[];
  currentTonic?: number;
  scale?: number;
  playbackMode?: "separate" | "together" | "no";
  setHoveredColors?: (colors: string[] | null) => void;
  showGuitarChords?: boolean;
}> = React.memo(
  ({
    mode,
    chapterChords,
    currentTonic: propTonic,
    scale = 1,
    playbackMode = "separate",
    setHoveredColors,
    showGuitarChords = false,
  }) => {
    const contextTonic = useTonicContext();
    const currentTonic = propTonic ?? contextTonic;

    const [playingStates, setPlayingStates] = useState<{
      [key: number]: number;
    }>({});
    const timeoutRef = useRef<NodeJS.Timeout[]>([]);

    const { title, chords } = mode;
    const hideLabels = playbackMode !== "separate";
    const titleHeight = hideLabels ? 0 : TITLE_HEIGHT;

    // Check if we should show the chord stairs
    const chapterChordsSet = new Set(chapterChords || []) as Set<Chord>;
    const modeChordSet = new Set(mode.chords);
    // Only remove V for intersection check
    const modeChordSetWithoutV = new Set(modeChordSet);
    modeChordSetWithoutV.delete("V");
    modeChordSetWithoutV.delete("V7");
    const hasIntersection = [...chapterChordsSet].some((chord) =>
      modeChordSetWithoutV.has(chord),
    );

    // Use original modeChordSet (with V) for filtering
    const filteredChords = chords.filter(
      (chord) => !chapterChords || chapterChordsSet.has(chord),
    );

    const numChords = filteredChords.length;

    const rehydratedChords = rehydrateChords(filteredChords);

    // Find minimum position across all chords
    const minPosition = Math.min(
      ...rehydratedChords.flatMap((chord) => chord.positions),
    );

    // Find which chord and which note has the minimum position
    const pitchOfMinPosition = rehydratedChords.find((chord) =>
      chord.positions.includes(minPosition),
    )?.pitches[0];

    // Shift all positions up by the minimum position (making the lowest note at position 0)
    rehydratedChords.forEach((chord) => {
      chord.positions = chord.positions.map((pos) => pos - minPosition);
    });

    const maxPosition = Math.max(
      ...rehydratedChords.flatMap((chord) => chord.positions),
    );

    const height = maxPosition + 1;

    // Calculate total height including margin top and text, plus half note height for last note
    const totalHeight = (height + 1) * NOTE_HEIGHT;

    const tonicChordPosition = filteredChords.findIndex((chord) =>
      /^(i|I)$/.test(chord),
    );

    // Scale the constants
    const scaledNoteHeight = NOTE_HEIGHT * scale;
    const scaledNoteWidth = NOTE_WIDTH * scale;
    const scaledHorizontalGap = (hideLabels ? 0 : HORIZONTAL_GAP) * scale;
    const scaledFontSize = 16 * scale;

    const handleChordClick = useCallback(
      (chord: Chord, positions: number[], pitchOfMinPosition: number) => {
        if (playbackMode === "no") return;

        // Clear any existing timeouts
        timeoutRef.current.forEach((timeout) => clearTimeout(timeout));
        timeoutRef.current = [];

        if (playbackMode === "together") {
          // Reset playing states
          setPlayingStates({});

          // Prepare chord sequence
          const chordSequence = rehydratedChords.map((chordData) =>
            chordData.positions.map(
              (position) => position + pitchOfMinPosition + currentTonic,
            ),
          );

          // Play the sequence with animation callbacks
          playArpeggiatedChordSequence(
            chordSequence,
            (index) => {
              setPlayingStates((prev) => ({
                ...prev,
                [index]: Date.now(),
              }));
            },
            (index) => {
              setPlayingStates((prev) => {
                const newState = { ...prev };
                delete newState[index];
                return newState;
              });
            },
          );
        } else {
          // For single chord playback
          const clickedChordIndex = rehydratedChords.findIndex(
            (c) => c.name === chord && c.positions === positions,
          );

          // Set new timestamp for this chord
          setPlayingStates((prev) => ({
            [clickedChordIndex]: Date.now(),
          }));

          const transposedNotes = positions.map(
            (position) => position + pitchOfMinPosition + currentTonic,
          );
          playArpeggiatedChord(transposedNotes);

          const timeout = setTimeout(() => {
            setPlayingStates({});
          }, 600);

          timeoutRef.current = [timeout];
        }
      },
      [currentTonic, playbackMode, rehydratedChords],
    );

    const handleChordMouseEnter = useCallback(
      (pitches: number[]) => {
        if (setHoveredColors) {
          setHoveredColors(
            pitches.map((pitch) => `noteColor_${pitch % 12}_colors`),
          );
        }
      },
      [setHoveredColors],
    );

    const handleChordMouseLeave = useCallback(() => {
      if (setHoveredColors) {
        setHoveredColors(null);
      }
    }, [setHoveredColors]);

    const getDisplayChordName = (name: string, pitches: number[]) => {
      if (!showGuitarChords) return formatChordName(name);

      const root = pitches[0];
      const intervals = pitches.slice(1).map((p, i) => p - pitches[i]);
      const intervalString = intervals.join(" ");

      const guitarChord = convertChordToGuitarChord(
        ((root + currentTonic) % 12) as PitchClass,
        intervalString,
      );

      return guitarChord || formatChordName(name);
    };

    return !hasIntersection && chapterChords ? (
      <></>
    ) : (
      <div
        key={title}
        style={{
          width:
            numChords * scaledNoteWidth + (numChords - 1) * scaledHorizontalGap,
          height: totalHeight * scale + titleHeight,
          position: "relative",
          fontSize: scaledFontSize,
          marginTop: titleHeight,
          display: "inline-block",
        }}
      >
        {rehydratedChords.map(({ name, pitches, positions }, chordIndex) => {
          const topPosition =
            (maxPosition - positions.at(-1)) * scaledNoteHeight;
          const bottomPosition =
            (maxPosition - positions[0]) * scaledNoteHeight;
          const chordNameOffset =
            (chordIndex < tonicChordPosition ? -29 : 14) * scale;
          const height =
            bottomPosition -
            topPosition +
            scaledNoteHeight * 2 +
            Math.abs(chordNameOffset) +
            20 * scale;

          return (
            <ChordBoundingBox
              key={`bounding-box-${chordIndex}`}
              onClick={() =>
                handleChordClick(name, positions, pitchOfMinPosition)
              }
              onMouseEnter={() => handleChordMouseEnter(pitches)}
              onMouseLeave={handleChordMouseLeave}
              clickable={playbackMode !== "no"}
              style={{
                left: chordIndex * (scaledNoteWidth + scaledHorizontalGap),
                top: Math.min(topPosition + chordNameOffset, topPosition),
                width: scaledNoteWidth,
                height,
              }}
            >
              <ChordContent>
                <>
                  {pitches.map((pitch, pitchIndex) => (
                    <ChordNote
                      key={`${chordIndex}-${pitchIndex}-${
                        playingStates[chordIndex] || 0
                      }`}
                      className={`noteColor_${pitch % 12}_colors`}
                      isPlaying={chordIndex in playingStates}
                      delay={pitchIndex * ARPEGGIO_DELAY_MS}
                      style={{
                        position: "absolute",
                        width: scaledNoteWidth,
                        height: scaledNoteHeight * 2,
                        top:
                          (maxPosition - positions[pitchIndex]) *
                            scaledNoteHeight +
                          -Math.min(topPosition + chordNameOffset, topPosition),
                      }}
                    />
                  ))}
                  {!hideLabels && (
                    <ChordName
                      style={{
                        top:
                          chordIndex < tonicChordPosition
                            ? (maxPosition - positions.at(-1)) *
                                scaledNoteHeight -
                              29 +
                              -Math.min(
                                topPosition + chordNameOffset,
                                topPosition,
                              )
                            : (maxPosition - positions[0]) * scaledNoteHeight +
                              14 +
                              -Math.min(
                                topPosition + chordNameOffset,
                                topPosition,
                              ),
                        userSelect: "none",
                        pointerEvents: "none",
                        fontFamily: "Tahoma",
                      }}
                    >
                      {getDisplayChordName(name, pitches)}
                    </ChordName>
                  )}
                </>
              </ChordContent>
            </ChordBoundingBox>
          );
        })}
        {!hideLabels && title && (
          <div
            style={{
              position: "absolute",
              bottom: -titleHeight / 2,
              left: 0,
              fontSize: scaledFontSize * 0.9,
              color: "#aaa",
              userSelect: "none",
            }}
          >
            {title}
          </div>
        )}
      </div>
    );
  },
);

export default ChordStairs;
