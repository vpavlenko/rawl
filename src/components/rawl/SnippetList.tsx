import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import SnippetItem, { PX_IN_MEASURE } from "./SnippetItem";

const SnippetListContainer = styled.div<{ isPreview?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => (props.isPreview ? "60px" : "20px")};
  padding-bottom: 10px;
`;

const SnippetItemWrapper = styled.div<{
  isPreview?: boolean;
  measureCount: number;
  isLoading?: boolean;
}>`
  flex: 0 0 auto;
  margin-bottom: ${(props) => (props.isPreview ? "0px" : "20px")};
  position: relative;
  display: grid;
  grid-template-rows: auto 1fr;
  cursor: pointer;
  width: ${(props) => props.measureCount * PX_IN_MEASURE}px;
  align-items: start;
  gap: 4px;

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
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      border: 2px solid #fff;
      border-top-color: transparent;
      border-radius: 50%;
      z-index: 10001;
      animation: spinner 1s linear infinite;
    }
    
    @keyframes spinner {
      to {transform: translate(-50%, -50%) rotate(360deg);}
    }
  `}
`;

const SlugLabel = styled.div`
  color: #666;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  margin: 0;
`;

const SnippetContainer = styled.div`
  min-width: 0;
  width: 100%;
  margin: 0;
`;

interface SnippetListProps {
  snippets: Snippet[];
  slugs?: string[];
  onSnippetClick: (snippet: Snippet) => void;
  isPreview?: boolean;
  noteHeight?: number;
  loadingSnippets?: Set<string>;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  slugs,
  onSnippetClick,
  isPreview = false,
  noteHeight = 3,
  loadingSnippets = new Set(),
}) => {
  return (
    <SnippetListContainer isPreview={isPreview}>
      {snippets.map((snippet, index) => {
        const measureCount =
          snippet.measuresSpan[1] - snippet.measuresSpan[0] + 1;
        return (
          <SnippetItemWrapper
            key={index}
            isPreview={isPreview}
            measureCount={measureCount}
            onClick={() => onSnippetClick(snippet)}
            isLoading={loadingSnippets.has((snippet as any).composerSlug)}
          >
            {slugs && slugs[index] && <SlugLabel>{slugs[index]}</SlugLabel>}
            <SnippetContainer>
              <SnippetItem
                snippet={snippet}
                index={index}
                isPreview={isPreview}
                noteHeight={noteHeight}
              />
            </SnippetContainer>
          </SnippetItemWrapper>
        );
      })}
    </SnippetListContainer>
  );
};

export default SnippetList;
