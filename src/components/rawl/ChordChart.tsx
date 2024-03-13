import * as React from "react";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { PitchClass } from "./analysis";
import { CHORDS, Chord, ChordLegend } from "./course/ChordClouds";

// TODO: position superscripts nicer:
// https://chat.openai.com/share/42b5dd9d-73e0-426b-a704-cded9796b612

// TODO: show guitar chord on hover
// https://chat.openai.com/share/aa1a4c44-98b9-46b2-bd82-a2ffff7a714c
const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
}> = ({
  name,
  colorScheme,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
}) => {
  const isCurrentChord = CHORDS[name].every((scaleDegree) =>
    scaleDegreesUnderCursor.has(scaleDegree),
  );
  const isArpeggiatedCurrentChord = CHORDS[name].every((scaleDegree) =>
    scaleDegreesAroundCursor.has(scaleDegree),
  );
  return (
    <div
      style={{
        width: 70,
        height: 90,
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ChordLegend name={name} colorScheme={colorScheme} />
      </div>
      <div
        style={{
          fontSize: 20,
          position: "absolute",
          top: -8,
          left: "-3.5em",
          textAlign: "right",
          width: "2.5em",
          height: "2em",
          transition: `background-color 0.3s linear, color 0.3s linear${
            isArpeggiatedCurrentChord ? "" : ", box-shadow 0.2s linear"
          }`,
          boxShadow: isArpeggiatedCurrentChord ? "0px 0px 0px 1px white" : "",
          backgroundColor: isCurrentChord ? "white" : "transparent",
          color: isCurrentChord ? "black" : "white",
        }}
      >
        {name
          .replace("b", "♭")
          .replace("7", "⁷")
          .replace("o", "ᵒ")
          .replace("6", "⁶")
          .replace("4", "₄")
          .replace("5", "₅")}
      </div>
    </div>
  );
};

const ChordRow: React.FC<{
  title: string;
  chords: Chord[];
  colorScheme: ColorScheme;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
}> = ({
  title,
  chords,
  colorScheme,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, 170px)",
      justifyContent: "space-between",
      gap: "10px",
    }}
  >
    <div>{title}</div>
    {chords.map((chord) => (
      <Chord
        name={chord}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
      />
    ))}
  </div>
);

const ChordChart: React.FC<{
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
}> = ({ scaleDegreesUnderCursor, scaleDegreesAroundCursor }) => {
  const { colorScheme } = useColorScheme();
  return (
    <div style={{ position: "fixed", left: 2, marginTop: 40, width: "100vw" }}>
      <ChordRow
        title="minor key"
        chords={["iv", "bVI", "i", "bIII", "v", "bVII"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
      />
      <ChordRow
        title="major key"
        chords={["ii", "IV", "vi", "I", "iii", "V"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
      />
      <ChordRow
        title="applied"
        chords={["V/ii", "V7/IV", "V/vi", "V7", "V/iii", "V/V"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
      />
      {/* <ChordRow
        title="dominants"
        chords={["V7", "Vsus4", "V+", "bII"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      />
      <ChordRow
        title="Mozart"
        chords={[
          "It",
          "Fr",
          "Ger",
          "Cad64",
          "cad64",
          "ii65",
          "iiø65",
          "viio7",
          "viio7/V",
        ]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      />
      <ChordRow
        title="chord types"
        chords={["I+", "I", "I7", "I△", "i", "i7", "i△", "io", "io7", "iø7"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      /> */}
    </div>
  );
};

export default ChordChart;
