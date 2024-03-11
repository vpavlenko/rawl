import * as React from "react";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { Chord, ChordLegend } from "./course/ChordClouds";

const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
}> = ({ name, colorScheme }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <span
        style={{ fontSize: 30, position: "relative", top: 25, marginRight: 25 }}
      >
        {name}
      </span>
      <span
        style={{
          width: 70,
          height: 140,
          display: "inline-block",
          marginRight: 10,
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

const ChordChart = () => {
  const { colorScheme } = useColorScheme();
  return (
    <div style={{ position: "fixed", left: 2, marginTop: 10 }}>
      <div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 30 }}>major</div>
          <Chord name={"I"} colorScheme={colorScheme} />
          <Chord name={"ii"} colorScheme={colorScheme} />
          <Chord name={"iii"} colorScheme={colorScheme} />
          <Chord name={"IV"} colorScheme={colorScheme} />
          <Chord name={"V"} colorScheme={colorScheme} />
          <Chord name={"vi"} colorScheme={colorScheme} />
        </div>
      </div>
      <div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 30 }}>minor</div>
          <Chord name={"i"} colorScheme={colorScheme} />
          <Chord name={"bIII"} colorScheme={colorScheme} />
          <Chord name={"iv"} colorScheme={colorScheme} />
          <Chord name={"v"} colorScheme={colorScheme} />
          <Chord name={"V"} colorScheme={colorScheme} />
          <Chord name={"bVI"} colorScheme={colorScheme} />
          <Chord name={"bVII"} colorScheme={colorScheme} />
        </div>
      </div>
      <div>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ marginRight: 30 }}>other</div>
          <Chord name={"V/ii"} colorScheme={colorScheme} />
          <Chord name={"V7/IV"} colorScheme={colorScheme} />
          <Chord name={"V/V"} colorScheme={colorScheme} />
          <Chord name={"V/vi"} colorScheme={colorScheme} />
          <Chord name={"bII"} colorScheme={colorScheme} />
          <Chord name={"Vsus4"} colorScheme={colorScheme} />
          <Chord name={"V+"} colorScheme={colorScheme} />
          <Chord name={"viio7"} colorScheme={colorScheme} />
          <Chord name={"io7"} colorScheme={colorScheme} />
        </div>
      </div>
    </div>
  );
};

export default ChordChart;
