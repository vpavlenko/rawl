import isEqual from "lodash/isEqual";
import * as React from "react";
import { useState } from "react";
import styled from "styled-components";
import { ColorScheme, useColorScheme } from "../ColorScheme";
import { Row } from "./Course";

const NOTE_HEIGHT = 5;

const NOTES = ["1", "b2", "2", "b3", "3", "4", "#4", "5", "b6", "6", "b7", "7"];
const CLOUD_HEIGHT = 200;
const CLOUD_WIDTH = 150;
const CLOUD_LEGEND_NOTE_HEIGHT = 15;
const CHORDS = {
  i: [0, 3, 7],
  ii: [2, 5, 9],
  ii7: [2, 5, 9, 0],
  iii: [4, 7, 11],
  iii7: [4, 7, 11, 2],
  iv: [5, 8, 0],
  I: [0, 4, 7],
  "V7/IV": [0, 4, 7, 10],
  I7: [0, 4, 7, 10],
  vi: [9, 0, 4],
  vi7: [9, 0, 4, 7],
  IV: [5, 9, 0],
  IV7: [5, 9, 0, 3],
  V: [7, 11, 2],
  V7: [7, 11, 2, 5],
  V7b9: [7, 11, 2, 5, 8],
  "V/V": [2, 6, 9],
  "V/V/V": [9, 1, 4],
  "V/ii": [9, 1, 4],
  III: [4, 8, 11],
  "V/vi": [4, 8, 11],
  Vsus4: [7, 0, 2],
  "I△": [0, 4, 7, 11],
  "IV△": [5, 9, 0, 4],
  I5: [0, 7],
  IV5: [5, 0],
  V5: [7, 2],
  v: [7, 10, 2],
  bVI: [8, 0, 3],
  bVII: [10, 2, 5],
  bIII: [3, 7, 10],
  bII: [1, 5, 8],
  "V+": [7, 11, 3],
};
type Chord = keyof typeof CHORDS;

const CloudPianoKey = styled.div`
  user-select: none;
  width: 100px;
  height: ${CLOUD_LEGEND_NOTE_HEIGHT}px;
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
  for (let i = 0; i < 60; ++i) {
    const width = Math.random() * 40;

    noteDivs.push(
      <div
        key={i}
        className={`noteColor_${
          notes[Math.floor(Math.random() * notes.length)]
        }_${colorScheme}`}
        style={{
          position: "absolute",
          top: Math.random() * (CLOUD_HEIGHT - NOTE_HEIGHT),
          left: Math.random() * (CLOUD_WIDTH - width),
          width,
          height: NOTE_HEIGHT,
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
      <div key={i} style={{ position: "absolute", top, left: -50 }}>
        <CloudPianoKey
          className={`noteColor_${note}_${colorScheme}`}
        ></CloudPianoKey>
        <div
          style={{
            fontSize: CLOUD_LEGEND_NOTE_HEIGHT - 3,
            width: CLOUD_LEGEND_NOTE_HEIGHT,
            height: CLOUD_LEGEND_NOTE_HEIGHT,
            position: "absolute",
            left: 42,
            textAlign: "center",
            top: 0,
            textShadow:
              "0 0 1px black, 0 0 3px black, 0 0 6px black, 0 0 9px black",
            fontWeight: 700,
          }}
        >
          {NOTES[note]}
        </div>
      </div>,
    );
    if (i > 0) {
      top += ((12 + notes[i] - notes[i - 1]) % 12) * CLOUD_LEGEND_NOTE_HEIGHT;
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
            fontSize: 48,
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
        <Row style={{ position: "absolute", left: 750 }}>
          {chords.map((chord, index) => (
            <React.Fragment key={index}>
              <ChordCloud name={chord} colorScheme={colorScheme} />{" "}
            </React.Fragment>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default ChordClouds;
