import React, { useMemo } from "react";
import { ColoredNote } from "./parseMidi";

interface FrozenNotesProps {
  notes: ColoredNote[][];
  measureWidth: number;
  midiNumberToY: (midiNumber: number) => number;
  scale?: number; // Add scale prop
}

const FrozenNotes: React.FC<FrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
  scale = 1, // Default scale to 1
}) => {
  const midiRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    notes.forEach((voiceNotes) => {
      voiceNotes.forEach((note) => {
        const midiNumber = note.note.midiNumber;
        min = Math.min(min, midiNumber);
        max = Math.max(max, midiNumber);
      });
    });
    return [min, max];
  }, [notes]);

  const timeRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    notes.forEach((voiceNotes) => {
      voiceNotes.forEach((note) => {
        min = Math.min(min, note.span[0]);
        max = Math.max(max, note.span[1]);
      });
    });
    return [min, max];
  }, [notes]);

  const noteHeight = 8 * scale; // Scale noteHeight
  const height = ((midiRange[1] - midiRange[0] + 1) * 4 + noteHeight) * scale;
  const width = (timeRange[1] - timeRange[0]) * measureWidth * scale;

  const toX = (time: number) => (time - timeRange[0]) * measureWidth * scale;
  const toY = (midiNumber: number) =>
    height - (midiNumber - midiRange[0] + 1) * 4 * scale - noteHeight;

  const getNoteRectangles = (notes: ColoredNote[]) => {
    return notes.map((note) => {
      const {
        span,
        color,
        voiceIndex,
        isActive,
        isDrum,
        note: { midiNumber },
      } = note;
      const top = toY(midiNumber);
      const left = toX(span[0]);
      const noteWidth = toX(span[1]) - left;

      return (
        <div
          key={`nr_${note.id}`}
          className={`${color} voiceShape-${voiceIndex}`}
          style={{
            position: "absolute",
            height: `${isActive ? noteHeight : 0.5 * scale}px`,
            width: isDrum ? "0px" : noteWidth,
            top: isActive ? top : top + noteHeight - 0.5 * scale,
            left,
            backgroundColor: color,
            zIndex: Math.round(10 + 1000 / noteWidth),
          }}
        />
      );
    });
  };

  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        width: `${width}px`,
      }}
    >
      {notes.map((voiceNotes, index) => (
        <div key={index}>{getNoteRectangles(voiceNotes)}</div>
      ))}
    </div>
  );
};

export default FrozenNotes;
