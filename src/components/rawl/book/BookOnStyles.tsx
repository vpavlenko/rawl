import React, { useState } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import ChordStairs from "../legends/ChordStairs";
import { STYLES_CHAPTERS } from "./stylesChapters";

const NAV_HORIZONTAL_GAP = 15;
const NAV_CHORD_STAIRS_SCALE = 0.6;

const EditorIndexContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const EditorIndexTitle = styled.h1`
  color: #fff;
  margin-bottom: 20px;
`;

// New lighter link style
const ScoreLink = styled(Link)`
  color: #fff;
  text-decoration: none;
  padding: 6px 2px;
  border-radius: 2px;
  display: block;
  transition: all 0.2s ease;
  font-size: 14px;
  margin-bottom: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const ChapterSection = styled.div`
  margin-bottom: 30px;
`;

const ChapterContent = styled.div`
  padding: 20px 0;
`;

const ChapterTitle = styled.h2`
  color: #fff;
  margin: 0 0 15px 0;
`;

const ChapterDescription = styled.div`
  color: #fff;
  margin: 15px 0 25px 0;
  line-height: 1.5;
  max-width: 700px;
`;

const ChapterSelector = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px ${NAV_HORIZONTAL_GAP}px;
  padding: 0;
  margin: 0 0 30px 0;
  overflow: visible;
`;

const ChapterTitleTooltip = styled.div<{
  isSelected?: boolean;
  isHovered?: boolean;
}>`
  background: rgba(0, 0, 0, 0.9);
  padding: 0px 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: ${(props) => {
    return props.isHovered ? 20000 : 10000;
  }};
  opacity: ${(props) => {
    return props.isSelected || props.isHovered ? 1 : 0;
  }};
  color: #fff;
`;

const ChapterButton = styled.button<{ isSelected: boolean }>`
  background: black;
  color: white;
  cursor: pointer;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0;
  border-radius: 0;
  overflow: visible;
  height: 80px;
  border: none;

  ${ChapterTitleTooltip} {
    position: absolute;
    top: 55px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    white-space: nowrap;
  }

  &:hover {
    ${ChapterTitleTooltip} {
      display: flex;
    }
  }
`;

const NavChordWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  position: relative;
  height: 60px;
  width: 100%;
`;

const ScoresList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
`;

// Helper function to get chapter slug
const getChapterSlug = (chapter: string) => slugify(chapter.toLowerCase());

const BookOnStyles: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const [hoveredChapter, setHoveredChapter] = useState<string | null>(null);

  // Find selected chapter based on slug or default to first chapter
  const selectedChapter = React.useMemo(() => {
    if (!slug) return STYLES_CHAPTERS[0].title;
    return (
      STYLES_CHAPTERS.find(
        (chapter) => getChapterSlug(chapter.title) === slug.toLowerCase(),
      )?.title || STYLES_CHAPTERS[0].title
    );
  }, [slug]);

  // Handle chapter selection
  const handleChapterSelect = (chapter: string) => {
    const newSlug = getChapterSlug(chapter);
    history.push(`/book/${newSlug}`);
  };

  const renderChapterContent = () => {
    const currentChapter = STYLES_CHAPTERS.find(
      (chapter) => chapter.title === selectedChapter,
    );

    if (!currentChapter) {
      return <p>Select a chapter to view its content.</p>;
    }

    return (
      <ChapterContent>
        <ChapterDescription>
          {currentChapter.pretext ? (
            currentChapter.pretext()
          ) : (
            <p>No description available.</p>
          )}
        </ChapterDescription>
      </ChapterContent>
    );
  };

  return (
    <EditorIndexContainer>
      <EditorIndexTitle>
        Structures and Styles of Western composers
      </EditorIndexTitle>

      <ChapterSelector>
        {STYLES_CHAPTERS.map((chapter) => (
          <ChapterButton
            key={chapter.title}
            isSelected={selectedChapter === chapter.title}
            onClick={() => handleChapterSelect(chapter.title)}
            onMouseEnter={() => setHoveredChapter(chapter.title)}
            onMouseLeave={() => setHoveredChapter(null)}
          >
            <NavChordWrapper>
              {chapter.titleChords && (
                <ChordStairs
                  mode={{ title: "", chords: chapter.titleChords }}
                  scale={NAV_CHORD_STAIRS_SCALE}
                  playbackMode="no"
                />
              )}
            </NavChordWrapper>
            <ChapterTitleTooltip
              isSelected={selectedChapter === chapter.title}
              isHovered={hoveredChapter === chapter.title}
            >
              {chapter.title}
            </ChapterTitleTooltip>
          </ChapterButton>
        ))}
      </ChapterSelector>

      {renderChapterContent()}
    </EditorIndexContainer>
  );
};

export default BookOnStyles;
