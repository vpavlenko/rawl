import React, { useMemo } from "react";
import styled from "styled-components";
import { Analysis } from "./analysis";
import { AnalysisGrid } from "./AnalysisGrid";
import { ColoredNote } from "./parseMidi";
import { MeasuresAndBeats, MidiRange } from "./SystemLayout";

interface FrozenNotesProps {
  notes: ColoredNote[][];
  measureWidth: number;
  midiNumberToY: (midiNumber: number) => number;
  scale?: number;
  maxWidth: number;
}

interface EnhancedFrozenNotesProps extends FrozenNotesProps {
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
}

const FrozenNotesContainer = styled.div`
  position: relative;
`;

const NotesLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;

const HeaderStaff = styled.div`
  position: relative;
  height: 40px;
  margin-bottom: 10px;
`;

const FrozenNotes: React.FC<FrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
  scale = 1,
  maxWidth,
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

  const noteHeight = 8 * scale;
  const height = ((midiRange[1] - midiRange[0] + 1) * 4 + noteHeight) * scale;
  const width = Math.min(
    (timeRange[1] - timeRange[0]) * measureWidth * scale,
    maxWidth,
  );
  const scaleFactor =
    width / ((timeRange[1] - timeRange[0]) * measureWidth * scale);

  const toX = (time: number) =>
    (time - timeRange[0]) * measureWidth * scale * scaleFactor;
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

const EnhancedFrozenNotes: React.FC<EnhancedFrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
  scale = 1,
  maxWidth,
  analysis,
  measuresAndBeats,
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
    return [min, max] as MidiRange;
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

  const noteHeight = 8 * scale;
  const height = ((midiRange[1] - midiRange[0] + 1) * 4 + noteHeight) * scale;
  const width = Math.min(
    (timeRange[1] - timeRange[0]) * measureWidth * scale,
    maxWidth,
  );

  const secondsToX = (seconds: number) =>
    ((seconds - timeRange[0]) * width) / (timeRange[1] - timeRange[0]);

  const dummyMeasureSelection = {
    selectedMeasure: null,
    selectMeasure: () => {},
    splitAtMeasure: () => {},
    mergeAtMeasure: () => {},
    renumberMeasure: () => {},
  };

  return (
    <FrozenNotesContainer>
      <HeaderStaff>
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={() => 0}
          noteHeight={40}
          phraseStarts={[]}
          midiRange={[0, 0]}
          measureSelection={dummyMeasureSelection}
          showHeader={true}
          showTonalGrid={false}
          secondsToX={secondsToX}
        />
      </HeaderStaff>
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          position: "relative",
        }}
      >
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={midiNumberToY}
          noteHeight={noteHeight}
          phraseStarts={[]}
          midiRange={midiRange}
          measureSelection={dummyMeasureSelection}
          showHeader={false}
          showTonalGrid={true}
          secondsToX={secondsToX}
        />
        <NotesLayer>
          <FrozenNotes
            notes={notes}
            measureWidth={measureWidth}
            midiNumberToY={midiNumberToY}
            scale={scale}
            maxWidth={maxWidth}
          />
        </NotesLayer>
      </div>
    </FrozenNotesContainer>
  );
};

export default EnhancedFrozenNotes;
