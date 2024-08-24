import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 100%;
  margin: 0 auto;
`;

const ChapterNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 20px;
  background-color: #1a1a1a;
  position: fixed;
  top: 60px; // Adjust this value based on the actual height of your AppHeader
  left: 0;
  right: 0;
  z-index: 1000;
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
  margin-top: 120px; // Adjust this value based on the combined height of AppHeader and ChapterNavigation
`;

const Sidebar = styled.div`
  width: 30%;
  padding: 20px;
  position: fixed;
  top: 140px; // Adjust based on the height of AppHeader + ChapterNavigation
  bottom: 0;
  overflow-y: auto;
`;

const MainContent = styled.div`
  width: 70%;
  margin-left: 30%;
  padding: 20px;
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

const DebugInput = styled.input`
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 2000;
`;

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState("");
  const [debugValue, setDebugValue] = useState("");
  const topicRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>(
    {},
  );
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Find the scrollable container
    const findScrollableParent = (
      element: HTMLElement | null,
    ): HTMLElement | null => {
      if (!element) return null;
      if (element.scrollHeight > element.clientHeight) {
        return element;
      }
      return findScrollableParent(element.parentElement);
    };

    const contentArea = document.querySelector(".App-main-content-area");
    const scrollableParent = findScrollableParent(contentArea as HTMLElement);

    if (scrollableParent) {
      scrollContainerRef.current = scrollableParent;
      console.log("Scrollable container found:", scrollableParent);
    } else {
      console.warn("No scrollable container found");
    }

    path.forEach((chapter) => {
      chapter.topics.forEach((topic) => {
        topicRefs.current[topic.topic] = React.createRef();
      });
    });
  }, []);

  const scrollToTopic = (topic: string) => {
    const topicElement = topicRefs.current[topic].current;
    if (topicElement) {
      const yOffset = -140; // Adjust this value based on the height of your AppHeader + ChapterNavigation
      const y =
        topicElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "instant" });
    }
  };

  const scrollToChapter = (chapterIndex: number) => {
    const firstTopicOfChapter = path[chapterIndex].topics[0].topic;
    scrollToTopic(firstTopicOfChapter);
  };

  const handleScroll = useCallback(() => {
    console.log("Scroll event triggered");
    if (!scrollContainerRef.current) return;

    const scrollPosition = scrollContainerRef.current.scrollTop;
    let currentChapter = 0;
    let currentTopic = "";

    path.forEach((chapter, chapterIndex) => {
      chapter.topics.forEach((topic) => {
        const topicElement = topicRefs.current[topic.topic].current;
        if (topicElement && topicElement.offsetTop <= scrollPosition + 140) {
          currentChapter = chapterIndex;
          currentTopic = topic.topic;
        }
      });
    });

    console.log(
      `Current chapter: ${currentChapter}, Current topic: ${currentTopic}`,
    );
    setActiveChapter(currentChapter);
    setActiveTopic(currentTopic);
    setDebugValue(`Chapter: ${currentChapter}, Topic: ${currentTopic}`);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      console.log("Adding scroll event listener to", scrollContainer);
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        console.log("Removing scroll event listener");
        scrollContainer.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

  return (
    <PathContainer>
      <DebugInput type="text" value={debugValue} readOnly />
      <ChapterNavigation>
        {path.map((chapter, index) => (
          <ChapterButton
            key={chapter.chapter}
            active={index === activeChapter}
            onClick={() => {
              setActiveChapter(index);
              scrollToChapter(index);
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
        <MainContent>
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
