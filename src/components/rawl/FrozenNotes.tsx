import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Analysis, MeasuresSpan } from "./analysis";
import { AnalysisGrid } from "./AnalysisGrid";
import { getNoteRectangles as getSystemNoteRectangles } from "./getNoteRectangles";
import { ColoredNote, Note } from "./parseMidi";
import { getNoteColorPitchClass, pitchClassToCssClass } from "./Rawl";
import { MeasuresAndBeats, MidiRange } from "./SystemLayout";

interface EnhancedFrozenNotesProps {
  notes: Note[][];
  toX: (seconds: number) => number;
  midiNumberToY: (midiNumber: number) => number;
  maxWidth: number;
  noteHeight: number;
  timeRange: [number, number];
  analysis: Analysis;
  measuresAndBeats: MeasuresAndBeats;
  startMeasure: number;
  phraseStarts?: number[];
  isPreview?: boolean;
  hoveredColors?: string[] | null;
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
  phraseStarts,
  isPreview = false,
  hoveredColors,
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
      voiceNotes.map((note) => {
        const pitchClass = getNoteColorPitchClass(
          note,
          analysis,
          measuresAndBeats.measures,
        );
        return {
          ...note,
          color: pitchClassToCssClass(pitchClass),
          colorPitchClass: pitchClass,
          isActive: true,
        };
      }),
    );
  }, [notes, analysis, measuresAndBeats.measures]);

  const getNoteRectangles = useCallback(
    (notes: ColoredNote[]) =>
      getSystemNoteRectangles(
        notes,
        midiNumberToY,
        noteHeight,
        null, // handleNoteClick
        () => {}, // handleMouseEnter
        () => {}, // handleMouseLeave
        toX,
        false, // enableManualRemeasuring
        hoveredColors,
      ),
    [midiNumberToY, noteHeight, toX, hoveredColors],
  );

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

  const memoizedNoteRectangles = useMemo(() => {
    return adjustedNotes.map((voiceNotes) =>
      getNoteRectangles(voiceNotes as ColoredNote[]),
    );
  }, [adjustedNotes, getNoteRectangles]);

  return (
    <FrozenNotesContainer>
      <HeaderStaff>
        <AnalysisGrid
          analysis={analysis}
          measuresAndBeats={measuresAndBeats}
          midiNumberToY={() => 0}
          noteHeight={16}
          phraseStarts={phraseStarts || []}
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
          phraseStarts={phraseStarts || []}
          midiRange={midiRange}
          measureSelection={dummyMeasureSelection}
          showHeader={false}
          showTonalGrid={true}
          secondsToX={toX}
          sectionSpan={sectionSpan}
        />
        <div
          style={{
            position: "relative",
            height: `${height}px`,
            width: `${maxWidth}px`,
            overflow: "hidden",
          }}
        >
          {memoizedNoteRectangles.map((voiceRectangles, index) => (
            <div key={index}>{voiceRectangles}</div>
          ))}
        </div>
      </div>
    </FrozenNotesContainer>
  );
};

export default EnhancedFrozenNotes;
