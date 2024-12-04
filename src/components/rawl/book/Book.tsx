import * as React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { AppContext } from "../../AppContext";
import { NewTonicSymbol } from "../AnalysisGrid";
import ChordStairs, { Chord } from "../ChordStairs";
import { PianoLegend } from "../PianoLegend";
import SnippetList from "../SnippetList";
import { Snippet } from "../analysis";
import { TOP_100_COMPOSERS } from "../top100Composers";
import IntroText from "./IntroText";

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

const BookContainer = styled.div`
  width: 97%;
  padding: 20px;
  color: #ddd;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 30px;
`;

const ChordStairsWrapper = styled.div`
  transform: scale(0.9);
  position: sticky;
  top: 0px;
  width: fit-content;
  z-index: 1000000;
  background: black;
  float: right;
  margin-left: 20px;
  padding: 10px;
  border: 0.5px solid #666;
`;

const GroupContainer = styled.div`
  margin-bottom: 80px;
  // clear: both;
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

const MoreSection = styled.div`
  color: #999;
  margin-bottom: 10px;
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
  gap: 12px;
  padding: 16px 0;
  margin: 20px 0;
`;

const ChapterTitleTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  padding: 4px 8px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
`;

const SelectionArrow = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid #bbb;
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
  padding: 10px 0px;
  border-radius: 0;
  box-sizing: border-box;

  ${ChapterTitleTooltip} {
    display: none;
  }

  &:hover ${ChapterTitleTooltip} {
    display: block;
  }
`;

const ChapterTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ChapterStairsWrapper = styled.div`
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

