import * as React from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
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

const ChapterButton = styled.button<{ isSelected: boolean }>`
  background: black;
  color: ${(props) => (props.isSelected ? "black" : "white")};
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  box-shadow: ${(props) => (props.isSelected ? "0 0 0px 0.5px #999" : "none")};

  &:hover {
    box-shadow: 0 0 0px 0.5px #999;
  }
`;

const ChapterTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
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

const Book = () => {
  const appContext = React.useContext(AppContext);
  if (!appContext) throw new Error("AppContext not found");
  const { analyses } = appContext;
  const [loadingSnippets, setLoadingSnippets] = React.useState<Set<string>>(
    new Set(),
  );
  const [selectedChapter, setSelectedChapter] = React.useState<string>("Intro");

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
    // Add "Intro" as the first chapter
    uniqueChapters.add("Intro");
    orderedComposers.forEach((composer) => {
      if (composer.chapter) {
        uniqueChapters.add(composer.chapter);
      }
    });
    uniqueChapters.add("About This Selection");
    return Array.from(uniqueChapters);
  }, []);

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
    if (selectedChapter === "About This Selection") {
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
          const titleChords = getChapterTitleChords(selectedChapter);

          return (
            <div key={`group-${groupIndex}`}>
              <ChapterTitle>
                {selectedChapter}
                {titleChords && (
                  <ChordStairs
                    mode={{ title: "", chords: titleChords }}
                    hideLabels={true}
                    scale={0.5}
                  />
                )}
              </ChapterTitle>
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
                onClick={() => setSelectedChapter(chapter)}
              >
                {titleChords ? (
                  <div
                    style={{
                      backgroundColor: "black",
                      margin: "0 0 10 0",
                    }}
                  >
                    <ChordStairs
                      mode={{ title: "", chords: titleChords }}
                      hideLabels={true}
                      scale={0.5}
                    />
                  </div>
                ) : (
                  chapter
                )}
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
