import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem from "./SnippetItem";

const SnippetListContainer = styled.div<{ isPreview?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => (props.isPreview ? "60px" : "20px")};
  padding-bottom: 10px;
`;

const SnippetItemWrapper = styled.div<{ isPreview?: boolean }>`
  flex: 0 0 auto;
  margin-bottom: ${(props) => (props.isPreview ? "0px" : "20px")};
`;

interface SnippetListProps {
  snippets: Snippet[];
  deleteSnippet?: (index: number) => void;
  noteHeight?: number;
  isPreview?: boolean;
  onSnippetClick?: (snippet: Snippet) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  deleteSnippet,
  noteHeight = 3,
  isPreview = false,
  onSnippetClick,
}) => {
  return (
    <SnippetListContainer isPreview={isPreview}>
      {snippets.map((snippet, index) => (
        <SnippetItemWrapper
          key={index}
          isPreview={isPreview}
          style={{ cursor: onSnippetClick ? "pointer" : "default" }}
          onClick={() => onSnippetClick?.(snippet)}
        >
          <SnippetItem
            snippet={snippet}
            index={index}
            deleteSnippet={deleteSnippet}
            noteHeight={noteHeight}
            isPreview={isPreview}
          />
        </SnippetItemWrapper>
      ))}
    </SnippetListContainer>
  );
};

export default SnippetList;
