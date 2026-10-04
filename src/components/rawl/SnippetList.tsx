import React, { useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Snippet } from "./analysis";
import { corpora } from "./corpora/corpora";
import {
  GenreItem,
  GenreList,
  getEmojis,
  getUniqueStyles,
  hasMetadata,
} from "./corpusUtils";
import SnippetItem, { PX_IN_MEASURE } from "./SnippetItem";

const SnippetListContainer = styled.div<{ isPreview?: boolean; $timeline?: boolean }>`
  display: flex;
  flex-wrap: ${(props) => (props.$timeline ? "nowrap" : "wrap")};
  gap: ${(props) => (props.$timeline ? "32px" : props.isPreview ? "60px" : "20px")};
  padding-bottom: ${(props) => (props.$timeline ? "20px" : "10px")};
  ${(props) => props.$timeline && `
    position: relative;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
  `}
`;

const TimelineYear = styled.div<{ $known: boolean }>`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  height: 50px;
  color: ${({ $known }) => ($known ? "#ddd" : "#888")};
  font-size: 13px;
  font-variant-numeric: tabular-nums;

  &::before {
    content: "";
    position: absolute;
    top: 35px;
    left: -32px;
    width: calc(100% + 32px);
    border-top: 1px solid #555;
  }

  &::after {
    content: "";
    position: absolute;
    top: 31px;
    left: 0;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: ${({ $known }) => ($known ? "#ddd" : "#777")};
    box-shadow: 0 0 0 3px black;
  }
`;

const EditTagButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #777;
  border-radius: 4px;
  background: #222;
  color: #fff;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 120ms ease, background 120ms ease;
  &:focus-visible { opacity: 1; pointer-events: auto; }
  &:hover { background: #333; }
  @media (hover: none) { opacity: 1; pointer-events: auto; }
  svg { width: 15px; height: 15px; }
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

  &:hover ${EditTagButton}, &:focus-within ${EditTagButton} {
    opacity: 1;
    pointer-events: auto;
  }

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

const SlugLabel = styled.div<{ $hasEditButton?: boolean }>`
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  box-sizing: border-box;
  padding-right: ${({ $hasEditButton }) => $hasEditButton ? "28px" : "0"};
  margin: 0;
`;

const SnippetContainer = styled.div`
  min-width: 0;
  width: 100%;
  margin: 0;
`;

const ComposerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
  font-size: 0.8rem;
  color: #fff;
  border-top: 1px solid #333;
  margin-top: 4px;
`;

const ComposerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComposerName = styled.span`
  color: #fff;
`;

const LakhInfo = styled(ComposerInfo)`
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
`;

const LakhArtistName = styled(ComposerName)`
  overflow-wrap: anywhere;
`;

const FilenameLabel = styled(SlugLabel)`
  color: #999;
  font-size: 11px;
`;

const YearInfo = styled.span`
  color: #999;
  font-size: 0.8em;
`;

const TagEditor = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  width: 100%;
  color: #fff;
  font-size: 11px;

  input {
    min-width: 0;
    flex: 1 1 120px;
    color: #fff;
    background: #111;
    border: 1px solid #777;
    border-radius: 3px;
    padding: 3px 4px;
  }

  button {
    color: #fff;
    background: #222;
    border: 1px solid #555;
    border-radius: 3px;
    padding: 3px 5px;
    cursor: pointer;
  }

  [role="alert"] {
    color: #ff9999;
    width: 100%;
  }
`;

interface SnippetListProps {
  snippets: Snippet[];
  slugs?: string[];
  onSnippetClick: (snippet: Snippet, element: HTMLElement) => void;
  snippetIds?: string[];
  isPreview?: boolean;
  noteHeight?: number;
  loadingSnippets?: Set<string>;
  deleteSnippet?: (index: number) => void;
  hoveredColors?: string[] | null;
  onEditTag?: (index: number, tag: string) => Promise<void>;
  availableTags?: string[];
  timeline?: boolean;
  timelineScrollLeftRef?: React.MutableRefObject<number>;
}

export const getComposerInfo = (midiSlug: string) => {
  const matchingCorpora = corpora.filter((corpus) =>
    corpus.midis.some((midi) => midi === midiSlug),
  );
  return matchingCorpora.find(hasMetadata) || null;
};

const getLakhInfo = (midiSlug?: string) => {
  if (!midiSlug?.startsWith("c/MIDI/")) return null;
  const [artist, ...fileParts] = midiSlug.slice("c/MIDI/".length).split("/");
  const filename = fileParts.join("/");
  if (!artist || !filename) return null;
  return {
    artist,
    filename,
    song: filename.replace(/(?:\.\d+)?\.mid$/i, ""),
  };
};

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  slugs,
  onSnippetClick,
  snippetIds,
  isPreview = false,
  noteHeight = 3,
  loadingSnippets = new Set(),
  deleteSnippet,
  hoveredColors,
  onEditTag,
  availableTags = [],
  timeline = false,
  timelineScrollLeftRef,
}) => {
  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (timeline && listRef.current && timelineScrollLeftRef) {
      listRef.current.scrollLeft = timelineScrollLeftRef.current;
    }
  }, [timeline, timelineScrollLeftRef]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tagDraft, setTagDraft] = useState("");
  const [tagError, setTagError] = useState("");
  const [savingTag, setSavingTag] = useState(false);

  const saveTag = async (index: number, currentTag: string) => {
    const tag = tagDraft.trim();
    if (!/^[^:\s]+:[^:\s]+$/.test(tag)) {
      setTagError("Use chapter:topic, with no spaces.");
      return;
    }
    if (tag === currentTag) {
      setEditingIndex(null);
      return;
    }
    setSavingTag(true);
    setTagError("");
    try {
      await onEditTag?.(index, tag);
      setEditingIndex(null);
    } catch (error) {
      setTagError("Could not save the tag. Please retry.");
    } finally {
      setSavingTag(false);
    }
  };

  return (
    <SnippetListContainer
      ref={listRef}
      isPreview={isPreview}
      $timeline={timeline}
      onScroll={timelineScrollLeftRef ? (event) => {
        timelineScrollLeftRef.current = event.currentTarget.scrollLeft;
      } : undefined}
    >
      {onEditTag && (
        <datalist id="structure-snippet-tags">
          {availableTags.map((tag) => (
            <option key={tag} value={tag} />
          ))}
        </datalist>
      )}
      {snippets.map((snippet, index) => {
        const measureCount =
          snippet.measuresSpan[1] - snippet.measuresSpan[0] + 1;
        const composerSlug = (snippet as any).composerSlug;
        const midiSlug = slugs?.[index];
        const lakhInfo = getLakhInfo(midiSlug);
        const composerInfo =
          midiSlug && !lakhInfo ? getComposerInfo(midiSlug) : null;

        return (
          <SnippetItemWrapper
            key={index}
            data-structure-snippet-id={snippetIds?.[index]}
            isPreview={isPreview}
            measureCount={measureCount}
            onClick={(event) => onSnippetClick(snippet, event.currentTarget)}
            isLoading={loadingSnippets.has(composerSlug)}
          >
            {timeline && (
              <TimelineYear $known={typeof composerInfo?.composerBirthYear === "number"}>
                {composerInfo?.composerBirthYear ?? "Year unknown"}
              </TimelineYear>
            )}
            {midiSlug && (
              <SlugLabel $hasEditButton={!!onEditTag} title={lakhInfo?.song || midiSlug}>
                {lakhInfo?.song || midiSlug}
              </SlugLabel>
            )}
            {onEditTag && editingIndex !== index && (
              <EditTagButton type="button" title="Edit tag"
                aria-label={`Edit tag for ${lakhInfo?.song || midiSlug || `snippet ${index + 1}`}`}
                onClick={(event) => {
                  event.stopPropagation();
                  setTagDraft(snippet.tag);
                  setTagError("");
                  setEditingIndex(index);
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  aria-hidden="true">
                  <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                  <path d="m15 5 4 4" />
                </svg>
              </EditTagButton>
            )}
            {onEditTag && editingIndex === index && (
              <TagEditor onClick={(event) => event.stopPropagation()}>
                <input
                  autoFocus
                  aria-label={`Tag for ${
                    lakhInfo?.song || midiSlug || `snippet ${index + 1}`
                  }`}
                  list="structure-snippet-tags"
                  value={tagDraft}
                  disabled={savingTag}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter")
                      void saveTag(index, snippet.tag);
                    if (event.key === "Escape") setEditingIndex(null);
                  }}
                />
                <button
                  disabled={savingTag}
                  onClick={() => void saveTag(index, snippet.tag)}
                >
                  Save
                </button>
                <button
                  disabled={savingTag}
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </button>
                {tagError && <span role="alert">{tagError}</span>}
              </TagEditor>
            )}
            <SnippetContainer>
              <SnippetItem
                snippet={snippet}
                index={index}
                isPreview={isPreview}
                noteHeight={noteHeight}
                deleteSnippet={deleteSnippet}
                hoveredColors={hoveredColors}
              />
            </SnippetContainer>
            {lakhInfo && (
              <LakhInfo>
                <LakhArtistName>{lakhInfo.artist}</LakhArtistName>
                <FilenameLabel title={lakhInfo.filename}>
                  {lakhInfo.filename}
                </FilenameLabel>
              </LakhInfo>
            )}
            {composerInfo && (
              <ComposerInfo>
                <ComposerHeader>
                  <ComposerName>
                    {composerInfo.slug
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </ComposerName>
                  {composerInfo.country && (
                    <div>{getEmojis(composerInfo.country)}</div>
                  )}
                  {!timeline && composerInfo.composerBirthYear && (
                    <YearInfo>({composerInfo.composerBirthYear})</YearInfo>
                  )}
                </ComposerHeader>
                {(composerInfo.genre || composerInfo.style) && (
                  <GenreList>
                    {getUniqueStyles(
                      composerInfo.genre,
                      composerInfo.style,
                    ).map((style, index) => (
                      <GenreItem key={index}>{style}</GenreItem>
                    ))}
                  </GenreList>
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
