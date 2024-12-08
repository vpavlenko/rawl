import * as React from "react";
import { useCallback, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { playArpeggiatedChord } from "../../../sampler/sampler";
import { Mode } from "../book/chapters";
import { Chord, formatChordName, rehydrateChords } from "./chords";

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

const ChordStairs: React.FC<{
  mode: Mode;
  chapterChords?: string[];
  currentTonic?: number;
  hideLabels?: boolean;
  scale?: number;
  playbackMode?: "separate" | "together" | "no";
}> = React.memo(
  ({
    mode,
    chapterChords,
    currentTonic = 0,
    hideLabels,
    scale = 1,
    playbackMode = "separate",
  }) => {
    const [playingChords, setPlayingChords] = useState<string[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout[]>([]);
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
          // Reset animation state
          setPlayingChords([]);
          setAnimationKey((prev) => prev + 1);

          // Schedule all chords to play in sequence
          rehydratedChords.forEach(
            ({ name, positions: chordPositions }, index) => {
              // Schedule chord playback
              const playTimeout = setTimeout(() => {
                const transposedNotes = chordPositions.map(
                  (position) => position + pitchOfMinPosition + currentTonic,
                );
                playArpeggiatedChord(transposedNotes);

                // Add chord to playing chords for animation
                setPlayingChords((prev) => [...prev, name]);

                // Remove chord from playing after animation
                const clearTimeout = setTimeout(() => {
                  setPlayingChords((prev) => prev.filter((c) => c !== name));
                }, 600); // Match animation duration

                timeoutRef.current.push(clearTimeout);
              }, index * 1000);

              timeoutRef.current.push(playTimeout);
            },
          );
        } else {
          // Original single chord behavior
          setPlayingChords([chord]);

          const transposedNotes = positions.map(
            (position) => position + pitchOfMinPosition + currentTonic,
          );
          playArpeggiatedChord(transposedNotes);

          const timeout = setTimeout(() => {
            setPlayingChords([]);
          }, 2000);

          timeoutRef.current = [timeout];
        }
      },
      [currentTonic, mode.title, playbackMode],
    );

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
                        isPlaying={playingChords.includes(name)}
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
