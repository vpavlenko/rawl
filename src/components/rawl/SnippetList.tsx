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
  deleteSnippet?: (index: number) => void;
}

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  slugs,
  onSnippetClick,
  isPreview = false,
  noteHeight = 3,
  loadingSnippets = new Set(),
  deleteSnippet,
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
