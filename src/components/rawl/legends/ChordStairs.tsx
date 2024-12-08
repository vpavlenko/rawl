import * as React from "react";
import { useCallback, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { playArpeggiatedChord } from "../../../sampler/sampler";
import { Mode } from "../book/chapters";
import { Chord, CHORDS, formatChordName } from "./chords";

const TITLE_HEIGHT = 27;

const NOTE_HEIGHT = 4;
const NOTE_WIDTH = 40;
const HORIZONTAL_GAP = 12;

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
    transform: scale(1.2);
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

const EqualsSign = styled.div`
  position: relative;
  top: -22px;
  font-size: 24px;
  user-select: none;
`;

const stackChordUp = (pitches: readonly number[]): number[] => {
  const result = [...pitches];
  for (let j = 1; j < result.length; j++) {
    while (result[j] < result[j - 1]) {
      result[j] += 12;
    }
  }
  return result;
};

const ChordStairs: React.FC<{
  mode: Mode;
  chapterChords?: string[];
  currentTonic?: number;
  hideLabels?: boolean;
  scale?: number;
  playTogether?: boolean;
}> = React.memo(
  ({
    mode,
    chapterChords,
    currentTonic = 0,
    hideLabels,
    scale = 1,
    playTogether,
  }) => {
    const [playingChord, setPlayingChord] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [animationKey, setAnimationKey] = useState(0);

    const { title, chords } = mode;
    const titleHeight = hideLabels ? 0 : TITLE_HEIGHT;

    // Check if we should show the chord stairs
    const chapterChordsSet = new Set(chapterChords || []) as Set<Chord>;
    const modeChordSet = new Set(mode.chords);
    // Only remove V for intersection check
    const modeChordSetWithoutV = new Set(modeChordSet);
    modeChordSetWithoutV.delete("V");
    const hasIntersection = [...chapterChordsSet].some((chord) =>
      modeChordSetWithoutV.has(chord),
    );

    const handleChordClick = useCallback(
      (chord: Chord, positions: number[], pitchOfMinPosition: number) => {
        if (!mode.title && !playTogether) return;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setPlayingChord(chord);
        setAnimationKey((prev) => prev + 1);

        timeoutRef.current = setTimeout(() => {
          setPlayingChord(null);
        }, 2000);

        if (playTogether) {
          // Play all chords in sequence
          rehydratedChords.forEach(({ positions: chordPositions }, index) => {
            setTimeout(() => {
              const transposedNotes = chordPositions.map(
                (position) => position + pitchOfMinPosition + currentTonic,
              );
              playArpeggiatedChord(transposedNotes);
            }, index * 1000); // 500ms delay between chords
          });
        } else {
          // Original single chord playback
          const transposedNotes = positions.map(
            (position) => position + pitchOfMinPosition + currentTonic,
          );
          playArpeggiatedChord(transposedNotes);
        }
      },
      [currentTonic, mode.title, playTogether],
    );

    if (!hasIntersection && chapterChords) {
      return null;
    }

    // Use original modeChordSet (with V) for filtering
    const filteredChords = chords.filter(
      (chord) => !chapterChords || chapterChordsSet.has(chord),
    );

    const numChords = filteredChords.length;

    const rehydratedChords: {
      name: Chord;
      pitches: number[]; // Original pitches for coloring
      positions: number[]; // Positions for rendering
    }[] = filteredChords.map((chord) => ({
      name: chord,
      pitches: [...stackChordUp(CHORDS[chord])],
      positions: [...CHORDS[chord]],
    }));

    // Calculate positions
    for (let i = 0; i < rehydratedChords.length; ++i) {
      const { pitches, positions } = rehydratedChords[i];
      if (i > 0) {
        const prevRoot = rehydratedChords[i - 1].pitches[0];
        const currentRoot = pitches[0];

        // Calculate the two possible minimal distances
        const distanceUp =
          (prevRoot < currentRoot ? 0 : 12) + currentRoot - prevRoot;
        const distanceDown = 12 - distanceUp;

        // Choose whether to place the root up or down
        if (distanceUp <= distanceDown) {
          positions[0] = rehydratedChords[i - 1].positions[0] + distanceUp;
        } else {
          positions[0] = rehydratedChords[i - 1].positions[0] - distanceDown;
        }
      } else {
        positions[0] = 0;
      }

      // Stack the rest of the notes above the root
      for (let j = 1; j < positions.length; ++j) {
        positions[j] =
          positions[j - 1] + ((pitches[j] - pitches[j - 1] + 12) % 12);
      }
    }

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

    return (
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
              key={`bounding-box-${chordIndex}-${animationKey}`}
              onClick={() =>
                handleChordClick(name, positions, pitchOfMinPosition)
              }
              clickable={!hideLabels}
              style={{
                left: chordIndex * (scaledNoteWidth + scaledHorizontalGap),
                top: Math.min(topPosition + chordNameOffset, topPosition),
                width: scaledNoteWidth,
                height,
              }}
            >
              <ChordContent>
                {name === "=" ? (
                  <EqualsSign>=</EqualsSign>
                ) : (
                  <>
                    {pitches.map((pitch, pitchIndex) => (
                      <ChordNote
                        key={`${chordIndex}-${pitchIndex}`}
                        className={`noteColor_${pitch % 12}_colors`}
                        isPlaying={playingChord === name}
                        delay={pitchIndex * 100}
                        style={{
                          position: "absolute",
                          width: scaledNoteWidth,
                          height: scaledNoteHeight * 2,
                          top:
                            (maxPosition - positions[pitchIndex]) *
                              scaledNoteHeight +
                            -Math.min(
                              topPosition + chordNameOffset,
                              topPosition,
                            ),
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
                              : (maxPosition - positions[0]) *
                                  scaledNoteHeight +
                                14 +
                                -Math.min(
                                  topPosition + chordNameOffset,
                                  topPosition,
                                ),
                          userSelect: "none",
                          pointerEvents: "none",
                        }}
                      >
                        {formatChordName(name)}
                      </ChordName>
                    )}
                  </>
                )}
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
