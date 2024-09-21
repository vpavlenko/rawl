import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import ErrorBoundary from "../../ErrorBoundary";
import { Analysis, Snippet } from "../analysis";
import NewLandingPage from "../NewLandingPage";
import Rawl from "../Rawl";
import SnippetsForTopic from "../SnippetsForTopic";

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
  background-color: ${(props) => (props.active ? "#4a90e2" : "transparent")};
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px; // Adjust this value as needed
`;

const ContentArea = styled.div<{ isRawlVisible: boolean }>`
  flex-grow: 1;
  // background-color: #333333;
  height: ${(props) =>
    props.isRawlVisible ? "calc(50vh - 30px)" : "calc(100vh - 30px)"};
  overflow-y: auto;
  transition: height 0.3s ease-in-out;
`;

const ChapterSection = styled.div`
  display: flex;
  flex-direction: column; // Change to column to flow topics vertically
  gap: 20px; // Add some space between topics
  padding-bottom: 20px;
`;

const TopicContainer = styled.div`
  margin: 0; // Remove the top and bottom margin
  padding: 20px 0; // Add padding instead of margin for spacing
`;

const TopicCard = styled.div`
  background-color: #000000;
  // margin: 5px 0;
  // padding: 10px;
  // border-radius: 5px;
  display: flex;
  flex-wrap: wrap; // Allow wrapping of SnippetItem components
  gap: 20px; // Add some space between SnippetItem components
  width: 100%; // Ensure it takes the full width
  box-sizing: border-box; // Include padding and border in the element's total width and height
`;

const TopicTitle = styled(Link)`
  font-size: 18px;
  margin: 0px 0px 10px 0px;
  color: #ffffff;
  text-decoration: none;
  cursor: pointer;
  display: block; // Change from inline to block
  &:hover {
    text-decoration: underline;
  }
`;

const StickyTopicTitle = styled(TopicTitle)`
  position: sticky;
  top: 0;
  background-color: #1a1a1a;
  z-index: 100000;
  padding: 10px 0;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
`;

const MidiButton = styled.button`
  display: block;
  padding: 3px 0;
  font-size: 14px;
  color: #ffffff;
  text-decoration: none;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  &:hover {
    color: #4a90e2;
  }
`;

const RawlContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background-color: #000;
  z-index: 200000;
  overflow: auto; // Enable scrolling
`;

const HomeChapter = styled.div`
  font-size: 24px;
  color: white;
  text-align: center;
  padding: 20px;
`;