const Book: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const appContext = React.useContext(AppContext);
  if (!appContext) throw new Error("AppContext not found");
  const { analyses } = appContext;
  const [loadingSnippets, setLoadingSnippets] = React.useState<Set<string>>(
    new Set(),
  );

  // Handle snippet click with loading state
  const handleSnippetClick = async (snippet: EnhancedSnippet) => {
    const slug = snippet.composerSlug;
    setLoadingSnippets((prev) => new Set([...prev, slug]));
    try {
      await appContext.handleSongClick(slug);
      // If the snippet has secondsSpan, seek to (secondsSpan - 1) seconds
      if (snippet.secondsSpan) {
        const seekPosition = Math.max(0, (snippet.secondsSpan[0] - 1) * 1000); // Convert to milliseconds
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

  // Sort composers with order first, then the rest
  const orderedComposers = [...TOP_100_COMPOSERS].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

  // Get unique chapters
  const chapters = React.useMemo(() => {
    const uniqueChapters = new Set<string>();
    uniqueChapters.add("Intro");
    orderedComposers.forEach((composer) => {
      if (composer.chapter) {
        uniqueChapters.add(composer.chapter);
      }
    });
    uniqueChapters.add(ABOUT_SELECTION);
    return Array.from(uniqueChapters);
  }, []);

  // Find selected chapter based on slug
  const selectedChapter = React.useMemo(() => {
    if (!slug) return "Intro";
    return (
      chapters.find(
        (chapter) => getChapterSlug(chapter) === slug.toLowerCase(),
      ) || "Intro"
    );
  }, [slug, chapters]);

  // Handle chapter selection
  const handleChapterSelect = (chapter: string) => {
    const newSlug = getChapterSlug(chapter);
    history.push(`/100/${newSlug}`);
  };

  // Redirect from root to /100/intro
  if (!slug) {
    return <Redirect to="/100/intro" />;
  }

  // Group composers by chapters
  const composerGroups = orderedComposers.reduce<
    Array<typeof TOP_100_COMPOSERS>
  >((acc, composer) => {
    if (composer.chapter || acc.length === 0) {
      acc.push([composer]);
    } else {
      acc[acc.length - 1].push(composer);
    }
    return acc;
  }, []);

  const getChapterTitleChords = (chapter: string): Chord[] | undefined => {
    const composerWithChapter = TOP_100_COMPOSERS.find(
      (composer) => composer.chapter === chapter && composer.titleChords,
    );
    return composerWithChapter?.titleChords;
  };

  const renderContent = () => {
    if (selectedChapter === ABOUT_SELECTION) {
      return (
        <div style={{ marginTop: "50px" }}>
          <IntroText />
        </div>
      );
    }

    const filteredGroups = composerGroups.filter(
      (group) => group[0].chapter === selectedChapter,
    );

    return (
      <>
        {filteredGroups.map((group, groupIndex) => {
          return (
            <div key={`group-${groupIndex}`} style={{ marginTop: "40px" }}>
              <ChapterTitle>{selectedChapter}</ChapterTitle>
              {group[0].mode && (
                <ChordStairsWrapper>
                  <ChordStairs
                    mode={group[0].mode}
                    {...(selectedChapter === "Intro"
                      ? { currentTonic: 5 }
                      : {})}
                  />
                </ChordStairsWrapper>
              )}
              <GroupContainer>
                <ComposersGrid>
                  {group
                    .filter(
                      (item) =>
                        analyses[`f/${item.slug}`]?.snippets?.some(
                          (s) => s.tag === "book:index",
                        ),
                    )
                    .map((item) => {
                      const { slug, composer, displayTitle } = item;
                      const snippets = (
                        analyses[`f/${item.slug}`]?.snippets || []
                      )
                        .filter((snippet) => snippet.tag === "book:index")
                        .map((snippet) => ({ ...snippet, composerSlug: slug }));

                      return (
                        <ComposerItem key={slug}>
                          <ComposerWrapper>
                            <ComposerLink
                              href={`/f/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ComposerTitle
                                composer={composer}
                                displayTitle={displayTitle}
                              />
                            </ComposerLink>
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

                {group.filter(
                  (item) =>
                    !analyses[`f/${item.slug}`]?.snippets?.some(
                      (s) => s.tag === "book:index",
                    ),
                ).length > 0 && (
                  <>
                    <MoreSection>More:</MoreSection>
                    <ComposerList>
                      {group
                        .filter(
                          (item) =>
                            !analyses[`f/${item.slug}`]?.snippets?.some(
                              (s) => s.tag === "book:index",
                            ),
                        )
                        .map(({ slug, composer, displayTitle }) => (
                          <ComposerListItem key={slug}>
                            <ComposerLink
                              href={`/f/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <ComposerTitle
                                composer={composer}
                                displayTitle={displayTitle}
                              />
                            </ComposerLink>
                          </ComposerListItem>
                        ))}
                    </ComposerList>
                  </>
                )}
              </GroupContainer>
            </div>
          );
        })}
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
          {chapters.map((chapter) => {
            const titleChords = getChapterTitleChords(chapter);
            return (
              <ChapterButton
                key={chapter}
                isSelected={selectedChapter === chapter}
                onClick={() => handleChapterSelect(chapter)}
              >
                <ChapterStairsWrapper>
                  {chapter === "Modulations" ? (
                    <div
                      style={{
                        position: "relative",
                        width: "80px",
                        height: "45px",
                      }}
                    >
                      <div style={{ position: "absolute", top: "-5px" }}>
                        <NewTonicSymbol
                          left={0}
                          number={1}
                          previousTonic={0}
                          modulationDiff={5}
                          tonicStart={5}
                        />
                      </div>
                      <div style={{ position: "absolute", top: "10px" }}>
                        <NewTonicSymbol
                          left={0}
                          number={1}
                          previousTonic={0}
                          modulationDiff={3}
                          tonicStart={3}
                        />
                      </div>
                      <div style={{ position: "absolute", top: "25px" }}>
                        <NewTonicSymbol
                          left={0}
                          number={1}
                          previousTonic={0}
                          modulationDiff={9}
                          tonicStart={9}
                        />
                      </div>
                      <div style={{ position: "absolute", top: "40px" }}>
                        <NewTonicSymbol
                          left={0}
                          number={1}
                          previousTonic={0}
                          modulationDiff={7}
                          tonicStart={7}
                        />
                      </div>
                    </div>
                  ) : titleChords ? (
                    <ChordStairs
                      mode={{ title: "", chords: titleChords }}
                      hideLabels={true}
                      scale={0.5}
                    />
                  ) : (
                    chapter
                  )}
                  {!["Misc", "About"].includes(chapter) && (
                    <ChapterTitleTooltip>{chapter}</ChapterTitleTooltip>
                  )}
                  {selectedChapter === chapter && <SelectionArrow />}
                </ChapterStairsWrapper>
              </ChapterButton>
            );
          })}
        </ChapterSelector>

        {renderContent()}
      </div>
    </BookContainer>
  );
};

export default Book;
