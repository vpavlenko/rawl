import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { ADMIN_USER_ID } from "../../annotationVersions";
import { Analysis, filterSnippetsByAccess, Snippet } from "../analysis";
import InlineRawlPlayer from "../InlineRawlPlayer";
import SnippetList from "../SnippetList";
import EXPLANATIONS from "./explanations";

const PathContainer = styled.div`
  position: relative;
  height: 100%;
  width: 100%;
  margin: 10px 0 0 0;
  padding: 0;
`;

const StructureSearch = styled.div`
  position: absolute;
  top: 0;
  right: 8px;
  z-index: 100001;
  width: 150px;

  input {
    box-sizing: border-box;
    width: 100%;
    height: 24px;
    padding: 3px 7px;
    border: 1px solid #555;
    border-radius: 4px;
    background: #111;
    color: white;
    font-size: 12px;

    &:focus {
      outline: 1px solid white;
    }
  }
`;

const SearchResults = styled.div`
  position: absolute;
  top: 28px;
  right: 0;
  width: 280px;
  max-width: calc(100vw - 16px);
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #555;
  border-radius: 4px;
  background: #111;
  color: #999;
  font-size: 12px;

  button {
    display: block;
    width: 100%;
    padding: 7px 9px;
    border: none;
    background: transparent;
    color: white;
    text-align: left;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      background: #333;
    }
  }

  p {
    margin: 9px;
  }
`;

const MenuContainer = styled.div<{ isRawlVisible?: boolean }>`
  width: 100%;
  height: ${(props) =>
    props.isRawlVisible ? "calc(50vh - 30px)" : "calc(100vh - 55px)"};
  overflow-y: auto;
  background-color: black;
  transition: height 0.3s ease-in-out;
`;

const ChapterRow = styled.div`
  display: flex;
  flex-direction: column;
  background-color: black;
  width: 100%;
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden; // Remove horizontal scrolling
  padding-top: 0; // Adjust padding to account for fixed menus
  padding-bottom: 100px; // Add padding at the bottom to avoid content being hidden behind the footer
`;

const ChapterButton = styled.button<{ active: boolean }>`
  padding: 0px 5px;
  text-align: left;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  border-radius: 4px;
  width: fit-content;
  user-select: none;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#333")};
  }
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  width: fit-content;
`;

const CategoryHeader = styled.div`
  padding-left: 5px;
  color: #999;
  font-size: 14px;
  letter-spacing: 0.5px;
  text-align: left;
  user-select: none;
`;

const ChaptersContainer = styled.div<{ twoColumns?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: fit-content;

  ${(props) =>
    props.twoColumns &&
    `
    flex-direction: row;
    gap: 0px;
    
    > div {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `}
`;

const TopicContainer = styled.div`
  padding: 0; // Remove padding since we don't need spacing between topics anymore
`;

const TopicCard = styled.div`
  background-color: #000000;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;

const HomeChapter = styled.div`
  font-size: 24px;
  color: white;
  text-align: center;
  padding: 20px;
`;

const TopicMenu = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0px 16px 16px 16px;
  background-color: black;
  position: sticky;
  top: 0;
  z-index: 100000;
`;

const TopicBubble = styled.span<{ active: boolean }>`
  cursor: pointer;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 14px;
  text-decoration: none;
  user-select: none;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#333")};
  }
`;

const TopicCount = styled.sup<{ active: boolean }>`
  margin-left: 2px;
  color: ${(props) => (props.active ? "#666" : "#999")};
  font-size: 10px;
  line-height: 0;
`;

const ChapterCategories = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  padding: 8px 172px 8px 8px;
`;

type ChapterCategories = {
  [category: string]: string[];
};

