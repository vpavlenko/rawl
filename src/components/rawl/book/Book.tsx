import {
  faClockRotateLeft,
  faGlobe,
  faHouse,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useState } from "react";
import { Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { AppContext } from "../../AppContext";
import { Snippet } from "../analysis";
import { NewTonicSymbol } from "../AnalysisGrid";
import { RelatedCorporaDisplay } from "../CompositionTitle";
import { MUSESCORE_TOP_100_SLUG } from "../corpora/corpora";
import { CorpusLink } from "../corpora/CorpusLink";
import ChordStairs from "../legends/ChordStairs";
import { FoldablePianoLegend } from "../legends/PianoLegend";
import SnippetList from "../SnippetList";
import { NARRATIVES } from "../SongNarrative";
import { Toggle } from "../Toggle";
import { TOP_100_COMPOSERS } from "../top100Composers";
import { BEYOND_CHAPTER_GROUPS, BEYOND_CHAPTERS } from "./beyondChapters";
import {
  CHAPTER_GROUPS,
  CHAPTERS,
  DOUBLE_TONIC_CHAPTER_TITLE,
  MODULATIONS_CHAPTER_TITLE,
  s,
} from "./chapters";

const NAV_HORIZONTAL_GAP = 15;
const NAV_CHORD_STAIRS_SCALE = 0.6;

type EnhancedSnippet = Snippet & {
  composerSlug: string;
};

const BookContainer = styled.div`
  width: 97%;
  padding: 20px;
  color: #fff;
  margin: 0 auto 100px auto;
  position: relative;
`;

const Title = styled.h1`
  font-size: 24px;
  color: #fff;
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
  color: #fff;
  text-decoration: none;
  cursor: pointer;
  display: inline;
`;

const ComposerWrapper = styled.div`
  transition: all 0.3s ease;
  padding: 4px 0px;
  border-radius: 4px;
`;

const SnippetContainer = styled.div`
  margin: 0px 30px 30px 0px;
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
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px ${NAV_HORIZONTAL_GAP}px;
  padding: 0;
  margin: 0;
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
  height: 70px;

  ${ChapterTitleTooltip} {
    position: absolute;
    top: 48px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 22px;
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
  height: 48px;
  flex-shrink: 0;
  width: 100%;
`;

export const ReadableTextBlock = styled.div`
  min-width: 43em;
  width: 43em;
  color: #fff;
  border-radius: 10px;
  margin: 20px 0px 100px 0px;
  position: relative;
`;

const ChapterReading = styled(ReadableTextBlock).attrs({
  "data-chapter-reading": true,
})`
  display: flow-root;
  min-width: 0;
  width: 100%;
  max-width: 700px;
  margin: 32px auto 64px;
  font-size: 17px;
  line-height: 1.75;

  & > * {
    max-width: 700px;
  }

  && h2 {
    margin: 52px 0 18px;
    font-size: 27px;
    font-weight: 500;
    line-height: 1.25;
  }

  && > h2:first-child,
  && > [data-authorship] + h2 {
    margin-top: 0;
  }

  ul {
    padding-left: 1.25em;
  }

  li + li {
    margin-top: 12px;
  }

  @media (min-width: 1200px) {
    padding-bottom: var(--chapter-gutter-space, 0px);
    &:has(.chapter-example-row) {
      max-width: 1120px;
    }

    & > .chapter-example-row {
      max-width: none;
    }
  }
`;

const ChapterNarrative: React.FC = ({ children }) => {
  const readingRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    const reading = readingRef.current;
    if (!reading) return;
    const desktop = window.matchMedia("(min-width: 1200px)");
    const rows = Array.from(
      reading.querySelectorAll<HTMLElement>(".chapter-example-row"),
    );
    const gutters = rows.map((row) => row.children[1] as HTMLElement);
    let frame = 0;

    const setLength = (element: HTMLElement, name: string, value: number) => {
      const length = `${Math.ceil(value)}px`;
      if (element.style.getPropertyValue(name) !== length) {
        element.style.setProperty(name, length);
      }
    };

    const positionGutters = () => {
      if (!desktop.matches) {
        gutters.forEach((gutter) => {
          gutter.style.removeProperty("--gutter-offset");
          gutter.style.removeProperty("--gutter-column-offset");
        });
        reading.style.removeProperty("--gutter-width");
        reading.style.removeProperty("--chapter-gutter-space");
        return;
      }

      const readingBounds = reading.getBoundingClientRect();
      const readingTop = readingBounds.top;
      // Use the available right margin, keeping a page-edge inset.
      const gutterWidth = Math.max(0,
        document.documentElement.clientWidth - readingBounds.left - 756 - 32,
      );
      setLength(reading, "--gutter-width", Math.floor(gutterWidth));
      const occupied: { left: number; top: number; right: number; bottom: number }[] = [];
      let gutterBottom = 0;
      rows.forEach((row, index) => {
        const gutter = gutters[index];
        const rowTop = row.getBoundingClientRect().top - readingTop;
        const { width, height } = gutter.getBoundingClientRect();
        const tops = [rowTop, ...occupied.map((box) => box.bottom + 24)]
          .filter((top) => top >= rowTop).sort((a, b) => a - b);
        const lefts = [0, ...occupied.map((box) => box.right + 24)]
          .sort((a, b) => a - b);
        let placement = { left: 0, top: Math.max(rowTop, gutterBottom + 24) };
        // Fill free horizontal space before pushing a group farther down.
        findSpace: for (const top of tops) {
          for (const left of lefts) {
            if (left + width > gutterWidth + 1) continue;
            const overlaps = occupied.some((box) =>
              left < box.right + 24 && left + width + 24 > box.left &&
              top < box.bottom + 24 && top + height + 24 > box.top,
            );
            if (!overlaps) {
              placement = { left, top };
              break findSpace;
            }
          }
        }
        setLength(gutter, "--gutter-column-offset", placement.left);
        setLength(gutter, "--gutter-offset", placement.top - rowTop);
        const bottom = placement.top + height;
        occupied.push({ ...placement, right: placement.left + width, bottom });
        gutterBottom = Math.max(gutterBottom, bottom);
      });

      // Reserve space only at the chapter's end, never between paragraphs.
      const proseHeight = reading.getBoundingClientRect().height -
        parseFloat(getComputedStyle(reading).paddingBottom);
      setLength(reading, "--chapter-gutter-space", Math.max(0, gutterBottom - proseHeight));
    };
    const scheduleLayout = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(positionGutters);
    };
    const observer = new ResizeObserver(scheduleLayout);
    observer.observe(reading);
    Array.from(reading.children).forEach((child) => observer.observe(child));
    gutters.forEach((gutter) => observer.observe(gutter));
    desktop.addEventListener("change", scheduleLayout);
    window.addEventListener("resize", scheduleLayout);
    positionGutters();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      desktop.removeEventListener("change", scheduleLayout);
      window.removeEventListener("resize", scheduleLayout);
    };
  }, []);

  return <ChapterReading ref={readingRef}>{children}</ChapterReading>;
};

