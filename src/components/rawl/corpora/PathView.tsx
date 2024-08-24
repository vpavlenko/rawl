import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const ChapterNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ChapterButton = styled.button<{ active: boolean }>`
  background-color: ${(props) => (props.active ? "#4a90e2" : "#2c3e50")};
  color: white;
  border: none;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3498db;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  max-height: calc(100vh - 100px);
`;

const Sidebar = styled.div`
  width: 30%;
  padding-right: 20px;
  overflow-y: auto;
`;

const MainContent = styled.div`
  width: 70%;
  overflow-y: auto;
  padding-left: 20px;
`;

const TopicIndex = styled.div`
  margin-left: 20px;
`;

const SidebarLink = styled.a<{ active: boolean }>`
  display: block;
  color: ${(props) => (props.active ? "#4a90e2" : "#b0b0b0")};
  text-decoration: none;
  margin-bottom: 5px;
  cursor: pointer;
  &:hover {
    color: #808080;
  }
`;

const ChapterTitle = styled.h2`
  color: #4a90e2;
  margin-bottom: 10px;
`;

const TopicContainer = styled.div`
  margin-bottom: 45px;
`;

const TopicTitle = styled.h3`
  color: #4a90e2;
  margin-bottom: 10px;
`;

const MidiList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const MidiItem = styled.li`
  margin-bottom: 5px;
`;

const MidiLink = styled(Link)`
  color: #f0f0f0;
  text-decoration: none;
  &:visited {
    color: #c0c0c0;
  }
  &:hover {
    color: #a0a0a0;
  }
  &:visited:hover {
    color: #909090;
  }
`;

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState("");
  const topicRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>(
    {},
  );
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    path.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        topicRefs.current[topic.topic] = React.createRef();
      });
    });
  }, []);

  const scrollToTopic = (topic: string) => {
    topicRefs.current[topic].current?.scrollIntoView({
      block: "start",
      behavior: "instant",
    });
  };

  const handleScroll = () => {
    if (mainContentRef.current) {
      const scrollPosition = mainContentRef.current.scrollTop;
      let currentChapter = 0;
      let currentTopic = "";

      path.forEach((chapter, chapterIndex) => {
        chapter.topics.forEach((topic) => {
          const topicElement = topicRefs.current[topic.topic].current;
          if (topicElement && topicElement.offsetTop <= scrollPosition + 100) {
            currentChapter = chapterIndex;
            currentTopic = topic.topic;
          }
        });
      });

      setActiveChapter(currentChapter);
      setActiveTopic(currentTopic);
    }
  };

  return (
    <PathContainer>
      <ChapterNavigation>
        {path.map((chapter, index) => (
          <ChapterButton
            key={chapter.chapter}
            active={index === activeChapter}
            onClick={() => {
              setActiveChapter(index);
              scrollToTopic(chapter.topics[0].topic);
            }}
          >
            {chapter.chapter}
          </ChapterButton>
        ))}
      </ChapterNavigation>
      <ContentContainer>
        <Sidebar>
          {path[activeChapter].topics.map((topic) => (
            <SidebarLink
              key={topic.topic}
              active={topic.topic === activeTopic}
              onClick={() => scrollToTopic(topic.topic)}
            >
              {topic.topic}
            </SidebarLink>
          ))}
        </Sidebar>
        <MainContent ref={mainContentRef} onScroll={handleScroll}>
          {path.map((chapter) => (
            <div key={chapter.chapter}>
              <ChapterTitle>{chapter.chapter}</ChapterTitle>
              {chapter.topics.map((topic) => (
                <TopicContainer
                  key={topic.topic}
                  ref={topicRefs.current[topic.topic]}
                >
                  <TopicTitle>{topic.topic}</TopicTitle>
                  <MidiList>
                    {topic.midis.map((midi, midiIndex) => (
                      <MidiItem key={midiIndex}>
                        <MidiLink to={`/f/${midi}`}>
                          {midi.replace(/---/g, " – ").replace(/-/g, " ")}
                        </MidiLink>
                      </MidiItem>
                    ))}
                  </MidiList>
                </TopicContainer>
              ))}
            </div>
          ))}
        </MainContent>
      </ContentContainer>
    </PathContainer>
  );
};

export default PathView;
