import * as React from "react";
import { TWELVE_TONE_COLORS } from "./romanNumerals";

const CHORD_TONE_HEIGHT = 8;

const ChordTone = ({ degree }) => (
  <div
    style={{
      height: CHORD_TONE_HEIGHT,
      width: "100%",
      backgroundColor: TWELVE_TONE_COLORS[degree],
      margin: "10px",
      position: "absolute",
      left: 0,
      top: ((19 - degree) % 12) * CHORD_TONE_HEIGHT,
    }}
  ></div>
);

const Chord = ({ degrees }) => (
  <div
    style={{
      display: "inline-block",
      position: "relative",
      height: 12 * CHORD_TONE_HEIGHT,
      width: "60px",
    }}
  >
    {degrees.toReversed().map((degree) => (
      <ChordTone degree={degree} />
    ))}
  </div>
);

export const ChordPlayground = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "10px",
        backgroundColor: "black",
      }}
    >
      <div>
        Chords in natural major: I = <Chord degrees={[0, 4, 7]} />, ii ={" "}
        <Chord degrees={[2, 5, 9]} />
      </div>
      <div>
        I IV V7 I = <Chord degrees={[0, 4, 7]} />
        <Chord degrees={[5, 9, 0]} />
        <Chord degrees={[7, 11, 2, 5]} />
        <Chord degrees={[0, 4, 7]} />
      </div>
    </div>
  );
};
