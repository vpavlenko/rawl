import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Snippet, rehydrateSnippet } from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";

const PX_IN_MEASURE = 100;

const SnippetItemContainer = styled.div<{ width: number; isPreview?: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => props.width}px;
  border-top: ${(props) => (props.isPreview ? "none" : "1px solid #444")};
  border-bottom: ${(props) => (props.isPreview ? "none" : "1px solid #444")};
  border-left: ${(props) => (props.isPreview ? "none" : "1px solid #444")};
  border-radius: ${(props) => (props.isPreview ? "0" : "5px")};
  overflow: hidden;
`;

const SnippetHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #222;
`;

const TimingInfo = styled.div`
  color: #888;
  font-size: 0.8em;
  margin-top: 4px;
  text-align: center;
`;

const SnippetContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
`;

const DeleteButton = styled.button`
  background-color: #ff4136;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  cursor: pointer;
  &:hover {
    background-color: #ff7066;
  }
`;

interface SnippetItemProps {
  snippet: Snippet;
  index: number;
  deleteSnippet?: (index: number) => void;
  noteHeight: number;
  isPreview?: boolean;
}

const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  index,
  deleteSnippet,
  noteHeight,
  isPreview = false,
}) => {
  const { rehydratedNotes, rehydratedAnalysis, rehydratedMeasuresAndBeats } =
    useMemo(() => rehydrateSnippet(snippet), [snippet]);

  const paddedMeasuresAndBeats = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0];
    const endMeasure = snippet.measuresSpan[1];

    // Ensure we don't create an array with negative length
    const paddingLength = Math.max(0, startMeasure - 1);

    // Slice the measures array to include only the selected range
    const slicedMeasures = rehydratedMeasuresAndBeats.measures.slice(
      0,
      endMeasure + 1,
    );

    const paddedMeasures = [
      ...Array(paddingLength).fill(rehydratedMeasuresAndBeats.measures[0] || 0),
      ...slicedMeasures,
    ];

    return {
      ...rehydratedMeasuresAndBeats,
      measures: paddedMeasures,
    };
  }, [snippet, rehydratedMeasuresAndBeats]);

  const snippetMidiRange = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    rehydratedNotes.forEach((voiceNotes) => {
      voiceNotes.forEach((note) => {
        const midiNumber = note.note.midiNumber;
        min = Math.min(min, midiNumber);
        max = Math.max(max, midiNumber);
      });
    });
    return [min, max] as [number, number];
  }, [rehydratedNotes]);

  const snippetMidiNumberToY = useCallback(
    (midiNumber: number) => (snippetMidiRange[1] - midiNumber + 1) * noteHeight,
    [snippetMidiRange, noteHeight],
  );

  const timeRange = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0];
    const endMeasure = snippet.measuresSpan[1];
    const startTime = paddedMeasuresAndBeats.measures[startMeasure - 1] || 0;
    const endTime = paddedMeasuresAndBeats.measures[endMeasure] || startTime;
    return [startTime, endTime] as [number, number];
  }, [snippet, paddedMeasuresAndBeats]);

  const containerWidth = useMemo(() => {
    return (rehydratedMeasuresAndBeats.measures.length - 1) * PX_IN_MEASURE;
  }, [timeRange]);

  const toX = useCallback(
    (seconds: number) => {
      const normalizedTime =
        (seconds - timeRange[0]) / (timeRange[1] - timeRange[0]);
      return isNaN(normalizedTime) ? 0 : normalizedTime * containerWidth; // Use containerWidth instead of 400
    },
    [timeRange, containerWidth],
  );

  return (
    <SnippetItemContainer width={containerWidth} isPreview={isPreview}>
      {!isPreview && (
        <SnippetHeader>
          {deleteSnippet && (
            <DeleteButton onClick={() => deleteSnippet(index)}>
              Delete
            </DeleteButton>
          )}
          <span>
            {snippet.tag.replace(":", ": ")}{" "}
            <span style={{ color: "gray" }}>
              {snippet.measuresSpan.join("..")}
            </span>
          </span>
          {snippet.secondsSpan && (
            <TimingInfo>
              {snippet.secondsSpan[0].toFixed(2)}s -{" "}
              {snippet.secondsSpan[1].toFixed(2)}s
            </TimingInfo>
          )}
        </SnippetHeader>
      )}
      <SnippetContent>
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          midiNumberToY={snippetMidiNumberToY}
          maxWidth={containerWidth}
          analysis={rehydratedAnalysis}
          measuresAndBeats={paddedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={snippet.measuresSpan[0]}
          toX={toX}
          timeRange={timeRange}
          isPreview={isPreview}
        />
      </SnippetContent>
    </SnippetItemContainer>
  );
};

export default SnippetItem;
