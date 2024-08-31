import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Snippet, rehydrateAnalysis, rehydrateNotes } from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";

const SnippetItemContainer = styled.div<{ compact: boolean }>`
  display: flex;
  flex-direction: column;
  width: ${(props) => (props.compact ? "100%" : "350px")};
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

const SnippetContent = styled.div<{ compact: boolean }>`
  height: ${(props) => (props.compact ? "200px" : "300px")};
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
  measureWidth: number;
  noteHeight: number;
  compact: boolean;
}

const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  index,
  deleteSnippet,
  measureWidth,
  noteHeight,
  compact,
}) => {
  const { rehydratedNotes, rehydratedAnalysis, rehydratedMeasuresAndBeats } =
    useMemo(() => {
      const rehydratedNotes = rehydrateNotes(snippet);
      const {
        analysis: rehydratedAnalysis,
        measuresAndBeats: rehydratedMeasuresAndBeats,
      } = rehydrateAnalysis(snippet.frozenNotes.analysis);
      return {
        rehydratedNotes,
        rehydratedAnalysis,
        rehydratedMeasuresAndBeats,
      };
    }, [snippet]);

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

  const paddedMeasuresAndBeats = useMemo(() => {
    const startMeasure = snippet.measuresSpan[0] - 1;
    const endMeasure = snippet.measuresSpan[1];
    const paddingLength = Math.max(0, startMeasure);
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

  return (
    <SnippetItemContainer compact={compact}>
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
      <SnippetContent compact={compact}>
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          measureWidth={measureWidth}
          midiNumberToY={snippetMidiNumberToY}
          maxWidth={compact ? "100%" : 350}
          analysis={rehydratedAnalysis}
          measuresAndBeats={paddedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={snippet.measuresSpan[0]}
        />
      </SnippetContent>
    </SnippetItemContainer>
  );
};

export default SnippetItem;
