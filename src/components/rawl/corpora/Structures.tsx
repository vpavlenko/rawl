import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { Analysis, filterSnippetsByAccess, Snippet } from "../analysis";
import InlineRawlPlayer from "../InlineRawlPlayer";
import SnippetList from "../SnippetList";
import EXPLANATIONS from "./explanations";

const PathContainer = styled.div`
  height: 100%;
  width: 100%;
  margin: 10px 0 0 0;
  padding: 0;
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

const EjectButton = styled.button`
  position: fixed;
  bottom: 50vh; // Position it just above the RawlContainer which is 50vh tall
  right: 0;
  background: #333;
  color: white;
  border: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  z-index: 200001; // Higher than RawlContainer to ensure it's clickable
  transition: background-color 0.2s;

  &:hover {
    background: #444;
  }
`;

const ChapterCategories = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 24px;
  padding: 8px;
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
  ) => void;
  loadingSnippets: Set<string>;
}>(
  ({
    activeTopic,
    activeChapter,
    chapterData,
    snippets,
    handleSnippetClick,
    loadingSnippets,
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
                      slugs={snippets.map(({ slug }) => {
                        return slug;
                      })}
                      onSnippetClick={(snippet) => {
                        const matchingSnippet = snippets.find(
                          (s) => s.snippet === snippet,
                        );
                        if (matchingSnippet) {
                          handleSnippetClick(
                            matchingSnippet.slug,
                            snippet.measuresSpan[0],
                            topic,
                          );
                        }
                      }}
                      isPreview={true}
                      noteHeight={3}
                      loadingSnippets={loadingSnippets}
                    />
                  </TopicCard>
                </TopicContainer>
              );
            })}
      </ScrollableContent>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.activeTopic === nextProps.activeTopic &&
      prevProps.activeChapter === nextProps.activeChapter &&
      prevProps.loadingSnippets === nextProps.loadingSnippets
    );
  },
);

const BreadcrumbContainer = styled.div`
  background-color: black;
  color: white;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  font-size: 14px;
  border-bottom: 1px solid #333;
`;

const BreadcrumbItem = styled.span`
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 8px;
  color: #666;
`;

const Structures: React.FC<StructuresProps> = ({
  analyses,
  initialChapter,
  initialTopic,
}) => {
  const { handleSongClick, currentMidi, rawlProps, eject, togglePause } =
    useContext(AppContext);
  const location = useLocation();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
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
        filterSnippetsByAccess(analysis.snippets).forEach((snippet) => {
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
    async (slug: string, measureStart: number, topic: string) => {
      console.log("[Structures] handleSnippetClick - Starting with:", {
        slug,
        measureStart,
        topic,
      });

      // Eject current playback before loading new snippet
      if (currentMidi && currentMidi.slug !== slug) {
        eject();
      }

      setLoadingSnippets((prev) => {
        const next = new Set([...prev, slug]);
        console.log("[Structures] Setting loadingSnippets to:", next);
        return next;
      });

      try {
        console.log("[Structures] Calling handleSongClick...");
        await handleSongClick(slug);
        console.log("[Structures] handleSongClick completed");

        setSelectedMeasureStart(measureStart);
        console.log("[Structures] Set measure start to:", measureStart);

        // Don't call handleTopicClick here since it ejects the playback
        if (topic && topic !== activeTopic) {
          setActiveTopic(topic);
        }

        // Force playback to start
        if (currentMidi?.slug === slug) {
          console.log("[Structures] Starting playback for:", slug);
          togglePause();
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
    [handleSongClick, activeTopic, currentMidi, togglePause, eject],
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

  return (
    <PathContainer>
      {isRawlVisible ? (
        // Breadcrumb navigation when Rawl is visible
        <div
          style={{
            display: "flex",
            backgroundColor: "black",
            padding: "8px 16px",
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
                .map(({ topic }) => (
                  <TopicBubble
                    key={topic}
                    active={activeTopic === topic}
                    onClick={() => {
                      handleTopicClick(topic);
                    }}
                  >
                    {topic.replace(/_/g, " ")}
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
                />
              </CategorySection>
            )}
          </ScrollableContent>
        </MenuContainer>
      )}

      {isRawlVisible && currentMidi && (
        <>
          <EjectButton
            onClick={() => {
              eject();
              setIsRawlVisible(false);
            }}
          >
            ×
          </EjectButton>
          <InlineRawlPlayer {...rawlProps} measureStart={selectedMeasureStart}>
            <TopicContent
              activeTopic={activeTopic}
              activeChapter={activeChapter}
              chapterData={chapterData}
              snippets={chapterData[activeChapter]?.topics || []}
              handleSnippetClick={handleSnippetClick}
              loadingSnippets={loadingSnippets}
            />
          </InlineRawlPlayer>
        </>
      )}
    </PathContainer>
  );
};

export default Structures;
