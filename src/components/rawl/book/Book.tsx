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
        <h1>Visual Harmony of Top 100 Composers on MuseScore.com</h1>
        <div
          style={{
            marginTop: "70px",
            marginBottom: "70px",
            marginLeft: "0px",
            transform: "scale(0.9)",
          }}
        >
          <PianoLegend inline={false} />
        </div>

        {composerGroups.map((group, groupIndex) => {
          return (
            <div key={`group-${groupIndex}`}>
              <div
                style={{
                  marginBottom: "10px",
                  marginTop: "50px",
                  marginLeft: "0px",
                  transform: "scale(0.9)",
                }}
              >
                {group[0].mode && <ChordStairs mode={group[0].mode} />}
              </div>
              <div
                style={{
                  marginBottom: "80px",
                }}
              >
                {group[0].chapter && (
                  <h2 style={{ margin: "0 0 10px 0" }}>{group[0].chapter}</h2>
                )}

                {/* First show titles with snippets */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "40px",
                    marginBottom: "30px",
                  }}
                >
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
                        <div
                          key={slug}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={{
                              transition: "all 0.3s ease",
                              textShadow:
                                hoveredSlug === slug
                                  ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
                                  : "none",
                              padding: "4px 0px",
                              borderRadius: "4px",
                              backgroundColor:
                                hoveredSlug === slug
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "transparent",
                            }}
                          >
                            <a
                              href={`/f/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: hoveredSlug === slug ? "#fff" : "white",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ComposerTitle
                                composer={composer}
                                displayTitle={displayTitle}
                              />
                            </a>
                          </div>
                          <div
                            style={{
                              marginTop: "200px",
                              marginBottom: "200px",
                            }}
                          >
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
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Then show remaining titles */}
                {group.filter(
                  (item) =>
                    !analyses[`f/${item.slug}`]?.snippets?.some(
                      (s) => s.tag === "book:index",
                    ),
                ).length > 0 && (
                  <>
                    <div style={{ color: "#999", marginBottom: "10px" }}>
                      More:
                    </div>
                    <ul
                      style={{
                        listStyle: "none",
                        paddingLeft: "0",
                        margin: "0",
                      }}
                    >
                      {group
                        .filter(
                          (item) =>
                            !analyses[`f/${item.slug}`]?.snippets?.some(
                              (s) => s.tag === "book:index",
                            ),
                        )
                        .map(({ slug, composer, displayTitle }) => (
                          <li
                            key={slug}
                            style={{
                              marginLeft: "0",
                              whiteSpace: "nowrap",
                              transition: "all 0.3s ease",
                              textShadow:
                                hoveredSlug === slug
                                  ? "0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)"
                                  : "none",
                              padding: "4px 0px",
                              borderRadius: "4px",
                              backgroundColor:
                                hoveredSlug === slug
                                  ? "rgba(255, 255, 255, 0.1)"
                                  : "transparent",
                            }}
                          >
                            <a
                              href={`/f/${slug}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: hoveredSlug === slug ? "#fff" : "white",
                                textDecoration: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ComposerTitle
                                composer={composer}
                                displayTitle={displayTitle}
                              />
                            </a>
                          </li>
                        ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <IntroText />
      </div>
    </BookContainer>
  );
};

export default Book;
