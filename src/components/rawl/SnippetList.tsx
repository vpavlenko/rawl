import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetListContainer = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow items to wrap to the next line
  gap: 20px;
  padding-bottom: 10px;
`;

const SnippetItemWrapper = styled.div`
  flex: 0 0 auto;
  width: 400px;
  margin-bottom: 20px; // Add vertical spacing between rows
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