const ClickableContainer = styled.div`
  cursor: pointer;
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
  const {
    handleSongClick,
    currentMidi,
    resetMidiPlayerState,
    rawlProps,
    saveAnalysis,
  } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [selectedMeasureStart, setSelectedMeasureStart] = useState<
    number | undefined
  >(undefined);
  const [isRawlVisible, setIsRawlVisible] = useState(false);
  const topicRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const history = useHistory();

  const processAnalyses = useCallback(() => {
    console.log("Processing analyses");
    const data: { [chapter: string]: ChapterData } = {};
    const errors: string[] = [];

    // Add special chapter "🎨"
    data["🎨"] = { chapter: "🎨", topics: [] };

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

    console.log("Processed data:", data);
    console.log("Errors:", errors);

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
          setTimeout(() => {
            topicRefs.current[initialTopic]?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 0);
        }
      }
    }
  }, [initialChapter, initialTopic, chapterData]);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
    resetMidiPlayerState();
    setActiveTopic(null);
    const chapter = chapterData[index].chapter;
    history.push(`/s/${encodeURIComponent(chapter)}`);
  };

  const handleTopicSelect = (topic: string) => {
    setActiveTopic(topic);
    const chapter = chapterData[activeChapter].chapter;
    history.push(
      `/s/${encodeURIComponent(chapter)}/${encodeURIComponent(topic)}`,
    );
    topicRefs.current[topic]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleMidiClick = (
    slug: string,
    measureStart: number,
    topic: string,
  ) => {
    console.log(
      "handleMidiClick called with slug:",
      slug,
      "measureStart:",
      measureStart,
      "and topic:",
      topic,
    );

    // Reset the MIDI player state before loading a new MIDI
    resetMidiPlayerState();

    // Load the new MIDI
    handleSongClick(slug);
    setSelectedMeasureStart(measureStart);

    // Scroll to the topic
    setActiveTopic(topic);
    topicRefs.current[topic]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  useEffect(() => {
    setIsRawlVisible(!!currentMidi);
  }, [currentMidi]);

  const [stickyTopic, setStickyTopic] = useState<string | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const topic = entry.target.id;
          if (entry.isIntersecting && entry.boundingClientRect.top <= 1) {
            // Check if the top of the element is at or above the top of the viewport
            setStickyTopic(topic);
          } else if (
            stickyTopic === topic &&
            entry.boundingClientRect.top > 1
          ) {
            // Find the next visible topic when the current sticky topic is scrolled out of view
            const nextVisibleTopic = Object.keys(topicRefs.current).find(
              (t) => {
                const ref = topicRefs.current[t];
                return ref && ref.getBoundingClientRect().top <= 1;
              },
            );
            setStickyTopic(nextVisibleTopic || null);
          }
        });
      },
      { threshold: [0, 1], rootMargin: "-1px 0px 0px 0px" },
    );

    Object.values(topicRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, [chapterData, activeChapter, stickyTopic]);

  const TopicTitleWithSticky: React.FC<{ topic: string }> = ({ topic }) => {
    return (
      <StickyTopicTitle
        to={`/s/${encodeURIComponent(
          chapterData[activeChapter].chapter,
        )}/${encodeURIComponent(topic)}`}
        id={topic}
        ref={(el: HTMLAnchorElement | null) => {
          if (el) {
            topicRefs.current[topic] = el as unknown as HTMLDivElement;
          }
        }}
        onClick={(e) => {
          e.preventDefault();
          handleTopicSelect(topic);
        }}
      >
        <div>{topic.replace(/_/g, " ")}</div>
      </StickyTopicTitle>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (chapterData.length === 0) {
    return <div>No analyses with snippets found.</div>;
  }

  return (
    <ErrorBoundary>
      <PathContainer>
        <ScrollableContent>
          <MenuContainer>
            <ChapterRow>
              {chapterData.map((chapter, index) => (
                <ChapterButton
                  key={chapter.chapter}
                  active={index === activeChapter}
                  onClick={() => handleChapterSelect(index)}
                  title={chapter.chapter.replace(/_/g, " ")} // Add this line for tooltip
                >
                  {chapter.chapter.replace(/_/g, " ")}
                </ChapterButton>
              ))}
            </ChapterRow>
          </MenuContainer>
          <ContentArea isRawlVisible={isRawlVisible}>
            {errorMessages.map((error, index) => (
              <ErrorMessage key={index}>{error}</ErrorMessage>
            ))}
            <ChapterSection>
              {chapterData[activeChapter].chapter === "🎨" ? (
                <HomeChapter>
                  <NewLandingPage />
                </HomeChapter>
              ) : (
                <>
                  {stickyTopic && (
                    <StickyTopicTitle as="div">
                      {stickyTopic.replace(/_/g, " ")}
                    </StickyTopicTitle>
                  )}
                  {chapterData[activeChapter].topics.map((topic) => (
                    <TopicContainer key={topic.topic}>
                      <TopicTitleWithSticky topic={topic.topic} />
                      <TopicCard>
                        {topic.snippets.map(({ snippet, slug }, index) => (
                          <ClickableContainer
                            key={index}
                            onClick={() =>
                              handleMidiClick(
                                slug,
                                snippet.measuresSpan[0],
                                topic.topic,
                              )
                            }
                          >
                            <MidiButton>
                              {slug
                                .replace(/---/g, " – ")
                                .replace(/-/g, " ")
                                .replace(/_/g, " ")}
                            </MidiButton>
                            <SnippetsForTopic
                              snippets={[snippet]}
                              noteHeight={3}
                            />
                          </ClickableContainer>
                        ))}
                      </TopicCard>
                    </TopicContainer>
                  ))}
                </>
              )}
            </ChapterSection>
          </ContentArea>
        </ScrollableContent>
        {currentMidi && rawlProps && rawlProps?.parsingResult && (
          <RawlContainer>
            <Rawl
              parsingResult={rawlProps.parsingResult}
              getCurrentPositionMs={rawlProps.getCurrentPositionMs}
              savedAnalysis={rawlProps.savedAnalysis}
              saveAnalysis={saveAnalysis}
              voiceNames={rawlProps.voiceNames}
              voiceMask={rawlProps.voiceMask}
              setVoiceMask={rawlProps.setVoiceMask}
              showAnalysisBox={rawlProps.showAnalysisBox}
              seek={rawlProps.seek}
              artist={rawlProps.artist}
              song={rawlProps.song}
              latencyCorrectionMs={rawlProps.latencyCorrectionMs}
              sourceUrl={currentMidi.sourceUrl}
              measureStart={selectedMeasureStart}
              isEmbedded={true}
            />
          </RawlContainer>
        )}
      </PathContainer>
    </ErrorBoundary>
  );
};

export default NewPathView;
