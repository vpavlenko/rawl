import * as React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { AppContext } from "../../AppContext";
import { Snippet } from "../analysis";
import { NewTonicSymbol } from "../AnalysisGrid";
import ChordStairs from "../legends/ChordStairs";
import SnippetList from "../SnippetList";
import { NARRATIVES } from "../SongNarrative";
import { TOP_100_COMPOSERS } from "../top100Composers";
import {
  CHAPTER_GROUPS,
  CHAPTERS,
  DOUBLE_TONIC_CHAPTER_TITLE,
  MODULATIONS_CHAPTER_TITLE,
} from "./chapters";

const NAV_CHORD_STAIRS_SCALE = 0.7;

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

const BookContainer = styled.div`
  width: 97%;
  padding: 20px;
  color: #ddd;
  margin: 0 auto 100px auto;
`;

const Title = styled.h1`
  font-size: 24px;
`;

const ChapterChordLegendWrapper = styled.div`
  position: fixed;
  bottom: 40px;
  right: 0px;
  width: fit-content;
  z-index: 1000000;
  background: black;
  padding: 0px 10px 30px 10px;
  border: 0.5px solid #666;
`;

const GroupContainer = styled.div`
  margin-bottom: 80px;
`;

const ComposersGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-bottom: 30px;
`;

const ComposerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ComposerLink = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const ComposerWrapper = styled.div`
  transition: all 0.3s ease;
  padding: 4px 0px;
  border-radius: 4px;
`;

const SnippetContainer = styled.div`
  margin-top: 0px;
  margin-bottom: 30px;
`;

const ComposerList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const ComposerListItem = styled.li`
  margin-left: 0;
  white-space: nowrap;
  transition: all 0.3s ease;
  padding: 4px 0px;
  border-radius: 4px;
`;

const ChapterSelector = styled.div.attrs({ className: "ChapterSelector" })`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  padding: 0;
  margin: 0;
`;

const ChapterTitleTooltip = styled.div<{
  isSelected?: boolean;
  isHovered?: boolean;
}>`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 0px 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: ${(props) => {
    return props.isHovered ? 2000 : 1000;
  }};
  opacity: ${(props) => {
    return props.isSelected || props.isHovered ? 1 : 0;
  }};
  display: block !important;
  color: ${(props) => (props.isSelected ? "white" : "#aaa")};
`;

const ChapterButton = styled.button<{ isSelected: boolean }>`
  background: black;
  color: white;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  position: relative;
  min-height: 80px;
  padding: 0px 0px;
  border-radius: 0;
  box-sizing: border-box;

  ${ChapterTitleTooltip} {
    display: none;
  }

  &:hover {
    ${ChapterTitleTooltip} {
      display: block;
    }
  }
`;

const NavChordWrapper = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: black;
  margin: 0 0 10px 0;
  position: relative;
`;

export const ReadableTextBlock = styled.div`
  max-width: 43em;
  color: white;
  border-radius: 10px;
  margin: 20px 0px 100px 0px;
  position: relative;
`;

export const ComposerTitle: React.FC<{
  composer: string;
  displayTitle: string;
  style?: React.CSSProperties;
}> = ({ composer, displayTitle, style }) => (
  <span style={style}>
    <span style={{ color: "#999" }}>{composer}. </span>
    <span style={{ color: "white" }}>{displayTitle}</span>
  </span>
);

const getChapterSlug = (chapter: string) => slugify(chapter.toLowerCase());

const ComposerLinkWithChat: React.FC<{
  composer: (typeof TOP_100_COMPOSERS)[number];
  onLinkClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  chatIconStyle?: React.CSSProperties;
}> = ({ composer, onLinkClick, chatIconStyle }) => (
  <ComposerLink
    href={`/f/${composer.slug}`}
    target="_blank"
    rel="noreferrer"
    onClick={onLinkClick}
  >
    <ComposerTitle
      composer={composer.composer}
      displayTitle={composer.displayTitle}
    />
    {NARRATIVES[composer.slug] && (
      <span style={{ marginLeft: "8px", color: "#999", ...chatIconStyle }}>
        💬 {NARRATIVES[composer.slug].qa.length}
      </span>
    )}
  </ComposerLink>
);

const ChapterGroupsContainer = styled.div`
  display: flex;
  width: 100%;
  position: relative;
  height: 30px;
  top: 13px;
  left: 1px;
  z-index: 1000000;
`;

const ChapterGroup = styled.div`
  white-space: nowrap;
  text-align: center;
  color: #666;
  font-size: 14px;
  position: absolute;
  padding-bottom: 12px;

  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 8px;
    border-top: 1px solid #666;
    border-left: 1px solid #666;
    border-right: 1px solid #666;
  }
`;

