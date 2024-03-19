import * as React from "react";
import { useCallback, useState } from "react";
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
    "V7/ii": "A7",
    "V7/IV": "C7",
    "V7/vi": "E7",
    "V7/iii": "B7",
    "V7/V": "D7",
    V7: "G7",
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
    "V7/ii": "A#7",
    "V7/IV": "C#7",
    "V7/vi": "E#7",
    "V7/iii": "B#7",
    "V7/V": "D#7",
    V7: "G#7",
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
    "V7/ii": "B7",
    "V7/IV": "D7",
    "V7/vi": "F#7",
    "V7/iii": "C#7",
    "V7/V": "E7",
    V7: "A7",
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
    "V7/ii": "C7",
    "V7/IV": "D#7",
    "V7/vi": "G7",
    "V7/iii": "D7",
    "V7/V": "F7",
    V7: "A#7",
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
    "V7/ii": "C#7",
    "V7/IV": "E7",
    "V7/vi": "G#7",
    "V7/iii": "D#7",
    "V7/V": "F#7",
    V7: "B7",
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
    "V7/ii": "D7",
    "V7/IV": "F7",
    "V7/vi": "A#7",
    "V7/iii": "E7",
    "V7/V": "G7",
    V7: "C7",
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
    "V7/ii": "D#7",
    "V7/IV": "F#7",
    "V7/vi": "B7",
    "V7/iii": "E#7",
    "V7/V": "G#7",
    V7: "C#7",
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
    "V7/ii": "E7",
    "V7/IV": "G7",
    "V7/vi": "C7",
    "V7/iii": "F#7",
    "V7/V": "A7",
    V7: "D7",
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
    "V7/ii": "F7",
    "V7/IV": "G#7",
    "V7/vi": "C#7",
    "V7/iii": "G7",
    "V7/V": "A#7",
    V7: "D#7",
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
    "V7/ii": "F#7",
    "V7/IV": "A7",
    "V7/vi": "D7",
    "V7/iii": "G#7",
    "V7/V": "B7",
    V7: "E7",
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
    "V7/ii": "G7",
    "V7/IV": "A#7",
    "V7/vi": "D7",
    "V7/iii": "A7",
    "V7/V": "C7",
    V7: "F7",
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
    "V7/ii": "G#7",
    "V7/IV": "B7",
    "V7/vi": "E7",
    "V7/iii": "A#7",
    "V7/V": "C#7",
    V7: "F#7",
  },
};

// TODO: position superscripts nicer:
// https://chat.openai.com/share/42b5dd9d-73e0-426b-a704-cded9796b612

type MouseEventHanlder = (event: React.MouseEvent<HTMLDivElement>) => void;

const Chord: React.FC<{
  name: Chord;
  colorScheme: ColorScheme;
  tonic: PitchClass;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
  hovered: boolean;
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: MouseEventHanlder;
}> = ({
  name,
  colorScheme,
  tonic,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
  hovered,
  handleMouseEnter,
  handleMouseLeave,
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
  handleMouseEnter: MouseEventHanlder;
  handleMouseLeave: MouseEventHanlder;
}> = ({
  title,
  chords,
  colorScheme,
  tonic,
  scaleDegreesUnderCursor,
  scaleDegreesAroundCursor,
  hovered,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, 170px)",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      <div>{title}</div>
      {chords.map((chord, index) => (
        <Chord
          key={index}
          name={chord}
          colorScheme={colorScheme}
          tonic={tonic}
          scaleDegreesUnderCursor={scaleDegreesUnderCursor}
          scaleDegreesAroundCursor={scaleDegreesAroundCursor}
          hovered={hovered}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      ))}
    </div>
  );
};

type ChordSet = { title: string; chords: Chord[] };

export const CHORD_SETS: ChordSet[] = [
  {
    title: "minor key",
    chords: ["iv", "bVI", "i", "bIII", "v", "bVII"],
  },
  { title: "major key", chords: ["ii", "IV", "vi", "I", "iii", "V"] },
  // {
  //   title: "applied",
  //   chords: ["V7/ii", "V7/IV", "V7/vi", "V7", "V7/iii", "V7/V"],
  // },
];

const ChordChart: React.FC<{
  tonic: PitchClass;
  scaleDegreesUnderCursor: Set<PitchClass>;
  scaleDegreesAroundCursor: Set<PitchClass>;
}> = ({ tonic, scaleDegreesUnderCursor, scaleDegreesAroundCursor }) => {
  const { colorScheme } = useColorScheme();
  const [hovered, setHovered] = useState<boolean>(false);
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);
  const handleMouseLeave = useCallback(() => {
    setHovered(false);
  }, []);
  return (
    <div style={{ position: "fixed", left: 2, marginTop: 40, width: "100vw" }}>
      {CHORD_SETS.map(({ title, chords }, index) => (
        <ChordRow
          key={index}
          title={title}
          chords={chords}
          colorScheme={colorScheme}
          tonic={tonic}
          scaleDegreesUnderCursor={scaleDegreesUnderCursor}
          scaleDegreesAroundCursor={scaleDegreesAroundCursor}
          hovered={hovered}
          handleMouseEnter={handleMouseEnter}
          handleMouseLeave={handleMouseLeave}
        />
      ))}
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
