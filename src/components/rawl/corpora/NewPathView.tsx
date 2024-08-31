import React, { useCallback, useState } from "react";
import styled from "styled-components";
import ErrorBoundary from "../../ErrorBoundary";
import { Analysis, Snippet } from "../analysis";
import SnippetList from "../SnippetList";

const PathContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  overflow-y: auto;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  background-color: #333333;
  padding: 10px;
`;

const ChapterSection = styled.div`
  margin-bottom: 20px;
`;

const TopicCard = styled.div`
  background-color: #000000;
  margin: 5px 0;
  padding: 10px;
  border-radius: 5px;
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

const DebugInfo = styled.pre`
  background-color: #1e1e1e;
  color: #d4d4d4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
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
  const [loading, setLoading] = useState(true);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [chapterData, setChapterData] = useState<ChapterData[]>([]);

  const processAnalyses = useCallback(() => {
    console.log("Processing analyses");
    const data: { [chapter: string]: ChapterData } = {};
    const errors: string[] = [];

    Object.entries(analyses).forEach(([path, analysis]) => {
      if (analysis.snippets && analysis.snippets.length > 0) {
        analysis.snippets.forEach((snippet) => {
          const [chapter, topic] = snippet.tag.split(":");
          if (!chapter || !topic) {
            errors.push(`Invalid tag format: ${snippet.tag}`);
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
          if (!topicData.midis.includes(path)) {
            topicData.midis.push(path);
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (chapterData.length === 0) {
    return <div>No analyses with snippets found.</div>;
  }

  return (
    <ErrorBoundary>
      <PathContainer>
        <h1>Analyses with Snippets</h1>
        <ContentArea>
          {errorMessages.map((error, index) => (
            <ErrorMessage key={index}>{error}</ErrorMessage>
          ))}
          {chapterData.map((chapter) => (
            <ChapterSection key={chapter.chapter}>
              <h2>{chapter.chapter}</h2>
              {chapter.topics.map((topic) => (
                <TopicCard key={topic.topic}>
                  <TopicTitle>{topic.topic}</TopicTitle>
                  <p>Number of snippets: {topic.snippets.length}</p>
                  <p>MIDIs: {topic.midis.join(", ")}</p>
                  <SnippetList
                    snippets={topic.snippets}
                    measureWidth={50}
                    noteHeight={3}
                    compact={true}
                  />
                </TopicCard>
              ))}
            </ChapterSection>
          ))}
        </ContentArea>
      </PathContainer>
    </ErrorBoundary>
  );
};

export default NewPathView;
