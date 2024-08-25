import React, { useState } from "react";
import styled from "styled-components";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ChapterColumn = styled.div`
  width: 200px;
  flex-shrink: 0;
  background-color: #1a1a1a;
  overflow-y: auto;
  position: sticky;
  top: 0;
  height: 100%;
`;

const ContentArea = styled.div`
  flex-grow: 1;
  background-color: #333333;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
`;

const ChapterButton = styled.button<{ active: boolean }>`
  width: 100%;
  padding: 10px;
  text-align: left;
  background-color: ${(props) => (props.active ? "#4a90e2" : "transparent")};
  color: white;
  border: none;
  cursor: pointer;
`;

const TopicCard = styled.div`
  background-color: #2c2c2c;
  margin: 5px;
  padding: 10px;
  display: inline-block;
  vertical-align: top;
  max-width: 20em;
`;

const TopicTitle = styled.h3`
  font-size: 14px;
  margin: 0 0 10px 0;
  color: #f0f0f0;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
`;

const MidiLink = styled.a`
  display: block;
  padding: 3px 0;
  font-size: 12px;
  color: #b0b0b0;
  text-decoration: none;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
  &:hover {
    color: #4a90e2;
  }
`;

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  return (
    <PathContainer>
      <ChapterColumn>
        {path.map((chapter, index) => (
          <ChapterButton
            key={chapter.chapter}
            active={index === activeChapter}
            onClick={() => handleChapterSelect(index)}
            onMouseEnter={() => handleChapterSelect(index)}
          >
            {chapter.chapter}
          </ChapterButton>
        ))}
      </ChapterColumn>
      <ContentArea>
        {path[activeChapter].topics.map((topic) => (
          <TopicCard key={topic.topic}>
            <TopicTitle>{topic.topic}</TopicTitle>
            {topic.midis.map((midi, index) => (
              <MidiLink
                key={index}
                href={`/f/${midi}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {midi.replace(/---/g, " – ").replace(/-/g, " ")}
              </MidiLink>
            ))}
          </TopicCard>
        ))}
      </ContentArea>
    </PathContainer>
  );
};

export default PathView;
