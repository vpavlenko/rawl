import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetListContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

const SnippetItemWrapper = styled.div`
  width: 400px; // Match the width of SnippetItem
  margin-bottom: 20px; // Add some vertical spacing between items
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
