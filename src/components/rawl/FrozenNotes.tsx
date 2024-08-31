import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Analysis, MeasuresSpan } from "./analysis";
import { AnalysisGrid } from "./AnalysisGrid";
import { ColoredNote, Note } from "./parseMidi";
import { getNoteColor } from "./Rawl";
import {
  getNoteRectangles as getSystemNoteRectangles,
  MeasuresAndBeats,
  MidiRange,
} from "./SystemLayout";

interface FrozenNotesProps {
  notes: Note[][];
  toX: (seconds: number) => number;
  midiNumberToY: (midiNumber: number) => number;
  maxWidth: number;
  noteHeight: number;
  timeRange: [number, number];
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
  toX,
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

  const height = (midiRange[1] - midiRange[0] + 2) * noteHeight;

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
        toX,
        false, // enableManualRemeasuring
      ),
    [midiNumberToY, noteHeight, toX],
  );

  return (
    <div
      style={{
        position: "relative",
        height: `${height}px`,
        width: `${maxWidth}px`,
        overflow: "hidden",
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
  midiNumberToY,
  maxWidth,
  analysis,
  measuresAndBeats,
  noteHeight,
  startMeasure,
  toX,
  timeRange,
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

  const height = (midiRange[1] - midiRange[0] + 2) * noteHeight;

  const adjustedNotes = useMemo(() => {
    return notes.map((voiceNotes) =>
      voiceNotes.map((note) => ({
        ...note,
        color: getNoteColor(note, analysis, measuresAndBeats.measures),
        isActive: true,
      })),
    );
  }, [notes, analysis, measuresAndBeats.measures, startMeasure]);

  const dummyMeasureSelection = useMemo(
    () => ({
      selectedMeasure: null,
      selectMeasure: () => {},
      splitAtMeasure: () => {},
      mergeAtMeasure: () => {},
      renumberMeasure: () => {},
    }),
    [],
  );

  const sectionSpan: MeasuresSpan = useMemo(() => {
    const paddingLength = startMeasure - 1;
    const endMeasure = measuresAndBeats.measures.length - 1;
    return [paddingLength, endMeasure];
  }, [startMeasure, measuresAndBeats.measures.length]);

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
          secondsToX={toX}
          sectionSpan={sectionSpan}
        />
      </HeaderStaff>
      <div
        style={{
          width: `${maxWidth}px`,
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
          secondsToX={toX}
          sectionSpan={sectionSpan}
        />
        <FrozenNotes
          notes={adjustedNotes as ColoredNote[][]}
          toX={toX}
          midiNumberToY={midiNumberToY}
          maxWidth={maxWidth}
          noteHeight={noteHeight}
          timeRange={timeRange}
        />
      </div>
    </FrozenNotesContainer>
  );
};

export default EnhancedFrozenNotes;