const Book: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const appContext = React.useContext(AppContext);
  const [hoveredChapter, setHoveredChapter] = React.useState<string | null>(
    null,
  );
  const [groupsPositions, setGroupsPositions] = React.useState<{
    [key: string]: { left: number; width: number };
  }>({});

  if (!appContext) throw new Error("AppContext not found");
  const { analyses, eject } = appContext;
  const [loadingSnippets, setLoadingSnippets] = React.useState<Set<string>>(
    new Set(),
  );

  // Add handler for composer link clicks
  const handleComposerLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    eject(); // Eject the current player before navigating
  };

  // Handle snippet click with loading state
  const handleSnippetClick = async (snippet: EnhancedSnippet) => {
    const slug = snippet.composerSlug;
    setLoadingSnippets((prev) => new Set([...prev, slug]));
    try {
      await appContext.handleSongClick(slug);
      if (snippet.secondsSpan) {
        const seekPosition = Math.max(0, (snippet.secondsSpan[0] - 1) * 1000);
        appContext.seek(seekPosition);
      }
    } finally {
      setLoadingSnippets((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  };

  // Get unique chapter titles
  const chapterTitles = React.useMemo(() => {
    return CHAPTERS.map((chapter) => chapter.title);
  }, []);

  // Find selected chapter based on slug
  const selectedChapter = React.useMemo(() => {
    if (!slug) return "Intro";
    return (
      chapterTitles.find(
        (chapter) => getChapterSlug(chapter) === slug.toLowerCase(),
      ) || "Intro"
    );
  }, [slug, chapterTitles]);

  // Redirect from root to /100/intro
  if (!slug) {
    return <Redirect to="/100/intro" />;
  }

  // Handle chapter selection
  const handleChapterSelect = (chapter: string) => {
    const newSlug = getChapterSlug(chapter);
    history.push(`/100/${newSlug}`);
  };

  React.useEffect(() => {
    const calculatePositions = () => {
      const newPositions: typeof groupsPositions = {};

      Object.entries(CHAPTER_GROUPS).forEach(([name, [from, to]]) => {
        const startButton = document.querySelector(
          `.ChapterSelector button:nth-child(${from})`,
        ) as HTMLElement;
        const endButton = document.querySelector(
          `.ChapterSelector button:nth-child(${to})`,
        ) as HTMLElement;

        if (startButton && endButton) {
          const startLeft = startButton.offsetLeft;
          const endRight = endButton.offsetLeft + endButton.offsetWidth;
          newPositions[name] = {
            left: startLeft,
            width: endRight - startLeft,
          };
        }
      });

      setGroupsPositions(newPositions);
    };

    // Calculate initial positions after render
    setTimeout(calculatePositions, 100); // Increased timeout to ensure buttons are rendered

    // Recalculate on window resize
    window.addEventListener("resize", calculatePositions);
    return () => window.removeEventListener("resize", calculatePositions);
  }, []);

  const renderContent = () => {
    const currentChapter = CHAPTERS.find(
      (chapter) => chapter.title === selectedChapter,
    );
    if (!currentChapter) return null;

    return (
      <>
        <div style={{ marginTop: "40px" }}>
          {currentChapter.mode && (
            <ChapterChordLegendWrapper>
              <ChordStairs
                mode={currentChapter.mode}
                {...(selectedChapter === "Intro" ? { currentTonic: 5 } : {})}
              />
            </ChapterChordLegendWrapper>
          )}
          {currentChapter.pretext && (
            <ReadableTextBlock>{currentChapter.pretext()}</ReadableTextBlock>
          )}
          <GroupContainer>
            <ComposersGrid>
              {currentChapter.composers
                .map((slug) => TOP_100_COMPOSERS.find((c) => c.slug === slug))
                .filter(
                  (composer): composer is (typeof TOP_100_COMPOSERS)[number] =>
                    composer !== undefined &&
                    analyses[`f/${composer.slug}`]?.snippets?.some(
                      (s) => s.tag === "book:index",
                    ),
                )
                .map((composer) => {
                  const snippets = (
                    analyses[`f/${composer.slug}`]?.snippets || []
                  )
                    .filter((snippet) => snippet.tag === "book:index")
                    .map((snippet) => ({
                      ...snippet,
                      composerSlug: composer.slug,
                    }));

                  return (
                    <ComposerItem key={composer.slug}>
                      <ComposerWrapper>
                        <ComposerLinkWithChat
                          composer={composer}
                          onLinkClick={handleComposerLinkClick}
                          chatIconStyle={{ marginLeft: "12px" }}
                        />
                      </ComposerWrapper>
                      <SnippetContainer>
                        <SnippetList
                          snippets={snippets}
                          onSnippetClick={handleSnippetClick}
                          loadingSnippets={loadingSnippets}
                          isPreview={true}
                          noteHeight={3}
                        />
                      </SnippetContainer>
                    </ComposerItem>
                  );
                })}
            </ComposersGrid>

            {currentChapter.composers
              .map((slug) => TOP_100_COMPOSERS.find((c) => c.slug === slug))
              .filter(
                (composer): composer is (typeof TOP_100_COMPOSERS)[number] =>
                  composer !== undefined &&
                  !analyses[`f/${composer.slug}`]?.snippets?.some(
                    (s) => s.tag === "book:index",
                  ),
              ).length > 0 && (
              <>
                <ComposerList>
                  {currentChapter.composers
                    .map((slug) =>
                      TOP_100_COMPOSERS.find((c) => c.slug === slug),
                    )
                    .filter(
                      (
                        composer,
                      ): composer is (typeof TOP_100_COMPOSERS)[number] =>
                        composer !== undefined &&
                        !analyses[`f/${composer.slug}`]?.snippets?.some(
                          (s) => s.tag === "book:index",
                        ),
                    )
                    .map((composer) => (
                      <ComposerListItem key={composer.slug}>
                        <ComposerLinkWithChat
                          composer={composer}
                          onLinkClick={handleComposerLinkClick}
                        />
                      </ComposerListItem>
                    ))}
                </ComposerList>
              </>
            )}
          </GroupContainer>
        </div>
      </>
    );
  };

  return (
    <BookContainer>
      <div className="Book" style={{ position: "relative" }}>
        <Title>Visual Harmony of Top 100 Composers on MuseScore.com</Title>
        <ChapterGroupsContainer>
          {Object.entries(CHAPTER_GROUPS).map(([name, [from, to]]) => {
            const position = groupsPositions[name];
            if (!position) return null;

            return (
              <ChapterGroup
                key={name}
                style={{
                  left: position.left,
                  width: position.width,
                }}
              >
                {name}
              </ChapterGroup>
            );
          })}
        </ChapterGroupsContainer>
        <ChapterSelector>
          {CHAPTERS.map((chapter) => (
            <ChapterButton
              key={chapter.title}
              isSelected={selectedChapter === chapter.title}
              onClick={() => handleChapterSelect(chapter.title)}
              onMouseEnter={() => setHoveredChapter(chapter.title)}
              onMouseLeave={() => setHoveredChapter(null)}
            >
              <NavChordWrapper>
                {chapter.title === MODULATIONS_CHAPTER_TITLE ? (
                  <div
                    style={{
                      position: "relative",
                      width: "65px",
                      height: "45px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                      }}
                    >
                      <NewTonicSymbol
                        left={0}
                        number={1}
                        previousTonic={0}
                        modulationDiff={5}
                        tonicStart={5}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        top: "25px",
                      }}
                    >
                      <NewTonicSymbol
                        left={0}
                        number={1}
                        previousTonic={0}
                        modulationDiff={7}
                        tonicStart={7}
                      />
                    </div>
                  </div>
                ) : chapter.title === DOUBLE_TONIC_CHAPTER_TITLE ? (
                  <>
                    <ChordStairs
                      mode={{ title: "", chords: ["vi"] }}
                      scale={NAV_CHORD_STAIRS_SCALE}
                      playbackMode="no"
                    />
                    <span style={{ margin: 4, fontSize: "28px" }}>=</span>
                    <ChordStairs
                      mode={{ title: "", chords: ["i"] }}
                      scale={NAV_CHORD_STAIRS_SCALE}
                      playbackMode="no"
                    />
                  </>
                ) : chapter.titleChords ? (
                  <ChordStairs
                    mode={{ title: "", chords: chapter.titleChords }}
                    scale={NAV_CHORD_STAIRS_SCALE}
                    playbackMode="no"
                  />
                ) : (
                  chapter.title
                )}
                {!["Style"].includes(chapter.title) && (
                  <ChapterTitleTooltip
                    isSelected={selectedChapter === chapter.title}
                    isHovered={hoveredChapter === chapter.title}
                  >
                    {chapter.title}
                  </ChapterTitleTooltip>
                )}
              </NavChordWrapper>
            </ChapterButton>
          ))}
        </ChapterSelector>

        {renderContent()}
      </div>
    </BookContainer>
  );
};

export default Book;
