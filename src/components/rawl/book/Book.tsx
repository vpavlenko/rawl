import * as React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { AppContext } from "../../AppContext";
import { Snippet } from "../analysis";
import { NewTonicSymbol } from "../AnalysisGrid";
import ChordStairs from "../ChordStairs";
import { PianoLegend } from "../PianoLegend";
import SnippetList from "../SnippetList";
import { NARRATIVES } from "../SongNarrative";
import { TOP_100_COMPOSERS } from "../top100Composers";
import { CHAPTERS, MODULATIONS_CHAPTER_TITLE } from "./chapters";
import IntroText from "./IntroText";

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

const ChapterSelector = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  padding: 0px 0;
  margin: 20px 0;
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
  z-index: 1000;
  opacity: ${(props) => {
    return props.isSelected || props.isHovered ? 1 : 0;
  }};
  display: block !important;
  color: ${(props) => (props.isSelected ? "white" : "#aaa")};
`;

const SelectionArrow = styled.div<{
  isHovered?: boolean;
  isSelected?: boolean;
}>`
  position: absolute;
  top: 0px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid
    ${(props) => (props.isHovered && !props.isSelected ? "#777" : "#bbb")};
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
    ${SelectionArrow} {
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

const ABOUT_SELECTION = "About";

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

const Book: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const appContext = React.useContext(AppContext);
  const [hoveredChapter, setHoveredChapter] = React.useState<string | null>(
    null,
  );
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

  const renderContent = () => {
    if (selectedChapter === ABOUT_SELECTION) {
      return (
        <div style={{ marginTop: "50px" }}>
          <IntroText />
        </div>
      );
    }

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
                          noteHeight={3}
                          isPreview={true}
                          onSnippetClick={handleSnippetClick}
                          loadingSnippets={loadingSnippets}
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
        {selectedChapter === "Intro" && (
          <div style={{ marginTop: "40px" }}>
            <PianoLegend currentTonic={5} />
          </div>
        )}
      </>
    );
  };

  return (
    <BookContainer>
      <div style={{ position: "relative" }}>
        <Title>Visual Harmony of Top 100 Composers on MuseScore.com</Title>
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
                ) : chapter.titleChords ? (
                  <ChordStairs
                    mode={{ title: "", chords: chapter.titleChords }}
                    hideLabels={true}
                    scale={0.5}
                  />
                ) : (
                  chapter.title
                )}
                {!["Intro", "Misc", "About"].includes(chapter.title) && (
                  <ChapterTitleTooltip
                    isSelected={selectedChapter === chapter.title}
                    isHovered={hoveredChapter === chapter.title}
                  >
                    {chapter.title}
                  </ChapterTitleTooltip>
                )}
                {(selectedChapter === chapter.title ||
                  hoveredChapter === chapter.title) && (
                  <SelectionArrow
                    isHovered={hoveredChapter === chapter.title}
                    isSelected={selectedChapter === chapter.title}
                  />
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
