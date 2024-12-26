import { faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { Redirect, useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import { slugify } from "transliteration";
import { AppContext } from "../../AppContext";
import { Snippet } from "../analysis";
import { NewTonicSymbol } from "../AnalysisGrid";
import { MUSESCORE_TOP_100_SLUG } from "../corpora/corpora";
import { CorpusLink } from "../corpora/CorpusLink";
import ChordStairs from "../legends/ChordStairs";
import { FoldablePianoLegend } from "../legends/PianoLegend";
import SnippetList from "../SnippetList";
import { NARRATIVES } from "../SongNarrative";
import { TOP_100_COMPOSERS } from "../top100Composers";
import {
  CHAPTER_GROUPS,
  CHAPTERS,
  DOUBLE_TONIC_CHAPTER_TITLE,
  MODULATIONS_CHAPTER_TITLE,
} from "./chapters";

const NAV_HORIZONTAL_GAP = 15;
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
  color: ${(props) => (props.isSelected ? "white" : "#aaa")};
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
  overflow: visible;

  ${ChapterTitleTooltip} {
    position: absolute;
    top: 60px;
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

export const ReadableTextBlock = styled.div`
  min-width: 43em;
  width: 43em;
  color: white;
  border-radius: 10px;
  margin: 20px 0px 100px 0px;
  position: relative;
`;

const ComposerListColumn = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5em 3em;
  font-size: 13px;
  align-items: start;
  align-content: flex-start;
  justify-content: start;
  min-width: 15em;
`;

const TwoColumnLayout = styled.div`
  display: flex;
  gap: 10em;
  margin: 0px 0px 100px 0px;
  min-width: 43em;

  @media (max-width: ${43 + 10 + 15}em) {
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
    <span style={{ color: "white" }}>
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
}> = ({ composer, onLinkClick, showNarrativeIcon = false }) => (
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
    padding-bottom: 12px;
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

const Book: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const history = useHistory();
  const appContext = React.useContext(AppContext);
  const [hoveredChapter, setHoveredChapter] = React.useState<string | null>(
    null,
  );
  const [hoveredComposerSlug, setHoveredComposerSlug] =
    React.useState<string>("happy-birthday");

  React.useEffect(() => {
    if (appContext.currentMidi?.slug) {
      setHoveredComposerSlug(appContext.currentMidi.slug);
    }
  }, [appContext.currentMidi?.slug]);

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
    eject(); // Add this line to eject MIDI before changing chapters
    const newSlug = getChapterSlug(chapter);
    history.push(`/100/${newSlug}`);
  };

  const renderContent = () => {
    const currentChapter = CHAPTERS.find(
      (chapter) => chapter.title === selectedChapter,
    );
    if (!currentChapter) return null;

    return (
      <>
        <div style={{ marginTop: "40px" }}>
          <FoldablePianoLegend mode={currentChapter.mode} />
          {currentChapter.pretext &&
            (currentChapter.title === "Intro" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0px",
                }}
              >
                <div>
                  <div style={{ marginBottom: "10px" }}>
                    <ComposerTitle
                      composer={
                        TOP_100_COMPOSERS.find(
                          (c) => c.slug === hoveredComposerSlug,
                        )?.composer || ""
                      }
                      displayTitle={
                        TOP_100_COMPOSERS.find(
                          (c) => c.slug === hoveredComposerSlug,
                        )?.displayTitle || ""
                      }
                    />
                  </div>
                  <div style={{ minHeight: "235px" }}>
                    <SnippetList
                      snippets={[
                        analyses[`f/${hoveredComposerSlug}`]?.snippets
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
                          setHoveredComposerSlug(
                            appContext.currentMidi?.slug || "happy-birthday",
                          )
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
                              .filter((s) => s.tag === "book:index")
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
              <ReadableTextBlock>{currentChapter.pretext()}</ReadableTextBlock>
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
        <Title>Visual Harmony of Top 100 Composers on MuseScore.com</Title>
        <ChapterSelector>
          {Object.entries(CHAPTER_GROUPS).map(
            ([name, [startIndex, endIndex]]) => {
              const groupChapters = CHAPTERS.slice(startIndex - 1, endIndex);
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
                                scale={NAV_CHORD_STAIRS_SCALE}
                                playbackMode="no"
                              />
                              <span style={{ margin: 3, fontSize: "28px" }}>
                                =
                              </span>
                              <ChordStairs
                                mode={{ title: "", chords: ["i"] }}
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
                              scale={NAV_CHORD_STAIRS_SCALE}
                              playbackMode="no"
                            />
                          ) : (
                            chapter.title
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