const CHAPTER_CATEGORIES: ChapterCategories = {
  order_of_chords: [
    "major_cadence",
    "progression",
    "cycle_root_motion",
    "shuttle",
    "stasis",
    "chunks",
    "minor_cadence",
    "last_chords",
  ],
  texture: [
    "bass",
    "voicing",
    "LH",
    "RH",
    "doubling",
    "arpeggio",
    "texture",
    "voice-leading",
    "interval",
    "inversion",
  ],
  melody: ["melody", "nonchord_tone", "ornament", "reharmonization"],
  chromaticism: [
    "applied",
    "6_b6",
    "chromatic_chords",
    "cto7",
    "rare_functional",
    "chord_scale",
    "b2",
    "constant_structures",
    "symmetric_chords",
    "vgm_chromatic",
  ],
  modulation: ["modulation", "relative", "parallel"],
  scale: [
    "scale",
    "dorian",
    "mixolydian",
    "modal_interchange",
    "steady_scale",
    "minor",
    "predominants",
    "pure_major",
    "root_motion",
  ],
  chord_types: [
    "chords",
    "seventh_chords",
    "V",
    "extensions",
    "ninth_chords",
    "jazz",
  ],
  rhythm_and_meter: ["meter", "rhythm", "hypermeter", "harmonic_rhythm"],
  misc: [],
};

export interface StructuresProps {
  analyses: { [key: string]: Analysis };
  initialChapter?: string;
  initialTopic?: string;
}

interface SnippetWithSlug {
  snippet: Snippet;
  slug: string;
  analysisKey: string;
  snippetIndex: number;
}

interface ChapterData {
  chapter: string;
  topics: {
    topic: string;
    snippets: SnippetWithSlug[];
  }[];
}

const formatCategoryLabel = (category: string) => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getMiscChapters = (
  chapterData: ChapterData[],
  categories: ChapterCategories,
) => {
  const allCategorizedChapters = new Set<string>();

  Object.values(categories).forEach((contents) => {
    contents.forEach((chapter) => allCategorizedChapters.add(chapter));
  });

  return chapterData.filter(
    (chapter) => !allCategorizedChapters.has(chapter.chapter),
  );
};

// Add this new component to render topic content
const TopicContent = React.memo<{
  activeTopic: string;
  activeChapter: number;
  chapterData: ChapterData[];
  snippets: { topic: string; snippets: SnippetWithSlug[] }[];
  handleSnippetClick: (
    slug: string,
    measureStart: number,
    topic: string,
    element: HTMLElement,
    snippetId: string,
  ) => void;
  loadingSnippets: Set<string>;
  onEditTag?: (snippet: SnippetWithSlug, tag: string) => Promise<void>;
  availableTags: string[];
}>(
  ({
    activeTopic,
    activeChapter,
    chapterData,
    snippets,
    handleSnippetClick,
    loadingSnippets,
    onEditTag,
    availableTags,
  }) => {
    return (
      <ScrollableContent>
        {activeTopic &&
          snippets
            .filter(({ topic }) => topic === activeTopic)
            .map(({ topic, snippets }) => {
              const fullTag = `${chapterData[activeChapter].chapter}:${topic}`;
              const explanation = EXPLANATIONS[fullTag];

              return (
                <TopicContainer key={topic}>
                  {explanation && (
                    <div
                      style={{
                        color: "white",
                        fontSize: "16px",
                        padding: "16px 16px",
                      }}
                    >
                      {explanation}
                    </div>
                  )}
                  <TopicCard>
                    <SnippetList
                      snippets={snippets.map(({ snippet }) => snippet)}
                      snippetIds={snippets.map(
                        ({ analysisKey, snippetIndex }) =>
                          `${analysisKey}:${snippetIndex}`,
                      )}
                      slugs={snippets.map(({ slug }) => {
                        return slug;
                      })}
                      onSnippetClick={(snippet, element) => {
                        const matchingSnippet = snippets.find(
                          (s) => s.snippet === snippet,
                        );
                        if (matchingSnippet) {
                          handleSnippetClick(
                            matchingSnippet.slug,
                            snippet.measuresSpan[0],
                            topic,
                            element,
                            `${matchingSnippet.analysisKey}:${matchingSnippet.snippetIndex}`,
                          );
                        }
                      }}
                      isPreview={true}
                      noteHeight={3}
                      loadingSnippets={loadingSnippets}
                      availableTags={availableTags}
                      onEditTag={
                        onEditTag &&
                        ((index, tag) => onEditTag(snippets[index], tag))
                      }
                    />
                  </TopicCard>
                </TopicContainer>
              );
            })}
      </ScrollableContent>
    );
  },
);

