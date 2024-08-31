import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

interface SnippetListProps {
  snippets: Snippet[];
  deleteSnippet?: (index: number) => void;
  measureWidth?: number;
  noteHeight?: number;
  compact?: boolean;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  deleteSnippet,
  measureWidth = 50,
  noteHeight = 3,
  compact = false,
}) => {
  return (
    <SnippetListContainer>
      {snippets.map((snippet, index) => (
        <SnippetItem
          key={index}
          snippet={snippet}
          index={index}
          deleteSnippet={deleteSnippet}
          measureWidth={measureWidth}
          noteHeight={noteHeight}
          compact={compact}
        />
      ))}
    </SnippetListContainer>
  );
};

export default SnippetList;
