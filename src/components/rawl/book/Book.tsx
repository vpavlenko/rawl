import * as React from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import ChordStairs from "../ChordStairs";
import { PianoLegend } from "../PianoLegend";
import SnippetList from "../SnippetList";
import { Snippet } from "../analysis";
import { TOP_100_COMPOSERS } from "../top100Composers";
import IntroText from "./IntroText";

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

const BookContainer = styled.div`
  width: 95%;
  padding: 20px;
  color: #ddd;
  margin: 0 auto;
`;

const Title = styled.h1``;

const LegendWrapper = styled.div`
  margin-top: 70px;
  margin-bottom: 70px;
  margin-left: 0px;
  transform: scale(0.9);
`;

const ChordStairsWrapper = styled.div`
  margin-bottom: 10px;
  margin-top: 50px;
  margin-left: 0px;
  transform: scale(0.9);
`;

const GroupContainer = styled.div`
  margin-bottom: 80px;
`;

const ChapterTitle = styled.h2`
  margin: 0 0 10px 0;
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

const ComposerLink = styled.a<{ isHovered: boolean }>`
  color: ${(props) => (props.isHovered ? "#fff" : "white")};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComposerWrapper = styled.div<{ isHovered: boolean }>`
  transition: all 0.3s ease;
  text-shadow: ${(props) =>
    props.isHovered
      ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
      : "none"};
  padding: 4px 0px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.isHovered ? "rgba(255, 255, 255, 0.1)" : "transparent"};
`;

const SnippetContainer = styled.div`
  margin-top: 200px;
  margin-bottom: 200px;
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

const ComposerListItem = styled.li<{ isHovered: boolean }>`
  margin-left: 0;
  white-space: nowrap;
  transition: all 0.3s ease;
  text-shadow: ${(props) =>
    props.isHovered
      ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
      : "none"};
  padding: 4px 0px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.isHovered ? "rgba(255, 255, 255, 0.1)" : "transparent"};
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
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null);

  // Sort composers with order first, then the rest
  const orderedComposers = [...TOP_100_COMPOSERS].sort((a, b) => {
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    return 0;
  });

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

  return (
    <BookContainer>
      <div style={{ position: "relative" }}>
        <Title>Visual Harmony of Top 100 Composers on MuseScore.com</Title>
        <LegendWrapper>
          <PianoLegend inline={false} />
        </LegendWrapper>

        {composerGroups.map((group, groupIndex) => (
          <div key={`group-${groupIndex}`}>
            <ChordStairsWrapper>
              {group[0].mode && <ChordStairs mode={group[0].mode} />}
            </ChordStairsWrapper>
            <GroupContainer>
              {group[0].chapter && (
                <ChapterTitle>{group[0].chapter}</ChapterTitle>
              )}

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
                        <ComposerWrapper isHovered={hoveredSlug === slug}>
                          <ComposerLink
                            href={`/f/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            isHovered={hoveredSlug === slug}
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
                            onSnippetHover={(snippet) =>
                              setHoveredSlug(
                                snippet
                                  ? (snippet as EnhancedSnippet).composerSlug
                                  : null,
                              )
                            }
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
                        <ComposerListItem
                          key={slug}
                          isHovered={hoveredSlug === slug}
                        >
                          <ComposerLink
                            href={`/f/${slug}`}
                            target="_blank"
                            rel="noreferrer"
                            isHovered={hoveredSlug === slug}
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
        ))}
        <IntroText />
      </div>
    </BookContainer>
  );
};

export default Book;