const Structures: React.FC<StructuresProps> = ({
  analyses,
  initialChapter,
  initialTopic,
}) => {
  const {
    handleSongClick,
    currentMidi,
    rawlProps,
    eject,
    user,
    saveFirebaseAnnotation,
  } = useContext(AppContext);
  const canEditTags =
    user?.uid === ADMIN_USER_ID && user.email === "cxielamiko@gmail.com";
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagSaveError, setTagSaveError] = useState("");
  const [selectedMeasureStart, setSelectedMeasureStart] = useState<
    number | undefined
  >(undefined);
  const [isRawlVisible, setIsRawlVisible] = useState(false);
  const [activeTopic, setActiveTopic] = useState<string | undefined>(() => {
    return initialTopic;
  });
  const [loadingSnippets, setLoadingSnippets] = useState<Set<string>>(
    new Set(),
  );
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<{ id: string; top: number } | null>(null);

  useEffect(() => {
    if (
      !isRawlVisible ||
      !currentMidi ||
      !rawlProps?.parsingResult ||
      !scrollAnchorRef.current ||
      !contentRef.current
    )
      return;

    const restoreScroll = () => {
      const anchor = scrollAnchorRef.current;
      const content = contentRef.current;
      if (!anchor || !content) return;
      const snippet = Array.from(
        content.querySelectorAll<HTMLElement>("[data-structure-snippet-id]"),
      ).find((element) => element.dataset.structureSnippetId === anchor.id);
      if (snippet) {
        content.scrollTop += snippet.getBoundingClientRect().top - anchor.top;
      }
    };

    // The player and previews can change row heights after the pane mounts.
    let secondFrame: number;
    const firstFrame = requestAnimationFrame(() => {
      restoreScroll();
      secondFrame = requestAnimationFrame(() => {
        restoreScroll();
        scrollAnchorRef.current = null;
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [isRawlVisible, currentMidi, rawlProps]);

  // Add this function to select first topic
  const selectFirstTopicFromChapter = useCallback(
    (chapterIndex: number) => {
      if (chapterData[chapterIndex]?.topics.length > 0) {
        const firstTopic = chapterData[chapterIndex].topics[0].topic;
        setActiveTopic(firstTopic);

        // Use the raw topic without encoding
        history.push(`/s/${chapterData[chapterIndex].chapter}/${firstTopic}`);
      }
    },
    [chapterData, history],
  );

  // Modify the chapter selection handler
  const handleChapterSelect = useCallback(
    (index: number) => {
      eject(); // Eject current playback when changing chapter
      setIsRawlVisible(false); // Hide the InlineRawl
      setActiveChapter(index);
      selectFirstTopicFromChapter(index);
    },
    [selectFirstTopicFromChapter, eject],
  );

  const processAnalyses = useCallback(() => {
    const data: { [chapter: string]: ChapterData } = {};
    const errors: string[] = [];

    Object.entries(analyses).forEach(([path, analysis]) => {
      const slug = path.startsWith("f/") ? path.slice(2) : path;

      if (analysis.snippets && analysis.snippets.length > 0) {
        analysis.snippets.forEach((snippet, snippetIndex) => {
          if (filterSnippetsByAccess([snippet]).length === 0) return;
          const snippetWithSlug = {
            ...snippet,
            composerSlug: slug,
          };

          const [chapter, topic] = snippet.tag.split(":");
          if (!chapter || !topic) {
            errors.push(`Invalid tag format: ${snippet.tag}`);
            return;
          }

          if (!data[chapter]) {
            data[chapter] = {
              chapter,
              topics: [],
            };
          }

          let topicData = data[chapter].topics.find((t) => t.topic === topic);
          if (!topicData) {
            topicData = {
              topic,
              snippets: [],
            };
            data[chapter].topics.push(topicData);
          }

          topicData.snippets.push({
            snippet: snippetWithSlug,
            slug,
            analysisKey: path,
            snippetIndex,
          });
        });
      }
    });

    setErrorMessages(errors);
    setChapterData(Object.values(data));
    setLoading(false);
  }, [analyses]);

  useEffect(() => {
    processAnalyses();
  }, [processAnalyses]);

  useEffect(() => {
    if (initialChapter) {
      const chapterIndex = chapterData.findIndex(
        (c) => c.chapter === initialChapter,
      );

      if (chapterIndex !== -1) {
        setActiveChapter(chapterIndex);
        if (initialTopic) {
          setActiveTopic(initialTopic);
        } else {
          selectFirstTopicFromChapter(chapterIndex);
        }
      }
    } else if (chapterData.length > 0) {
      // If no initialChapter is provided and we have chapters, select the first one
      setActiveChapter(0);
      selectFirstTopicFromChapter(0);
    }
  }, [initialChapter, initialTopic, chapterData, selectFirstTopicFromChapter]);

  useEffect(() => {
    setIsRawlVisible(!!currentMidi);
  }, [currentMidi]);

  // Modify handleTopicClick to eject current playback
  const handleTopicClick = (topic: string) => {
    eject(); // Eject current playback when changing topic
    setIsRawlVisible(false); // Hide the InlineRawl
    setActiveTopic(topic);

    // Use the raw topic without encoding for cleaner URLs
    history.push(`/s/${chapterData[activeChapter].chapter}/${topic}`);
  };

  const handleSnippetClick = useCallback(
    async (
      slug: string,
      measureStart: number,
      topic: string,
      element: HTMLElement,
      snippetId: string,
    ) => {
      if (!isRawlVisible) {
        scrollAnchorRef.current = {
          id: snippetId,
          top: element.getBoundingClientRect().top,
        };
      }
      console.log("[Structures] handleSnippetClick - Starting with:", {
        slug,
        measureStart,
        topic,
      });

      // Eject current playback before loading new snippet
      if (
        currentMidi &&
        (currentMidi.analysisKey || currentMidi.slug) !== slug
      ) {
        eject();
      }

      setLoadingSnippets((prev) => {
        const next = new Set([...prev, slug]);
        console.log("[Structures] Setting loadingSnippets to:", next);
        return next;
      });
      setSelectedMeasureStart(undefined);

      try {
        console.log("[Structures] Calling handleSongClick...");
        await handleSongClick(slug, { startPaused: true });
        console.log("[Structures] handleSongClick completed");

        setSelectedMeasureStart(measureStart);
        console.log("[Structures] Set measure start to:", measureStart);

        // Don't call handleTopicClick here since it ejects the playback
        if (topic && topic !== activeTopic) {
          setActiveTopic(topic);
        }
      } finally {
        setLoadingSnippets((prev) => {
          const next = new Set(prev);
          next.delete(slug);
          console.log("[Structures] Removing from loadingSnippets:", next);
          return next;
        });
      }
    },
    [handleSongClick, activeTopic, currentMidi, eject, isRawlVisible],
  );

  // Add useEffect to handle initial navigation into Structures
  useEffect(() => {
    const path = location.pathname;
    if (!path.startsWith("/s/")) {
      eject();
      setIsRawlVisible(false); // Hide the InlineRawl
    }
  }, [location, eject]);

  // Add cleanup effect to eject when unmounting
  useEffect(() => {
    return () => {
      // Stop playback when component is unmounted
      if (eject) {
        eject();
      }
    };
  }, [eject]);

  // Function to find category of current chapter
  const getCategoryForChapter = useCallback((chapterName: string) => {
    for (const [category, chapters] of Object.entries(CHAPTER_CATEGORIES)) {
      if (chapters.includes(chapterName)) {
        return category;
      }
    }
    return "misc";
  }, []);

  // Function to close breadcrumbs and return to full menu
  const handleBreadcrumbClick = useCallback(() => {
    if (isRawlVisible) {
      eject();
      setIsRawlVisible(false);
    }
  }, [isRawlVisible, eject]);

  const normalizedQuery = searchQuery.trim().toLowerCase().replace(/_/g, " ");
  const searchResults = normalizedQuery
    ? chapterData.flatMap(({ chapter, topics }, chapterIndex) =>
        topics
          .filter(({ topic }) =>
            `${chapter} ${topic}`
              .replace(/_/g, " ")
              .toLowerCase()
              .includes(normalizedQuery),
          )
          .map(({ topic }) => ({ chapter, chapterIndex, topic })),
      )
    : [];

  const availableTags = chapterData.flatMap(({ chapter, topics }) =>
    topics.map(({ topic }) => `${chapter}:${topic}`),
  );

  const handleEditTag = async (entry: SnippetWithSlug, tag: string) => {
    if (!canEditTags) throw new Error("Only the admin can edit tags");
    const analysis = analyses[entry.analysisKey];
    if (!analysis?.snippets?.[entry.snippetIndex]) {
      throw new Error("Snippet is no longer available");
    }
    setTagSaveError("");
    try {
      await saveFirebaseAnnotation(entry.analysisKey, {
        ...analysis,
        snippets: analysis.snippets.map((snippet, index) =>
          index === entry.snippetIndex ? { ...snippet, tag } : snippet,
        ),
      });
    } catch (error) {
      // The annotation store updates immediately, before Firestore confirms it.
      void saveFirebaseAnnotation(entry.analysisKey, analysis).catch(() => {});
      setTagSaveError("Could not save the tag. The original tag was restored.");
      throw error;
    }
  };

  return (
    <PathContainer>
      {tagSaveError && <ErrorMessage role="alert">{tagSaveError}</ErrorMessage>}
      <StructureSearch>
        <input
          type="search"
          aria-label="Search structures"
          placeholder="Search structures"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setSearchQuery("");
          }}
        />
        {normalizedQuery && (
          <SearchResults>
            {searchResults.length > 0 ? (
              searchResults.map(({ chapter, chapterIndex, topic }) => (
                <button
                  key={`${chapter}:${topic}`}
                  onClick={() => {
                    eject();
                    setIsRawlVisible(false);
                    setActiveChapter(chapterIndex);
                    setActiveTopic(topic);
                    setSearchQuery("");
                    history.push(`/s/${chapter}/${topic}`);
                  }}
                >
                  {chapter.replace(/_/g, " ")} · {topic.replace(/_/g, " ")}
                </button>
              ))
            ) : (
              <p role="status">No structures found.</p>
            )}
          </SearchResults>
        )}
      </StructureSearch>
      {isRawlVisible ? (
        // Breadcrumb navigation when Rawl is visible
        <div
          style={{
            display: "flex",
            backgroundColor: "black",
            padding: "8px 172px 8px 16px",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <CategoryHeader
            onClick={handleBreadcrumbClick}
            style={{ cursor: "pointer" }}
          >
            {formatCategoryLabel(
              getCategoryForChapter(chapterData[activeChapter]?.chapter || ""),
            )}
          </CategoryHeader>
          <ChapterButton active={true} onClick={handleBreadcrumbClick}>
            {(chapterData[activeChapter]?.chapter || "").replace(/_/g, " ")}
          </ChapterButton>
          {activeTopic && (
            <TopicBubble active={true} onClick={handleBreadcrumbClick}>
              {activeTopic.replace(/_/g, " ")}
            </TopicBubble>
          )}
        </div>
      ) : (
        // Regular menu when Rawl is not visible
        <MenuContainer isRawlVisible={isRawlVisible}>
          <ChapterRow>
            <ChapterCategories>
              {Object.entries(CHAPTER_CATEGORIES).map(
                ([category, contents]) => {
                  let categoryChapters = chapterData.filter((chapter) => {
                    if (category === "misc") {
                      return getMiscChapters(
                        chapterData,
                        CHAPTER_CATEGORIES,
                      ).some((c) => c.chapter === chapter.chapter);
                    }
                    return contents.includes(chapter.chapter);
                  });

                  // Sort chapters alphabetically
                  categoryChapters.sort((a, b) =>
                    a.chapter.localeCompare(b.chapter),
                  );

                  if (categoryChapters.length === 0) return null;

                  const shouldUseTwoColumns = categoryChapters.length > 5;
                  const midPoint = Math.ceil(categoryChapters.length / 2);

                  return (
                    <CategorySection key={category}>
                      <CategoryHeader>
                        {formatCategoryLabel(category)}
                      </CategoryHeader>
                      <ChaptersContainer twoColumns={shouldUseTwoColumns}>
                        {shouldUseTwoColumns ? (
                          <>
                            <div>
                              {categoryChapters
                                .slice(0, midPoint)
                                .map((chapter) => {
                                  const index = chapterData.findIndex(
                                    (c) => c.chapter === chapter.chapter,
                                  );
                                  return (
                                    <ChapterButton
                                      key={chapter.chapter}
                                      active={activeChapter === index}
                                      onClick={() => handleChapterSelect(index)}
                                    >
                                      {chapter.chapter.replace(/_/g, " ")}
                                    </ChapterButton>
                                  );
                                })}
                            </div>
                            <div>
                              {categoryChapters
                                .slice(midPoint)
                                .map((chapter) => {
                                  const index = chapterData.findIndex(
                                    (c) => c.chapter === chapter.chapter,
                                  );
                                  return (
                                    <ChapterButton
                                      key={chapter.chapter}
                                      active={activeChapter === index}
                                      onClick={() => handleChapterSelect(index)}
                                    >
                                      {chapter.chapter.replace(/_/g, " ")}
                                    </ChapterButton>
                                  );
                                })}
                            </div>
                          </>
                        ) : (
                          categoryChapters.map((chapter) => {
                            const index = chapterData.findIndex(
                              (c) => c.chapter === chapter.chapter,
                            );
                            return (
                              <ChapterButton
                                key={chapter.chapter}
                                active={activeChapter === index}
                                onClick={() => handleChapterSelect(index)}
                              >
                                {chapter.chapter.replace(/_/g, " ")}
                              </ChapterButton>
                            );
                          })
                        )}
                      </ChaptersContainer>
                    </CategorySection>
                  );
                },
              )}
            </ChapterCategories>
          </ChapterRow>
          {!loading && chapterData[activeChapter] && (
            <TopicMenu>
              {chapterData[activeChapter].topics
                .slice()
                .sort((a, b) => a.topic.localeCompare(b.topic))
                .map(({ topic, snippets }) => (
                  <TopicBubble
                    key={topic}
                    active={activeTopic === topic}
                    onClick={() => {
                      handleTopicClick(topic);
                    }}
                  >
                    {topic.replace(/_/g, " ")}
                    <TopicCount active={activeTopic === topic}>
                      {snippets.length}
                    </TopicCount>
                  </TopicBubble>
                ))}
            </TopicMenu>
          )}
          <ScrollableContent>
            {loading ? (
              <HomeChapter>Loading...</HomeChapter>
            ) : errorMessages.length > 0 ? (
              errorMessages.map((error, index) => (
                <ErrorMessage key={index}>{error}</ErrorMessage>
              ))
            ) : (
              <CategorySection>
                <TopicContent
                  activeTopic={activeTopic}
                  activeChapter={activeChapter}
                  chapterData={chapterData}
                  snippets={chapterData[activeChapter]?.topics || []}
                  handleSnippetClick={handleSnippetClick}
                  loadingSnippets={loadingSnippets}
                  availableTags={availableTags}
                  onEditTag={canEditTags ? handleEditTag : undefined}
                />
              </CategorySection>
            )}
          </ScrollableContent>
        </MenuContainer>
      )}

      {isRawlVisible && currentMidi && (
        <InlineRawlPlayer
          {...rawlProps}
          contentRef={contentRef}
          measureStart={selectedMeasureStart}
          playAfterSeek
          onEject={() => setIsRawlVisible(false)}
        >
          <TopicContent
            activeTopic={activeTopic}
            activeChapter={activeChapter}
            chapterData={chapterData}
            snippets={chapterData[activeChapter]?.topics || []}
            handleSnippetClick={handleSnippetClick}
            loadingSnippets={loadingSnippets}
            availableTags={availableTags}
            onEditTag={canEditTags ? handleEditTag : undefined}
          />
        </InlineRawlPlayer>
      )}
    </PathContainer>
  );
};

export default Structures;
