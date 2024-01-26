import isEqual from "lodash/isEqual";
import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { ColorScheme, useColorScheme } from "../ColorScheme";
import { SPLIT_NOTE_HEIGHT } from "../SystemLayout";
import { Row } from "./Course";

const NOTES = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];
const CLOUD_HEIGHT = 300;
const CLOUD_WIDTH = 200;
const CLOUD_LEGENT_NOTE_HEIGHT = 20;
const CHORDS = {
  ii: [2, 5, 9],
  iii: [4, 7, 11],
  I: [0, 4, 7], // Note: This will be the value of the last "I" chord in the array
  vi: [9, 0, 4],
  IV: [5, 9, 0],
  V: [7, 11, 2], // Note: This will be the value of the last "V" chord in the array
  V7: [7, 11, 2, 5],
  "V/V": [2, 6, 9],
  "V/V/V": [9, 1, 4],
  "V/ii": [9, 1, 4],
  III: [4, 8, 11],
};
type Chord = keyof typeof CHORDS;

const CloudPianoKey = styled.div`
  user-select: none;
  width: 100px;
  height: ${CLOUD_LEGENT_NOTE_HEIGHT}px;
  text-align: center;
  vertical-align: bottom;
  color: white;
  text-shadow:
    0px 0px 5px black,
    0px 0px 3px black;
  display: grid;
  align-content: end;
  border-radius: 5px;
  box-sizing: border-box;
  border-width: 5px;
`;

const ChordCloud: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
}> = React.memo(({ name, colorScheme }) => {
  const notes = CHORDS[name];
  const [numRerenders, setNumRerenders] = useState(0);
  const noteDivs = [];
  for (let i = 0; i < 100; ++i) {
    const width = Math.random() * 50;

    noteDivs.push(
      <div
        className={`noteColor_${
          notes[Math.floor(Math.random() * notes.length)]
        }_${colorScheme}`}
        style={{
          position: "absolute",
          top: Math.random() * (CLOUD_HEIGHT - SPLIT_NOTE_HEIGHT),
          left: Math.random() * (CLOUD_WIDTH - width),
          width,
          height: SPLIT_NOTE_HEIGHT,
          boxSizing: "border-box",
          borderRadius: "5px",
        }}
      />,
    );
  }

  const legendNotes = [];
  let top = 0;
  for (let i = notes.length - 1; i >= 0; i--) {
    const note = notes[i];
    legendNotes.push(
      <div style={{ position: "absolute", top, left: -50 }}>
        <CloudPianoKey
          className={`noteColor_${note}_${colorScheme}`}
        ></CloudPianoKey>
        <div
          style={{
            backgroundColor: "black",
            borderRadius: "50%",
            fontSize: 14,
            width: 15,
            height: 15,
            position: "absolute",
            left: 42,
            textAlign: "center",
            top: 2,
          }}
        >
          {NOTES[note]}
        </div>
      </div>,
    );
    if (i > 0) {
      top += ((12 + notes[i] - notes[i - 1]) % 12) * CLOUD_LEGENT_NOTE_HEIGHT;
    }
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: CLOUD_WIDTH,
          height: CLOUD_HEIGHT,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseMove={() => setNumRerenders(numRerenders + 1)}
      >
        {noteDivs}
        <span
          style={{
            fontSize: 72,
            zIndex: 10,
            textShadow:
              "0 0 1px black, 0 0 3px black, 0 0 5px black, 0 0 7px black, 0 0 10px black, 0 0 15px black, 0 0 20px black, 0 0 30px black",
          }}
        >
          {name}
        </span>
      </div>
      <span style={{ fontSize: 20, position: "relative" }}>{legendNotes}</span>
    </div>
  );
}, isEqual);

const ChordClouds = ({ chords }: { chords: Chord[] }) => {
  const { colorScheme } = useColorScheme();
  return (
    <div>
      <div style={{ position: "relative" }}>
        <Row style={{ position: "absolute", left: 800 }}>
          {chords.map((chord) => (
            <>
              <ChordCloud name={chord} colorScheme={colorScheme} />{" "}
            </>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ChordClouds;
