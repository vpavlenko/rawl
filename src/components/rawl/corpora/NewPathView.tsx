import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import { Analysis, Snippet } from "../analysis";
import InlineRawlPlayer from "../InlineRawlPlayer";
import SnippetList from "../SnippetList";

const PathContainer = styled.div`
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
`;

const MenuContainer = styled.div`
  width: 100%;
  background-color: #1a1a1a; // Ensure background color to avoid transparency issues
`;

const ChapterRow = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow wrapping to the next line
  background-color: black;
  width: 100%; // Ensure it takes the full width
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden; // Remove horizontal scrolling
  padding-top: 0; // Adjust padding to account for fixed menus
`;

const ChapterButton = styled.button<{ active: boolean }>`
  padding: 5px 10px;
  height: 100%; // Make buttons fill the ChapterRow height
  text-align: center;
  background-color: ${(props) => (props.active ? "white" : "black")};
  color: ${(props) => (props.active ? "black" : "white")};
  border: none;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; // Adjust this value as needed
`;

const ChapterSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
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

export interface NewPathViewProps {
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

const NewPathView: React.FC<NewPathViewProps> = ({
  analyses,
  initialChapter,
  initialTopic,
}) => {
  const { handleSongClick, currentMidi, resetMidiPlayerState, rawlProps } =
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
        analysis.snippets.forEach((snippet) => {
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
      <MenuContainer>
        <ChapterRow>
          {chapterData.map((chapter, index) => (
            <ChapterButton
              key={chapter.chapter}
              active={activeChapter === index}
              onClick={() => handleChapterSelect(index)}
            >
              {chapter.chapter}
            </ChapterButton>
          ))}
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
      </MenuContainer>
      {isRawlVisible && currentMidi ? (
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
      ) : (
        <ScrollableContent>
          {loading ? (
            <HomeChapter>Loading...</HomeChapter>
          ) : errorMessages.length > 0 ? (
            errorMessages.map((error, index) => (
              <ErrorMessage key={index}>{error}</ErrorMessage>
            ))
          ) : (
            <ChapterSection>
              {activeTopic &&
                chapterData[activeChapter]?.topics
                  .filter(({ topic }) => topic === activeTopic)
                  .map(({ topic, snippets }) => (
                    <TopicContainer key={topic}>
                      <TopicCard>
                        <SnippetList
                          snippets={snippets.map(({ snippet }) => snippet)}
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
            </ChapterSection>
          )}
        </ScrollableContent>
      )}
    </PathContainer>
  );
};

export default NewPathView;
