import React, { useRef } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
`;

const Sidebar = styled.div`
  width: 50%;
  padding-right: 20px;
`;

const TopicIndex = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
`;

const SidebarLink = styled.a`
  display: block;
  color: #b0b0b0;
  text-decoration: none;
  margin-bottom: 0px;
  cursor: pointer;
  &:hover {
    color: #808080;
  }
`;

const MainContent = styled.div`
  width: 50%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding-left: 20px;
`;

const TopicContainer = styled.div`
  margin-bottom: 45px;
`;

const TopicTitle = styled.h2`
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
  const topicRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement> }>(
    {},
  );

  React.useEffect(() => {
    path.forEach((topic) => {
      topicRefs.current[topic.topic] = React.createRef();
    });
  }, []);

  const scrollToTopic = (topic: string) => {
    topicRefs.current[topic].current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <PathContainer>
      <Sidebar>
        <TopicIndex>
          {path.map((topic) => (
            <SidebarLink
              key={topic.topic}
              onClick={() => scrollToTopic(topic.topic)}
            >
              {topic.topic}
            </SidebarLink>
          ))}
        </TopicIndex>
      </Sidebar>
      <MainContent>
        {path.map((topic) => (
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
      </MainContent>
    </PathContainer>
  );
};

export default PathView;