const ComposerListColumn = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0 3em;
  font-size: 13px;
  align-items: start;
  align-content: flex-start;
  justify-content: start;
  min-width: 15em;
`;

const TwoColumnLayout = styled.div`
  display: flex;
  gap: 3em;
  margin: 0px 0px 100px 0px;
  min-width: 43em;

  @media (max-width: ${43 + 10 + 3}em) {
    ${ComposerListColumn} {
      display: none;
    }
  }
`;

export const ComposerTitle: React.FC<{
  composer: string;
  displayTitle: string;
  isVocal?: boolean;
  style?: React.CSSProperties;
}> = ({ composer, displayTitle, isVocal, style }) => (
  <span style={style}>
    <span style={{ color: "#999" }}>{composer}. </span>
    <span style={{ color: "#fff" }}>
      {displayTitle}
      {/* {isVocal && <span style={{ marginLeft: "4px" }}>🎤</span>} */}
    </span>
  </span>
);

const getChapterSlug = (chapter: string) => slugify(chapter.toLowerCase());

export const CompositionLink: React.FC<{
  composer: (typeof TOP_100_COMPOSERS)[number];
  onLinkClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  showNarrativeIcon?: boolean;
}> = ({ composer, onLinkClick, showNarrativeIcon = false }) => {
  return (
    <ComposerLink
      href={`/f/${composer.slug}`}
      target="_blank"
      rel="noreferrer"
      onClick={onLinkClick}
    >
      <ComposerTitle
        composer={composer.composer}
        displayTitle={composer.displayTitle}
        isVocal={composer.isVocal}
      />
      {showNarrativeIcon && NARRATIVES[composer.slug] && (
        <span style={{ marginLeft: "12px", color: "#999" }}>
          💬 {NARRATIVES[composer.slug].qa.length}
        </span>
      )}
    </ComposerLink>
  );
};

const ChapterGroup = styled.div<{ isActive: boolean; hideHeader?: boolean }>`
  display: inline-flex;
  flex-direction: column;
  width: fit-content;
  min-width: min-content;
  overflow: visible;

  .group-header {
    white-space: nowrap;
    text-align: center;
    color: ${(props) => (props.isActive ? "#fff" : "#666")};
    font-size: 14px;
    padding-bottom: 10px;
    position: relative;
    transition: color 0.3s ease;
    width: 100%;
    overflow: visible;
    visibility: ${(props) => (props.hideHeader ? "hidden" : "visible")};

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      border-top: 1px solid ${(props) => (props.isActive ? "#fff" : "#666")};
      border-left: 1px solid ${(props) => (props.isActive ? "#fff" : "#666")};
      border-right: 1px solid ${(props) => (props.isActive ? "#fff" : "#666")};
      transition: border-color 0.3s ease;
      visibility: ${(props) => (props.hideHeader ? "hidden" : "visible")};
    }
  }

  .group-content {
    display: flex;
    flex-wrap: nowrap;
    gap: ${NAV_HORIZONTAL_GAP}px;
    overflow: visible;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

const findChapterForComposer = (
  composerSlug: string,
  chapters: typeof CHAPTERS,
): string | null => {
  return (
    chapters.find((chapter) => chapter.composers.includes(composerSlug))
      ?.title ?? null
  );
};

const ChapterArrow = styled.div`
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 1px;
  height: 20px;
  background: #666;
  pointer-events: none;

  &::after {
    content: "";
    position: absolute;
    top: 0%;
    left: 50%;
    transform: translateX(-50%);
    border-left: 3px solid transparent;
    border-right: 3px solid transparent;
    border-bottom: 4px solid #666;
  }
`;

const ModeToggle = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
`;

const Book: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const location = useLocation();
  const appContext = React.useContext(AppContext);
  const [hoveredChapter, setHoveredChapter] = React.useState<string | null>(
    null,
  );
  const [hoveredComposerSlug, setHoveredComposerSlug] =
    React.useState<string>("happy-birthday");
  const [hoveredColors, setHoveredColors] = useState<string[] | null>(null);
  const [isBeyondMode, setIsBeyondMode] = useState(() =>
    location.pathname.startsWith("/beyond"),
  );

  // Keep mode in sync with URL
  React.useEffect(() => {
    const shouldBeBeyondMode = location.pathname.startsWith("/beyond");
    if (shouldBeBeyondMode !== isBeyondMode) {
      setIsBeyondMode(shouldBeBeyondMode);
    }
  }, [location.pathname, isBeyondMode]);

  const currentComposerSlug =
    TOP_100_COMPOSERS.find(
      (composer) => composer.slug === appContext.currentMidi?.slug,
    )?.slug || "happy-birthday";

  React.useEffect(() => {
    setHoveredComposerSlug(currentComposerSlug);
  }, [currentComposerSlug]);

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

  // Get chapters and groups based on mode
  const currentChapters = isBeyondMode ? BEYOND_CHAPTERS : CHAPTERS;
  const currentChapterGroups = isBeyondMode
    ? BEYOND_CHAPTER_GROUPS
    : CHAPTER_GROUPS;

  // Get unique chapter titles
  const chapterTitles = React.useMemo(() => {
    return currentChapters.map((chapter) => chapter.title);
  }, [currentChapters]);

  // Find selected chapter based on slug
  const selectedChapter = React.useMemo(() => {
    if (!slug) return "Intro";
    return (
      chapterTitles.find(
        (chapter) => getChapterSlug(chapter) === slug.toLowerCase(),
      ) || "Intro"
    );
  }, [slug, chapterTitles]);

  const hoveredComposerChapter = React.useMemo(() => {
    return findChapterForComposer(hoveredComposerSlug, currentChapters);
  }, [hoveredComposerSlug, currentChapters]);

  // Redirect from root to /100/intro or /beyond/blues
  if (!slug) {
    const firstBeyondChapter = BEYOND_CHAPTERS[0]?.title || "intro";
    return (
      <Redirect
        to={
          isBeyondMode
            ? `/beyond/${slugify(firstBeyondChapter.toLowerCase())}`
            : "/100/intro"
        }
      />
    );
  }

  // Handle chapter selection
  const handleChapterSelect = (chapter: string) => {
    eject(); // Add this line to eject MIDI before changing chapters
    const newSlug = getChapterSlug(chapter);
    history.push(`/${isBeyondMode ? "beyond" : "100"}/${newSlug}`);
  };

  // Add mode toggle handler
  const handleModeToggle = () => {
    eject();
    setIsBeyondMode((prev) => !prev);
    const firstBeyondChapter = BEYOND_CHAPTERS[0]?.title || "intro";
    history.push(
      `/${!isBeyondMode ? "beyond" : "100"}/${
        !isBeyondMode ? slugify(firstBeyondChapter.toLowerCase()) : "intro"
      }`,
    );
  };

  const renderContent = () => {
    const currentChapter = currentChapters.find(
      (chapter) => chapter.title === selectedChapter,
    );
    if (!currentChapter) return null;

    const hoveredSnippets =
      analyses[`f/${hoveredComposerSlug}`]?.snippets ?? [];
    const currentSnippet = hoveredSnippets.find(
      (s) => s.tag === "book:index",
    );
    const initialTonic =
      currentSnippet?.frozenNotes.analysis.modulations[1] ?? 0;

    return (
      <>
        <div style={{ marginTop: currentChapter.title === "Intro" ? "40px" : "24px" }}>
          <FoldablePianoLegend
            mode={currentChapter.mode}
            setHoveredColors={setHoveredColors}
            currentTonic={initialTonic}
          />
          {currentChapter.pretext &&
            (currentChapter.title === "Intro" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <CompositionLink
                  composer={TOP_100_COMPOSERS.find(
                    (c) => c.slug === hoveredComposerSlug,
                  )}
                  onLinkClick={handleComposerLinkClick}
                />

                <div
                  style={{
                    display: "flex",
                    gap: "20px",
                    flexDirection: "row",
                  }}
                >
                  <div
                    style={{
                      minHeight: "310px",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <SnippetList
                      snippets={[
                        hoveredSnippets
                          .filter((snippet) => snippet.tag === "book:index")
                          .pop(),
                      ]
                        .filter(Boolean)
                        .map((snippet) => ({
                          ...snippet,
                          composerSlug: hoveredComposerSlug,
                        }))}
                      onSnippetClick={handleSnippetClick}
                      loadingSnippets={loadingSnippets}
                      isPreview={true}
                      noteHeight={3}
                      hoveredColors={hoveredColors}
                    />
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        flexDirection: "row",
                        gap: "50px",
                      }}
                    >
                      {analyses[`f/${hoveredComposerSlug}`]?.tags && (
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            gap: "5px",
                            position: "relative",
                            top: "-3px",
                          }}
                        >
                          {hoveredSnippets
                            .filter(
                              (snippet: Snippet, index: number) =>
                                snippet.tag !== "book:index" &&
                                !snippet.tag.startsWith("last_chords"),
                            )
                            .slice(0, 7)
                            .map((snippet: Snippet, index: number) => (
                              <div style={{ marginRight: "20px" }} key={index}>
                                {s([snippet.tag] as any)}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                    <RelatedCorporaDisplay
                      slug={hoveredComposerSlug}
                      horizontal={true}
                      showMetadata={false}
                    />
                  </div>
                </div>
                <TwoColumnLayout>
                  <ReadableTextBlock>
                    {currentChapter.pretext()}
                    <GroupContainer>
                      <ComposersGrid>
                        <ComposerWrapper>
                          <CompositionLink
                            composer={TOP_100_COMPOSERS.find(
                              (c) => c.slug === "happy-birthday",
                            )}
                            onLinkClick={handleComposerLinkClick}
                            showNarrativeIcon={true}
                          />
                        </ComposerWrapper>
                      </ComposersGrid>
                    </GroupContainer>
                  </ReadableTextBlock>
                  <ComposerListColumn>
                    <div style={{ width: "100%", marginBottom: "1em" }}>
                      <CorpusLink slug={MUSESCORE_TOP_100_SLUG} />
                    </div>
                    {TOP_100_COMPOSERS.slice(0, 100).map((composer) => (
                      <div
                        key={composer.slug}
                        onMouseEnter={() =>
                          setHoveredComposerSlug(composer.slug)
                        }
                        onMouseLeave={() =>
                          setHoveredComposerSlug(currentComposerSlug)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <CompositionLink
                          composer={composer}
                          onLinkClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const snippet = analyses[
                              `f/${composer.slug}`
                            ]?.snippets
                              ?.filter((s) => s.tag === "book:index")
                              .pop();
                            if (snippet) {
                              handleSnippetClick({
                                ...snippet,
                                composerSlug: composer.slug,
                              });
                            }
                          }}
                        />
                      </div>
                    ))}
                  </ComposerListColumn>
                </TwoColumnLayout>
              </div>
            ) : (
              <ChapterNarrative key={currentChapter.title}>
                {currentChapter.pretext()}
              </ChapterNarrative>
            ))}
          {currentChapter.title !== "Intro" && (
            <GroupContainer>
              <ComposersGrid>
                {currentChapter.composers
                  .map((slug) => TOP_100_COMPOSERS.find((c) => c.slug === slug))
                  .filter(
                    (
                      composer,
                    ): composer is (typeof TOP_100_COMPOSERS)[number] =>
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
                          <CompositionLink
                            composer={composer}
                            onLinkClick={handleComposerLinkClick}
                            showNarrativeIcon={true}
                          />
                        </ComposerWrapper>
                        {snippets.map((snippet) => (
                          <SnippetContainer>
                            <SnippetList
                              snippets={[snippet]}
                              onSnippetClick={handleSnippetClick}
                              loadingSnippets={loadingSnippets}
                              isPreview={true}
                              noteHeight={3}
                              hoveredColors={hoveredColors}
                            />
                          </SnippetContainer>
                        ))}
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
                          <CompositionLink
                            composer={composer}
                            onLinkClick={handleComposerLinkClick}
                          />
                        </ComposerListItem>
                      ))}
                  </ComposerList>
                </>
              )}
            </GroupContainer>
          )}
        </div>
      </>
    );
  };

  return (
    <BookContainer>
      <div className="Book" style={{ position: "relative" }}>
        <Title>
          {isBeyondMode
            ? "Visual Harmony Beyond the Top 100"
            : "Visual Harmony of Top 100 Composers on MuseScore.com"}
        </Title>
        <ModeToggle>
          <Toggle
            leftIcon={faHouse}
            rightIcon={faGlobe}
            isRight={isBeyondMode}
            onToggle={handleModeToggle}
            leftTitle="Top 100 Composers"
            rightTitle="Beyond Top 100"
          />
        </ModeToggle>
        <ChapterSelector>
          {Object.entries(currentChapterGroups).map(
            ([name, [startIndex, endIndex]]) => {
              const groupChapters = currentChapters.slice(
                startIndex - 1,
                endIndex,
              );
              const isActive = groupChapters.some(
                (chapter) => chapter.title === selectedChapter,
              );
              const hideHeader =
                name.toLowerCase() === "intro" ||
                name.toLowerCase() === "style";

              return (
                <ChapterGroup
                  key={name}
                  isActive={isActive}
                  hideHeader={hideHeader}
                >
                  <div className="group-header">{name}</div>
                  <div className="group-content">
                    {groupChapters.map((chapter) => (
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
                                  width: "65px",
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
                                  width: "65px",
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
                                register="narrative"
                                scale={NAV_CHORD_STAIRS_SCALE}
                                playbackMode="no"
                              />
                              <span style={{ margin: 3, fontSize: "28px" }}>
                                =
                              </span>
                              <ChordStairs
                                mode={{ title: "", chords: ["i"] }}
                                register="narrative"
                                scale={NAV_CHORD_STAIRS_SCALE}
                                playbackMode="no"
                              />
                            </>
                          ) : chapter.title === "Style" ? (
                            <FontAwesomeIcon
                              icon={faClockRotateLeft}
                              style={{ fontSize: "20px", color: "white" }}
                            />
                          ) : chapter.titleChords ? (
                            <ChordStairs
                              mode={{ title: "", chords: chapter.titleChords }}
                              register={
                                chapter.title === "Circle of fifths"
                                  ? "circle"
                                  : "narrative"
                              }
                              scale={NAV_CHORD_STAIRS_SCALE}
                              playbackMode="no"
                            />
                          ) : (
                            chapter.title
                          )}
                        </NavChordWrapper>
                        <ChapterTitleTooltip
                          isSelected={selectedChapter === chapter.title}
                          isHovered={
                            hoveredChapter === chapter.title ||
                            (hoveredComposerChapter === chapter.title &&
                              selectedChapter === "Intro" &&
                              hoveredComposerChapter !== "Intro")
                          }
                        >
                          {chapter.title}
                        </ChapterTitleTooltip>
                        {hoveredComposerChapter === chapter.title &&
                          selectedChapter === "Intro" &&
                          hoveredComposerChapter !== "Intro" && (
                            <ChapterArrow />
                          )}
                      </ChapterButton>
                    ))}
                  </div>
                </ChapterGroup>
              );
            },
          )}
        </ChapterSelector>

        {renderContent()}
      </div>
    </BookContainer>
  );
};

export default Book;
