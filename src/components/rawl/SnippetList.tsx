import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetListContainer = styled.div`
  display: flex;
  flex-direction: row; // Change to row for horizontal layout
  overflow-x: auto; // Enable horizontal scrolling
  gap: 20px;
  padding-bottom: 10px; // Add some padding to account for potential scrollbar
`;

const SnippetItemWrapper = styled.div`
  flex: 0 0 auto; // Prevent items from growing or shrinking
  width: 400px; // Match the width of SnippetItem
`;

interface SnippetListProps {
  snippets: Snippet[];
  deleteSnippet?: (index: number) => void;
  noteHeight?: number;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  deleteSnippet,
  noteHeight = 3,
}) => {
  return (
    <SnippetListContainer>
      {snippets.map((snippet, index) => (
        <SnippetItemWrapper key={index}>
          <SnippetItem
            snippet={snippet}
            index={index}
            deleteSnippet={deleteSnippet}
            noteHeight={noteHeight}
          />
        </SnippetItemWrapper>
      ))}
    </SnippetListContainer>
  );
};

export default SnippetList;
