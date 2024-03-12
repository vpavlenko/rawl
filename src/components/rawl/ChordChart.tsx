import * as React from "react";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { PitchClass } from "./analysis";
import { CHORDS, Chord, ChordLegend } from "./course/ChordClouds";

// TODO: position superscripts nicer:
// https://chat.openai.com/share/42b5dd9d-73e0-426b-a704-cded9796b612
const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
  scaleDegreesUnderCursor: Set<PitchClass>;
}> = ({ name, colorScheme, scaleDegreesUnderCursor }) => {
  const isCurrentChord = CHORDS[name].every((scaleDegree) =>
    scaleDegreesUnderCursor.has(scaleDegree),
  );
  debugger;
  // we need to know the current tonic
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      <span
        style={{
          fontSize: 20,
          position: "relative",
          top: -6,
          marginRight: 20,
          transition: "background-color 0.4s linear, color 0.4s linear",
          backgroundColor: isCurrentChord ? "white" : "black",
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
      </span>
      <span
        style={{
          width: 70,
          height: 90,
          display: "inline-block",
          marginRight: 5,
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
      </span>
    </div>
  );
};

const ChordRow: React.FC<{
  title: string;
  chords: Chord[];
  colorScheme: ColorScheme;
  scaleDegreesUnderCursor: Set<PitchClass>;
}> = ({ title, chords, colorScheme, scaleDegreesUnderCursor }) => (
  <div style={{ display: "flex", flexDirection: "row" }}>
    <div style={{ marginRight: 30 }}>{title}</div>
    {chords.map((chord) => (
      <Chord
        name={chord}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      />
    ))}
  </div>
);

const ChordChart: React.FC<{ scaleDegreesUnderCursor: Set<PitchClass> }> = ({
  scaleDegreesUnderCursor,
}) => {
  const { colorScheme } = useColorScheme();
  return (
    <div style={{ position: "fixed", left: 2, marginTop: 40 }}>
      <ChordRow
        title="minor key"
        chords={["iv", "bVI", "i", "bIII", "v", "bVII"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      />
      <ChordRow
        title="major key"
        chords={["ii", "IV", "vi", "I", "iii", "V"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
      />
      <ChordRow
        title="applied"
        chords={["V/ii", "V7/IV", "V/vi", "V/iii", "V/V"]}
        colorScheme={colorScheme}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
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
