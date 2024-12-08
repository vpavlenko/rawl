import * as React from "react";
import { useCallback, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { playArpeggiatedChord } from "../../sampler/sampler";

const TITLE_HEIGHT = 27;

export const CHORDS = {
  i: [0, 3, 7],
  ii: [2, 5, 9],
  ii7: [2, 5, 9, 0],
  iii: [4, 7, 11],
  iii7: [4, 7, 11, 2],
  iv: [5, 8, 0],
  I: [0, 4, 7],
  "V7/IV": [0, 4, 7, 10],
  "V7/iv": [0, 4, 7, 10],
  I7: [0, 4, 7, 10],
  vi: [9, 0, 4],
  vi7: [9, 0, 4, 7],
  IV: [5, 9, 0],
  IV7: [5, 9, 0, 3],
  V: [7, 11, 2],
  V7: [7, 11, 2, 5],
  V13: [7, 11, 2, 5, 9, 0, 4],
  V7b9: [7, 11, 2, 5, 8],
  "V/V": [2, 6, 9],
  "V7/V": [2, 6, 9, 0],
  "V/V/V": [9, 1, 4],
  "V/ii": [9, 1, 4],
  "V7/ii": [9, 1, 4, 7],
  "V/iii": [11, 3, 6],
  "V7/iii": [11, 3, 6, 9],
  III: [4, 8, 11],
  "V/vi": [4, 8, 11],
  "V7/vi": [4, 8, 11, 2],
  Vsus4: [7, 0, 2],
  Imaj7: [0, 4, 7, 11],
  IVmaj7: [5, 9, 0, 4],
  I5: [0, 7],
  IV5: [5, 0],
  V5: [7, 2],
  v: [7, 10, 2],
  bVI: [8, 0, 3],
  bVII: [10, 2, 5],
  bIII: [3, 7, 10],
  bII: [1, 5, 8],
  "V+": [7, 11, 3],
  viio7: [11, 2, 5, 8],
  io7: [0, 3, 6, 9],
  It: [8, 0, 6],
  Fr: [8, 0, 2, 6],
  Ger: [8, 0, 3, 6],
  Cad64: [7, 0, 4],
  cad64: [7, 0, 3],
  "viio7/V": [6, 9, 0, 3],
  ii65: [5, 9, 0, 2],
  iiø65: [5, 8, 0, 2],
  io: [0, 3, 6],
  "I+": [0, 4, 8],
  imaj7: [0, 3, 7, 11],
  i7: [0, 3, 7, 10],
  iø7: [0, 3, 6, 10],
  iio: [2, 5, 8],
  iio7: [2, 5, 8, 11],
  iiø7: [2, 5, 8, 12],
  viio: [11, 2, 5],
  IPAC: [0, 4, 12],
  I6: [4, 7, 12],
  "1": [0],
  b3: [3],
  "4": [5],
  "#4": [6],
  "5": [7],
  b7: [10],
  "7": [11],
  "=": [0],
} as const;
export type Chord = keyof typeof CHORDS;

const NOTE_HEIGHT = 4;
const NOTE_WIDTH = 40;
const HORIZONTAL_GAP = 12;

const ChordNote = styled.div`
  user-select: none;
  border-radius: 4px;
  width: ${NOTE_WIDTH}px;
  height: ${NOTE_HEIGHT * 2}px;
`;

const scaleOut = keyframes`
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const ChordBoundingBox = styled.div<{
  isPlaying?: boolean;
  clickable?: boolean;
}>`
  position: absolute;
  cursor: ${(props) => (props.clickable ? "pointer" : "inherit")};
  background: transparent;
  z-index: 1;
  transform-origin: center;
  ${(props) =>
    props.clickable &&
    props.isPlaying &&
    css`
      animation: ${scaleOut} 0.4s ease-out;
      animation-fill-mode: forwards;
    `}
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

export type Mode = { title: string; chords: Chord[] };

export const MODES: Mode[] = [
  {
    title: "minor",
    chords: ["iiø7", "iv", "bVI", "i", "bIII", "v", "V", "V7", "bVII"],
  },
  { title: "major", chords: ["ii", "IV", "vi", "I", "iii", "V", "V7"] },
  {
    title: "chromatic",
    chords: [
      "V7/IV",
      "bII",
      "V7/V",
      "V7/vi",
      "viio7/V",
      "Fr",
      "Ger",
      "V7/ii",
      "V7/iii",
    ],
  },
];

export const BLUES_SCALE: Mode = {
  title: "blues scale",
  chords: ["1", "b3", "4", "#4", "5", "b7"],
};

export const JAZZ_MODE: Mode = {
  title: "jazz",
  chords: ["ii7", "V7", "Imaj7", "iiø7", "V7b9", "i7"],
};

export const ONE_FLAT_SIX_FIVE: Mode = {
  title: "",
  chords: ["i", "bVI", "V"],
};

export const SIX_MAJOR_TRIADS: Mode = {
  title: "6 common triads in a major mode",
  chords: ["ii", "IV", "vi", "I", "iii", "V"],
};

export const NATURAL_MINOR: Mode = {
  title: "natural minor",
  chords: ["iv", "bVI", "i", "bIII", "v", "bVII"],
};

export const DORIAN_MINOR: Mode = {
  title: "dorian minor",
  chords: ["iv", "IV", "bVI", "i", "bIII", "v", "bVII"],
};

export const EXTENSIONS: Mode = {
  title: "seventh chords and extensions in major",
  chords: ["ii7", "IVmaj7", "vi7", "Imaj7", "iii7", "V13"],
};

export const V_of_V: Mode = {
  title: "",
  chords: ["V7/V", "V7", "I"],
};

export const APPLIED_CHORDS: Mode = {
  title: "applied chords",
  chords: ["V7/ii", "ii", "V7/iv", "iv", "V7/vi", "vi"],
};

export const CIRCLE_OF_FIFTHS: Mode = {
  title: "circle of fifths",
  chords: ["i", "iv", "bVII", "bIII", "bVI", "iio7", "bII", "V7"],
};

export const MARIO_CADENCE: Mode = {
  title: "Mario cadence",
  chords: ["bVI", "bVII", "I"],
};

export const MINOR_WITH_V: Mode = {
  title: "minor with V",
  chords: ["iv", "bVI", "i", "bIII", "v", "Vsus4", "V", "V7", "bVII"],
};

const formatChordName = (name: string) => {
  // note to AI: never change this function
  const parts = name.split("ø");
  if (parts.length === 1) {
    return name
      .replace("b", "♭")
      .replace("7", "⁷")
      .replace("1", "¹")
      .replace("3", "³");
  }
  return (
    <>
      {parts[0].replace("b", "♭")}
      <sup>ø</sup>
      {parts[1].replace("7", "⁷").replace("1", "¹").replace("3", "³")}
    </>
  );
};

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
}> = React.memo(
  ({ mode, chapterChords, currentTonic = 0, hideLabels, scale = 1 }) => {
    const [playingChord, setPlayingChord] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [animationKey, setAnimationKey] = useState(0);

    const handleChordClick = useCallback(
      (chord: Chord, positions: number[], pitchOfMinPosition: number) => {
        if (!mode.title) return;

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        setPlayingChord(chord);
        setAnimationKey((prev) => prev + 1);

        timeoutRef.current = setTimeout(() => {
          setPlayingChord(null);
        }, 2000);

        const transposedNotes = positions.map(
          (position) => position + pitchOfMinPosition + currentTonic,
        );
        playArpeggiatedChord(transposedNotes);
      },
      [currentTonic, mode.title],
    );

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
              isPlaying={playingChord === name}
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
