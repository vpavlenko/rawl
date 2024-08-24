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

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeTopic, setActiveTopic] = useState("");
  const topicRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>(
    {},
  );
  const scrollContainerRef = useRef<Element | null>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const findScrollableParent = (element: Element | null): Element | null => {
      if (!element) return null;
      if (element.scrollHeight > element.clientHeight) {
        return element;
      }
      return findScrollableParent(element.parentElement);
    };

    const contentArea = document.querySelector(".App-main-content-area");
    const scrollableParent = findScrollableParent(contentArea);

    if (scrollableParent) {
      scrollContainerRef.current = scrollableParent;
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
    const scrollContainer = scrollContainerRef.current;
    if (topicElement && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const topicRect = topicElement.getBoundingClientRect();
      const relativeTop = topicRect.top - containerRect.top;
      const targetScrollTop = scrollContainer.scrollTop + relativeTop - 100; // 100px from top

      // Animate scroll
      const startScrollTop = scrollContainer.scrollTop;
      const distance = targetScrollTop - startScrollTop;
      const duration = 200; // ms
      let start: number | null = null;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const percentage = Math.min(progress / duration, 1);
        scrollContainer.scrollTop =
          startScrollTop + distance * easeInOutCubic(percentage);
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };

      window.requestAnimationFrame(step);
    }
  };

  const scrollToChapter = (chapterIndex: number) => {
    const firstTopicOfChapter = path[chapterIndex].topics[0].topic;
    scrollToTopic(firstTopicOfChapter);
  };

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = window.setTimeout(() => {
      if (!scrollContainerRef.current) return;

      const containerRect = scrollContainerRef.current.getBoundingClientRect();
      const triggerPoint = containerRect.top + 100; // 100px from top

      let currentChapter = 0;
      let currentTopic = "";

      path.forEach((chapter, chapterIndex) => {
        chapter.topics.forEach((topic) => {
          const topicElement = topicRefs.current[topic.topic].current;
          if (topicElement) {
            const topicRect = topicElement.getBoundingClientRect();
            if (
              topicRect.top <= triggerPoint &&
              topicRect.bottom > triggerPoint
            ) {
              currentChapter = chapterIndex;
              currentTopic = topic.topic;
            }
          }
        });
      });

      setActiveChapter(currentChapter);
      setActiveTopic(currentTopic);
    }, 100); // Debounce for 100ms
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => {
        scrollContainer.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current !== null) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  // Easing function for smooth animation
  const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

  return (
    <PathContainer>
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
