import React, { useState } from "react";
import styled from "styled-components";
import FrozenNotes from "../FrozenNotes";
import { ColoredNote } from "../parseMidi";
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

// Add this type definition
type GeneratedNote = {
  note: { midiNumber: number };
  id: number;
  isDrum: boolean;
  span: number[];
  voiceIndex: number;
  color: string;
  isActive: boolean;
};

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  // Example frozen notes data
  const frozenNotesData: GeneratedNote[][] = [
    [
      {
        note: {
          midiNumber: 67,
        },
        id: 0,
        isDrum: false,
        span: [0, 0.24895833333333334],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 67,
        },
        id: 1,
        isDrum: false,
        span: [0.25, 0.3322916666666667],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 69,
        },
        id: 2,
        isDrum: false,
        span: [0.33333333333333337, 0.4156250000000001],
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 67,
        },
        id: 3,
        isDrum: false,
        span: [0.41666666666666674, 0.49895833333333345],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 76,
        },
        id: 4,
        isDrum: false,
        span: [0.5000000000000001, 0.6239583333333335],
        voiceIndex: 0,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 67,
        },
        id: 5,
        isDrum: false,
        span: [0.8750000000000001, 0.9989583333333335],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 69,
        },
        id: 6,
        isDrum: false,
        span: [1.0000000000000002, 1.1239583333333334],
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 69,
        },
        id: 7,
        isDrum: false,
        span: [1.2500000000000002, 1.3739583333333334],
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 74,
        },
        id: 8,
        isDrum: false,
        span: [1.5000000000000002, 1.8739583333333334],
        voiceIndex: 0,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 72,
        },
        id: 9,
        isDrum: false,
        span: [1.8750000000000002, 1.9989583333333334],
        voiceIndex: 0,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 71,
        },
        id: 10,
        isDrum: false,
        span: [2.0000000000000004, 2.2489583333333334],
        voiceIndex: 0,
        color: "noteColor_11_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 71,
        },
        id: 11,
        isDrum: false,
        span: [2.25, 2.3739583333333334],
        voiceIndex: 0,
        color: "noteColor_11_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 72,
        },
        id: 12,
        isDrum: false,
        span: [2.375, 2.4989583333333334],
        voiceIndex: 0,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 74,
        },
        id: 13,
        isDrum: false,
        span: [2.5, 2.5614583333333334],
        voiceIndex: 0,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 76,
        },
        id: 14,
        isDrum: false,
        span: [2.625, 2.6864583333333334],
        voiceIndex: 0,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 77,
        },
        id: 15,
        isDrum: false,
        span: [2.75, 2.8114583333333334],
        voiceIndex: 0,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 79,
        },
        id: 16,
        isDrum: false,
        span: [2.875, 2.9364583333333334],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 81,
        },
        id: 17,
        isDrum: false,
        span: [3, 3.1864583333333334],
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 81,
        },
        id: 18,
        isDrum: false,
        span: [3.375, 3.4364583333333334],
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 79,
        },
        id: 19,
        isDrum: false,
        span: [3.5, 3.9989583333333334],
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
    ],
    [
      {
        note: {
          midiNumber: 48,
        },
        id: 517,
        isDrum: false,
        span: [0, 0.24895833333333334],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 518,
        isDrum: false,
        span: [0.25, 0.49895833333333345],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 519,
        isDrum: false,
        span: [0.25, 0.49895833333333345],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 64,
        },
        id: 520,
        isDrum: false,
        span: [0.25, 0.49895833333333345],
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 521,
        isDrum: false,
        span: [0.5000000000000001, 0.7489583333333335],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 522,
        isDrum: false,
        span: [0.5000000000000001, 0.7489583333333335],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 64,
        },
        id: 523,
        isDrum: false,
        span: [0.5000000000000001, 0.7489583333333335],
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 41,
        },
        id: 524,
        isDrum: false,
        span: [1.0000000000000002, 1.2489583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 53,
        },
        id: 525,
        isDrum: false,
        span: [1.0000000000000002, 1.2489583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 53,
        },
        id: 526,
        isDrum: false,
        span: [1.2500000000000002, 1.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 57,
        },
        id: 527,
        isDrum: false,
        span: [1.2500000000000002, 1.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 62,
        },
        id: 528,
        isDrum: false,
        span: [1.2500000000000002, 1.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 53,
        },
        id: 529,
        isDrum: false,
        span: [1.5000000000000002, 1.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 57,
        },
        id: 530,
        isDrum: false,
        span: [1.5000000000000002, 1.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 62,
        },
        id: 531,
        isDrum: false,
        span: [1.5000000000000002, 1.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 43,
        },
        id: 532,
        isDrum: false,
        span: [2.0000000000000004, 2.2489583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 533,
        isDrum: false,
        span: [2.0000000000000004, 2.2489583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 534,
        isDrum: false,
        span: [2.25, 2.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 59,
        },
        id: 535,
        isDrum: false,
        span: [2.25, 2.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_11_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 65,
        },
        id: 536,
        isDrum: false,
        span: [2.25, 2.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 537,
        isDrum: false,
        span: [2.5, 2.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 59,
        },
        id: 538,
        isDrum: false,
        span: [2.5, 2.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_11_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 65,
        },
        id: 539,
        isDrum: false,
        span: [2.5, 2.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 48,
        },
        id: 540,
        isDrum: false,
        span: [3, 3.2489583333333334],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 541,
        isDrum: false,
        span: [3.25, 3.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 542,
        isDrum: false,
        span: [3.25, 3.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 64,
        },
        id: 543,
        isDrum: false,
        span: [3.25, 3.4989583333333334],
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 544,
        isDrum: false,
        span: [3.5, 3.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 545,
        isDrum: false,
        span: [3.5, 3.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 64,
        },
        id: 546,
        isDrum: false,
        span: [3.5, 3.7489583333333334],
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
    ],
  ];

  const measureWidth = 100; // Fixed width for each measure
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;

  // Add this function to convert GeneratedNote to ColoredNote
  const convertToColoredNotes = (notes: GeneratedNote[][]): ColoredNote[][] => {
    return notes.map((voice) =>
      voice.map((note) => ({
        ...note,
        span: note.span as [number, number],
      })),
    );
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
        <TopicCard>
          <TopicTitle>Frozen Notes Example</TopicTitle>
          <FrozenNotes
            notes={convertToColoredNotes(frozenNotesData)}
            measureWidth={measureWidth}
            midiNumberToY={midiNumberToY}
          />
        </TopicCard>
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
