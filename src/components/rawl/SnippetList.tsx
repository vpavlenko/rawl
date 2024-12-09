import { flag } from "country-emoji";
import React from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import { corpora } from "./corpora/corpora";
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
  display: flex;
  flex-direction: column;
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
  color: #fff;
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

const ComposerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px;
  font-size: 0.8rem;
  color: #fff;
  border-top: 1px solid #333;
  margin-top: 4px;
`;

const ComposerName = styled.span`
  color: #fff;
`;

const Flags = styled.span`
  font-size: 1rem;
  position: relative;
  top: 1px;
`;

const GenreInfo = styled.span`
  color: #fff;
  font-size: 0.7rem;
`;

const YearInfo = styled.span`
  color: #fff;
  font-size: 0.7rem;
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

const getComposerInfo = (midiSlug: string) => {
  // Find all corpora that contain this midi
  const matchingCorpora = corpora.filter((corpus) =>
    corpus.midis.some((midi) => midi === midiSlug),
  );

  // Return the first corpus that has meaningful metadata
  return (
    matchingCorpora.find(
      (corpus) =>
        corpus.composerBirthYear ||
        corpus.genre ||
        corpus.style ||
        corpus.country,
    ) || null
  );
};

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
        const composerSlug = (snippet as any).composerSlug;
        const midiSlug = slugs?.[index];
        const composerInfo = midiSlug ? getComposerInfo(midiSlug) : null;

        return (
          <SnippetItemWrapper
            key={index}
            isPreview={isPreview}
            measureCount={measureCount}
            onClick={() => onSnippetClick(snippet)}
            isLoading={loadingSnippets.has(composerSlug)}
          >
            {midiSlug && <SlugLabel>{midiSlug}</SlugLabel>}
            <SnippetContainer>
              <SnippetItem
                snippet={snippet}
                index={index}
                isPreview={isPreview}
                noteHeight={noteHeight}
                deleteSnippet={deleteSnippet}
              />
            </SnippetContainer>
            {composerInfo && (
              <ComposerInfo>
                <ComposerName>
                  {composerInfo.slug
                    .split("_")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </ComposerName>
                {composerInfo.country && (
                  <Flags>
                    {composerInfo.country
                      .split(",")
                      .map((c) => flag(c.trim()))
                      .join(" ")}
                  </Flags>
                )}
                {composerInfo.composerBirthYear && (
                  <YearInfo>({composerInfo.composerBirthYear})</YearInfo>
                )}
                {(composerInfo.genre || composerInfo.style) && (
                  <GenreInfo>
                    {[composerInfo.genre, composerInfo.style]
                      .filter(Boolean)
                      .join(", ")}
                  </GenreInfo>
                )}
              </ComposerInfo>
            )}
          </SnippetItemWrapper>
        );
      })}
    </SnippetListContainer>
  );
};

export default SnippetList;
