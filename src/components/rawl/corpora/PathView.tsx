import React, { useContext, useState } from "react";
import styled from "styled-components";
import { AppContext } from "../../AppContext";
import FrozenNotes from "../FrozenNotes";
import Rawl from "../Rawl";
import { ColoredNote } from "../parseMidi";
import { topicToFrozenStrings } from "../pathViewFrozenSnippets";
import path from "./path";

const PathContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

const ChapterRow = styled.div`
  display: flex;
  overflow-x: auto;
  background-color: #1a1a1a;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const ChapterButton = styled.button<{ active: boolean }>`
  padding: 10px 20px;
  text-align: center;
  background-color: ${(props) => (props.active ? "#4a90e2" : "transparent")};
  color: white;
  border: none;
  cursor: pointer;
  white-space: nowrap;
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

const TopicCard = styled.div`
  background-color: #000000;
  margin: 5px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  vertical-align: top;
  max-width: 20em;
`;

const TopicTitle = styled.h3`
  font-size: 18px;
  margin: 0 0 10px 0;
  color: #ffffff;
  word-wrap: break-word;
  padding-left: 1em;
  text-indent: -1em;
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

const MiniNotesDisplay = styled.div`
  margin: 15px 0;
  width: 100%;
`;

const topicToFrozenNotes: { [key: string]: ColoredNote[][] } =
  Object.fromEntries(
    Object.entries(topicToFrozenStrings).map(([key, value]) => [
      key,
      JSON.parse(value),
    ]),
  );

const PathView: React.FC = () => {
  const { handleSongClick, rawlProps } = useContext(AppContext);
  const [activeChapter, setActiveChapter] = useState(0);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  const handleMidiClick = (slug: string) => {
    console.log("handleMidiClick called with slug:", slug);
    handleSongClick(`f:${slug}`);
  };

  const measureWidth = 100;
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;
  const scale = 0.9; // Define scale factor

  return (
    <PathContainer>
      <ChapterRow>
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
      </ChapterRow>
      <ContentArea>
        {path[activeChapter].topics.map((topic) => (
          <TopicCard key={topic.topic}>
            <TopicTitle>{topic.topic}</TopicTitle>
            {topicToFrozenNotes[topic.topic] && (
              <MiniNotesDisplay>
                <FrozenNotes
                  notes={topicToFrozenNotes[topic.topic]}
                  measureWidth={measureWidth}
                  midiNumberToY={midiNumberToY}
                  scale={scale} // Pass scale to FrozenNotes
                  maxWidth={20 * 16} // 20em * 16px (assuming 1em = 16px)
                />
              </MiniNotesDisplay>
            )}
            {topic.midis.map((midi, index) => (
              <MidiButton key={index} onClick={() => handleMidiClick(midi)}>
                {midi.replace(/---/g, " – ").replace(/-/g, " ")}
              </MidiButton>
            ))}
          </TopicCard>
        ))}
      </ContentArea>
      {rawlProps && rawlProps.parsingResult && (
        <RawlContainer>
          <Rawl {...rawlProps} />
        </RawlContainer>
      )}
    </PathContainer>
  );
};

const RawlContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background-color: #000;
  z-index: 1000;
`;

export default PathView;
