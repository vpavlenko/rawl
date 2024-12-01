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

const SnippetItemWrapper = styled.div<{
  isPreview?: boolean;
  isLoading?: boolean;
}>`
  flex: 0 0 auto;
  margin-bottom: ${(props) => (props.isPreview ? "0px" : "20px")};
  position: relative;

  ${(props) =>
    props.isLoading &&
    `
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    }
    
    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      z-index: 10001;
      animation: spinner 0.6s linear infinite;
    }
    
    @keyframes spinner {
      to {transform: rotate(360deg);}
    }
  `}
`;

interface SnippetListProps {
  snippets: Snippet[];
  deleteSnippet?: (index: number) => void;
  noteHeight?: number;
  isPreview?: boolean;
  onSnippetClick?: (snippet: Snippet) => void;
  loadingSnippets?: Set<string>;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  deleteSnippet,
  noteHeight = 3,
  isPreview = false,
  onSnippetClick,
  loadingSnippets = new Set(),
}) => {
  return (
    <SnippetListContainer isPreview={isPreview}>
      {snippets.map((snippet, index) => (
        <SnippetItemWrapper
          key={index}
          isPreview={isPreview}
          style={{ cursor: onSnippetClick ? "pointer" : "default" }}
          onClick={() => onSnippetClick?.(snippet)}
          isLoading={loadingSnippets.has((snippet as any).composerSlug)}
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