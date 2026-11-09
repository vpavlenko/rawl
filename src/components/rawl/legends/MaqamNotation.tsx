import React from "react";
import styled from "styled-components";
import { maqamFigure, MaqamScale } from "./maqamScales";

const Staff = styled.div`
  position: relative;
  width: 100%;
  img {
    display: block;
    width: 100%;
    height: auto;
    filter: invert(1);
  }
`;
const NoteTarget = styled.button<{ $active: boolean }>`
  position: absolute;
  top: 0;
  height: 100%;
  padding: 0;
  border: 0;
  border-radius: 3px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#e9b44c55" : "transparent")};
  &:hover,
  &:focus-visible {
    background: #e9b44c33;
    outline: 1px solid #e9b44c;
  }
`;

export const MaqamNotation: React.FC<{
  maqam: MaqamScale;
  activeIndex: number | null;
  onNote: (pitch: number, index: number) => void;
}> = ({ maqam, activeIndex, onNote }) => {
  const pitches = [...maqam.lower, ...maqam.jins];
  return (
    <Staff>
      <img
        src={maqamFigure(maqam, "jins")}
        alt={`${maqam.name.toLowerCase()} jins`}
      />
      {pitches.map((pitch, index) => {
        const left =
          index === 0 ? 0 : (maqam.noteX[index - 1] + maqam.noteX[index]) / 2;
        const right =
          index === pitches.length - 1
            ? 100
            : (maqam.noteX[index] + maqam.noteX[index + 1]) / 2;
        return (
          <NoteTarget
            key={index}
            type="button"
            data-testid="maqam-note"
            data-pitch={pitch}
            data-active={index === activeIndex || undefined}
            aria-label={`${maqam.name.toLowerCase()} ${pitch}`}
            $active={index === activeIndex}
            style={{ left: `${left}%`, width: `${right - left}%` }}
            onClick={() => onNote(pitch, index)}
          />
        );
      })}
    </Staff>
  );
};
