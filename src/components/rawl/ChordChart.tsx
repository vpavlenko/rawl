import * as React from "react";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { Chord, ChordLegend } from "./course/ChordClouds";

const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
}> = ({ name, colorScheme }) => {
  return (
    <div
      style={{
        width: 100,
        height: 200,
        display: "inline-block",
        marginRight: 30,
      }}
    >
      <div style={{ position: "relative", left: 20, fontSize: 30 }}>{name}</div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <ChordLegend name={name} colorScheme={colorScheme} />
      </div>
    </div>
  );
};

const ChordChart = () => {
  const { colorScheme } = useColorScheme();
  return (
    <div style={{ position: "fixed", left: 2 }}>
      <div>
        <div>major:</div>
        <div>
          <Chord name={"I"} colorScheme={colorScheme} />
          <Chord name={"ii"} colorScheme={colorScheme} />
          <Chord name={"iii"} colorScheme={colorScheme} />
          <Chord name={"IV"} colorScheme={colorScheme} />
          <Chord name={"V"} colorScheme={colorScheme} />
          <Chord name={"vi"} colorScheme={colorScheme} />
        </div>
      </div>
      <div>
        <div>minor:</div>
        <div>
          <Chord name={"i"} colorScheme={colorScheme} />
          <Chord name={"bIII"} colorScheme={colorScheme} />
          <Chord name={"iv"} colorScheme={colorScheme} />
          <Chord name={"v"} colorScheme={colorScheme} />
          <Chord name={"V"} colorScheme={colorScheme} />
          <Chord name={"bVI"} colorScheme={colorScheme} />
          <Chord name={"bVII"} colorScheme={colorScheme} />
        </div>
      </div>
    </div>
  );
};

export default ChordChart;
