import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Analysis } from "./analysis";
import { AnalysisGrid } from "./AnalysisGrid";
import { ColoredNote, Note } from "./parseMidi";
import { getNoteColor, SecondsConverter } from "./Rawl";
import {
  getNoteRectangles as getSystemNoteRectangles,
  MeasuresAndBeats,
  MidiRange,
} from "./SystemLayout";

interface FrozenNotesProps {
  notes: Note[][]; // Change this to Note[][]
  measureWidth: number;
  midiNumberToY: (midiNumber: number) => number;
  maxWidth: number;
  noteHeight: number;
}

interface EnhancedFrozenNotesProps extends FrozenNotesProps {
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  startMeasure: number;
}

const FrozenNotesContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const HeaderStaff = styled.div`
  position: relative;
  height: 16px;
  margin-bottom: 0px;
`;

const FrozenNotes: React.FC<FrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
  maxWidth,
  noteHeight,
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

  const height = (midiRange[1] - midiRange[0] + 1) * noteHeight;
  const width = Math.min(
    (timeRange[1] - timeRange[0]) * measureWidth,
    maxWidth,
  );

  const secondsToX: SecondsConverter = useCallback(
    (seconds) => (seconds - timeRange[0]) * measureWidth,
    [timeRange, measureWidth],
  );

  const getNoteRectangles = useCallback(
    (notes: ColoredNote[]) =>
      getSystemNoteRectangles(
        notes,
        midiNumberToY,
        noteHeight,
        () => {}, // handleNoteClick
        () => {}, // handleMouseEnter
        () => {}, // handleMouseLeave
        false, // showVelocity
        secondsToX,
        false, // enableManualRemeasuring
      ),
    [midiNumberToY, noteHeight, secondsToX],
  );

  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        width: `${width}px`,
      }}
    >
      {notes.map((voiceNotes, index) => (
        <div key={index}>{getNoteRectangles(voiceNotes as ColoredNote[])}</div>
      ))}
    </div>
  );
};

const EnhancedFrozenNotes: React.FC<EnhancedFrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
  maxWidth,
  analysis,
  measuresAndBeats,
  noteHeight,
  startMeasure,
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
    const firstMeasure = measuresAndBeats.measures[0];
    const lastMeasure =
      measuresAndBeats.measures[measuresAndBeats.measures.length - 1];
    return [firstMeasure, lastMeasure];
  }, [measuresAndBeats]);

  const height = (midiRange[1] - midiRange[0] + 2) * noteHeight;
  const width = (timeRange[1] - timeRange[0]) * measureWidth;

  const secondsToX = useCallback(
    (seconds: number) => (seconds - timeRange[0]) * measureWidth,
    [timeRange, measureWidth],
  );

  const adjustedNotes = useMemo(() => {
    return notes.map((voiceNotes) =>
      voiceNotes.map((note) => ({
        ...note,
        color: getNoteColor(note, analysis, measuresAndBeats.measures),
        isActive: true, // Add this if it's needed for rendering
      })),
    );
  }, [notes, analysis, measuresAndBeats.measures, startMeasure]);

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
          noteHeight={16}
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
          overflow: "hidden",
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
        <FrozenNotes
          notes={adjustedNotes as ColoredNote[][]} // Cast to ColoredNote[][] here
          measureWidth={measureWidth}
          midiNumberToY={midiNumberToY}
          maxWidth={width}
          noteHeight={noteHeight}
        />
      </div>
    </FrozenNotesContainer>
  );
};

export default React.memo(EnhancedFrozenNotes);
