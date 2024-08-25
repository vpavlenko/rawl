import React, { useState } from "react";
import styled from "styled-components";
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

interface FrozenNotesProps {
  notes: ColoredNote[][];
  measureWidth: number;
  midiNumberToY: (midiNumber: number) => number;
}

const FrozenNotes: React.FC<FrozenNotesProps> = ({
  notes,
  measureWidth,
  midiNumberToY,
}) => {
  const getNoteRectangles = (notes: ColoredNote[]) => {
    return notes.map((note) => {
      const {
        span,
        color,
        voiceIndex,
        isActive,
        isDrum,
        note: { midiNumber },
      } = note;
      const top = midiNumberToY(midiNumber);
      const left = span[0] * measureWidth;
      const width = (span[1] - span[0]) * measureWidth;

      return (
        <div
          key={`nr_${note.id}`}
          className={`${color} voiceShape-${voiceIndex}`}
          style={{
            position: "absolute",
            height: `${isActive ? 4 : 0.5}px`,
            width: isDrum ? "0px" : width,
            top: isActive ? top : top + 4 - 0.5,
            left,
            backgroundColor: color,
            zIndex: Math.round(10 + 1000 / width),
          }}
        />
      );
    });
  };

  return (
    <div style={{ position: "relative", height: "600px", width: "100%" }}>
      {notes.map((voiceNotes, index) => (
        <div key={index}>{getNoteRectangles(voiceNotes)}</div>
      ))}
    </div>
  );
};

