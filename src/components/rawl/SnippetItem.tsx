import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Snippet, rehydrateSnippet } from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";

const SnippetItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 400px;
  border: 1px solid #444;
  border-radius: 5px;
  overflow: hidden;
`;

const SnippetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #222;
`;

const SnippetContent = styled.div`
  height: 300px;
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

  const snippetHeight =
    (snippetMidiRange[1] - snippetMidiRange[0] + 1) * noteHeight;

  const snippetMidiNumberToY = useCallback(
    (midiNumber: number) =>
      snippetHeight - (midiNumber - snippetMidiRange[0]) * noteHeight,
    [snippetHeight, snippetMidiRange, noteHeight],
  );

  const timeRange = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0];
    const endMeasure = snippet.measuresSpan[1];
    const startTime = paddedMeasuresAndBeats.measures[startMeasure - 1] || 0;
    const endTime = paddedMeasuresAndBeats.measures[endMeasure] || startTime;
    return [startTime, endTime] as [number, number];
  }, [snippet, paddedMeasuresAndBeats]);

  const toX = useCallback(
    (seconds: number) => {
      const normalizedTime =
        (seconds - timeRange[0]) / (timeRange[1] - timeRange[0]);
      return isNaN(normalizedTime) ? 0 : normalizedTime * 400; // Map to 0..400px, default to 0 if NaN
    },
    [timeRange],
  );

  return (
    <SnippetItemContainer>
      {!isPreview && (
        <SnippetHeader>
          <span>
            {snippet.tag} (Measures: {snippet.measuresSpan.join("-")})
          </span>
          {deleteSnippet && (
            <DeleteButton onClick={() => deleteSnippet(index)}>
              Delete
            </DeleteButton>
          )}
        </SnippetHeader>
      )}
      <SnippetContent>
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          midiNumberToY={snippetMidiNumberToY}
          maxWidth={400}
          analysis={rehydratedAnalysis}
          measuresAndBeats={paddedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={snippet.measuresSpan[0]}
          toX={toX}
          timeRange={timeRange}
        />
      </SnippetContent>
    </SnippetItemContainer>
  );
};

export default SnippetItem;
