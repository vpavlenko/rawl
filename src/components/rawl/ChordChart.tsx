import * as React from "react";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { ColorScheme, useColorScheme } from "./ColorScheme";
import { PitchClass } from "./analysis";
import { CHORDS, Chord, ChordLegend } from "./course/ChordClouds";

const ROMAN_NUMERAL_TO_CHORD = {
  0: {
    // C
    iv: "Fm",
    bVI: "Ab",
    i: "Cm",
    bIII: "Eb",
    v: "Gm",
    bVII: "Bb",
    ii: "Dm",
    IV: "F",
    vi: "Am",
    I: "C",
    iii: "Em",
    V: "G",
    "V/ii": "A",
    "V7/IV": "C7",
    "V/vi": "E",
    V7: "G7",
    "V/iii": "B",
    "V/V": "D",
  },
  1: {
    // C#/Db
    iv: "F#m",
    bVI: "A",
    i: "C#m",
    bIII: "E",
    v: "G#m",
    bVII: "B",
    ii: "D#m",
    IV: "F#",
    vi: "A#m",
    I: "C#",
    iii: "E#m",
    V: "G#",
    "V/ii": "A#",
    "V7/IV": "C#7",
    "V/vi": "E#",
    V7: "G#7",
    "V/iii": "B#",
    "V/V": "D#",
  },
  2: {
    // D
    iv: "Gm",
    bVI: "Bb",
    i: "Dm",
    bIII: "F",
    v: "Am",
    bVII: "C",
    ii: "Em",
    IV: "G",
    vi: "Bm",
    I: "D",
    iii: "F#m",
    V: "A",
    "V/ii": "B",
    "V7/IV": "D7",
    "V/vi": "F#",
    V7: "A7",
    "V/iii": "C#",
    "V/V": "E",
  },
  3: {
    // D#/Eb
    iv: "G#m",
    bVI: "B",
    i: "D#m",
    bIII: "F#",
    v: "A#m",
    bVII: "C#",
    ii: "Fm",
    IV: "G#",
    vi: "Cm",
    I: "D#",
    iii: "Gm",
    V: "A#",
    "V/ii": "C",
    "V7/IV": "D#7",
    "V/vi": "G",
    V7: "A#7",
    "V/iii": "D",
    "V/V": "F",
  },
  4: {
    // E
    iv: "Am",
    bVI: "C",
    i: "Em",
    bIII: "G",
    v: "Bm",
    bVII: "D",
    ii: "F#m",
    IV: "A",
    vi: "C#m",
    I: "E",
    iii: "G#m",
    V: "B",
    "V/ii": "C#",
    "V7/IV": "E7",
    "V/vi": "G#",
    V7: "B7",
    "V/iii": "D#",
    "V/V": "F#",
  },
  5: {
    // F
    iv: "A#m",
    bVI: "C#",
    i: "Fm",
    bIII: "G#",
    v: "Cm",
    bVII: "D#",
    ii: "Gm",
    IV: "A#",
    vi: "Dm",
    I: "F",
    iii: "A",
    V: "C",
    "V/ii": "D",
    "V7/IV": "F7",
    "V/vi": "A#",
    V7: "C7",
    "V/iii": "E",
    "V/V": "G",
  },
  6: {
    // F#/Gb
    iv: "Bm",
    bVI: "D",
    i: "F#m",
    bIII: "A",
    v: "C#m",
    bVII: "E",
    ii: "G#m",
    IV: "B",
    vi: "D#m",
    I: "F#",
    iii: "A#m",
    V: "C#",
    "V/ii": "D#",
    "V7/IV": "F#7",
    "V/vi": "B",
    V7: "C#7",
    "V/iii": "E#",
    "V/V": "G#",
  },
  7: {
    // G
    iv: "Cm",
    bVI: "Eb",
    i: "Gm",
    bIII: "Bb",
    v: "Dm",
    bVII: "F",
    ii: "Am",
    IV: "C",
    vi: "Em",
    I: "G",
    iii: "Bm",
    V: "D",
    "V/ii": "E",
    "V7/IV": "G7",
    "V/vi": "C",
    V7: "D7",
    "V/iii": "F#",
    "V/V": "A",
  },
  8: {
    // G#/Ab
    iv: "C#m",
    bVI: "E",
    i: "G#m",
    bIII: "C",
    v: "D#m",
    bVII: "F#",
    ii: "A#m",
    IV: "C#",
    vi: "Fm",
    I: "G#",
    iii: "Cm",
    V: "D#",
    "V/ii": "F",
    "V7/IV": "G#7",
    "V/vi": "C#",
    V7: "D#7",
    "V/iii": "G",
    "V/V": "A#",
  },
  9: {
    // A
    iv: "Dm",
    bVI: "F",
    i: "Am",
    bIII: "C",
    v: "Em",
    bVII: "G",
    ii: "Bm",
    IV: "D",
    vi: "F#m",
    I: "A",
    iii: "C#m",
    V: "E",
    "V/ii": "F#",
    "V7/IV": "A7",
    "V/vi": "D",
    V7: "E7",
    "V/iii": "G#",
    "V/V": "B",
  },
  10: {
    // A#/Bb
    iv: "D#m",
    bVI: "F#",
    i: "A#m",
    bIII: "C#",
    v: "Fm",
    bVII: "G#",
    ii: "Cm",
    IV: "D#",
    vi: "Gm",
    I: "A#",
    iii: "D",
    V: "F",
    "V/ii": "G",
    "V7/IV": "A#7",
    "V/vi": "D#",
    V7: "F7",
    "V/iii": "A",
    "V/V": "C",
  },
  11: {
    // B
    iv: "Em",
    bVI: "G",
    i: "Bm",
    bIII: "D",
    v: "F#m",
    bVII: "A",
    ii: "C#m",
    IV: "E",
    vi: "G#m",
    I: "B",
    iii: "D#m",
    V: "F#",
    "V/ii": "G#",
    "V7/IV": "B7",
    "V/vi": "E",
    V7: "F#7",
    "V/iii": "A#",
    "V/V": "C#",
  },
};

