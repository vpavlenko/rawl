import React, { useCallback, useContext, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import ErrorBoundary from "../../ErrorBoundary";
import { Analysis, Snippet } from "../analysis";
import Rawl from "../Rawl";
import SnippetsForTopic from "../SnippetsForTopic";

const PathContainer = styled.div`
  height: 100%;
  width: 100%;
`;

const ChapterRow = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow wrapping to the next line
  background-color: #1a1a1a;
  //   position: sticky;
  top: 0;
  z-index: 1;
  width: 100%; // Ensure it takes the full width
`;

const ScrollableContent = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden; // Remove horizontal scrolling
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
`;

const ContentArea = styled.div<{ isRawlVisible: boolean }>`
  flex-grow: 1;
  background-color: #333333;
  padding: 10px;
  height: ${(props) =>
    props.isRawlVisible ? "calc(50vh - 30px)" : "calc(100vh - 30px)"};
  overflow-y: auto;
  transition: height 0.3s ease-in-out;
`;

const ChapterSection = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2px;
  padding-bottom: 20px;
`;

const TopicCard = styled.div`
  background-color: #000000;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
  width: 400px;
  flex-shrink: 0;
`;

const TopicTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #ffffff;
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
  z-index: 1000;
  overflow: auto; // Enable scrolling
`;

interface NewPathViewProps {
  analyses: { [key: string]: Analysis };
}

interface ChapterData {
  chapter: string;
  topics: {
    topic: string;
    snippets: Snippet[];
    midis: string[];
  }[];
}

const NewPathView: React.FC<NewPathViewProps> = ({ analyses }) => {
  const { handleSongClick, rawlProps } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);
  const [activeChapter, setActiveChapter] = useState(0);
  const [selectedMeasureStart, setSelectedMeasureStart] = useState<
    number | undefined
  >(undefined);
  const [isRawlVisible, setIsRawlVisible] = useState(false);

  const processAnalyses = useCallback(() => {
    console.log("Processing analyses");
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
            topicData = { topic, snippets: [], midis: [] };
            data[chapter].topics.push(topicData);
          }

          topicData.snippets.push(snippet);
          if (!topicData.midis.includes(slug)) {
            topicData.midis.push(slug);
          }
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

  React.useEffect(() => {
    processAnalyses();
  }, [processAnalyses]);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  const handleMidiClick = (slug: string, measureStart: number) => {
    console.log(
      "handleMidiClick called with slug:",
      slug,
      "and measureStart:",
      measureStart,
    );
    handleSongClick(`f:${slug}`);
    setSelectedMeasureStart(measureStart);
  };

  React.useEffect(() => {
    setIsRawlVisible(!!rawlProps && !!rawlProps.parsingResult);
  }, [rawlProps]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (chapterData.length === 0) {
    return <div>No analyses with snippets found.</div>;
  }

  return (
    <ErrorBoundary>
      <PathContainer>
        <ChapterRow>
          {chapterData.map((chapter, index) => (
            <ChapterButton
              key={chapter.chapter}
              active={index === activeChapter}
              onClick={() => handleChapterSelect(index)}
            >
              {chapter.chapter.replace(/_/g, " ")}
            </ChapterButton>
          ))}
        </ChapterRow>
        <ScrollableContent>
          <ContentArea isRawlVisible={isRawlVisible}>
            {errorMessages.map((error, index) => (
              <ErrorMessage key={index}>{error}</ErrorMessage>
            ))}
            <ChapterSection>
              {chapterData[activeChapter].topics.map((topic) => (
                <TopicCard key={topic.topic}>
                  <TopicTitle>{topic.topic}</TopicTitle>
                  <SnippetsForTopic snippets={topic.snippets} noteHeight={3} />
                  <div>
                    {topic.midis.map((midi, index) => (
                      <MidiButton
                        key={index}
                        onClick={() =>
                          handleMidiClick(
                            midi,
                            topic.snippets[index].measuresSpan[0],
                          )
                        }
                      >
                        {midi.replace(/---/g, " – ").replace(/-/g, " ")}
                      </MidiButton>
                    ))}
                  </div>
                </TopicCard>
              ))}
            </ChapterSection>
          </ContentArea>
        </ScrollableContent>
        {rawlProps && rawlProps.parsingResult && (
          <RawlContainer>
            <Rawl {...rawlProps} measureStart={selectedMeasureStart} />
          </RawlContainer>
        )}
      </PathContainer>
    </ErrorBoundary>
  );
};

export default NewPathView;