const PathView: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState(0);

  const handleChapterSelect = (index: number) => {
    setActiveChapter(index);
  };

  // Example frozen notes data
  const frozenNotesData = [
    [
      {
        note: {
          midiNumber: 69,
        },
        id: 36,
        isDrum: false,
        span: [6, 6.123958333333333],
        chipState: {
          on: {
            index: "0x123",
            delta: 13,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 69,
            param2: 75,
            playTime: 6000,
            track: 0,
          },
          off: {
            index: "0x127",
            delta: 119,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 69,
            param2: 127,
            playTime: 6123.958333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 72,
        },
        id: 37,
        isDrum: false,
        span: [6.125, 6.248958333333333],
        chipState: {
          on: {
            index: "0x12a",
            delta: 1,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 72,
            param2: 75,
            playTime: 6125,
            track: 0,
          },
          off: {
            index: "0x12d",
            delta: 12,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 72,
            param2: 127,
            playTime: 6248.958333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 77,
        },
        id: 38,
        isDrum: false,
        span: [6.375, 6.492708333333333],
        chipState: {
          on: {
            index: "0x130",
            delta: 120,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 77,
            param2: 75,
            playTime: 6375,
            track: 0,
          },
          off: {
            index: "0x133",
            delta: 6,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 77,
            param2: 127,
            playTime: 6492.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 74,
        },
        id: 39,
        isDrum: false,
        span: [6.5, 6.617708333333333],
        chipState: {
          on: {
            index: "0x136",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 74,
            param2: 75,
            playTime: 6500,
            track: 0,
          },
          off: {
            index: "0x139",
            delta: 113,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 74,
            param2: 127,
            playTime: 6617.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_9_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 72,
        },
        id: 40,
        isDrum: false,
        span: [6.625, 6.742708333333333],
        chipState: {
          on: {
            index: "0x13c",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 72,
            param2: 75,
            playTime: 6625,
            track: 0,
          },
          off: {
            index: "0x13f",
            delta: 6,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 72,
            param2: 127,
            playTime: 6742.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 69,
        },
        id: 41,
        isDrum: false,
        span: [6.75, 6.867708333333333],
        chipState: {
          on: {
            index: "0x142",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 69,
            param2: 75,
            playTime: 6750,
            track: 0,
          },
          off: {
            index: "0x145",
            delta: 113,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 69,
            param2: 127,
            playTime: 6867.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 68,
        },
        id: 42,
        isDrum: false,
        span: [6.875, 6.992708333333333],
        chipState: {
          on: {
            index: "0x148",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 68,
            param2: 75,
            playTime: 6875,
            track: 0,
          },
          off: {
            index: "0x14b",
            delta: 6,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 68,
            param2: 127,
            playTime: 6992.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_3_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 67,
        },
        id: 43,
        isDrum: false,
        span: [7, 7.117708333333333],
        chipState: {
          on: {
            index: "0x14e",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 67,
            param2: 75,
            playTime: 7000,
            track: 0,
          },
          off: {
            index: "0x151",
            delta: 113,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 67,
            param2: 127,
            playTime: 7117.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 70,
        },
        id: 44,
        isDrum: false,
        span: [7.125, 7.242708333333333],
        chipState: {
          on: {
            index: "0x154",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 70,
            param2: 75,
            playTime: 7125,
            track: 0,
          },
          off: {
            index: "0x157",
            delta: 6,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 70,
            param2: 127,
            playTime: 7242.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 76,
        },
        id: 45,
        isDrum: false,
        span: [7.25, 7.367708333333333],
        chipState: {
          on: {
            index: "0x15a",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 76,
            param2: 75,
            playTime: 7250,
            track: 0,
          },
          off: {
            index: "0x15d",
            delta: 113,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 76,
            param2: 127,
            playTime: 7367.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_11_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 72,
        },
        id: 46,
        isDrum: false,
        span: [7.375, 7.492708333333333],
        chipState: {
          on: {
            index: "0x160",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 0,
            param1: 72,
            param2: 75,
            playTime: 7375,
            track: 0,
          },
          off: {
            index: "0x163",
            delta: 6,
            type: 8,
            subtype: 8,
            channel: 0,
            param1: 72,
            param2: 127,
            playTime: 7492.708333333333,
            track: 0,
          },
        },
        voiceIndex: 0,
        color: "noteColor_7_colors",
        isActive: true,
      },
    ],
    [
      {
        note: {
          midiNumber: 53,
        },
        id: 260,
        isDrum: false,
        span: [6, 6.236458333333333],
        chipState: {
          on: {
            index: "0x6b7",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 53,
            param2: 62,
            playTime: 6000,
            track: 1,
          },
          off: {
            index: "0x6ba",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 53,
            param2: 127,
            playTime: 6236.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_0_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 57,
        },
        id: 261,
        isDrum: false,
        span: [6.25, 6.486458333333333],
        chipState: {
          on: {
            index: "0x6be",
            delta: 1,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 57,
            param2: 62,
            playTime: 6250,
            track: 1,
          },
          off: {
            index: "0x6c4",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 57,
            param2: 127,
            playTime: 6486.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 262,
        isDrum: false,
        span: [6.25, 6.486458333333333],
        chipState: {
          on: {
            index: "0x6c1",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 60,
            param2: 62,
            playTime: 6250,
            track: 1,
          },
          off: {
            index: "0x6c8",
            delta: 0,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 60,
            param2: 127,
            playTime: 6486.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 48,
        },
        id: 263,
        isDrum: false,
        span: [6.5, 6.736458333333333],
        chipState: {
          on: {
            index: "0x6cb",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 48,
            param2: 62,
            playTime: 6500,
            track: 1,
          },
          off: {
            index: "0x6ce",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 48,
            param2: 127,
            playTime: 6736.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 57,
        },
        id: 264,
        isDrum: false,
        span: [6.75, 6.986458333333333],
        chipState: {
          on: {
            index: "0x6d2",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 57,
            param2: 62,
            playTime: 6750,
            track: 1,
          },
          off: {
            index: "0x6d8",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 57,
            param2: 127,
            playTime: 6986.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_4_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 265,
        isDrum: false,
        span: [6.75, 6.986458333333333],
        chipState: {
          on: {
            index: "0x6d5",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 60,
            param2: 62,
            playTime: 6750,
            track: 1,
          },
          off: {
            index: "0x6dc",
            delta: 0,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 60,
            param2: 127,
            playTime: 6986.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 55,
        },
        id: 266,
        isDrum: false,
        span: [7, 7.236458333333333],
        chipState: {
          on: {
            index: "0x6df",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 55,
            param2: 62,
            playTime: 7000,
            track: 1,
          },
          off: {
            index: "0x6e2",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 55,
            param2: 127,
            playTime: 7236.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_2_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 58,
        },
        id: 267,
        isDrum: false,
        span: [7.25, 7.486458333333333],
        chipState: {
          on: {
            index: "0x6e6",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 58,
            param2: 62,
            playTime: 7250,
            track: 1,
          },
          off: {
            index: "0x6ec",
            delta: 107,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 58,
            param2: 127,
            playTime: 7486.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 268,
        isDrum: false,
        span: [7.25, 7.486458333333333],
        chipState: {
          on: {
            index: "0x6e9",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 60,
            param2: 62,
            playTime: 7250,
            track: 1,
          },
          off: {
            index: "0x6f0",
            delta: 0,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 60,
            param2: 127,
            playTime: 7486.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 48,
        },
        id: 269,
        isDrum: false,
        span: [7.5, 7.736458333333333],
        chipState: {
          on: {
            index: "0x6f3",
            delta: 7,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 48,
            param2: 62,
            playTime: 7500,
            track: 1,
          },
          off: {
            index: "0x6f6",
            delta: 227,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 48,
            param2: 127,
            playTime: 7736.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 58,
        },
        id: 270,
        isDrum: false,
        span: [7.75, 7.986458333333333],
        chipState: {
          on: {
            index: "0x6fa",
            delta: 13,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 58,
            param2: 62,
            playTime: 7750,
            track: 1,
          },
          off: {
            index: "0x700",
            delta: 227,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 58,
            param2: 127,
            playTime: 7986.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_5_colors",
        isActive: true,
      },
      {
        note: {
          midiNumber: 60,
        },
        id: 271,
        isDrum: false,
        span: [7.75, 7.986458333333333],
        chipState: {
          on: {
            index: "0x6fd",
            delta: 0,
            type: 8,
            subtype: 9,
            channel: 1,
            param1: 60,
            param2: 62,
            playTime: 7750,
            track: 1,
          },
          off: {
            index: "0x704",
            delta: 0,
            type: 8,
            subtype: 8,
            channel: 1,
            param1: 60,
            param2: 127,
            playTime: 7986.458333333333,
            track: 1,
          },
        },
        voiceIndex: 1,
        color: "noteColor_7_colors",
        isActive: true,
      },
    ],
  ];

  const measureWidth = 100; // Fixed width for each measure
  const midiNumberToY = (midiNumber: number) => (127 - midiNumber) * 4;

  // Define a type for the frozen note data
  type FrozenNoteData = Omit<ColoredNote, "span"> & { span: [number, number] };

  // Cast the frozenNotesData to the correct type
  const typedFrozenNotesData: FrozenNoteData[][] =
    frozenNotesData as FrozenNoteData[][];

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
            notes={typedFrozenNotesData}
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
