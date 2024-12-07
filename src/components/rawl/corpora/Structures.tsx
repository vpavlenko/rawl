import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { Analysis, filterSnippetsByAccess, Snippet } from "../analysis";
import InlineRawlPlayer from "../InlineRawlPlayer";
import SnippetList from "../SnippetList";

const PathContainer = styled.div`
  height: 100%;
  width: 100%;
  margin: 10px 0 0 0;
  padding: 0;
`;

const MenuContainer = styled.div<{ isRawlVisible?: boolean }>`
  width: 100%;
  height: ${(props) =>
    props.isRawlVisible ? "calc(50vh - 30px)" : "calc(100vh - 30px)"};
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
`;

const ChapterButton = styled.button<{ active: boolean }>`
  padding: 2px 5px;
  text-align: center;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#333")};
  }
`;

const CategorySection = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
  min-width: 0;
`;

const CategoryLabel = styled.div`
  color: #999;
  font-size: 12px;
  padding-right: 8px;
`;

const CategoryChapters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

const ChapterCategories = styled.div`
  display: grid;
  width: 100%;
  gap: 4px;
  grid-template-columns: 1fr;

  @media (min-width: 500px) {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  @media (min-width: 1000px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 12px;
  }
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
  padding: 16px;
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
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: ${(props) => (props.active ? "white" : "#666")};
  }
`;

const EjectButton = styled.button`
  position: absolute;
  top: -29px; // Position it above the player
  right: 0;
  background: #333;
  color: white;
  border: none;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  z-index: 100001; // Higher than TopicMenu
  transition: background-color 0.2s;

  &:hover {
    background: #444;
  }
