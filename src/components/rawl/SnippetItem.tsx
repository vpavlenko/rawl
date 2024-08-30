import React, { useCallback, useMemo } from "react";
import styled from "styled-components";
import { Snippet, rehydrateAnalysis, rehydrateNotes } from "./analysis";
import EnhancedFrozenNotes from "./FrozenNotes";

const SnippetItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
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
  height: 150px;
  overflow: hidden;
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
  deleteSnippet: (index: number) => void;
  measureWidth: number;
  noteHeight: number;
}

const SnippetItem: React.FC<SnippetItemProps> = ({
  snippet,
  index,
  deleteSnippet,
  measureWidth,
  noteHeight,
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

  return (
    <SnippetItemContainer>
      <SnippetHeader>
        <span>
          {snippet.tag} (Measures: {snippet.measuresSpan.join("-")})
        </span>
        <DeleteButton onClick={() => deleteSnippet(index)}>Delete</DeleteButton>
      </SnippetHeader>
      <SnippetContent>
        <EnhancedFrozenNotes
          notes={rehydratedNotes}
          measureWidth={measureWidth / 2}
          midiNumberToY={snippetMidiNumberToY}
          maxWidth={300}
          analysis={rehydratedAnalysis}
          measuresAndBeats={rehydratedMeasuresAndBeats}
          noteHeight={noteHeight}
          startMeasure={snippet.measuresSpan[0]}
        />
      </SnippetContent>
    </SnippetItemContainer>
  );
};

export default SnippetItem;