// TODO: position superscripts nicer:
// https://chat.openai.com/share/42b5dd9d-73e0-426b-a704-cded9796b612

// TODO: show guitar chord on hover
// https://chat.openai.com/share/aa1a4c44-98b9-46b2-bd82-a2ffff7a714c
const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
  tonic: PitchClass;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
  hovered: boolean;
}> = ({
  name,
  colorScheme,
  tonic,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
  hovered,
}) => {
  // Disable for now since position is accurate to sampleRate, which as 16384
  // is too coarse for a reasonable result.
  const isCurrentChord =
    false &&
    CHORDS[name].every((scaleDegree) =>
      scaleDegreesUnderCursor.has(scaleDegree),
    );
  const isArpeggiatedCurrentChord =
    false &&
    CHORDS[name].every((scaleDegree) =>
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
        {hovered
          ? ROMAN_NUMERAL_TO_CHORD[tonic][name]
          : name
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
  tonic: PitchClass;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
  hovered: boolean;
  setHovered: Dispatch<SetStateAction<boolean>>;
}> = ({
  title,
  chords,
  colorScheme,
  tonic,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
  hovered,
  setHovered,
}) => {
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, 170px)",
        justifyContent: "space-between",
        gap: "10px",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div>{title}</div>
      {chords.map((chord) => (
        <Chord
          name={chord}
          colorScheme={colorScheme}
          tonic={tonic}
          scaleDegreesUnderCursor={scaleDegreesUnderCursor}
          scaleDegreesAroundCursor={scaleDegreesAroundCursor}
          hovered={hovered}
        />
      ))}
    </div>
  );
};

const ChordChart: React.FC<{
  tonic: PitchClass;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
}> = ({ tonic, scaleDegreesUnderCursor, scaleDegreesAroundCursor }) => {
  const { colorScheme } = useColorScheme();
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <div style={{ position: "fixed", left: 2, marginTop: 40, width: "100vw" }}>
      <ChordRow
        title="minor key"
        chords={["iv", "bVI", "i", "bIII", "v", "bVII"]}
        colorScheme={colorScheme}
        tonic={tonic}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
        hovered={hovered}
        setHovered={setHovered}
      />
      <ChordRow
        title="major key"
        chords={["ii", "IV", "vi", "I", "iii", "V"]}
        colorScheme={colorScheme}
        tonic={tonic}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
        hovered={hovered}
        setHovered={setHovered}
      />
      <ChordRow
        title="applied"
        chords={["V/ii", "V7/IV", "V/vi", "V7", "V/iii", "V/V"]}
        colorScheme={colorScheme}
        tonic={tonic}
        scaleDegreesUnderCursor={scaleDegreesUnderCursor}
        scaleDegreesAroundCursor={scaleDegreesAroundCursor}
        hovered={hovered}
        setHovered={setHovered}
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