`;

const CHAPTER_CATEGORIES = {
  order_of_chords: {
    major: [
      "major_cadence",
      "progression",
      "cycle_root_motion",
      "shuttle",
      "stasis",
      "chunks",
      "rare_functional",
    ],
    minor: ["minor_cadence", "scale", "chords", "last_chords"],
  },
  texture: [
    "bass",
    "voicing",
    "LH",
    "RH",
    "doubling",
    "arpeggio",
    "texture",
    "voice_leading",
    "interval",
    "inversion",
  ],
  melody: [
    "melody",
    "nonchord_tone",
    "chord_scale",
    "ornament",
    "reharmonization",
  ],
  chromaticism: ["applied", "6_b6", "chromatic_chords", "cto7"],
  modulation: ["modulation", "relative", "parallel"],
  modal_harmony: [
    "dorian",
    "mixolydian",
    "modal_interchange",
    "steady_scale",
    "minor",
    "predominants",
    "pure_major",
    "root_motion",
  ],
  chords_beyond_triads: [
    "seventh_chords",
    "V",
    "extensions",
    "ninth_chords",
    "jazz",
  ],
  non_classical_chromaticism: [
    "b2",
    "constant_structures",
    "symmetric_chords",
    "vgm_chromatic",
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
  categories: typeof CHAPTER_CATEGORIES,
) => {
  const allCategorizedChapters = new Set<string>();

  Object.values(categories).forEach((contents) => {
    if (typeof contents === "object" && !Array.isArray(contents)) {
      Object.values(contents)
        .flat()
        .forEach((chapter) => allCategorizedChapters.add(chapter));
    } else {
      (contents as string[]).forEach((chapter) =>
        allCategorizedChapters.add(chapter),
      );
    }
  });

  return chapterData.filter(
    (chapter) => !allCategorizedChapters.has(chapter.chapter),
  );
};

const Structures: React.FC<StructuresProps> = ({
  analyses,
  initialChapter,
  initialTopic,
}) => {
  const { handleSongClick, currentMidi, rawlProps, eject } =
    useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedMeasureStart, setSelectedMeasureStart] = useState<
    number | undefined
  >(undefined);
  const [isRawlVisible, setIsRawlVisible] = useState(false);
  const history = useHistory();
  const [activeTopic, setActiveTopic] = useState<string | undefined>(() => {
    return initialTopic;
  });

  // Add this function to select first topic
  const selectFirstTopicFromChapter = useCallback(
    (chapterIndex: number) => {
      if (chapterData[chapterIndex]?.topics.length > 0) {
        const firstTopic = chapterData[chapterIndex].topics[0].topic;
        setActiveTopic(firstTopic);
        history.push(`/s/${chapterData[chapterIndex].chapter}/${firstTopic}`);
      }
    },
    [chapterData, history],
  );

  // Modify the chapter selection handler
  const handleChapterSelect = useCallback(
    (index: number) => {
      setActiveChapter(index);
      selectFirstTopicFromChapter(index);
    },
    [selectFirstTopicFromChapter],
  );

  const processAnalyses = useCallback(() => {
    const data: { [chapter: string]: ChapterData } = {};
    const errors: string[] = [];

    Object.entries(analyses).forEach(([path, analysis]) => {
      // Strip the "f/" prefix from the path
      const slug = path.startsWith("f/") ? path.slice(2) : path;

      if (analysis.snippets && analysis.snippets.length > 0) {
        filterSnippetsByAccess(analysis.snippets).forEach((snippet) => {
          const [chapter, topic] = snippet.tag.split(":");
          if (!chapter || !topic) {
            errors.push(`Invalid tag format: ${snippet.tag} in ${path}`);
            return;
          }

          if (!data[chapter]) {
            data[chapter] = { chapter, topics: [] };
          }

          let topicData = data[chapter].topics.find((t) => t.topic === topic);
          if (!topicData) {
            topicData = { topic, snippets: [] };
            data[chapter].topics.push(topicData);
          }

          topicData.snippets.push({ snippet, slug });
        });
      }
    });

    setErrorMessages(errors);
    setChapterData(
      Object.values(data).sort((a, b) => a.chapter.localeCompare(b.chapter)),
    );
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

  const handleTopicClick = (topic: string) => {
    setActiveTopic(topic);
  };

  const handleSnippetClick = useCallback(
    (slug: string, measureStart: number, topic: string) => {
      handleSongClick(slug);
      setSelectedMeasureStart(measureStart);
      if (topic) {
        handleTopicClick(topic);
      }
    },
    [handleSongClick],
  );

  return (
    <PathContainer>
      <MenuContainer isRawlVisible={isRawlVisible}>
        <ChapterRow>
          <ChapterCategories>
            {Object.entries(CHAPTER_CATEGORIES).map(([category, contents]) => {
              let categoryChapters = chapterData.filter((chapter) => {
                if (category === "misc") {
                  return false; // Skip misc category in normal filtering
                }
                if (typeof contents === "object" && !Array.isArray(contents)) {
                  return Object.values(contents)
                    .flat()
                    .includes(chapter.chapter);
                }
                return (contents as string[]).includes(chapter.chapter);
              });

              // Handle misc category separately
              if (category === "misc") {
                categoryChapters = getMiscChapters(
                  chapterData,
                  CHAPTER_CATEGORIES,
                );
              }

              if (categoryChapters.length === 0) return null;

              return (
                <CategorySection key={category}>
                  <CategoryLabel>{formatCategoryLabel(category)}</CategoryLabel>
                  <CategoryChapters>
                    {categoryChapters.map((chapter) => {
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
                  </CategoryChapters>
                </CategorySection>
              );
            })}
          </ChapterCategories>
        </ChapterRow>
        {!loading && chapterData[activeChapter] && (
          <TopicMenu>
            {chapterData[activeChapter].topics.map(({ topic }) => (
              <TopicBubble
                key={topic}
                active={activeTopic === topic}
                onClick={() => {
                  handleTopicClick(topic);
                  history.push(
                    `/s/${chapterData[activeChapter].chapter}/${topic}`,
                  );
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
              {activeTopic &&
                chapterData[activeChapter]?.topics
                  .filter(({ topic }) => topic === activeTopic)
                  .map(({ topic, snippets }) => (
                    <TopicContainer key={topic}>
                      <TopicCard>
                        <SnippetList
                          snippets={snippets.map(({ snippet }) => snippet)}
                          slugs={snippets.map(({ slug }) => slug)}
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
                        />
                      </TopicCard>
                    </TopicContainer>
                  ))}
            </CategorySection>
          )}
        </ScrollableContent>
      </MenuContainer>
      {isRawlVisible && currentMidi && (
        <div style={{ position: "relative" }}>
          <EjectButton
            onClick={() => {
              eject();
              setIsRawlVisible(false);
            }}
          >
            ×
          </EjectButton>
          <InlineRawlPlayer {...rawlProps} measureStart={selectedMeasureStart}>
            <ScrollableContent>
              {activeTopic &&
                chapterData[activeChapter]?.topics
                  .filter(({ topic }) => topic === activeTopic)
                  .map(({ topic, snippets }) => (
                    <TopicContainer key={topic}>
                      <TopicCard>
                        <SnippetList
                          snippets={snippets.map(({ snippet }) => snippet)}
                          slugs={snippets.map(({ slug }) => slug)}
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
                        />
                      </TopicCard>
                    </TopicContainer>
                  ))}
            </ScrollableContent>
          </InlineRawlPlayer>
        </div>
      )}
    </PathContainer>
  );
};

export default Structures;
